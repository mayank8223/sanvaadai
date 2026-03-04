/* ----------------- Globals --------------- */
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

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
