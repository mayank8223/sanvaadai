/**
 * T27 – AI/LLM constants.
 * Centralized config for model IDs and limits.
 */

export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
export const DEFAULT_TRANSCRIPTION_MODEL = 'whisper-1';

/** Max audio file size for transcription (25MB – Whisper API limit). */
export const MAX_TRANSCRIPTION_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/** Allowed MIME types for transcription (Whisper supports many formats). */
export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/x-m4a',
  'audio/mpga',
] as const;
