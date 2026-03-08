/* ----------------- Globals --------------- */
import type { GpsCoordinates } from '@sanvaadai/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type GpsCaptureResult,
  type GpsPermissionStatus,
  type LocationAdapter,
  captureGpsCoordinates,
  getDefaultLocationAdapter,
  getPermissionStatus,
  requestLocationPermission,
} from '../lib/location/gps';

/* ----------------- Types --------------- */
export type UseGpsLocationResult = {
  permissionStatus: GpsPermissionStatus;
  isCapturing: boolean;
  lastCoordinates: GpsCoordinates | null;
  captureError: string | null;
  requestPermission: () => Promise<GpsPermissionStatus>;
  captureNow: () => Promise<GpsCaptureResult>;
};

const CAPTURE_ERROR_MESSAGES: Record<string, string> = {
  permission_denied: 'Location permission denied.',
  timeout: 'GPS capture timed out.',
  unavailable: 'Location unavailable.',
};

/* ----------------- Hook --------------- */
const useGpsLocation = (): UseGpsLocationResult => {
  const adapterRef = useRef<LocationAdapter | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<GpsPermissionStatus>('undetermined');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [lastCoordinates, setLastCoordinates] = useState<GpsCoordinates | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const getAdapter = useCallback(async (): Promise<LocationAdapter> => {
    if (!adapterRef.current) {
      adapterRef.current = await getDefaultLocationAdapter();
    }
    return adapterRef.current;
  }, []);

  useEffect(() => {
    getAdapter()
      .then((adapter) => getPermissionStatus(adapter))
      .then(setPermissionStatus)
      .catch(() => setPermissionStatus('undetermined'));
  }, [getAdapter]);

  const requestPermission = useCallback(async (): Promise<GpsPermissionStatus> => {
    const adapter = await getAdapter();
    const status = await requestLocationPermission(adapter);
    setPermissionStatus(status);
    return status;
  }, [getAdapter]);

  const captureNow = useCallback(async (): Promise<GpsCaptureResult> => {
    setIsCapturing(true);
    setCaptureError(null);

    const adapter = await getAdapter();
    const result = await captureGpsCoordinates(adapter);

    setIsCapturing(false);

    if (result.ok) {
      setLastCoordinates(result.coordinates);
    } else {
      setCaptureError(CAPTURE_ERROR_MESSAGES[result.reason] ?? 'Location capture failed.');
    }

    return result;
  }, [getAdapter]);

  return {
    permissionStatus,
    isCapturing,
    lastCoordinates,
    captureError,
    requestPermission,
    captureNow,
  };
};

export default useGpsLocation;
