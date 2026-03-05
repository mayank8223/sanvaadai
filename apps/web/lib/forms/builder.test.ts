/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  normalizeSelectOptions,
  sanitizeBuilderPayload,
  slugifyFieldKey,
  validateBuilderPayload,
} from '@/lib/forms/builder';

describe('slugifyFieldKey', () => {
  it('normalizes labels into machine keys', () => {
    expect(slugifyFieldKey('Meal Count (Girls)')).toBe('meal_count_girls');
  });
});

describe('normalizeSelectOptions', () => {
  it('removes empty entries and de-dupes by value', () => {
    expect(
      normalizeSelectOptions([
        { value: ' Breakfast ', label: 'Breakfast' },
        { value: 'Breakfast', label: 'Breakfast duplicate' },
        { value: '', label: 'Lunch' },
        { value: '', label: '' },
      ])
    ).toEqual([
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
    ]);
  });
});

describe('sanitizeBuilderPayload', () => {
  it('trims top-level text and normalizes select options', () => {
    const payload = sanitizeBuilderPayload({
      title: ' Daily Form ',
      description: ' Collect data ',
      fields: [
        {
          id: 'field_1',
          key: ' Meal Type ',
          label: ' Meal Type ',
          type: 'select',
          required: true,
          options: [
            { value: 'Breakfast', label: 'Breakfast' },
            { value: 'Breakfast', label: 'Breakfast duplicate' },
            { value: '', label: 'Lunch' },
          ],
        },
      ],
    });

    expect(payload.title).toBe('Daily Form');
    expect(payload.description).toBe('Collect data');
    expect(payload.fields[0]?.key).toBe('meal_type');
    expect(
      (payload.fields[0] as unknown as { options: Array<{ value: string; label: string }> }).options
    ).toEqual([
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
    ]);
  });
});

describe('validateBuilderPayload', () => {
  it('rejects duplicate keys', () => {
    const error = validateBuilderPayload({
      title: 'Duplicate keys',
      description: null,
      fields: [
        {
          id: 'a',
          key: 'field',
          label: 'Field A',
          type: 'text',
          required: false,
        },
        {
          id: 'b',
          key: 'Field',
          label: 'Field B',
          type: 'number',
          required: false,
        },
      ],
    });

    expect(error).toContain('Duplicate field key');
  });
});
