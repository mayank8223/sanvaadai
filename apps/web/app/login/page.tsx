/* ----------------- Globals --------------- */
import { redirect } from 'next/navigation';

import { LoginPageContent } from './login-client';
import { getAuthPageRedirectPath } from '@/lib/auth/auth-routes';
import { getSession } from '@/lib/auth/server';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to Sanvaadai Admin',
};

const LoginPage = async () => {
  const session = await getSession();
  const redirectPath = getAuthPageRedirectPath(Boolean(session));
  if (redirectPath) {
    redirect(redirectPath);
  }

  return <LoginPageContent />;
};

export default LoginPage;
