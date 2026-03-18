'use client';

/* ----------------- Globals --------------- */
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

/* ----------------- Constants --------------- */
const MIN_PASSWORD_LENGTH = 6;

/* ----------------- Types --------------- */
type InviteSetPasswordClientProps = {
  email: string;
};

/* ----------------- Component --------------- */
export const InviteSetPasswordClient = ({ email }: InviteSetPasswordClientProps) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    window.location.href = `/invite/accept?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set your password to complete your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Setting password…' : 'Set password and continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};
