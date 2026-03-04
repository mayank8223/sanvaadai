/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';

import { parseCreateFormInput, parseFormStatus } from '@/lib/forms/contracts';

/* ----------------- Constants --------------- */
const FORM_SELECT_COLUMNS =
  'id, organization_id, created_by_user_id, title, description, status, fields, version, published_at, archived_at, created_at, updated_at';

/* ----------------- API: GET /api/forms --------------- */
export const GET = withApiGuard(async ({ request, context }) => {
  const activeMembership = context.activeMembership;
  if (!activeMembership) {
    return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
  }

  const requestUrl = new URL(request.url);
  const requestedStatus = requestUrl.searchParams.get('status');
  const parsedStatus = requestedStatus ? parseFormStatus(requestedStatus) : null;

  if (requestedStatus && !parsedStatus) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from('forms')
    .select(FORM_SELECT_COLUMNS)
    .eq('organization_id', activeMembership.organization_id)
    .order('created_at', { ascending: false });

  if (activeMembership.role === 'COLLECTOR') {
    query = query.eq('status', 'PUBLISHED');
  } else if (parsedStatus) {
    query = query.eq('status', parsedStatus);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ forms: data ?? [] });
});

/* ----------------- API: POST /api/forms --------------- */
export const POST = withApiGuard(
  async ({ request, context }) => {
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

    const parsedInput = parseCreateFormInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        {
          error:
            'Invalid body. Expected { title: string, description?: string | null, fields: FormFieldDefinition[] }',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forms')
      .insert({
        organization_id: activeMembership.organization_id,
        created_by_user_id: context.user.id,
        title: parsedInput.title,
        description: parsedInput.description,
        fields: parsedInput.fields,
      })
      .select(FORM_SELECT_COLUMNS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ form: data }, { status: 201 });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);
