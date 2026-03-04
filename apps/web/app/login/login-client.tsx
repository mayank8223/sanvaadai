'use client';

/* ----------------- Globals --------------- */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OAUTH_PROVIDERS, type OAuthProviderId } from '@/lib/auth/constants';
import { buildOAuthRedirectUrl } from '@/lib/auth/helpers';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_REDIRECT_PATH = '/';
const SIGNUP_PATH = '/signup';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? DEFAULT_REDIRECT_PATH;
  const errorFromUrl = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(errorFromUrl);
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<OAuthProviderId | null>(null);
  const [redirectToUrl, setRedirectToUrl] = useState<string | null>(null);

  useEffect(() => {
    if (redirectToUrl) {
      window.location.href = redirectToUrl;
    }
  }, [redirectToUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(nextPath);
    router.refresh();
  };

  const handleOAuthSignIn = async (providerId: OAuthProviderId) => {
    setError(null);
    setOauthProvider(providerId);
    const supabase = createClient();
    const redirectTo = buildOAuthRedirectUrl(nextPath);
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: providerId,
      options: { redirectTo },
    });
    if (oauthError) {
      setError(oauthError.message);
      setOauthProvider(null);
      return;
    }
    if (data?.url) {
      setRedirectToUrl(data.url);
      return;
    }
    setOauthProvider(null);
  };

  const isOAuthLoading = oauthProvider !== null;
  const isFormDisabled = loading || isOAuthLoading;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate aria-label="Sign in">
        {error && (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="login-email">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isFormDisabled}
            aria-invalid={!!error}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="login-password">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isFormDisabled}
            aria-invalid={!!error}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isFormDisabled} aria-busy={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {OAUTH_PROVIDERS.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            className="w-full"
            disabled={isFormDisabled}
            aria-busy={oauthProvider === id}
            aria-label={`Sign in with ${label}`}
            onClick={() => handleOAuthSignIn(id)}
          >
            {oauthProvider === id ? `Signing in with ${label}…` : `Sign in with ${label}`}
          </Button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={
            SIGNUP_PATH +
            (nextPath !== DEFAULT_REDIRECT_PATH ? `?next=${encodeURIComponent(nextPath)}` : '')
          }
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};

export const LoginPageContent = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background font-sans">
    <main className="flex w-full max-w-md flex-col items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
      <p className="text-center text-muted-foreground">
        Sign in with your email and password or use Google / GitHub.
      </p>
      <LoginForm />
    </main>
  </div>
);

export default LoginForm;
