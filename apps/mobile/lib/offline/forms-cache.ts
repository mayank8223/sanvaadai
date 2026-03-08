/* ----------------- Globals --------------- */
import type { CollectorFormListItem } from '../../hooks/useCollectorForms';

import { defaultStorageAdapter, type StorageAdapter } from './storage';

/* ----------------- Constants --------------- */
const FORMS_CACHE_KEY = 'svd_mobile_forms_cache_v1';

/* ----------------- Types --------------- */
type FormsCacheEnvelope = {
  cached_at: string;
  forms: CollectorFormListItem[];
};

/* ----------------- Exports --------------- */
export const saveCachedForms = async (
  forms: CollectorFormListItem[],
  storageAdapter: StorageAdapter = defaultStorageAdapter
): Promise<void> => {
  const envelope: FormsCacheEnvelope = {
    cached_at: new Date().toISOString(),
    forms,
  };

  await storageAdapter.setItem(FORMS_CACHE_KEY, JSON.stringify(envelope));
};

export const readCachedForms = async (
  storageAdapter: StorageAdapter = defaultStorageAdapter
): Promise<CollectorFormListItem[] | null> => {
  const rawValue = await storageAdapter.getItem(FORMS_CACHE_KEY);
  if (!rawValue) return null;

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<FormsCacheEnvelope>;
    if (!Array.isArray(parsedValue.forms)) {
      return null;
    }

    return parsedValue.forms as CollectorFormListItem[];
  } catch {
    return null;
  }
};
