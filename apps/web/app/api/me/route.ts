/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/server';

/**
 * GET /api/me
 * Returns the currently authenticated user (from session/JWT).
 * Responds with 401 when unauthenticated.
 */
export const GET = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
};
