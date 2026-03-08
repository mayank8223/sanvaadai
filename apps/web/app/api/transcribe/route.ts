/**
 * T28 – Speech-to-text API (shared for web & mobile).
 * POST /api/transcribe – accepts multipart audio, returns transcription.
 */

/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import {
  transcribeAudio,
  validateAudioFile,
} from '@/lib/ai/transcribe';
import { withApiGuard } from '@/lib/auth/guards';

/* ----------------- Constants --------------- */
const FORM_FIELD_NAME = 'audio';

/* ----------------- API --------------- */
export const POST = withApiGuard(
  async ({ request }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Set it in .env.local.' },
        { status: 503 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid multipart form data.' },
        { status: 400 }
      );
    }

    const file = formData.get(FORM_FIELD_NAME);
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          error: `Missing or invalid "${FORM_FIELD_NAME}" field. Send multipart/form-data with an audio file.`,
        },
        { status: 400 }
      );
    }

    const validation = validateAudioFile({
      size: file.size,
      type: file.type,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
    } catch {
      return NextResponse.json(
        { error: 'Failed to read audio file.' },
        { status: 400 }
      );
    }

    const language = formData.get('language');
    const languageStr =
      typeof language === 'string' && language.length === 2
        ? language
        : undefined;

    try {
      const result = await transcribeAudio({
        audio: buffer,
        language: languageStr,
      });

      return NextResponse.json({
        text: result.text,
        language: result.language,
        durationInSeconds: result.durationInSeconds,
        segments: result.segments,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  { requireAuth: true, requireMembership: false }
);
