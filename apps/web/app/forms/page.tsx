/* ----------------- Globals --------------- */
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  COLLECTOR_HOME_PATH,
  LOGIN_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';
import {
  getFormSubmissionCount,
  parseFormsListFilters,
  type FormsListFormRecord,
  type FormsListSearchParams,
} from '@/lib/forms/listing';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const FORMS_PATH = '/forms';
const NEW_FORM_PATH = '/forms/new';
const TEAM_SETTINGS_PATH = '/settings/team';
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
    return 'bg-green-500 text-green-800 dark:bg-green-500 dark:text-green-200';
  }

  if (status === 'ARCHIVED') {
    return 'bg-gray-500 text-gray-800 dark:bg-gray-500 dark:text-gray-200';
  }

  return 'bg-yellow-500 text-yellow-800 dark:bg-yellow-500 dark:text-yellow-200';
};

const getFilterHref = (status: (typeof STATUS_FILTER_OPTIONS)[number]) =>
  status === 'ALL' ? FORMS_PATH : `${FORMS_PATH}?status=${encodeURIComponent(status)}`;

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

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;

  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    redirect(COLLECTOR_HOME_PATH);
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
  console.log('activeMembership--tt', activeMembership);
  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={FORMS_PATH}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage forms for your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href={NEW_FORM_PATH}>Create form</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={TEAM_SETTINGS_PATH}>Team settings</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2 py-2">
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
                    <th className="px-2 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id} className="border-b">
                      <td className="px-2 py-3 font-medium text-foreground">{form.title}</td>
                      <td className="px-2 py-3">
                        <Badge variant="primary" className={getStatusBadgeClassName(form.status)}>
                          {form.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {formatIsoDate(form.created_at)}
                      </td>
                      <td className="px-2 py-3 text-right text-foreground">
                        {getFormSubmissionCount(form)}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/forms/${form.id}/edit`}>Edit</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedShell>
  );
};

export default FormsPage;
