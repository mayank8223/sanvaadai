'use client';

/* ----------------- Globals --------------- */
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const LOGIN_PATH = '/login';

const signOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
};

export type AuthActionsProps = {
  /** User email to display. */
  userEmail: string;
};

export const AuthActions = ({ userEmail }: AuthActionsProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push(LOGIN_PATH);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground" aria-label="Signed in as">
        {userEmail}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        type="button"
        aria-label="Sign out"
      >
        Sign out
      </Button>
    </div>
  );
};
