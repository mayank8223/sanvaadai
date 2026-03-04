/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseUpdateFormInput } from '@/lib/forms/contracts';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const FORM_SELECT_COLUMNS =
  'id, organization_id, created_by_user_id, title, description, status, fields, version, published_at, archived_at, created_at, updated_at';

/* ----------------- API: GET /api/forms/[id] --------------- */
export const GET = withApiGuard(async ({ context, request }) => {
  const activeMembership = context.activeMembership;
  if (!activeMembership) {
    return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
  }

  const pathname = new URL(request.url).pathname;
  const formId = pathname.split('/').pop() ?? '';
  if (!formId) {
    return NextResponse.json({ error: 'Form id is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms')
    .select(FORM_SELECT_COLUMNS)
    .eq('id', formId)
    .eq('organization_id', activeMembership.organization_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  if (activeMembership.role === 'COLLECTOR' && data.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  return NextResponse.json({ form: data });
});

/* ----------------- API: PATCH /api/forms/[id] --------------- */
export const PATCH = withApiGuard(
  async ({ context, request }) => {
    const activeMembership = context.activeMembership;
    if (!activeMembership) {
      return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
    }

    const pathname = new URL(request.url).pathname;
    const formId = pathname.split('/').pop() ?? '';
    if (!formId) {
      return NextResponse.json({ error: 'Form id is required' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedInput = parseUpdateFormInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        {
          error:
            'Invalid body. Expected at least one of { title, description, fields } with valid values.',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('forms')
      .update({
        ...parsedInput,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)
      .eq('organization_id', activeMembership.organization_id)
      .select(FORM_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ form: data });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);
