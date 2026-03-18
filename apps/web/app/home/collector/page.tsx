/* ----------------- Globals --------------- */
import type { Metadata } from 'next';
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
import { formatDateTime } from '@/lib/formatters';
import { APP_NAME } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Metadata --------------- */
export const metadata: Metadata = {
  title: `Home | ${APP_NAME}`,
};

/* ----------------- Page --------------- */
const CollectorHomePage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(HOME_PATH)}`);
  }

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;
  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'COLLECTOR') {
    redirect(ADMIN_HOME_PATH);
  }

  const organizationId = activeMembership.organization_id;
  const supabase = await createClient();

  const [formsResult, recentSubmissionsResult] = await Promise.all([
    supabase
      .from('forms')
      .select('id, title, status')
      .eq('organization_id', organizationId)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('submissions')
      .select('id, submitted_at, form_id')
      .eq('organization_id', organizationId)
      .eq('collector_user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5),
  ]);

  const formIds = Array.from(
    new Set((recentSubmissionsResult.data ?? []).map((submission) => submission.form_id))
  );
  const formNameById = new Map<string, string>();

  if (formIds.length > 0) {
    const { data } = await supabase.from('forms').select('id, title').in('id', formIds);
    for (const form of data ?? []) {
      formNameById.set(form.id, form.title);
    }
  }

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={COLLECTOR_HOME_PATH}
    >
      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card id="assigned-forms">
          <CardHeader>
            <CardTitle>Assigned published forms</CardTitle>
            <CardDescription>Start with any form below.</CardDescription>
          </CardHeader>
          <CardContent>
            {formsResult.error ? (
              <p className="text-sm text-destructive">{formsResult.error.message}</p>
            ) : (formsResult.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No published forms available yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(formsResult.data ?? []).map((form) => (
                  <li key={form.id} className="rounded-md border p-3">
                    <Link
                      href={`/collector/forms/${form.id}`}
                      className="block font-medium text-foreground hover:underline"
                    >
                      {form.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{form.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common collector actions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="#assigned-forms">Open forms</Link>
            </Button>
            <Button variant="outline" disabled>
              Continue draft
            </Button>
            <Button asChild variant="secondary">
              <Link href="#recent-submissions">Recent submissions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card id="recent-submissions">
          <CardHeader>
            <CardTitle>Your recent submissions</CardTitle>
            <CardDescription>Latest entries submitted by you.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissionsResult.error ? (
              <p className="text-sm text-destructive">{recentSubmissionsResult.error.message}</p>
            ) : (recentSubmissionsResult.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">You have not submitted any forms yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentSubmissionsResult.data ?? []).map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <span className="font-medium text-foreground">
                      {formNameById.get(submission.form_id) ?? 'Form'}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDateTime(submission.submitted_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </AuthenticatedShell>
  );
};

export default CollectorHomePage;
