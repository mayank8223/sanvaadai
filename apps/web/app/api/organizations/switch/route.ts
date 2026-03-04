/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import { withApiGuard } from '@/lib/auth/guards';
import { parseSwitchOrganizationInput } from '@/lib/organizations/contracts';
import { getUserMembershipsForOrganization } from '@/lib/organizations/service';

/* ----------------- Constants --------------- */
const ORGANIZATION_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 365,
};

/* ----------------- API: POST /api/organizations/switch --------------- */
export const POST = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedInput = parseSwitchOrganizationInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        { error: 'Invalid body. Expected { organizationId: string }' },
        { status: 400 }
      );
    }

    let memberships;
    try {
      memberships = await getUserMembershipsForOrganization(
        context.user.id,
        parsedInput.organizationId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate membership';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: No membership for requested organization' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      organizationId: parsedInput.organizationId,
    });

    response.cookies.set(
      ORGANIZATION_ID_COOKIE,
      parsedInput.organizationId,
      ORGANIZATION_COOKIE_OPTIONS
    );
    return response;
  },
  {
    requireMembership: false,
  }
);
