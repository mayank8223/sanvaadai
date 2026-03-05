/* ----------------- Globals --------------- */
import { cookies } from 'next/headers';

import { ORGANIZATION_ID_COOKIE, type MembershipRole } from '@/lib/auth/organization';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Types --------------- */
export type OrganizationOption = {
  organization_id: string;
  role: MembershipRole;
  organization: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
};

export type ShellContext = {
  memberships: OrganizationOption[];
  activeMembership: OrganizationOption | null;
  requestedOrganizationId: string | null;
  hasInvalidRequestedOrganization: boolean;
};

type MembershipRow = {
  organization_id: string;
  role: MembershipRole;
  organizations:
    | { id: string; name: string; slug: string | null }
    | Array<{ id: string; name: string; slug: string | null }>
    | null;
};

/* ----------------- Helpers --------------- */
const toOrganizationRecord = (
  organizations: MembershipRow['organizations']
): { id: string; name: string; slug: string | null } | null => {
  if (!organizations) return null;
  if (Array.isArray(organizations)) {
    return organizations[0] ?? null;
  }

  return organizations;
};

const normalizeMemberships = (rows: MembershipRow[]): OrganizationOption[] =>
  rows.map((membership) => ({
    organization_id: membership.organization_id,
    role: membership.role,
    organization: toOrganizationRecord(membership.organizations),
  }));

/* ----------------- API --------------- */
export const loadShellContext = async (userId: string): Promise<ShellContext> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role, organizations:organization_id(id, name, slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    throw new Error(`Failed to load memberships: ${error.message}`);
  }

  const memberships = normalizeMemberships((data ?? []) as MembershipRow[]);
  const cookieStore = await cookies();
  const requestedOrganizationId = cookieStore.get(ORGANIZATION_ID_COOKIE)?.value ?? null;
  const selectedMembership = requestedOrganizationId
    ? (memberships.find((membership) => membership.organization_id === requestedOrganizationId) ??
      null)
    : null;
  const activeMembership = selectedMembership ?? memberships[0] ?? null;

  return {
    memberships,
    activeMembership,
    requestedOrganizationId,
    hasInvalidRequestedOrganization: Boolean(requestedOrganizationId) && !selectedMembership,
  };
};
