/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { parseCreateFormInput, parseFormStatus, parseUpdateFormInput } from '@/lib/forms/contracts';

describe('parseFormStatus', () => {
  it('returns null for invalid status', () => {
    expect(parseFormStatus('INVALID')).toBeNull();
  });

  it('returns valid status values', () => {
    expect(parseFormStatus('DRAFT')).toBe('DRAFT');
    expect(parseFormStatus('PUBLISHED')).toBe('PUBLISHED');
    expect(parseFormStatus('ARCHIVED')).toBe('ARCHIVED');
  });
});

describe('parseCreateFormInput', () => {
  it('parses valid form input', () => {
    const parsed = parseCreateFormInput({
      title: 'Attendance Survey',
      description: 'Daily attendance tracking',
      fields: [
        {
          id: 'field_1',
          key: 'student_name',
          label: 'Student Name',
          type: 'text',
          required: true,
        },
      ],
    });

    expect(parsed).toEqual({
      title: 'Attendance Survey',
      description: 'Daily attendance tracking',
      fields: [
        {
          id: 'field_1',
          key: 'student_name',
          label: 'Student Name',
          type: 'text',
          required: true,
        },
      ],
    });
  });

  it('rejects invalid field definitions', () => {
    const parsed = parseCreateFormInput({
      title: 'Attendance Survey',
      fields: [
        {
          id: 'field_1',
          key: '',
          label: 'Student Name',
          type: 'text',
          required: true,
        },
      ],
    });

    expect(parsed).toBeNull();
  });
});

describe('parseUpdateFormInput', () => {
  it('requires at least one supported field', () => {
    expect(parseUpdateFormInput({})).toBeNull();
  });

  it('accepts nullable description updates', () => {
    expect(parseUpdateFormInput({ description: null })).toEqual({ description: null });
  });

  it('rejects invalid title updates', () => {
    expect(parseUpdateFormInput({ title: '   ' })).toBeNull();
  });
});
