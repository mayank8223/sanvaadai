/* ----------------- Globals --------------- */
import { redirect } from 'next/navigation';

import { OnboardingOrganizationClient } from './onboarding-organization-client';
import { getCurrentUser } from '@/lib/auth/server';
import { getUserMemberships } from '@/lib/auth/organization';

/* ----------------- Constants --------------- */
const LOGIN_PATH = '/login';
const DEFAULT_AFTER_AUTH_PATH = '/forms';

/* ----------------- Page --------------- */
const OnboardingOrganizationPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent('/onboarding/organization')}`);
  }

  const memberships = await getUserMemberships(user.id);
  if (memberships.length > 0) {
    redirect(DEFAULT_AFTER_AUTH_PATH);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
      <OnboardingOrganizationClient />
    </main>
  );
};

export default OnboardingOrganizationPage;
