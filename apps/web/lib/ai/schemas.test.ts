/**
 * T29 – Unit tests for AI Zod schemas.
 */

import { describe, expect, it } from 'bun:test';

import {
  aiFormDefinitionDraftSchema,
  answerDraftSchema,
  followUpQuestionSchema,
} from './schemas';

/** Minimal field with all required keys (null for unused). */
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

describe('aiFormDefinitionDraftSchema', () => {
  it('accepts valid form draft with text and number fields', () => {
    const valid = {
      title: 'School Meal Form',
      description: 'Daily meal verification',
      fields: [
        {
          ...baseField,
          key: 'school_name',
          label: 'School Name',
          type: 'text',
          required: true,
        },
        {
          ...baseField,
          key: 'meal_count',
          label: 'Meal Count',
          type: 'number',
          required: true,
        },
      ],
    };
    const result = aiFormDefinitionDraftSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts form draft with select field and options', () => {
    const valid = {
      title: 'Survey',
      description: null,
      fields: [
        {
          ...baseField,
          key: 'rating',
          label: 'Rating',
          type: 'select',
          required: false,
          options: [
            { value: 'good', label: 'Good' },
            { value: 'bad', label: 'Bad' },
          ],
        },
      ],
    };
    const result = aiFormDefinitionDraftSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const invalid = {
      title: '',
      description: null,
      fields: [
        {
          ...baseField,
          key: 'x',
          label: 'X',
          type: 'text',
          required: false,
        },
      ],
    };
    const result = aiFormDefinitionDraftSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects empty fields array', () => {
    const invalid = {
      title: 'Form',
      description: null,
      fields: [],
    };
    const result = aiFormDefinitionDraftSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid field type', () => {
    const invalid = {
      title: 'Form',
      description: null,
      fields: [
        {
          ...baseField,
          key: 'x',
          label: 'X',
          type: 'invalid_type',
          required: false,
        },
      ],
    };
    const result = aiFormDefinitionDraftSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('answerDraftSchema', () => {
  it('accepts valid answer draft', () => {
    const valid = {
      answers: { school_name: 'ABC School', meal_count: 50 },
      missingRequiredFields: ['date'],
      followUpQuestions: [
        { fieldKey: 'date', question: 'What date was the meal served?' },
      ],
    };
    const result = answerDraftSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts empty answers and follow-ups', () => {
    const valid = {
      answers: {},
      missingRequiredFields: [],
      followUpQuestions: [],
    };
    const result = answerDraftSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid follow-up (missing fieldKey)', () => {
    const invalid = {
      answers: {},
      missingRequiredFields: [],
      followUpQuestions: [{ question: 'What?' }],
    };
    const result = answerDraftSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('followUpQuestionSchema', () => {
  it('accepts valid follow-up question', () => {
    const valid = { fieldKey: 'school_name', question: 'Which school?' };
    const result = followUpQuestionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
