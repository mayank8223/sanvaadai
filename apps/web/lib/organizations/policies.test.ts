/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  canDemoteMembership,
  canRemoveMembership,
  countAdminMemberships,
} from '@/lib/organizations/policies';

describe('countAdminMemberships', () => {
  it('counts only admin memberships', () => {
    const count = countAdminMemberships([
      { id: 'm1', role: 'ADMIN' },
      { id: 'm2', role: 'COLLECTOR' },
      { id: 'm3', role: 'ADMIN' },
    ]);

    expect(count).toBe(2);
  });
});

describe('admin protection policies', () => {
  it('prevents demoting last admin', () => {
    expect(canDemoteMembership({ id: 'm1', role: 'ADMIN' }, 'COLLECTOR', 1)).toBe(false);
  });

  it('allows demoting when more than one admin exists', () => {
    expect(canDemoteMembership({ id: 'm1', role: 'ADMIN' }, 'COLLECTOR', 2)).toBe(true);
  });

  it('prevents removing last admin', () => {
    expect(canRemoveMembership({ id: 'm1', role: 'ADMIN' }, 1)).toBe(false);
  });

  it('allows removing collector even if no admins are counted', () => {
    expect(canRemoveMembership({ id: 'm2', role: 'COLLECTOR' }, 0)).toBe(true);
  });
});
