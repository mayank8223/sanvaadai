/* ----------------- Globals --------------- */
import type { SupabaseClientOptions } from '@supabase/supabase-js';
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptionsWithName,
} from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/* ----------------- Constants --------------- */
// Read at runtime in updateSession so middleware can skip auth when env is missing.

/**
 * Options for the non-deprecated createServerClient overload (getAll/setAll).
 * Typing this forces the correct overload and avoids the deprecated (get/set/remove) signature.
 */
type ServerClientOptions = SupabaseClientOptions<'public'> & {
  cookieOptions?: CookieOptionsWithName;
  cookies: CookieMethodsServer;
  cookieEncoding?: 'raw' | 'base64url';
};

const PUBLIC_PATH_PREFIXES = ['/login', '/signup', '/auth', '/invite', '/api/health'];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((publicPathPrefix) => pathname.startsWith(publicPathPrefix));

/**
 * Refreshes the Supabase auth session and applies cookie updates to the response.
 * Call this from middleware on every request so the browser and server stay in sync.
 * Do not run code between createServerClient and supabase.auth.getClaims().
 * If Supabase env vars are missing, skips auth and returns next() so the app does not throw.
 */
export const updateSession = async (request: NextRequest) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const pathname = request.nextUrl.pathname;

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      supabaseResponse = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      );
    },
  };

  const options: ServerClientOptions = {
    cookies: cookieMethods,
  };

  const supabase = createServerClient(url, anonKey, options);

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Allow unauthenticated access to explicitly public routes.
  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
};
