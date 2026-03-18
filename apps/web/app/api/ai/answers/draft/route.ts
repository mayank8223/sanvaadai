/**
 * T32 – AI endpoint: dictation → AnswerDraft.
 * POST /api/ai/answers/draft – accepts transcription + form definition, returns AnswerDraft.
 */

/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import {
  generateAnswerDraftFromTranscription,
  type FormFieldForAnswerDraft,
} from '@/lib/ai/answer-draft';
import { withApiGuard } from '@/lib/auth/guards';

/* ----------------- Types --------------- */
type RequestBody = {
  transcription: string;
  formDefinition: {
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'select' | 'file' | 'location';
      required: boolean;
      options?: Array<{ value: string; label: string }>;
    }>;
  };
};

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

    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const transcription =
      typeof body.transcription === 'string' ? body.transcription : null;
    const formDefinition = body.formDefinition;

    if (!transcription) {
      return NextResponse.json(
        { error: 'transcription is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (
      !formDefinition ||
      !Array.isArray(formDefinition.fields) ||
      formDefinition.fields.length === 0
    ) {
      return NextResponse.json(
        { error: 'formDefinition.fields is required and must be a non-empty array.' },
        { status: 400 }
      );
    }

    const fields: FormFieldForAnswerDraft[] = formDefinition.fields.map(
      (f) => ({
        key: String(f.key),
        label: String(f.label),
        type: f.type,
        required: Boolean(f.required),
        options: Array.isArray(f.options) ? f.options : undefined,
      })
    );

    const result = await generateAnswerDraftFromTranscription({
      transcription,
      fields,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ answerDraft: result.answerDraft });
  },
  { requireAuth: true, requireMembership: true }
);
