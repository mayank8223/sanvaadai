/**
 * Unit tests for T28 – transcribe validation.
 */

import { describe, expect, it } from 'bun:test';

import {
  ALLOWED_AUDIO_MIME_TYPES,
  MAX_TRANSCRIPTION_FILE_SIZE_BYTES,
} from './constants';
import { validateAudioFile } from './transcribe';

describe('validateAudioFile', () => {
  it('accepts valid audio file within size limit', () => {
    const result = validateAudioFile({
      size: 1024 * 1024,
      type: 'audio/mpeg',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects file exceeding max size', () => {
    const result = validateAudioFile({
      size: MAX_TRANSCRIPTION_FILE_SIZE_BYTES + 1,
      type: 'audio/mpeg',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('too large');
    }
  });

  it('rejects empty file', () => {
    const result = validateAudioFile({ size: 0, type: 'audio/mpeg' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Empty');
    }
  });

  it('rejects unsupported MIME type when provided', () => {
    const result = validateAudioFile({
      size: 1024,
      type: 'video/mp4',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Unsupported');
    }
  });

  it('accepts file with null/undefined type (lenient)', () => {
    expect(validateAudioFile({ size: 1024, type: null }).ok).toBe(true);
    expect(validateAudioFile({ size: 1024 }).ok).toBe(true);
  });

  it('accepts all allowed MIME types', () => {
    for (const mime of ALLOWED_AUDIO_MIME_TYPES) {
      const result = validateAudioFile({ size: 1024, type: mime });
      expect(result.ok).toBe(true);
    }
  });

  it('accepts MIME type with charset suffix', () => {
    const result = validateAudioFile({
      size: 1024,
      type: 'audio/mpeg; charset=utf-8',
    });
    expect(result.ok).toBe(true);
  });
});
