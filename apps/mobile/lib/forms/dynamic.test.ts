/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { buildDefaultDraftAnswers, validateAndBuildSubmissionAnswers } from './dynamic';

/* ----------------- Tests --------------- */
describe('buildDefaultDraftAnswers', () => {
  it('builds defaults from field definitions', () => {
    const values = buildDefaultDraftAnswers([
      {
        id: 'f1',
        key: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        default_value: 'initial note',
      },
      {
        id: 'f2',
        key: 'count',
        label: 'Count',
        type: 'number',
        required: true,
        default_value: 7,
      },
    ]);

    expect(values.notes).toBe('initial note');
    expect(values.count).toBe('7');
  });
});

describe('validateAndBuildSubmissionAnswers', () => {
  it('returns errors for missing required fields', () => {
    const result = validateAndBuildSubmissionAnswers(
      [
        {
          id: 'f1',
          key: 'school',
          label: 'School',
          type: 'text',
          required: true,
        },
      ],
      {
        school: '',
      }
    );

    expect(result.errors.school).toBe('This field is required.');
  });

  it('parses number and date field values', () => {
    const result = validateAndBuildSubmissionAnswers(
      [
        {
          id: 'f1',
          key: 'students',
          label: 'Students',
          type: 'number',
          required: true,
          min: 1,
          max: 200,
        },
        {
          id: 'f2',
          key: 'visit_date',
          label: 'Visit date',
          type: 'date',
          required: true,
        },
      ],
      {
        students: '42',
        visit_date: '2026-03-07',
      }
    );

    expect(result.errors.students).toBeUndefined();
    expect(result.errors.visit_date).toBeUndefined();
    expect(result.answers.students).toBe(42);
    expect(result.answers.visit_date).toBe('2026-03-07');
  });

  it('validates select options and location fields', () => {
    const result = validateAndBuildSubmissionAnswers(
      [
        {
          id: 'f1',
          key: 'meal_type',
          label: 'Meal type',
          type: 'select',
          required: true,
          options: [
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
          ],
        },
        {
          id: 'f2',
          key: 'gps',
          label: 'GPS',
          type: 'location',
          required: true,
        },
      ],
      {
        meal_type: 'lunch',
        gps: '12.11,77.55,8',
      }
    );

    expect(result.errors.meal_type).toBeUndefined();
    expect(result.errors.gps).toBeUndefined();
    expect(result.answers.meal_type).toBe('lunch');
    expect(result.answers.gps).toEqual({
      latitude: 12.11,
      longitude: 77.55,
      accuracy: 8,
    });
  });
});
