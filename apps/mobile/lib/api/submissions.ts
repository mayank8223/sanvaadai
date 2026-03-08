/* ----------------- Globals --------------- */
import type { SubmissionPayload } from '@sanvaadai/types';

/* ----------------- Types --------------- */
type CreateSubmissionInput = {
  apiBaseUrl: string;
  accessToken: string;
  organizationId: string;
  payload: SubmissionPayload;
};

type CreateSubmissionResult =
  | {
      ok: true;
      submissionId: string | null;
      statusCode: number;
    }
  | {
      ok: false;
      errorMessage: string;
      statusCode: number | null;
    };

type CreateSubmissionResponseBody = {
  submission?: {
    id?: string;
  };
  error?: string;
};

/* ----------------- API --------------- */
export const createSubmission = async ({
  apiBaseUrl,
  accessToken,
  organizationId,
  payload,
}: CreateSubmissionInput): Promise<CreateSubmissionResult> => {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-organization-id': organizationId,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      errorMessage: 'Submission failed. Please try again.',
      statusCode: null,
    };
  }

  let responseBody: CreateSubmissionResponseBody | null = null;
  try {
    responseBody = (await response.json()) as CreateSubmissionResponseBody;
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      errorMessage: responseBody?.error ?? 'Submission failed. Please try again.',
      statusCode: response.status,
    };
  }

  return {
    ok: true,
    submissionId: responseBody?.submission?.id ?? null,
    statusCode: response.status,
  };
};
