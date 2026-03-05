/* ----------------- Globals --------------- */
import type { MembershipRole } from '@/lib/auth/organization';
import type { OrganizationOption } from '@/lib/auth/shell';

/* ----------------- Constants --------------- */
export const HOME_PATH = '/';
export const LOGIN_PATH = '/login';
export const ONBOARDING_ORGANIZATION_PATH = '/onboarding/organization';
export const ADMIN_HOME_PATH = '/home/admin';
export const COLLECTOR_HOME_PATH = '/home/collector';

/* ----------------- Types --------------- */
export type HomeRouteDecision =
  | { type: 'redirect'; destination: string }
  | { type: 'render'; state: 'no-membership' | 'invalid-organization' };

type ResolveHomeRouteInput = {
  memberships: OrganizationOption[];
  activeMembership: OrganizationOption | null;
  hasInvalidRequestedOrganization: boolean;
};

/* ----------------- Helpers --------------- */
export const getRoleHomePath = (role: MembershipRole): string =>
  role === 'ADMIN' ? ADMIN_HOME_PATH : COLLECTOR_HOME_PATH;

export const resolveHomeRouteDecision = ({
  memberships,
  activeMembership,
  hasInvalidRequestedOrganization,
}: ResolveHomeRouteInput): HomeRouteDecision => {
  if (memberships.length === 0) {
    return { type: 'render', state: 'no-membership' };
  }

  if (hasInvalidRequestedOrganization || !activeMembership) {
    return { type: 'render', state: 'invalid-organization' };
  }

  return { type: 'redirect', destination: getRoleHomePath(activeMembership.role) };
};
