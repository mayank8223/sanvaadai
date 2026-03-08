/**
 * T28 – Speech-to-text transcription using Vercel AI SDK + OpenAI Whisper.
 */

/* ----------------- Globals --------------- */
import { experimental_transcribe as transcribe } from 'ai';

import {
  ALLOWED_AUDIO_MIME_TYPES,
  MAX_TRANSCRIPTION_FILE_SIZE_BYTES,
} from './constants';
import { transcriptionModel } from './provider';

/* ----------------- Types --------------- */
export type TranscribeResult = {
  text: string;
  language?: string;
  durationInSeconds?: number;
  segments?: Array<{ start: number; end: number; text: string }>;
};

export type TranscribeInput = {
  audio: Buffer | Uint8Array | ArrayBuffer;
  language?: string;
};

/* ----------------- Helpers --------------- */
const isAllowedMimeType = (mime: string | null): boolean => {
  if (!mime) return true;
  const normalized = mime.toLowerCase().split(';')[0].trim();
  return (ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(normalized);
};

export const validateAudioFile = (file: {
  size: number;
  type?: string | null;
}): { ok: true } | { ok: false; error: string } => {
  if (file.size > MAX_TRANSCRIPTION_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File too large. Max ${MAX_TRANSCRIPTION_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: 'Empty file.' };
  }

  if (file.type && !isAllowedMimeType(file.type)) {
    return {
      ok: false,
      error: `Unsupported audio format. Allowed: ${ALLOWED_AUDIO_MIME_TYPES.join(', ')}`,
    };
  }

  return { ok: true };
};

/* ----------------- Main --------------- */
export const transcribeAudio = async (
  input: TranscribeInput
): Promise<TranscribeResult> => {
  const audioBuffer =
    input.audio instanceof ArrayBuffer
      ? new Uint8Array(input.audio)
      : input.audio instanceof Buffer
        ? new Uint8Array(input.audio)
        : input.audio;

  const result = await transcribe({
    model: transcriptionModel(),
    audio: audioBuffer,
    providerOptions: input.language
      ? { openai: { language: input.language } }
      : undefined,
  });

  return {
    text: result.text,
    language: result.language,
    durationInSeconds: result.durationInSeconds,
    segments: result.segments?.map((s) => ({
      start: s.startSecond,
      end: s.endSecond,
      text: s.text,
    })),
  };
};
