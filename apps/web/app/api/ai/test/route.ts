/**
 * T27 – Simple AI test endpoint to verify Vercel AI SDK + OpenAI integration.
 * GET /api/ai/test – returns a short generated message (requires auth).
 * Remove or restrict in production.
 */

/* ----------------- Globals --------------- */
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

import { chatModel } from '@/lib/ai/provider';
import { withApiGuard } from '@/lib/auth/guards';

/* ----------------- API --------------- */
export const GET = withApiGuard(
  async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Set it in .env.local.' },
        { status: 503 }
      );
    }

    try {
      const { text } = await generateText({
        model: chatModel(),
        prompt: 'Say "AI integration working" in exactly 5 words or fewer.',
      });

      return NextResponse.json({ ok: true, message: text.trim() });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI request failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  { requireAuth: true, requireMembership: false }
);
