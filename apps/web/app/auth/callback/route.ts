/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback route for Supabase Auth.
 * Exchanges the authorization code (from email confirmation or OAuth) for a session
 * and sets cookies. Required for server-side auth flow with @supabase/ssr.
 * Redirects to ?next= or origin.
 */
export const GET = async (request: Request) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  const redirectUrl = new URL(nextPath, requestUrl.origin);
  return NextResponse.redirect(redirectUrl);
};
