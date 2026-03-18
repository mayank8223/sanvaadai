/**
 * T32 – AI answer draft: dictation/transcription → AnswerDraft.
 * Maps spoken text to form fields using the AI SDK.
 */

/* ----------------- Globals --------------- */
import { generateText, Output } from 'ai';

import { chatModel } from './provider';
import { answerDraftSchema, type AnswerDraft } from './schemas';

/* ----------------- Types --------------- */
export type FormFieldForAnswerDraft = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'location';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type GenerateAnswerDraftInput = {
  transcription: string;
  fields: FormFieldForAnswerDraft[];
};

export type GenerateAnswerDraftResult =
  | { ok: true; answerDraft: AnswerDraft }
  | { ok: false; error: string };

/* ----------------- Constants --------------- */
const ANSWER_DRAFT_SYSTEM_PROMPT = `You are a form-filling assistant. Given a transcription of spoken dictation and a form definition (list of fields with key, label, type, required), you extract answers and identify gaps.

Rules:
- Map spoken content to the correct field by key
- For select fields, match spoken values to option labels or values
- For numbers, extract numeric values
- For dates, normalize to ISO date string (YYYY-MM-DD) when possible
- Put field keys in missingRequiredFields only when the field is required AND has no value
- followUpQuestions: ask one specific, concise question per missing required field
- Do not fabricate data; only use what is clearly stated in the transcription
- answers: use field key as key; value can be string, number, boolean, null, or string[] for multi-select`;

/* ----------------- Main --------------- */
export const generateAnswerDraftFromTranscription = async (
  input: GenerateAnswerDraftInput
): Promise<GenerateAnswerDraftResult> => {
  const { transcription, fields } = input;
  const trimmed = transcription.trim();
  if (!trimmed) {
    return { ok: false, error: 'Transcription is required.' };
  }
  if (!fields.length) {
    return { ok: false, error: 'At least one form field is required.' };
  }

  const fieldsDescription = fields
    .map(
      (f) =>
        `- ${f.key} (${f.type}, required: ${f.required}): ${f.label}${
          f.options?.length ? ` [options: ${f.options.map((o) => o.label).join(', ')}]` : ''
        }`
    )
    .join('\n');

  try {
    const { output } = await generateText({
      model: chatModel(),
      system: ANSWER_DRAFT_SYSTEM_PROMPT,
      prompt: `Form fields:\n${fieldsDescription}\n\nTranscription:\n${trimmed}\n\nExtract answers and identify missing required fields.`,
      output: Output.object({
        schema: answerDraftSchema,
        name: 'AnswerDraft',
        description: 'Extracted answers, missing required fields, and follow-up questions',
      }),
    });

    return { ok: true, answerDraft: output };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Answer draft generation failed';
    return { ok: false, error: message };
  }
};
