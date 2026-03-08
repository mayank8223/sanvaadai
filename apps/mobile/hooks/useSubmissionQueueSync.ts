/* ----------------- Globals --------------- */
import NetInfo from '@react-native-community/netinfo';
import { type Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { apiBaseUrl } from '../lib/api/env';
import { flushQueuedSubmissions, readQueuedSubmissions } from '../lib/offline/submission-queue';

/* ----------------- Constants --------------- */
const REFRESH_INTERVAL_MS = 30_000;

/* ----------------- Hooks --------------- */
const useSubmissionQueueSync = (session: Session | null) => {
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshQueueCount = useCallback(async () => {
    const items = await readQueuedSubmissions();
    setQueuedCount(items.length);
  }, []);

  const flushQueue = useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    setIsSyncing(true);
    try {
      await flushQueuedSubmissions({
        apiBaseUrl,
        accessToken: session.access_token,
      });
      await refreshQueueCount();
    } finally {
      setIsSyncing(false);
    }
  }, [refreshQueueCount, session?.access_token]);

  useEffect(() => {
    void refreshQueueCount();
  }, [refreshQueueCount]);

  useEffect(() => {
    if (!session?.access_token) {
      setQueuedCount(0);
      return;
    }

    void flushQueue();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true;
      const isInternetReachable = state.isInternetReachable !== false;

      if (isConnected && isInternetReachable) {
        void flushQueue();
      }
    });

    const interval = setInterval(() => {
      void flushQueue();
    }, REFRESH_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [flushQueue, session?.access_token]);

  return {
    queuedCount,
    isSyncing,
    refreshQueueCount,
    flushQueue,
  };
};

export default useSubmissionQueueSync;
