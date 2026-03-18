/* ----------------- Globals --------------- */
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  COLLECTOR_HOME_PATH,
  LOGIN_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';

import { APP_NAME } from '@/lib/constants';

import { TeamSettingsClient } from './team-settings-client';

/* ----------------- Metadata --------------- */
export const metadata: Metadata = {
  title: `Team Settings | ${APP_NAME}`,
};

/* ----------------- Constants --------------- */
const TEAM_SETTINGS_PATH = '/settings/team';

/* ----------------- Page --------------- */
const TeamSettingsPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(TEAM_SETTINGS_PATH)}`);
  }

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;
  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    return (
      <AuthenticatedShell
        userEmail={user.email ?? null}
        memberships={shellContext.memberships}
        activeMembership={activeMembership}
        currentPath={TEAM_SETTINGS_PATH}
      >
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 py-8">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Admin access required</CardTitle>
              <CardDescription>
                You need an admin role in the active organization to manage the team.
              </CardDescription>
            </CardHeader>
          </Card>
          <Button asChild variant="outline">
            <Link href={COLLECTOR_HOME_PATH}>Back to home</Link>
          </Button>
        </section>
      </AuthenticatedShell>
    );
  }

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={TEAM_SETTINGS_PATH}
    >
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Team settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage admins and collectors for your active organization.
          </p>
        </header>
        <TeamSettingsClient organizationId={activeMembership.organization_id} />
      </section>
    </AuthenticatedShell>
  );
};

export default TeamSettingsPage;
