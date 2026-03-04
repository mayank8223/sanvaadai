/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  ORGANIZATION_ID_COOKIE,
  ORGANIZATION_ID_HEADER,
  ORGANIZATION_ID_QUERY_PARAM,
  pickActiveMembership,
  resolveRequestedOrganizationId,
  type OrganizationMembership,
} from './organization';

/* ----------------- Helpers --------------- */
const createRequest = ({
  url = 'http://localhost:3000/api/me',
  headers = {},
}: {
  url?: string;
  headers?: Record<string, string>;
} = {}): Request => new Request(url, { headers });

const memberships: OrganizationMembership[] = [
  { organization_id: 'org_1', role: 'ADMIN' },
  { organization_id: 'org_2', role: 'COLLECTOR' },
];

describe('resolveRequestedOrganizationId', () => {
  it('prefers query param over header and cookie', () => {
    const request = createRequest({
      url: `http://localhost:3000/api/me?${ORGANIZATION_ID_QUERY_PARAM}=org_query`,
      headers: {
        [ORGANIZATION_ID_HEADER]: 'org_header',
        cookie: `${ORGANIZATION_ID_COOKIE}=org_cookie`,
      },
    });

    expect(resolveRequestedOrganizationId({ request })).toBe('org_query');
  });

  it('falls back to header, then cookie, then provided fallback', () => {
    const requestFromHeader = createRequest({
      headers: {
        [ORGANIZATION_ID_HEADER]: 'org_header',
        cookie: `${ORGANIZATION_ID_COOKIE}=org_cookie`,
      },
    });
    expect(resolveRequestedOrganizationId({ request: requestFromHeader })).toBe('org_header');

    const requestFromCookie = createRequest({
      headers: {
        cookie: `${ORGANIZATION_ID_COOKIE}=org_cookie`,
      },
    });
    expect(resolveRequestedOrganizationId({ request: requestFromCookie })).toBe('org_cookie');

    const requestFromFallback = createRequest();
    expect(
      resolveRequestedOrganizationId({
        request: requestFromFallback,
        fallbackOrganizationId: 'org_fallback',
      })
    ).toBe('org_fallback');
  });
});

describe('pickActiveMembership', () => {
  it('returns requested org membership when present', () => {
    expect(pickActiveMembership(memberships, 'org_2')).toEqual({
      organization_id: 'org_2',
      role: 'COLLECTOR',
    });
  });

  it('returns null when requested org is not found', () => {
    expect(pickActiveMembership(memberships, 'missing_org')).toBeNull();
  });

  it('returns first membership when no org is requested', () => {
    expect(pickActiveMembership(memberships, null)).toEqual({
      organization_id: 'org_1',
      role: 'ADMIN',
    });
  });
});
