/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { buildSubmissionsCsv, MAX_EXPORT_ROWS } from '@/lib/submissions/csv-export';
import { parseExportSubmissionsQuery } from '@/lib/submissions/contracts';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const SUBMISSION_SELECT_COLUMNS =
  'id, form_id, collector_user_id, payload, metadata, submitted_at, users:collector_user_id(full_name, email)';

/* ----------------- API: GET /api/submissions/export --------------- */
export const GET = withApiGuard(
  async ({ request, context }) => {
    const activeMembership = context.activeMembership;
    if (!activeMembership) {
      return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
    }

    const requestUrl = new URL(request.url);
    const parsedQuery = parseExportSubmissionsQuery(requestUrl);
    if (!parsedQuery) {
      return NextResponse.json(
        {
          error: 'Invalid query. Expected formId and optional format=csv|json.',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('id, title, fields')
      .eq('id', parsedQuery.formId)
      .eq('organization_id', activeMembership.organization_id)
      .maybeSingle();

    if (formError) {
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }

    if (!formData) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const { data: submissionRows, error: submissionsError } = await supabase
      .from('submissions')
      .select(SUBMISSION_SELECT_COLUMNS)
      .eq('organization_id', activeMembership.organization_id)
      .eq('form_id', parsedQuery.formId)
      .order('submitted_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS);

    if (submissionsError) {
      return NextResponse.json({ error: submissionsError.message }, { status: 500 });
    }

    const formFields = ((formData as { fields?: Array<{ key: string; label: string }> }).fields ??
      []) as Array<{ key: string; label: string }>;

    if (parsedQuery.format === 'csv') {
      const submissions = (submissionRows ?? []).map((row: Record<string, unknown>) => {
        const users = row.users as { full_name: string | null; email: string | null } | null;
        return {
          id: String(row.id ?? ''),
          form_id: String(row.form_id ?? ''),
          collector_user_id: row.collector_user_id as string | null,
          collector_name: users?.full_name ?? null,
          collector_email: users?.email ?? null,
          submitted_at: String(row.submitted_at ?? ''),
          payload: (row.payload as Record<string, unknown>) ?? {},
          metadata: (row.metadata as Record<string, unknown>) ?? {},
        };
      });

      const csv = buildSubmissionsCsv(submissions, formFields);
      const filename = `submissions-${(formData as { title: string }).title.replace(/[^a-z0-9-_]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const submissions = (submissionRows ?? []).map((row: Record<string, unknown>) => {
      const users = row.users as { full_name: string | null; email: string | null } | null;
      return {
        ...row,
        collector_name: users?.full_name ?? null,
        collector_email: users?.email ?? null,
        users: undefined,
      };
    });

    return NextResponse.json({
      export: {
        ready: true,
        form: { id: formData.id, title: (formData as { title: string }).title },
        format: 'json',
        submissions,
      },
    });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);
