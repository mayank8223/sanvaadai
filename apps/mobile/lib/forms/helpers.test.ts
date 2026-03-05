/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { buildFormMetadataLine, formatRelativeDateLabel } from './helpers';

describe('formatRelativeDateLabel', () => {
  it('returns readable date labels', () => {
    expect(formatRelativeDateLabel('2026-03-04T09:15:00.000Z').includes('2026')).toBe(true);
  });

  it('returns fallback for invalid dates', () => {
    expect(formatRelativeDateLabel('invalid')).toBe('Unknown date');
  });
});

describe('buildFormMetadataLine', () => {
  it('includes version and updated date', () => {
    const line = buildFormMetadataLine({
      id: 'form_1',
      title: 'Daily meal',
      description: null,
      status: 'PUBLISHED',
      updated_at: '2026-03-04T09:15:00.000Z',
      published_at: '2026-03-04T08:00:00.000Z',
      organization_id: 'org_1',
      version: 3,
    });

    expect(line.includes('v3')).toBe(true);
    expect(line.includes('Updated')).toBe(true);
  });
});
