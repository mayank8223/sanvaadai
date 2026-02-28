/* ----------------- Globals --------------- */
import type { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptionsWithName,
} from '@supabase/ssr';
import { cookies } from 'next/headers';

/* ----------------- Constants --------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Options for the non-deprecated createServerClient overload (getAll/setAll).
 * Asserting to this type forces the correct overload and avoids the deprecated
 * (get/set/remove) signature.
 */
type ServerClientOptions = SupabaseClientOptions<'public'> & {
  cookieOptions?: CookieOptionsWithName;
  cookies: CookieMethodsServer;
  cookieEncoding?: 'raw' | 'base64url';
};

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses cookies for session; create one per request/action.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      } catch {
        // Called from a Server Component; middleware can refresh sessions.
      }
    },
  };

  const options: ServerClientOptions = {
    cookies: cookieMethods,
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, options);
};
