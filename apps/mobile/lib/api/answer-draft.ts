/**
 * T33 – Mobile API client for AI answer draft.
 * Sends transcription + form definition to POST /api/ai/answers/draft.
 */

/* ----------------- Types --------------- */
type FormFieldForDraft = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'location';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
};

type AnswerDraft = {
  answers: Record<string, string | number | boolean | null | string[]>;
  missingRequiredFields: string[];
  followUpQuestions: Array<{ fieldKey: string; question: string }>;
};

type FetchAnswerDraftInput = {
  apiBaseUrl: string;
  accessToken: string;
  organizationId: string | null;
  transcription: string;
  formDefinition: { fields: FormFieldForDraft[] };
};

type FetchAnswerDraftResult =
  | { ok: true; answerDraft: AnswerDraft }
  | { ok: false; errorMessage: string; statusCode: number | null };

type FetchAnswerDraftResponseBody = {
  answerDraft?: AnswerDraft;
  error?: string;
};

/* ----------------- API --------------- */
export const fetchAnswerDraft = async ({
  apiBaseUrl,
  accessToken,
  organizationId,
  transcription,
  formDefinition,
}: FetchAnswerDraftInput): Promise<FetchAnswerDraftResult> => {
  let response: Response;
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    if (organizationId) {
      headers['x-organization-id'] = organizationId;
    }

    response = await fetch(`${apiBaseUrl}/api/ai/answers/draft`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transcription: transcription.trim(),
        formDefinition: {
          fields: formDefinition.fields.map((f) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
          })),
        },
      }),
    });
  } catch {
    return {
      ok: false,
      errorMessage: 'Answer draft request failed. Check your connection.',
      statusCode: null,
    };
  }

  let body: FetchAnswerDraftResponseBody | null = null;
  try {
    body = (await response.json()) as FetchAnswerDraftResponseBody;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      errorMessage: body?.error ?? 'Failed to generate answer draft.',
      statusCode: response.status,
    };
  }

  if (!body?.answerDraft) {
    return {
      ok: false,
      errorMessage: 'No answer draft returned.',
      statusCode: response.status,
    };
  }

  return {
    ok: true,
    answerDraft: body.answerDraft,
  };
};

/* ----------------- Helpers --------------- */
export const answerDraftToDraftAnswers = (
  answers: AnswerDraft['answers']
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (value === null || value === undefined) {
      result[key] = '';
      continue;
    }
    if (typeof value === 'string') {
      result[key] = value;
      continue;
    }
    if (typeof value === 'number') {
      result[key] = String(value);
      continue;
    }
    if (typeof value === 'boolean') {
      result[key] = value ? 'true' : 'false';
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.join(', ');
      continue;
    }
    result[key] = String(value);
  }
  return result;
};

export type { AnswerDraft, FormFieldForDraft };
