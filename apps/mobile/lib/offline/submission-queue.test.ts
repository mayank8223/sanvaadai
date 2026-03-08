/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  enqueueSubmission,
  flushQueuedSubmissions,
  readQueuedSubmissions,
} from './submission-queue';
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
describe('submission-queue', () => {
  it('enqueues and flushes successful submissions', async () => {
    const storage = createMemoryStorage();
    await enqueueSubmission(
      {
        organizationId: 'org_1',
        payload: {
          form_id: 'form_1',
          answers: {
            field_1: 'ok',
          },
        },
      },
      storage
    );

    const flushResult = await flushQueuedSubmissions({
      apiBaseUrl: 'http://localhost:3000',
      accessToken: 'token',
      storageAdapter: storage,
      sendSubmission: async () => ({
        ok: true,
        submissionId: 'sub_1',
        statusCode: 201,
      }),
    });

    const remainingItems = await readQueuedSubmissions(storage);
    expect(flushResult.sentCount).toBe(1);
    expect(remainingItems.length).toBe(0);
  });

  it('keeps retryable failures in queue', async () => {
    const storage = createMemoryStorage();
    await enqueueSubmission(
      {
        organizationId: 'org_1',
        payload: {
          form_id: 'form_1',
          answers: {
            field_1: 'pending',
          },
        },
      },
      storage
    );

    const flushResult = await flushQueuedSubmissions({
      apiBaseUrl: 'http://localhost:3000',
      accessToken: 'token',
      storageAdapter: storage,
      sendSubmission: async () => ({
        ok: false,
        errorMessage: 'server down',
        statusCode: 503,
      }),
    });

    const remainingItems = await readQueuedSubmissions(storage);
    expect(flushResult.remainingCount).toBe(1);
    expect(remainingItems.length).toBe(1);
    expect(remainingItems[0]?.attempts).toBe(1);
  });
});
