/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseExportSubmissionsQuery } from '@/lib/submissions/contracts';
import { createClient } from '@/lib/supabase/server';

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
      .select('id, title')
      .eq('id', parsedQuery.formId)
      .eq('organization_id', activeMembership.organization_id)
      .maybeSingle();

    if (formError) {
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }

    if (!formData) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', activeMembership.organization_id)
      .eq('form_id', parsedQuery.formId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      export: {
        ready: false,
        reason: 'CSV/streaming export implementation is planned for T26.',
        form: {
          id: formData.id,
          title: formData.title,
        },
        requested_format: parsedQuery.format,
        estimated_rows: count ?? 0,
      },
    });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);
