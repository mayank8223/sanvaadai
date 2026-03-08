import { describe, expect, it } from 'bun:test';

import { buildSubmissionsCsv } from './csv-export';

describe('buildSubmissionsCsv', () => {
  it('builds CSV with headers and one row', () => {
    const submissions = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        collector_user_id: 'user-1',
        collector_name: 'John Doe',
        collector_email: 'john@example.com',
        submitted_at: '2026-03-08T10:00:00Z',
        payload: {
          answers: { school_name: 'School A', count: 42 },
          location: { latitude: 12.34, longitude: 56.78, accuracy: 10 },
        },
        metadata: {},
      },
    ];
    const formFields = [
      { key: 'school_name', label: 'School Name' },
      { key: 'count', label: 'Count' },
    ];
    const csv = buildSubmissionsCsv(submissions, formFields);
    expect(csv).toContain('id,form_id,collector_name,collector_email,submitted_at,latitude,longitude,accuracy,school_name,count');
    expect(csv).toContain('sub-1,form-1,John Doe,john@example.com,2026-03-08T10:00:00Z,12.34,56.78,10,School A,42');
  });

  it('escapes commas and quotes in cell values', () => {
    const submissions = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        collector_user_id: null,
        collector_name: 'Doe, John',
        collector_email: 'john@example.com',
        submitted_at: '2026-03-08T10:00:00Z',
        payload: { answers: { note: 'He said "hello"' }, location: null },
        metadata: {},
      },
    ];
    const formFields = [{ key: 'note', label: 'Note' }];
    const csv = buildSubmissionsCsv(submissions, formFields);
    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"He said ""hello"""');
  });

  it('handles empty submissions', () => {
    const csv = buildSubmissionsCsv([], []);
    expect(csv).toBe(
      'id,form_id,collector_name,collector_email,submitted_at,latitude,longitude,accuracy'
    );
  });

  it('handles missing location', () => {
    const submissions = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        collector_user_id: null,
        collector_name: null,
        collector_email: null,
        submitted_at: '2026-03-08T10:00:00Z',
        payload: { answers: {} },
        metadata: {},
      },
    ];
    const csv = buildSubmissionsCsv(submissions, []);
    expect(csv).toContain('sub-1,form-1,,,2026-03-08T10:00:00Z,,,');
  });
});
