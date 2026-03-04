/* ----------------- Globals --------------- */
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
export const ORGANIZATION_ID_QUERY_PARAM = 'orgId';
export const ORGANIZATION_ID_HEADER = 'x-organization-id';
export const ORGANIZATION_ID_COOKIE = 'svd_org_id';

export const MEMBERSHIP_ROLES = ['ADMIN', 'COLLECTOR'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

/* ----------------- Types --------------- */
export type OrganizationMembership = {
  organization_id: string;
  role: MembershipRole;
};

export type AuthOrganizationContext = {
  user: SupabaseAuthUser | null;
  memberships: OrganizationMembership[];
  requestedOrganizationId: string | null;
  activeMembership: OrganizationMembership | null;
};

type ResolveOrganizationIdInput = {
  request: Request;
  fallbackOrganizationId?: string | null;
};

/* ----------------- Helpers --------------- */
const getCookieValue = (cookieHeader: string, cookieName: string): string | null => {
  if (!cookieHeader) return null;

  const cookiePair = cookieHeader
    .split(';')
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${cookieName}=`));

  if (!cookiePair) return null;

  const rawValue = cookiePair.slice(cookieName.length + 1);
  const decodedValue = decodeURIComponent(rawValue).trim();
  return decodedValue.length > 0 ? decodedValue : null;
};

const normalizeOrganizationId = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

export const resolveRequestedOrganizationId = ({
  request,
  fallbackOrganizationId = null,
}: ResolveOrganizationIdInput): string | null => {
  const requestUrl = new URL(request.url);
  const queryOrgId = normalizeOrganizationId(
    requestUrl.searchParams.get(ORGANIZATION_ID_QUERY_PARAM)
  );
  if (queryOrgId) return queryOrgId;

  const headerOrgId = normalizeOrganizationId(request.headers.get(ORGANIZATION_ID_HEADER));
  if (headerOrgId) return headerOrgId;

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieOrgId = normalizeOrganizationId(getCookieValue(cookieHeader, ORGANIZATION_ID_COOKIE));
  if (cookieOrgId) return cookieOrgId;

  return normalizeOrganizationId(fallbackOrganizationId);
};

export const pickActiveMembership = (
  memberships: OrganizationMembership[],
  requestedOrganizationId: string | null
): OrganizationMembership | null => {
  if (memberships.length === 0) return null;

  if (requestedOrganizationId) {
    const matchingMembership = memberships.find(
      ({ organization_id }) => organization_id === requestedOrganizationId
    );
    if (matchingMembership) return matchingMembership;
    return null;
  }

  return memberships[0] ?? null;
};

export const getUserMemberships = async (userId: string): Promise<OrganizationMembership[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to load memberships: ${error.message}`);
  }

  return (data ?? []) as OrganizationMembership[];
};

export const resolveAuthOrganizationContext = async (
  user: SupabaseAuthUser,
  request: Request
): Promise<AuthOrganizationContext> => {
  const memberships = await getUserMemberships(user.id);
  const requestedOrganizationId = resolveRequestedOrganizationId({
    request,
    fallbackOrganizationId: memberships[0]?.organization_id ?? null,
  });

  return {
    user,
    memberships,
    requestedOrganizationId,
    activeMembership: pickActiveMembership(memberships, requestedOrganizationId),
  };
};
