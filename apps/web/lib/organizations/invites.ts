/**
 * Organization invite service.
 * Handles creating invites and accepting them after user signup.
 */

/* ----------------- Globals --------------- */
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

import type { MembershipRole } from '@/lib/auth/organization';

/* ----------------- Constants --------------- */
const INVITE_EXPIRY_DAYS = 7;

/* ----------------- Types --------------- */
export type OrganizationInviteRecord = {
  id: string;
  email: string;
  organization_id: string;
  role: MembershipRole;
  token: string;
  invited_by_user_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

/* ----------------- Helpers --------------- */
const generateInviteToken = (): string => {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

/* ----------------- Create invite --------------- */
export type CreateInviteInput = {
  email: string;
  organizationId: string;
  role: MembershipRole;
  invitedByUserId: string;
};

export type CreateInviteResult =
  | { ok: true; inviteId: string }
  | { ok: false; error: string };

export const createOrganizationInvite = async (
  input: CreateInviteInput
): Promise<CreateInviteResult> => {
  const { email, organizationId, role, invitedByUserId } = input;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: 'Email is required' };
  }

  const supabase = await createClient();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  const token = generateInviteToken();

  const { data: invite, error: insertError } = await supabase
    .from('organization_invites')
    .insert({
      email: normalizedEmail,
      organization_id: organizationId,
      role,
      token,
      invited_by_user_id: invitedByUserId,
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single();

  if (insertError) {
    return { ok: false, error: insertError.message };
  }
  if (!invite?.id) {
    return { ok: false, error: 'Failed to create invite' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectTo = `${appUrl}/invite/accept?token=${token}`;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      ok: false,
      error:
        'Email invite is not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment.',
    };
  }

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo,
    data: { invite_token: token },
  });

  if (inviteError) {
    await supabase.from('organization_invites').delete().eq('id', invite.id);
    return {
      ok: false,
      error: inviteError.message ?? 'Failed to send invite email',
    };
  }

  return { ok: true, inviteId: invite.id };
};

/* ----------------- Get invite by email (for OTP flow) --------------- */
export const getPendingInviteByEmail = async (
  email: string
): Promise<OrganizationInviteRecord | null> => {
  const supabase = await createClient();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('organization_invites')
    .select('id, email, organization_id, role, token, invited_by_user_id, expires_at, accepted_at, created_at')
    .eq('email', normalized)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as OrganizationInviteRecord;
};

/* ----------------- Get invite by token --------------- */
export const getInviteByToken = async (
  token: string
): Promise<OrganizationInviteRecord | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organization_invites')
    .select('id, email, organization_id, role, token, invited_by_user_id, expires_at, accepted_at, created_at')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return data as OrganizationInviteRecord;
};

/* ----------------- Accept invite --------------- */
export type AcceptInviteResult =
  | { ok: true; organizationId: string }
  | { ok: false; error: string };

export const acceptOrganizationInvite = async (
  token: string,
  userId: string,
  userEmail: string
): Promise<AcceptInviteResult> => {
  const invite = await getInviteByToken(token);
  if (!invite) {
    return { ok: false, error: 'Invite not found, expired, or already accepted' };
  }

  const normalizedUserEmail = userEmail?.trim().toLowerCase() ?? '';
  if (normalizedUserEmail !== invite.email) {
    return { ok: false, error: 'This invite was sent to a different email address' };
  }

  const supabase = await createClient();

  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('id')
    .eq('organization_id', invite.organization_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMembership) {
    await supabase
      .from('organization_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);
    return { ok: true, organizationId: invite.organization_id };
  }

  const { error: membershipError } = await supabase.from('memberships').insert({
    organization_id: invite.organization_id,
    user_id: userId,
    role: invite.role,
  });

  if (membershipError) {
    return { ok: false, error: membershipError.message };
  }

  await supabase
    .from('organization_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return { ok: true, organizationId: invite.organization_id };
};

/* ----------------- Accept invite by email (after OTP verify) --------------- */
export const acceptOrganizationInviteByEmail = async (
  userId: string,
  userEmail: string
): Promise<AcceptInviteResult> => {
  const invite = await getPendingInviteByEmail(userEmail);
  if (!invite) {
    return { ok: false, error: 'Invite not found, expired, or already accepted' };
  }
  return acceptOrganizationInvite(invite.token, userId, userEmail);
};
