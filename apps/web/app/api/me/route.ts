/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';

/**
 * GET /api/me
 * Returns the currently authenticated user plus resolved org/membership context.
 * Responds with 401 when unauthenticated.
 */
export const GET = withApiGuard(
  async ({ context }) => {
    const { user, memberships, activeMembership, requestedOrganizationId } = context;

    return NextResponse.json({
      user: {
        id: user?.id ?? null,
        email: user?.email ?? null,
      },
      membership: {
        requestedOrganizationId,
        activeOrganizationId: activeMembership?.organization_id ?? null,
        role: activeMembership?.role ?? null,
      },
      memberships,
    });
  },
  {
    requireAuth: true,
    requireMembership: false,
  }
);
