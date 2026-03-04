import { AuthApiError, AuthError } from '@supabase/supabase-js';
import { describe, expect, it } from 'bun:test';

import { AUTH_COPY } from '../../constants';
import { mapAuthErrorToMessage } from './errors';

describe('mapAuthErrorToMessage', () => {
  it('returns invalid credential copy for invalid credentials', () => {
    const error = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');

    expect(mapAuthErrorToMessage(error)).toBe(AUTH_COPY.invalidCredentialsMessage);
  });

  it('returns fallback copy for unknown auth errors', () => {
    const error = new AuthError('Unexpected auth error');

    expect(mapAuthErrorToMessage(error)).toBe(AUTH_COPY.genericAuthErrorMessage);
  });
});
