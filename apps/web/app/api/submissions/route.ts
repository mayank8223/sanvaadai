/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseCreateSubmissionInput, parseListSubmissionsQuery } from '@/lib/submissions/contracts';
import { computeLocationFlags } from '@/lib/submissions/location-flags';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const SUBMISSION_SELECT_COLUMNS =
  'id, organization_id, form_id, collector_user_id, payload, metadata, submitted_at, created_at, updated_at, users:collector_user_id(full_name, email)';

/* ----------------- Helpers --------------- */
const getFormForOrganization = async (formId: string, organizationId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select('id, status')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/* ----------------- API: GET /api/submissions --------------- */
export const GET = withApiGuard(
  async ({ request, context }) => {
    const activeMembership = context.activeMembership;
    if (!activeMembership) {
      return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
    }

    const requestUrl = new URL(request.url);
    const parsedQuery = parseListSubmissionsQuery(requestUrl);
    if (!parsedQuery) {
      return NextResponse.json(
        {
          error:
            'Invalid query. Expected formId and optional limit, offset, collectorUserId, submittedAfter, submittedBefore.',
        },
        { status: 400 }
      );
    }

    let formRecord: { id: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } | null;
    try {
      formRecord = await getFormForOrganization(
        parsedQuery.formId,
        activeMembership.organization_id
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load form';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!formRecord) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const supabase = await createClient();
    let query = supabase
      .from('submissions')
      .select(SUBMISSION_SELECT_COLUMNS, { count: 'exact' })
      .eq('organization_id', activeMembership.organization_id)
      .eq('form_id', parsedQuery.formId)
      .order('submitted_at', { ascending: false })
      .range(parsedQuery.offset, parsedQuery.offset + parsedQuery.limit - 1);

    if (parsedQuery.collectorUserId) {
      query = query.eq('collector_user_id', parsedQuery.collectorUserId);
    }

    if (parsedQuery.submittedAfter) {
      query = query.gte('submitted_at', parsedQuery.submittedAfter);
    }

    if (parsedQuery.submittedBefore) {
      query = query.lte('submitted_at', parsedQuery.submittedBefore);
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submissions = (data ?? []).map((row: Record<string, unknown>) => {
      const metadata = (row.metadata as Record<string, unknown>) ?? {};
      const payload = (row.payload as Record<string, unknown>) ?? {};
      let flags = metadata.flags as Record<string, boolean> | undefined;
      if (!flags && payload.location) {
        flags = computeLocationFlags(payload.location as Parameters<typeof computeLocationFlags>[0]);
      }
      if (!flags) {
        flags = computeLocationFlags(null);
      }
      const users = row.users as { full_name: string | null; email: string | null } | null;
      return {
        ...row,
        collector: users
          ? { full_name: users.full_name ?? null, email: users.email ?? null }
          : null,
        flags,
        users: undefined,
      };
    });

    return NextResponse.json({
      submissions,
      pagination: {
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
        total: count ?? 0,
      },
    });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);

/* ----------------- API: POST /api/submissions --------------- */
export const POST = withApiGuard(async ({ request, context }) => {
  const activeMembership = context.activeMembership;
  if (!activeMembership || !context.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsedInput = parseCreateSubmissionInput(body);
  if (!parsedInput) {
    return NextResponse.json(
      {
        error:
          'Invalid body. Expected { form_id: string, answers: Record<string, unknown>, location?: { latitude, longitude, accuracy? } | null, client_submitted_at?: string, device?: { platform?: string, app_version?: string } }',
      },
      { status: 400 }
    );
  }

  let formRecord: { id: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } | null;
  try {
    formRecord = await getFormForOrganization(
      parsedInput.form_id,
      activeMembership.organization_id
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load form';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!formRecord) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  if (activeMembership.role === 'COLLECTOR' && formRecord.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Form is not available for submission' }, { status: 403 });
  }

  const nowIso = new Date().toISOString();
  const locationFlags = computeLocationFlags(parsedInput.location);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      organization_id: activeMembership.organization_id,
      form_id: parsedInput.form_id,
      collector_user_id: context.user.id,
      payload: parsedInput,
      metadata: {
        source: 'api',
        membership_role: activeMembership.role,
        received_at: nowIso,
        flags: locationFlags,
      },
      submitted_at: parsedInput.client_submitted_at ?? nowIso,
    })
    .select(SUBMISSION_SELECT_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submission: data }, { status: 201 });
});
