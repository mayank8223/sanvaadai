/**
 * T30 – Unit tests for AI form generation helpers.
 */

import { describe, expect, it } from 'bun:test';

import { aiDraftToBuilderPayload } from './form-generate';
import type { AiFormDefinitionDraft } from './schemas';

const baseField = {
  help_text: null,
  placeholder: null,
  default_value: null,
  min: null,
  max: null,
  min_date: null,
  max_date: null,
  options: null,
  accept: null,
  max_size_mb: null,
  multiple: null,
  require_gps_accuracy_meters: null,
} as const;

describe('aiDraftToBuilderPayload', () => {
  it('converts AI draft to builder payload with field IDs', () => {
    const draft: AiFormDefinitionDraft = {
      title: 'Test Form',
      description: 'A test',
      fields: [
        { ...baseField, key: 'name', label: 'Name', type: 'text', required: true },
        { ...baseField, key: 'count', label: 'Count', type: 'number', required: false },
      ],
    };
    const payload = aiDraftToBuilderPayload(draft);
    expect(payload.title).toBe('Test Form');
    expect(payload.description).toBe('A test');
    expect(payload.fields).toHaveLength(2);
    payload.fields.forEach((f) => {
      expect(f.id).toBeDefined();
      expect(f.id.length).toBeGreaterThan(0);
    });
    expect(payload.fields[0].key).toBe('name');
    expect(payload.fields[0].type).toBe('text');
    expect(payload.fields[1].key).toBe('count');
    expect(payload.fields[1].type).toBe('number');
  });

  it('normalizes select options', () => {
    const draft: AiFormDefinitionDraft = {
      title: 'Survey',
      description: null,
      fields: [
        {
          ...baseField,
          key: 'choice',
          label: 'Choice',
          type: 'select',
          required: false,
          options: [
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ],
        },
      ],
    };
    const payload = aiDraftToBuilderPayload(draft);
    expect(payload.fields[0].type).toBe('select');
    const selectField = payload.fields[0] as unknown as { options: { value: string; label: string }[] };
    expect(selectField.options).toEqual([
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ]);
  });

  it('adds default select options when missing', () => {
    const draft: AiFormDefinitionDraft = {
      title: 'Form',
      description: null,
      fields: [
        {
          ...baseField,
          key: 'choice',
          label: 'Choice',
          type: 'select',
          required: false,
          options: null,
        },
      ],
    };
    const payload = aiDraftToBuilderPayload(draft);
    const selectField = payload.fields[0] as unknown as { options: { value: string; label: string }[] };
    expect(selectField.options).toHaveLength(2);
    expect(selectField.options[0]).toHaveProperty('value');
    expect(selectField.options[0]).toHaveProperty('label');
  });
});
