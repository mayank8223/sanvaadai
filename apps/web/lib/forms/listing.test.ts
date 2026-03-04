/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { getFormSubmissionCount, parseFormsListFilters } from '@/lib/forms/listing';

describe('parseFormsListFilters', () => {
  it('defaults to ALL when status is missing', () => {
    expect(parseFormsListFilters({})).toEqual({ status: 'ALL' });
  });

  it('returns a valid status filter', () => {
    expect(parseFormsListFilters({ status: 'PUBLISHED' })).toEqual({ status: 'PUBLISHED' });
  });

  it('ignores invalid status values', () => {
    expect(parseFormsListFilters({ status: 'INVALID' })).toEqual({ status: 'ALL' });
  });
});

describe('getFormSubmissionCount', () => {
  it('returns count from relation payload', () => {
    const count = getFormSubmissionCount({
      id: 'form_1',
      title: 'Form',
      status: 'PUBLISHED',
      created_at: '2026-03-04T10:00:00.000Z',
      submissions: [{ count: 8 }],
    });

    expect(count).toBe(8);
  });

  it('returns zero when relation count is unavailable', () => {
    const count = getFormSubmissionCount({
      id: 'form_1',
      title: 'Form',
      status: 'PUBLISHED',
      created_at: '2026-03-04T10:00:00.000Z',
      submissions: null,
    });

    expect(count).toBe(0);
  });
});
