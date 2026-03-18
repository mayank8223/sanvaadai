'use client';

/* ----------------- Globals --------------- */
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

/* ----------------- Types --------------- */
type InviteAcceptClientProps = {
  email: string;
};

/* ----------------- Component --------------- */
export const InviteAcceptClient = ({ email }: InviteAcceptClientProps) => {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const code = otp.trim().replace(/\s/g, '');
    if (!code) {
      setError('Enter the 6-digit code from your email');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'invite',
    });

    if (verifyError) {
      setError(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    router.push(`/invite/set-password?email=${encodeURIComponent(email)}`);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code from your invite email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification code
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isSubmitting}
              className="text-center text-lg tracking-[0.5em]"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying…' : 'Verify and join'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Check your inbox at {email}
        </p>
      </div>
    </div>
  );
};
