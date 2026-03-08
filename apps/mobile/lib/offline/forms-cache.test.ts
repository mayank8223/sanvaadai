/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { readCachedForms, saveCachedForms } from './forms-cache';
import type { StorageAdapter } from './storage';

/* ----------------- Helpers --------------- */
const createMemoryStorage = (): StorageAdapter => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

/* ----------------- Tests --------------- */
describe('forms-cache', () => {
  it('persists and reads cached forms', async () => {
    const storage = createMemoryStorage();
    const forms = [
      {
        id: 'form_1',
        title: 'Attendance',
        description: null,
        status: 'PUBLISHED' as const,
        updated_at: '2026-03-01T00:00:00.000Z',
        published_at: '2026-03-01T00:00:00.000Z',
        organization_id: 'org_1',
        version: 1,
        organizationName: 'Org 1',
      },
    ];

    await saveCachedForms(forms, storage);
    const cachedForms = await readCachedForms(storage);

    expect(Array.isArray(cachedForms)).toBe(true);
    expect(cachedForms?.[0]?.id).toBe('form_1');
  });
});
