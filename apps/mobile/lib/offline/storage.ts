/* ----------------- Globals --------------- */
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ----------------- Types --------------- */
export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

/* ----------------- Exports --------------- */
export const defaultStorageAdapter: StorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};
