/* ----------------- Globals --------------- */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { AuthActions } from '@/components/auth/auth-actions';
import { OrgSwitcher, type OrganizationOption } from '@/components/organization/org-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import { getCurrentUser } from '@/lib/auth/server';
import {
  getFormSubmissionCount,
  parseFormsListFilters,
  type FormsListFormRecord,
  type FormsListSearchParams,
} from '@/lib/forms/listing';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const LOGIN_PATH = '/login';
const FORMS_PATH = '/forms';
const TEAM_SETTINGS_PATH = '/settings/team';
const ONBOARDING_ORGANIZATION_PATH = '/onboarding/organization';
const STATUS_FILTER_OPTIONS = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const FORM_SELECT_COLUMNS = 'id, title, status, created_at, submissions(count)';

/* ----------------- Helpers --------------- */
const formatIsoDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));

const getStatusBadgeClassName = (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
  if (status === 'PUBLISHED') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
  }

  if (status === 'ARCHIVED') {
    return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200';
  }

  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
};

const getFilterHref = (status: (typeof STATUS_FILTER_OPTIONS)[number]) =>
  status === 'ALL' ? FORMS_PATH : `${FORMS_PATH}?status=${encodeURIComponent(status)}`;

const getActiveMembership = (
  memberships: OrganizationOption[],
  requestedOrganizationId: string | null
) => {
  if (!requestedOrganizationId) {
    return memberships[0] ?? null;
  }

  return (
    memberships.find((membership) => membership.organization_id === requestedOrganizationId) ??
    memberships[0] ??
    null
  );
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

const loadForms = async (
  organizationId: string,
  status: (typeof STATUS_FILTER_OPTIONS)[number]
): Promise<FormsListFormRecord[]> => {
  const supabase = await createClient();
  let query = supabase
    .from('forms')
    .select(FORM_SELECT_COLUMNS)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (status !== 'ALL') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FormsListFormRecord[];
};

/* ----------------- Page --------------- */
type FormsPageProps = {
  searchParams?: Promise<FormsListSearchParams> | FormsListSearchParams;
};

const FormsPage = async ({ searchParams }: FormsPageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(FORMS_PATH)}`);
  }

  const supabase = await createClient();
  const { data: membershipsData, error: membershipsError } = await supabase
    .from('memberships')
    .select('organization_id, role, organizations:organization_id(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (membershipsError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Failed to load memberships</CardTitle>
            <CardDescription>{membershipsError.message}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const memberships = normalizeOrganizationOptions(
    (membershipsData ?? []) as Array<{
      organization_id: string;
      role: 'ADMIN' | 'COLLECTOR';
      organizations: Array<{ id: string; name: string; slug: string | null }> | null;
    }>
  );
  const cookieStore = await cookies();
  const requestedOrganizationId = cookieStore.get(ORGANIZATION_ID_COOKIE)?.value ?? null;
  const activeMembership = getActiveMembership(memberships, requestedOrganizationId);

  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 py-16">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>
              You need an admin membership to view the forms management page.
            </CardDescription>
          </CardHeader>
        </Card>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </main>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = parseFormsListFilters(resolvedSearchParams);

  let forms: FormsListFormRecord[] = [];
  let loadError: string | null = null;

  try {
    forms = await loadForms(activeMembership.organization_id, filters.status);
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load forms';
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage forms for your organization.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <OrgSwitcher
            memberships={memberships}
            activeOrganizationId={activeMembership.organization_id}
          />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={TEAM_SETTINGS_PATH}>Team settings</Link>
            </Button>
            <AuthActions userEmail={user.email ?? 'Signed in'} />
          </div>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        {STATUS_FILTER_OPTIONS.map((statusOption) => (
          <Button
            key={statusOption}
            asChild
            size="sm"
            variant={filters.status === statusOption ? 'default' : 'outline'}
          >
            <Link href={getFilterHref(statusOption)}>{statusOption}</Link>
          </Button>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All forms</CardTitle>
          <CardDescription>Title, status, created date, and submission volume.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <p className="text-sm text-destructive">Failed to load forms: {loadError}</p>
          ) : forms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No forms found for the current filter. Create a form to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-2 py-3 font-medium">Title</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Created</th>
                    <th className="px-2 py-3 font-medium text-right">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id} className="border-b">
                      <td className="px-2 py-3 font-medium text-foreground">{form.title}</td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClassName(form.status)}`}
                        >
                          {form.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {formatIsoDate(form.created_at)}
                      </td>
                      <td className="px-2 py-3 text-right text-foreground">
                        {getFormSubmissionCount(form)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default FormsPage;
