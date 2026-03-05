/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { getAuthPageRedirectPath } from '@/lib/auth/auth-routes';
import { HOME_PATH } from '@/lib/auth/home-routing';

describe('getAuthPageRedirectPath', () => {
  it('redirects authenticated users to home', () => {
    expect(getAuthPageRedirectPath(true)).toBe(HOME_PATH);
  });

  it('returns null for unauthenticated users', () => {
    expect(getAuthPageRedirectPath(false)).toBeNull();
  });
});
