/* ----------------- Globals --------------- */
import { createClient } from '@/lib/supabase/server';

import type { MembershipRole } from '@/lib/auth/organization';

/* ----------------- Types --------------- */
export type UserMembershipRecord = {
  id: string;
  user_id: string;
  organization_id: string;
  role: MembershipRole;
  created_at: string;
  updated_at: string;
};

export type UserRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/* ----------------- Queries --------------- */
export const getUserMembershipsForOrganization = async (
  userId: string,
  organizationId: string
): Promise<UserMembershipRecord[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('memberships')
    .select('id, user_id, organization_id, role, created_at, updated_at')
    .eq('user_id', userId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to load memberships: ${error.message}`);
  }

  return (data ?? []) as UserMembershipRecord[];
};

export const getUserById = async (userId: string): Promise<UserRecord | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user: ${error.message}`);
  }

  return (data as UserRecord | null) ?? null;
};

export const getUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url, created_at, updated_at')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user by email: ${error.message}`);
  }

  return (data as UserRecord | null) ?? null;
};

export const getOrganizationAdminMembershipCount = async (
  organizationId: string
): Promise<number> => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('memberships')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('role', 'ADMIN');

  if (error) {
    throw new Error(`Failed to count admins: ${error.message}`);
  }

  return count ?? 0;
};
