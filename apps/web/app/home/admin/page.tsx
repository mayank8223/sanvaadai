/* ----------------- Globals --------------- */
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ADMIN_HOME_PATH,
  COLLECTOR_HOME_PATH,
  HOME_PATH,
  LOGIN_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Helpers --------------- */
const formatDateTime = (isoDate: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));

const toUserIdentity = (
  users:
    | { full_name: string | null; email: string | null }
    | Array<{ full_name: string | null; email: string | null }>
    | null
) => {
  if (!users) return null;
  if (Array.isArray(users)) {
    return users[0] ?? null;
  }

  return users;
};

/* ----------------- Page --------------- */
const AdminHomePage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(HOME_PATH)}`);
  }

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;
  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    redirect(COLLECTOR_HOME_PATH);
  }

  const organizationId = activeMembership.organization_id;
  const supabase = await createClient();

  const [
    { count: formsCount },
    { count: publishedFormsCount },
    { count: teamCount },
    recentResult,
  ] = await Promise.all([
    supabase
      .from('forms')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    supabase
      .from('forms')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'PUBLISHED'),
    supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    supabase
      .from('submissions')
      .select('id, submitted_at, collector_user_id, users:collector_user_id(full_name, email)')
      .eq('organization_id', organizationId)
      .order('submitted_at', { ascending: false })
      .limit(5),
  ]);
  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={ADMIN_HOME_PATH}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total forms</CardDescription>
            <CardTitle>{formsCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Published forms</CardDescription>
            <CardTitle>{publishedFormsCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Team members</CardDescription>
            <CardTitle>{teamCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent submissions</CardTitle>
            <CardDescription>Latest responses from your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentResult.error ? (
              <p className="text-sm text-destructive">{recentResult.error.message}</p>
            ) : (recentResult.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentResult.data ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {toUserIdentity(item.users)?.full_name ?? 'Unknown collector'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {toUserIdentity(item.users)?.email ??
                          item.collector_user_id ??
                          'No collector'}
                      </p>
                    </div>
                    <span className="text-muted-foreground">
                      {formatDateTime(item.submitted_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Most common admin tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/forms/new">Create form</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings/team">Manage team</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/forms">View submissions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AuthenticatedShell>
  );
};

export default AdminHomePage;
