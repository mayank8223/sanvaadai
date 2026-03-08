/* ----------------- Globals --------------- */
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { SubmissionsTableClient } from '@/components/forms/submissions-table-client';
import { ExportCsvButton } from '@/components/submissions/export-csv-button';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import { Button } from '@/components/ui/button';
import {
  COLLECTOR_HOME_PATH,
  LOGIN_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const FORMS_PATH = '/forms';
const FORM_SELECT_COLUMNS = 'id, title, organization_id';

type CollectorOption = {
  user_id: string;
  email: string | null;
  full_name: string | null;
};

/* ----------------- Page --------------- */
type SubmissionsPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

const SubmissionsPage = async ({ params }: SubmissionsPageProps) => {
  const { id: formId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(`/forms/${formId}/submissions`)}`);
  }

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;

  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    redirect(COLLECTOR_HOME_PATH);
  }

  const supabase = await createClient();
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select(FORM_SELECT_COLUMNS)
    .eq('id', formId)
    .eq('organization_id', activeMembership.organization_id)
    .maybeSingle();

  if (formError || !formData) {
    notFound();
  }

  const { data: membersData } = await supabase
    .from('memberships')
    .select('user_id, users:user_id(id, email, full_name)')
    .eq('organization_id', activeMembership.organization_id)
    .eq('role', 'COLLECTOR');

  const rawMembers = (membersData ?? []) as Array<{
    user_id: string;
    users: { id: string; email: string | null; full_name: string | null } | Array<{ id: string; email: string | null; full_name: string | null }> | null;
  }>;
  const collectors: CollectorOption[] = rawMembers.map((row) => {
    const users = row.users;
    const user = Array.isArray(users) ? users[0] ?? null : users;
    return {
      user_id: row.user_id,
      email: user?.email ?? null,
      full_name: user?.full_name ?? null,
    };
  });

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={`/forms/${formId}/submissions`}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Submissions: {formData.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and filter submissions for this form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton formId={formId} formTitle={formData.title} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/forms/${formId}/edit`}>Edit form</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={FORMS_PATH}>Back to forms</Link>
          </Button>
        </div>
      </header>

      <SubmissionsTableClient
        formId={formId}
        formTitle={formData.title}
        collectors={collectors}
      />
    </AuthenticatedShell>
  );
};

export default SubmissionsPage;
