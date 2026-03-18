/**
 * T32 – Unit tests for AI answer draft generation.
 */

import { describe, expect, it } from 'bun:test';

import { generateAnswerDraftFromTranscription } from './answer-draft';

describe('generateAnswerDraftFromTranscription', () => {
  it('rejects empty transcription', async () => {
    const result = await generateAnswerDraftFromTranscription({
      transcription: '',
      fields: [{ key: 'name', label: 'Name', type: 'text', required: true }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Transcription');
  });

  it('rejects empty fields', async () => {
    const result = await generateAnswerDraftFromTranscription({
      transcription: 'School ABC, 50 meals',
      fields: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('field');
  });
});
