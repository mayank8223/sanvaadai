/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  parseCreateSubmissionInput,
  parseExportSubmissionsQuery,
  parseListSubmissionsQuery,
} from '@/lib/submissions/contracts';

describe('parseCreateSubmissionInput', () => {
  it('parses valid payloads', () => {
    const parsed = parseCreateSubmissionInput({
      form_id: 'form_1',
      answers: {
        school_name: 'Government School',
        total_students: 148,
      },
      client_submitted_at: '2026-03-04T10:00:00.000Z',
      device: {
        platform: 'android',
        app_version: '1.0.0',
      },
    });

    expect(parsed).toEqual({
      form_id: 'form_1',
      answers: {
        school_name: 'Government School',
        total_students: 148,
      },
      client_submitted_at: '2026-03-04T10:00:00.000Z',
      device: {
        platform: 'android',
        app_version: '1.0.0',
      },
    });
  });

  it('rejects payloads without form id', () => {
    expect(parseCreateSubmissionInput({ answers: {} })).toBeNull();
  });

  it('rejects payloads with invalid client_submitted_at', () => {
    expect(
      parseCreateSubmissionInput({
        form_id: 'form_1',
        answers: {},
        client_submitted_at: 'invalid-date',
      })
    ).toBeNull();
  });
});

describe('parseListSubmissionsQuery', () => {
  it('requires formId', () => {
    const query = parseListSubmissionsQuery(new URL('https://example.com/api/submissions'));
    expect(query).toBeNull();
  });

  it('applies defaults and max limit cap', () => {
    const query = parseListSubmissionsQuery(
      new URL('https://example.com/api/submissions?formId=form_1&limit=999')
    );

    expect(query).toEqual({
      formId: 'form_1',
      limit: 100,
      offset: 0,
      collectorUserId: null,
      submittedAfter: null,
      submittedBefore: null,
    });
  });

  it('parses supported filters', () => {
    const query = parseListSubmissionsQuery(
      new URL(
        'https://example.com/api/submissions?formId=form_1&limit=25&offset=10&collectorUserId=user_1&submittedAfter=2026-03-01T00:00:00.000Z&submittedBefore=2026-03-03T00:00:00.000Z'
      )
    );

    expect(query).toEqual({
      formId: 'form_1',
      limit: 25,
      offset: 10,
      collectorUserId: 'user_1',
      submittedAfter: '2026-03-01T00:00:00.000Z',
      submittedBefore: '2026-03-03T00:00:00.000Z',
    });
  });
});

describe('parseExportSubmissionsQuery', () => {
  it('defaults format to csv', () => {
    const parsed = parseExportSubmissionsQuery(
      new URL('https://example.com/api/submissions/export?formId=form_1')
    );

    expect(parsed).toEqual({
      formId: 'form_1',
      format: 'csv',
    });
  });

  it('rejects unsupported formats', () => {
    const parsed = parseExportSubmissionsQuery(
      new URL('https://example.com/api/submissions/export?formId=form_1&format=xml')
    );

    expect(parsed).toBeNull();
  });
});
