import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Skeleton API route for liveness/readiness checks (e.g. Vercel, load balancers).
 */
export const GET = () => {
  return NextResponse.json({ ok: true });
};
