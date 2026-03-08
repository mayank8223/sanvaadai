/* ----------------- Globals --------------- */
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { SubmissionDetailClient } from '@/components/submissions/submission-detail-client';
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
const SUBMISSION_SELECT_COLUMNS =
  'id, organization_id, form_id, collector_user_id, payload, metadata, submitted_at, created_at, updated_at, users:collector_user_id(full_name, email)';
const FORM_SELECT_COLUMNS = 'id, title, fields';

/* ----------------- Page --------------- */
type SubmissionDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

const SubmissionDetailPage = async ({ params }: SubmissionDetailPageProps) => {
  const { id: submissionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(`/submissions/${submissionId}`)}`);
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
  const { data: submissionData, error: submissionError } = await supabase
    .from('submissions')
    .select(SUBMISSION_SELECT_COLUMNS)
    .eq('id', submissionId)
    .eq('organization_id', activeMembership.organization_id)
    .maybeSingle();

  if (submissionError || !submissionData) {
    notFound();
  }

  const formId = (submissionData as { form_id: string }).form_id;
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select(FORM_SELECT_COLUMNS)
    .eq('id', formId)
    .eq('organization_id', activeMembership.organization_id)
    .maybeSingle();

  if (formError || !formData) {
    notFound();
  }

  const row = submissionData as Record<string, unknown>;
  const payload = (row.payload as Record<string, unknown>) ?? {};
  const metadata = (row.metadata as Record<string, unknown>) ?? {};
  const users = row.users as { full_name: string | null; email: string | null } | null;
  const collector = users
    ? { full_name: users.full_name ?? null, email: users.email ?? null }
    : null;

  const submission = {
    id: String(row.id),
    form_id: String(row.form_id),
    collector_user_id: row.collector_user_id as string | null,
    collector,
    payload,
    metadata,
    submitted_at: String(row.submitted_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };

  const rawFields = (formData as { fields?: Array<{ id: string; key: string; label: string; type: string }> }).fields ?? [];
  const form = {
    id: String(formData.id),
    title: (formData as { title: string }).title,
    fields: rawFields,
  };

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={`/submissions/${submissionId}`}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Submission details</h1>
          <p className="text-sm text-muted-foreground">
            {form.title} · Submitted{' '}
            {new Intl.DateTimeFormat('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(submission.submitted_at as string))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/forms/${formId}/submissions`}>Back to submissions</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/forms/${formId}/edit`}>Edit form</Link>
          </Button>
        </div>
      </header>

      <SubmissionDetailClient submission={submission} form={form} />
    </AuthenticatedShell>
  );
};

export default SubmissionDetailPage;
