/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseFormStatus } from '@/lib/forms/contracts';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const FORM_SELECT_COLUMNS =
  'id, organization_id, created_by_user_id, title, description, status, fields, version, published_at, archived_at, created_at, updated_at';

const getFormIdFromStatusPathname = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  const statusIndex = segments.lastIndexOf('status');
  if (statusIndex <= 0) return null;
  return segments[statusIndex - 1] ?? null;
};

/* ----------------- API: PATCH /api/forms/[id]/status --------------- */
export const PATCH = withApiGuard(
  async ({ context, request }) => {
    const activeMembership = context.activeMembership;
    if (!activeMembership) {
      return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
    }

    const pathname = new URL(request.url).pathname;
    const formId = getFormIdFromStatusPathname(pathname);
    if (!formId) {
      return NextResponse.json({ error: 'Form id is required' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const rawStatus =
      typeof body === 'object' && body !== null ? (body as { status?: unknown }).status : null;
    const status = parseFormStatus(rawStatus);
    if (!status) {
      return NextResponse.json(
        { error: 'Invalid body. Expected { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const supabase = await createClient();

    const updatePayload: {
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      published_at?: string | null;
      archived_at?: string | null;
      updated_at: string;
    } = {
      status,
      updated_at: now,
    };

    if (status === 'PUBLISHED') {
      updatePayload.published_at = now;
      updatePayload.archived_at = null;
    } else if (status === 'ARCHIVED') {
      updatePayload.archived_at = now;
    } else {
      updatePayload.archived_at = null;
    }

    const { data, error } = await supabase
      .from('forms')
      .update(updatePayload)
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
