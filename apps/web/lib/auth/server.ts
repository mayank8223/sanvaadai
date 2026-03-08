/* ----------------- Globals --------------- */
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/* ----------------- Types --------------- */
export type ResolvedAuthUser = {
  user: SupabaseAuthUser | null;
  source: 'cookie' | 'bearer';
};

/* ----------------- Helpers --------------- */
const getBearerToken = (request: Request): string | null => {
  const authorizationHeader = request.headers.get('authorization');
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;
  const normalizedToken = token.trim();
  return normalizedToken.length > 0 ? normalizedToken : null;
};

export const getCurrentUserFromAccessToken = async (
  accessToken: string
): Promise<SupabaseAuthUser | null> => {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
};

/**
 * Returns the currently authenticated user from the session (validated with Supabase).
 * Use in Server Components and API Route Handlers to get the current user.
 * Returns null if unauthenticated or session invalid.
 */
export const getCurrentUser = async (): Promise<SupabaseAuthUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

export const getCurrentUserFromRequest = async (request: Request): Promise<ResolvedAuthUser> => {
  const accessToken = getBearerToken(request);
  if (accessToken) {
    const user = await getCurrentUserFromAccessToken(accessToken);
    return {
      user,
      source: 'bearer',
    };
  }

  const user = await getCurrentUser();
  return {
    user,
    source: 'cookie',
  };
};

/**
 * Returns the current session (without forcing a server round-trip to validate).
 * Prefer getCurrentUser() when you need a validated user; use this when you only
 * need to check presence of a session (e.g. redirect logic).
 */
export const getSession = async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
