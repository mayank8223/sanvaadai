/* ----------------- Globals --------------- */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { OrgSwitcher, type OrganizationOption } from '@/components/organization/org-switcher';
import { AuthActions } from '@/components/auth/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import { getCurrentUser } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

import { TeamSettingsClient } from './team-settings-client';

/* ----------------- Constants --------------- */
const LOGIN_PATH = '/login';
const ONBOARDING_ORGANIZATION_PATH = '/onboarding/organization';

/* ----------------- Helpers --------------- */
const getActiveOrganizationId = (
  memberships: OrganizationOption[],
  requestedOrganizationId: string | null
) => {
  if (!requestedOrganizationId) return memberships[0]?.organization_id ?? null;
  const match = memberships.find(
    (membership) => membership.organization_id === requestedOrganizationId
  );
  return match?.organization_id ?? memberships[0]?.organization_id ?? null;
};

const normalizeOrganizationOptions = (
  memberships: Array<{
    organization_id: string;
    role: 'ADMIN' | 'COLLECTOR';
    organizations: Array<{ id: string; name: string; slug: string | null }> | null;
  }>
): OrganizationOption[] =>
  memberships.map((membership) => ({
    organization_id: membership.organization_id,
    role: membership.role,
    organization: membership.organizations?.[0] ?? null,
  }));

/* ----------------- Page --------------- */
const TeamSettingsPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent('/settings/team')}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role, organizations:organization_id(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Failed to load team settings</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const memberships = normalizeOrganizationOptions(
    (data ?? []) as Array<{
      organization_id: string;
      role: 'ADMIN' | 'COLLECTOR';
      organizations: Array<{ id: string; name: string; slug: string | null }> | null;
    }>
  );
  if (memberships.length === 0) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  const cookieStore = await cookies();
  const requestedOrganizationId = cookieStore.get(ORGANIZATION_ID_COOKIE)?.value ?? null;
  const activeOrganizationId = getActiveOrganizationId(memberships, requestedOrganizationId);
  const activeMembership = memberships.find(
    (membership) => membership.organization_id === activeOrganizationId
  );

  if (!activeMembership || activeMembership.role !== 'ADMIN') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 py-16">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>
              You need an admin role in the active organization to manage the team.
            </CardDescription>
          </CardHeader>
        </Card>
        <Button asChild variant="outline">
          <Link href="/forms">Back to forms</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage admins and collectors for your active organization.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <OrgSwitcher memberships={memberships} activeOrganizationId={activeOrganizationId} />
          <AuthActions userEmail={user.email ?? 'Signed in'} />
        </div>
      </header>

      <TeamSettingsClient organizationId={activeOrganizationId} />
    </main>
  );
};

export default TeamSettingsPage;
