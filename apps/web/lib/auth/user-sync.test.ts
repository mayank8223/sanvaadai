/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import { toUserProfileRow } from './user-sync';

/* ----------------- Helpers --------------- */
const createAuthUser = (
  overrides: Partial<SupabaseAuthUser> = {}
): SupabaseAuthUser =>
  ({
    id: 'user_1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'jane@example.com',
    ...overrides,
  }) as SupabaseAuthUser;

describe('toUserProfileRow', () => {
  it('maps primary metadata fields when available', () => {
    const row = toUserProfileRow(
      createAuthUser({
        user_metadata: {
          full_name: 'Jane Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      })
    );

    expect(row).toEqual({
      id: 'user_1',
      email: 'jane@example.com',
      full_name: 'Jane Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  it('uses fallback metadata keys and normalizes empty values', () => {
    const row = toUserProfileRow(
      createAuthUser({
        email: undefined,
        user_metadata: {
          full_name: '   ',
          name: 'Fallback Name',
          avatar_url: '',
          picture: 'https://example.com/picture.png',
        },
      })
    );

    expect(row).toEqual({
      id: 'user_1',
      email: null,
      full_name: 'Fallback Name',
      avatar_url: 'https://example.com/picture.png',
    });
  });
});
