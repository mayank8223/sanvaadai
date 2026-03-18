/**
 * T30 – AI endpoint: description → FormDefinition.
 * POST /api/ai/forms/generate – accepts { description } and returns validated form draft.
 */

/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { generateFormFromDescription } from '@/lib/ai/form-generate';
import { withApiGuard } from '@/lib/auth/guards';

/* ----------------- API --------------- */
export const POST = withApiGuard(
  async (params) => {
    const { request } = params;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Set it in .env.local.' },
        { status: 503 }
      );
    }

    let body: { description?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const description = typeof body.description === 'string' ? body.description : null;
    if (!description) {
      return NextResponse.json(
        { error: 'description is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const result = await generateFormFromDescription({ description });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ form: result.form });
  },
  { requireAuth: true, requireMembership: true, allowedRoles: ['ADMIN'] }
);
