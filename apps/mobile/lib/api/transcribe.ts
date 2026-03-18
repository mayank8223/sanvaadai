/**
 * T33 – Mobile API client for speech-to-text.
 * Sends audio to POST /api/transcribe.
 */

/* ----------------- Types --------------- */
type TranscribeInput = {
  apiBaseUrl: string;
  accessToken: string;
  organizationId: string | null;
  audioUri: string;
  mimeType?: string;
  language?: string;
};

type TranscribeResult =
  | { ok: true; text: string; language?: string; durationInSeconds?: number }
  | { ok: false; errorMessage: string; statusCode: number | null };

type TranscribeResponseBody = {
  text?: string;
  language?: string;
  durationInSeconds?: number;
  error?: string;
};

/* ----------------- Constants --------------- */
const DEFAULT_MIME_TYPE = 'audio/m4a';
const DEFAULT_FILE_NAME = 'recording.m4a';

/* ----------------- API --------------- */
export const transcribeAudio = async ({
  apiBaseUrl,
  accessToken,
  organizationId,
  audioUri,
  mimeType = DEFAULT_MIME_TYPE,
  language,
}: TranscribeInput): Promise<TranscribeResult> => {
  let response: Response;
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: mimeType,
      name: DEFAULT_FILE_NAME,
    } as unknown as Blob);

    if (language && language.length === 2) {
      formData.append('language', language);
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (organizationId) {
      headers['x-organization-id'] = organizationId;
    }

    response = await fetch(`${apiBaseUrl}/api/transcribe`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    return {
      ok: false,
      errorMessage: 'Transcription request failed. Check your connection.',
      statusCode: null,
    };
  }

  let body: TranscribeResponseBody | null = null;
  try {
    body = (await response.json()) as TranscribeResponseBody;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      errorMessage: body?.error ?? 'Transcription failed.',
      statusCode: response.status,
    };
  }

  return {
    ok: true,
    text: body?.text ?? '',
    language: body?.language,
    durationInSeconds: body?.durationInSeconds,
  };
};
