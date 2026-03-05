/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  ADMIN_HOME_PATH,
  COLLECTOR_HOME_PATH,
  getRoleHomePath,
  resolveHomeRouteDecision,
} from '@/lib/auth/home-routing';
import type { OrganizationOption } from '@/lib/auth/shell';

/* ----------------- Fixtures --------------- */
const adminMembership: OrganizationOption = {
  organization_id: 'org_admin',
  role: 'ADMIN',
  organization: {
    id: 'org_admin',
    name: 'Admin Org',
    slug: 'admin-org',
  },
};

const collectorMembership: OrganizationOption = {
  organization_id: 'org_collector',
  role: 'COLLECTOR',
  organization: {
    id: 'org_collector',
    name: 'Collector Org',
    slug: 'collector-org',
  },
};

describe('getRoleHomePath', () => {
  it('returns admin home for admin role', () => {
    expect(getRoleHomePath('ADMIN')).toBe(ADMIN_HOME_PATH);
  });

  it('returns collector home for collector role', () => {
    expect(getRoleHomePath('COLLECTOR')).toBe(COLLECTOR_HOME_PATH);
  });
});

describe('resolveHomeRouteDecision', () => {
  it('returns no-membership state when memberships are empty', () => {
    const decision = resolveHomeRouteDecision({
      memberships: [],
      activeMembership: null,
      hasInvalidRequestedOrganization: false,
    });

    expect(decision).toEqual({ type: 'render', state: 'no-membership' });
  });

  it('returns invalid-organization state when selected org is invalid', () => {
    const decision = resolveHomeRouteDecision({
      memberships: [adminMembership, collectorMembership],
      activeMembership: null,
      hasInvalidRequestedOrganization: true,
    });

    expect(decision).toEqual({ type: 'render', state: 'invalid-organization' });
  });

  it('redirects admin users to admin home', () => {
    const decision = resolveHomeRouteDecision({
      memberships: [adminMembership],
      activeMembership: adminMembership,
      hasInvalidRequestedOrganization: false,
    });

    expect(decision).toEqual({ type: 'redirect', destination: ADMIN_HOME_PATH });
  });

  it('redirects collector users to collector home', () => {
    const decision = resolveHomeRouteDecision({
      memberships: [collectorMembership],
      activeMembership: collectorMembership,
      hasInvalidRequestedOrganization: false,
    });

    expect(decision).toEqual({ type: 'redirect', destination: COLLECTOR_HOME_PATH });
  });
});
