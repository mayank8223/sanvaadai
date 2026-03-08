/**
 * T23 – Location flagging for submissions.
 * Computes flags from GPS data to help admins identify submissions needing review.
 */

import type { GpsCoordinatesInput } from './contracts';

/* ----------------- Constants --------------- */
/** Accuracy threshold in meters; above this is considered poor. */
export const POOR_ACCURACY_THRESHOLD_METERS = 100;

/* ----------------- Types --------------- */
export type LocationFlags = {
  location_missing: boolean;
  location_poor_accuracy: boolean;
  location_accuracy_unknown: boolean;
};

/* ----------------- Helpers --------------- */
export const computeLocationFlags = (
  location: GpsCoordinatesInput | null | undefined
): LocationFlags => {
  if (!location) {
    return {
      location_missing: true,
      location_poor_accuracy: false,
      location_accuracy_unknown: false,
    };
  }

  if (location.accuracy === null || location.accuracy === undefined) {
    return {
      location_missing: false,
      location_poor_accuracy: false,
      location_accuracy_unknown: true,
    };
  }

  return {
    location_missing: false,
    location_poor_accuracy: location.accuracy > POOR_ACCURACY_THRESHOLD_METERS,
    location_accuracy_unknown: false,
  };
};
