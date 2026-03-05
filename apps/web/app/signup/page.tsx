/* ----------------- Globals --------------- */
import { redirect } from 'next/navigation';

import { SignUpPageContent } from './signup-client';
import { getAuthPageRedirectPath } from '@/lib/auth/auth-routes';
import { getSession } from '@/lib/auth/server';

export const metadata = {
  title: 'Create account',
  description: 'Create a Sanvaadai Admin account',
};

const SignUpPage = async () => {
  const session = await getSession();
  const redirectPath = getAuthPageRedirectPath(Boolean(session));
  if (redirectPath) {
    redirect(redirectPath);
  }

  return <SignUpPageContent />;
};

export default SignUpPage;
