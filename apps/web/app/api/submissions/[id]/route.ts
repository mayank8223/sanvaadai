/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { computeLocationFlags } from '@/lib/submissions/location-flags';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const SUBMISSION_SELECT_COLUMNS =
  'id, organization_id, form_id, collector_user_id, payload, metadata, submitted_at, created_at, updated_at, users:collector_user_id(full_name, email)';

/* ----------------- Helpers --------------- */
const getSubmissionIdFromPathname = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  const submissionsIndex = segments.indexOf('submissions');
  if (submissionsIndex < 0) return null;
  const id = segments[submissionsIndex + 1] ?? null;
  return id?.trim() ? id : null;
};

/* ----------------- API: GET /api/submissions/[id] --------------- */
export const GET = withApiGuard(
  async ({ request, context }) => {
    const activeMembership = context.activeMembership;
    if (!activeMembership) {
      return NextResponse.json({ error: 'Forbidden: Membership required' }, { status: 403 });
    }

    const id = getSubmissionIdFromPathname(new URL(request.url).pathname);
    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('submissions')
      .select(SUBMISSION_SELECT_COLUMNS)
      .eq('id', id)
      .eq('organization_id', activeMembership.organization_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const row = data as Record<string, unknown>;
    const metadata = (row.metadata as Record<string, unknown>) ?? {};
    const payload = (row.payload as Record<string, unknown>) ?? {};
    let flags = metadata.flags as Record<string, boolean> | undefined;
    if (!flags && payload.location) {
      flags = computeLocationFlags(
        payload.location as Parameters<typeof computeLocationFlags>[0]
      );
    }
    if (!flags) {
      flags = computeLocationFlags(null);
    }

    const users = row.users as { full_name: string | null; email: string | null } | null;
    const collector = users
      ? { full_name: users.full_name ?? null, email: users.email ?? null }
      : null;

    return NextResponse.json({
      submission: {
        ...row,
        collector,
        flags,
        users: undefined,
      },
    });
  },
  {
    allowedRoles: ['ADMIN'],
  }
);
