import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LandingPage } from '@/components/landing/landing-page';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HOME_PATH,
  ONBOARDING_ORGANIZATION_PATH,
  resolveHomeRouteDecision,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';

export const metadata: Metadata = {
  title: 'Sanvaadai - AI-Powered Field Data Collection',
  description:
    'Create smart forms with AI, collect data offline, and analyze results. The modern platform for field research and data collection.',
};

const HomePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return <LandingPage />;
  }

  const shellContext = await loadShellContext(user.id);
  const routeDecision = resolveHomeRouteDecision(shellContext);
  if (routeDecision.type === 'redirect') {
    redirect(routeDecision.destination);
  }

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={shellContext.activeMembership}
      currentPath={HOME_PATH}
    >
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {routeDecision.state === 'no-membership' ? (
          <Card>
            <CardHeader>
              <CardTitle>Set up your organization</CardTitle>
              <CardDescription>
                You are signed in but not part of any organization yet. Create your organization to
                continue, or ask an admin to invite you.
              </CardDescription>
              <div className="pt-2">
                <Button asChild>
                  <Link href={ONBOARDING_ORGANIZATION_PATH}>Create organization</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Organization selection is out of date</CardTitle>
              <CardDescription>
                Your current organization selection is no longer valid. Switch organization from the
                header to continue.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </AuthenticatedShell>
  );
};

export default HomePage;
