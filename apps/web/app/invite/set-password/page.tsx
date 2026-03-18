/* ----------------- Globals --------------- */
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/server';
import { InviteSetPasswordClient } from './invite-set-password-client';

/* ----------------- Page --------------- */
type InviteSetPasswordPageProps = {
  searchParams: Promise<{ email?: string }>;
};

const InviteSetPasswordPage = async ({ searchParams }: InviteSetPasswordPageProps) => {
  const params = await searchParams;
  const email = params.email?.trim();

  if (!email) {
    redirect('/login?error=Invalid+invite+link');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/set-password?email=${email}`)}`);
  }

  if (user.email?.toLowerCase() !== email.toLowerCase()) {
    redirect('/login?error=Email+does+not+match+invite');
  }

  return <InviteSetPasswordClient email={email} />;
};

export default InviteSetPasswordPage;
