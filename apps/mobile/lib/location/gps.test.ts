/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import {
  type LocationAdapter,
  captureGpsCoordinates,
  getPermissionStatus,
  requestLocationPermission,
} from './gps';

/* ----------------- Helpers --------------- */
const createAdapter = (overrides: Partial<LocationAdapter> = {}): LocationAdapter => ({
  getPermissionStatus: async () => 'granted',
  requestPermission: async () => 'granted',
  getCurrentPosition: async () => ({
    latitude: 28.6139,
    longitude: 77.209,
    accuracy: 10,
    timestamp: 1_700_000_000_000,
  }),
  ...overrides,
});

/* ----------------- Tests --------------- */
describe('getPermissionStatus', () => {
  it('returns "granted" from adapter', async () => {
    const adapter = createAdapter({ getPermissionStatus: async () => 'granted' });
    const status = await getPermissionStatus(adapter);
    expect(status).toBe('granted');
  });

  it('returns "denied" from adapter', async () => {
    const adapter = createAdapter({ getPermissionStatus: async () => 'denied' });
    const status = await getPermissionStatus(adapter);
    expect(status).toBe('denied');
  });

  it('returns "undetermined" from adapter', async () => {
    const adapter = createAdapter({ getPermissionStatus: async () => 'undetermined' });
    const status = await getPermissionStatus(adapter);
    expect(status).toBe('undetermined');
  });
});

describe('requestLocationPermission', () => {
  it('returns "granted" when user grants permission', async () => {
    const adapter = createAdapter({ requestPermission: async () => 'granted' });
    const status = await requestLocationPermission(adapter);
    expect(status).toBe('granted');
  });

  it('returns "denied" when user denies permission', async () => {
    const adapter = createAdapter({ requestPermission: async () => 'denied' });
    const status = await requestLocationPermission(adapter);
    expect(status).toBe('denied');
  });
});

describe('captureGpsCoordinates', () => {
  it('returns coordinates with correct shape when permission is granted', async () => {
    const adapter = createAdapter();
    const result = await captureGpsCoordinates(adapter);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.coordinates.latitude).toBe(28.6139);
    expect(result.coordinates.longitude).toBe(77.209);
    expect(result.coordinates.accuracy).toBe(10);
    expect(typeof result.coordinates.captured_at).toBe('string');
  });

  it('sets accuracy to null when adapter returns null', async () => {
    const adapter = createAdapter({
      getCurrentPosition: async () => ({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: null,
        timestamp: 1_700_000_000_000,
      }),
    });

    const result = await captureGpsCoordinates(adapter);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.coordinates.accuracy).toBeNull();
  });

  it('formats captured_at as ISO string from timestamp', async () => {
    const timestamp = 1_700_000_000_000;
    const adapter = createAdapter({
      getCurrentPosition: async () => ({
        latitude: 0,
        longitude: 0,
        accuracy: 5,
        timestamp,
      }),
    });

    const result = await captureGpsCoordinates(adapter);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.coordinates.captured_at).toBe(new Date(timestamp).toISOString());
  });

  it('returns permission_denied when permission is not granted', async () => {
    const adapter = createAdapter({ getPermissionStatus: async () => 'denied' });
    const result = await captureGpsCoordinates(adapter);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('permission_denied');
  });

  it('returns unavailable when getCurrentPosition throws', async () => {
    const adapter = createAdapter({
      getCurrentPosition: async () => {
        throw new Error('hardware unavailable');
      },
    });

    const result = await captureGpsCoordinates(adapter);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unavailable');
  });

  it('returns unavailable when getPermissionStatus throws', async () => {
    const adapter = createAdapter({
      getPermissionStatus: async () => {
        throw new Error('native crash');
      },
    });

    const result = await captureGpsCoordinates(adapter);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unavailable');
  });
});
