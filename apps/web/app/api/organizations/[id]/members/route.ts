/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseCreateMemberInput } from '@/lib/organizations/contracts';
import { createOrganizationInvite } from '@/lib/organizations/invites';
import {
  getUserByEmail,
  getUserById,
  getUserMembershipsForOrganization,
} from '@/lib/organizations/service';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Helpers --------------- */
const getOrganizationIdFromPathname = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  const organizationsIndex = segments.lastIndexOf('organizations');
  if (organizationsIndex < 0) return null;
  const organizationId = segments[organizationsIndex + 1];
  return organizationId?.trim() ? organizationId : null;
};

const resolveAdminMembershipForOrganization = async (userId: string, organizationId: string) => {
  const memberships = await getUserMembershipsForOrganization(userId, organizationId);
  return memberships.find((membership) => membership.role === 'ADMIN') ?? null;
};

/* ----------------- API: GET /api/organizations/:id/members --------------- */
export const GET = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = getOrganizationIdFromPathname(new URL(request.url).pathname);
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization id is required' }, { status: 400 });
    }

    let adminMembership;
    try {
      adminMembership = await resolveAdminMembershipForOrganization(
        context.user.id,
        organizationId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load membership';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!adminMembership) {
      return NextResponse.json({ error: 'Forbidden: Admin membership required' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('memberships')
      .select(
        'id, role, organization_id, user_id, created_at, updated_at, users:user_id(id, email, full_name, avatar_url, created_at, updated_at)'
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      members: data ?? [],
    });
  },
  {
    requireMembership: false,
  }
);

/* ----------------- API: POST /api/organizations/:id/members --------------- */
export const POST = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = getOrganizationIdFromPathname(new URL(request.url).pathname);
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization id is required' }, { status: 400 });
    }

    let adminMembership;
    try {
      adminMembership = await resolveAdminMembershipForOrganization(
        context.user.id,
        organizationId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load membership';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!adminMembership) {
      return NextResponse.json({ error: 'Forbidden: Admin membership required' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedInput = parseCreateMemberInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        {
          error:
            'Invalid body. Expected { role: "ADMIN" | "COLLECTOR", userId?: string, email?: string }',
        },
        { status: 400 }
      );
    }

    let targetUser = null;
    try {
      if (parsedInput.userId) {
        targetUser = await getUserById(parsedInput.userId);
      } else if (parsedInput.email) {
        targetUser = await getUserByEmail(parsedInput.email);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve user';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!targetUser) {
      const supabase = await createClient();
      const { data: existingInvite } = await supabase
        .from('organization_invites')
        .select('id')
        .eq('email', parsedInput.email!.toLowerCase())
        .eq('organization_id', organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (existingInvite) {
        return NextResponse.json(
          {
            status: 'invite_sent',
            message: 'An invite was already sent to this email. They can check their inbox.',
          },
          { status: 200 }
        );
      }

      const inviteResult = await createOrganizationInvite({
        email: parsedInput.email!,
        organizationId,
        role: parsedInput.role,
        invitedByUserId: context.user.id,
      });

      if (!inviteResult.ok) {
        return NextResponse.json({ error: inviteResult.error }, { status: 500 });
      }

      return NextResponse.json(
        {
          status: 'invite_sent',
          message: `Invite sent to ${parsedInput.email}. They'll receive an email to create an account and join as ${parsedInput.role}.`,
        },
        { status: 201 }
      );
    }

    const supabase = await createClient();
    const { data: existingMembership, error: existingMembershipError } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existingMembershipError) {
      return NextResponse.json({ error: existingMembershipError.message }, { status: 500 });
    }

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Member already exists in this organization' },
        { status: 409 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        organization_id: organizationId,
        user_id: targetUser.id,
        role: parsedInput.role,
      })
      .select('id, role, organization_id, user_id, created_at, updated_at')
      .single();

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        member: {
          ...membership,
          user: targetUser,
        },
      },
      { status: 201 }
    );
  },
  {
    requireMembership: false,
  }
);
