/* ----------------- Globals --------------- */
import type { GpsCoordinates } from '@sanvaadai/types';

/* ----------------- Types --------------- */
export type GpsPermissionStatus = 'undetermined' | 'granted' | 'denied';

export type GpsCaptureResult =
  | { ok: true; coordinates: GpsCoordinates }
  | { ok: false; reason: 'permission_denied' | 'timeout' | 'unavailable' };

export type RawLocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
};

/** Injectable adapter so the core logic can be unit tested without native modules. */
export type LocationAdapter = {
  getPermissionStatus: () => Promise<GpsPermissionStatus>;
  requestPermission: () => Promise<GpsPermissionStatus>;
  getCurrentPosition: () => Promise<RawLocationResult>;
};

/* ----------------- Constants --------------- */
const CAPTURE_TIMEOUT_MS = 10_000;

/* ----------------- Core helpers (adapter-injected) --------------- */
export const getPermissionStatus = async (
  adapter: LocationAdapter
): Promise<GpsPermissionStatus> => adapter.getPermissionStatus();

export const requestLocationPermission = async (
  adapter: LocationAdapter
): Promise<GpsPermissionStatus> => adapter.requestPermission();

export const captureGpsCoordinates = async (
  adapter: LocationAdapter
): Promise<GpsCaptureResult> => {
  let status: GpsPermissionStatus;
  try {
    status = await adapter.getPermissionStatus();
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  const timeoutPromise = new Promise<GpsCaptureResult>((resolve) => {
    setTimeout(() => resolve({ ok: false, reason: 'timeout' }), CAPTURE_TIMEOUT_MS);
  });

  const capturePromise = (async (): Promise<GpsCaptureResult> => {
    try {
      const raw = await adapter.getCurrentPosition();
      return {
        ok: true,
        coordinates: {
          latitude: raw.latitude,
          longitude: raw.longitude,
          accuracy: raw.accuracy,
          captured_at: new Date(raw.timestamp).toISOString(),
        },
      };
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  })();

  return Promise.race([capturePromise, timeoutPromise]);
};

/* ----------------- Expo-location adapter (default, not imported in tests) --------------- */
const createExpoLocationAdapter = async (): Promise<LocationAdapter> => {
  // Dynamic import keeps native module out of test bundles.
  const Location = await import('expo-location');

  const toStatus = (status: string): GpsPermissionStatus => {
    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  };

  return {
    getPermissionStatus: async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      return toStatus(status);
    },
    requestPermission: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return toStatus(status);
    },
    getCurrentPosition: async () => {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
        timestamp: pos.timestamp,
      };
    },
  };
};

let _defaultAdapter: LocationAdapter | null = null;

/** Returns (and caches) the default expo-location adapter. */
export const getDefaultLocationAdapter = async (): Promise<LocationAdapter> => {
  if (!_defaultAdapter) {
    _defaultAdapter = await createExpoLocationAdapter();
  }
  return _defaultAdapter;
};
