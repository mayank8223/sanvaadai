'use client';

/* ----------------- Globals --------------- */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_REDIRECT_PATH = '/';
const LOGIN_PATH = '/login';

const SignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? DEFAULT_REDIRECT_PATH;
  const errorFromUrl = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(errorFromUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: fullName ? { full_name: fullName } : undefined },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists. Sign in instead.');
      return;
    }
    if (data?.session) {
      router.push(nextPath);
      router.refresh();
      return;
    }
    setMessage(
      'Check your email to confirm your account. Then sign in below or use the link in the email.'
    );
  };

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Create account"
    >
      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {message}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="signup-full-name">
          Full name <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="signup-full-name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="signup-email">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          aria-invalid={!!error}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="signup-password">
          Password
        </label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
          aria-invalid={!!error}
        />
        <p className="text-xs text-muted-foreground">At least 6 characters.</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={
            LOGIN_PATH +
            (nextPath !== DEFAULT_REDIRECT_PATH ? `?next=${encodeURIComponent(nextPath)}` : '')
          }
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export const SignUpPageContent = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background font-sans">
    <main className="flex w-full max-w-md flex-col items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
      <p className="text-center text-muted-foreground">Create an admin account with your email.</p>
      <SignUpForm />
    </main>
  </div>
);

export default SignUpForm;
