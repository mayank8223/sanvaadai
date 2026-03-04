/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  parseCreateMemberInput,
  parseCreateOrganizationInput,
  parseSwitchOrganizationInput,
  parseUpdateMemberRoleInput,
} from '@/lib/organizations/contracts';

describe('parseCreateOrganizationInput', () => {
  it('parses valid payload with slug', () => {
    expect(parseCreateOrganizationInput({ name: 'Org A', slug: 'org-a' })).toEqual({
      name: 'Org A',
      slug: 'org-a',
    });
  });

  it('allows null slug', () => {
    expect(parseCreateOrganizationInput({ name: 'Org A' })).toEqual({
      name: 'Org A',
      slug: null,
    });
  });

  it('rejects invalid slug pattern', () => {
    expect(parseCreateOrganizationInput({ name: 'Org A', slug: 'Org A' })).toBeNull();
  });
});

describe('parseSwitchOrganizationInput', () => {
  it('parses valid payload', () => {
    expect(parseSwitchOrganizationInput({ organizationId: 'org_1' })).toEqual({
      organizationId: 'org_1',
    });
  });

  it('rejects empty organization id', () => {
    expect(parseSwitchOrganizationInput({ organizationId: '   ' })).toBeNull();
  });
});

describe('parseCreateMemberInput', () => {
  it('supports email add flow', () => {
    expect(parseCreateMemberInput({ role: 'COLLECTOR', email: 'USER@EXAMPLE.COM' })).toEqual({
      role: 'COLLECTOR',
      userId: null,
      email: 'user@example.com',
    });
  });

  it('supports userId add flow', () => {
    expect(parseCreateMemberInput({ role: 'ADMIN', userId: 'user_1' })).toEqual({
      role: 'ADMIN',
      userId: 'user_1',
      email: null,
    });
  });

  it('rejects payload without email/userId', () => {
    expect(parseCreateMemberInput({ role: 'ADMIN' })).toBeNull();
  });
});

describe('parseUpdateMemberRoleInput', () => {
  it('parses valid role updates', () => {
    expect(parseUpdateMemberRoleInput({ role: 'ADMIN' })).toEqual({ role: 'ADMIN' });
  });

  it('rejects invalid role updates', () => {
    expect(parseUpdateMemberRoleInput({ role: 'OWNER' })).toBeNull();
  });
});
