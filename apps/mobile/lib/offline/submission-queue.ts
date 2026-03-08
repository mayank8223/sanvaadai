/* ----------------- Globals --------------- */
import type { SubmissionPayload } from '@sanvaadai/types';

import { createSubmission } from '../api/submissions';
import { defaultStorageAdapter, type StorageAdapter } from './storage';

/* ----------------- Constants --------------- */
const SUBMISSION_QUEUE_KEY = 'svd_mobile_submission_queue_v1';
const RETRYABLE_STATUS_CODES = new Set([408, 429]);

/* ----------------- Types --------------- */
export type QueuedSubmissionItem = {
  id: string;
  created_at: string;
  organization_id: string;
  payload: SubmissionPayload;
  attempts: number;
};

type SubmissionQueueEnvelope = {
  updated_at: string;
  items: QueuedSubmissionItem[];
};

type FlushQueueInput = {
  apiBaseUrl: string;
  accessToken: string;
  storageAdapter?: StorageAdapter;
  sendSubmission?: typeof createSubmission;
};

type FlushQueueResult = {
  sentCount: number;
  droppedCount: number;
  remainingCount: number;
};

/* ----------------- Helpers --------------- */
const makeQueueItemId = (): string =>
  `queue_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const isRetryableFailure = (statusCode: number | null): boolean => {
  if (statusCode === null) return true;
  if (statusCode >= 500) return true;
  return RETRYABLE_STATUS_CODES.has(statusCode);
};

const parseQueueEnvelope = (rawValue: string | null): SubmissionQueueEnvelope => {
  if (!rawValue) {
    return {
      updated_at: new Date().toISOString(),
      items: [],
    };
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<SubmissionQueueEnvelope>;
    if (!Array.isArray(parsedValue.items)) {
      return {
        updated_at: new Date().toISOString(),
        items: [],
      };
    }

    return {
      updated_at:
        typeof parsedValue.updated_at === 'string'
          ? parsedValue.updated_at
          : new Date().toISOString(),
      items: parsedValue.items as QueuedSubmissionItem[],
    };
  } catch {
    return {
      updated_at: new Date().toISOString(),
      items: [],
    };
  }
};

const persistQueueItems = async (
  queueItems: QueuedSubmissionItem[],
  storageAdapter: StorageAdapter = defaultStorageAdapter
): Promise<void> => {
  await storageAdapter.setItem(
    SUBMISSION_QUEUE_KEY,
    JSON.stringify({
      updated_at: new Date().toISOString(),
      items: queueItems,
    } satisfies SubmissionQueueEnvelope)
  );
};

/* ----------------- Exports --------------- */
export const readQueuedSubmissions = async (
  storageAdapter: StorageAdapter = defaultStorageAdapter
): Promise<QueuedSubmissionItem[]> => {
  const rawValue = await storageAdapter.getItem(SUBMISSION_QUEUE_KEY);
  return parseQueueEnvelope(rawValue).items;
};

export const enqueueSubmission = async (
  input: {
    organizationId: string;
    payload: SubmissionPayload;
  },
  storageAdapter: StorageAdapter = defaultStorageAdapter
): Promise<QueuedSubmissionItem[]> => {
  const existingItems = await readQueuedSubmissions(storageAdapter);
  const nextItems: QueuedSubmissionItem[] = [
    ...existingItems,
    {
      id: makeQueueItemId(),
      created_at: new Date().toISOString(),
      organization_id: input.organizationId,
      payload: input.payload,
      attempts: 0,
    },
  ];

  await persistQueueItems(nextItems, storageAdapter);
  return nextItems;
};

export const flushQueuedSubmissions = async ({
  apiBaseUrl,
  accessToken,
  storageAdapter = defaultStorageAdapter,
  sendSubmission = createSubmission,
}: FlushQueueInput): Promise<FlushQueueResult> => {
  const queueItems = await readQueuedSubmissions(storageAdapter);
  if (queueItems.length === 0) {
    return {
      sentCount: 0,
      droppedCount: 0,
      remainingCount: 0,
    };
  }

  let sentCount = 0;
  let droppedCount = 0;
  const remainingItems: QueuedSubmissionItem[] = [];

  for (const item of queueItems) {
    const response = await sendSubmission({
      apiBaseUrl,
      accessToken,
      organizationId: item.organization_id,
      payload: item.payload,
    });

    if (response.ok) {
      sentCount += 1;
      continue;
    }

    if (isRetryableFailure(response.statusCode)) {
      remainingItems.push({
        ...item,
        attempts: item.attempts + 1,
      });

      const currentIndex = queueItems.findIndex((queueItem) => queueItem.id === item.id);
      const restItems = queueItems.slice(currentIndex + 1).map((queueItem) => ({
        ...queueItem,
        attempts: queueItem.attempts,
      }));
      remainingItems.push(...restItems);
      break;
    }

    droppedCount += 1;
  }

  await persistQueueItems(remainingItems, storageAdapter);
  return {
    sentCount,
    droppedCount,
    remainingCount: remainingItems.length,
  };
};
