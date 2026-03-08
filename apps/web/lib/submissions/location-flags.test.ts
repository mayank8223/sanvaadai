/* ----------------- Globals --------------- */
import { describe, expect, it } from 'bun:test';

import { computeLocationFlags, POOR_ACCURACY_THRESHOLD_METERS } from './location-flags';

describe('computeLocationFlags', () => {
  it('flags missing location', () => {
    expect(computeLocationFlags(null)).toEqual({
      location_missing: true,
      location_poor_accuracy: false,
      location_accuracy_unknown: false,
    });
    expect(computeLocationFlags(undefined)).toEqual({
      location_missing: true,
      location_poor_accuracy: false,
      location_accuracy_unknown: false,
    });
  });

  it('flags unknown accuracy when accuracy is null', () => {
    expect(
      computeLocationFlags({
        latitude: 12.34,
        longitude: 56.78,
        accuracy: null,
      })
    ).toEqual({
      location_missing: false,
      location_poor_accuracy: false,
      location_accuracy_unknown: true,
    });
  });

  it('flags poor accuracy when above threshold', () => {
    expect(
      computeLocationFlags({
        latitude: 12.34,
        longitude: 56.78,
        accuracy: POOR_ACCURACY_THRESHOLD_METERS + 1,
      })
    ).toEqual({
      location_missing: false,
      location_poor_accuracy: true,
      location_accuracy_unknown: false,
    });
  });

  it('does not flag when accuracy is at or below threshold', () => {
    expect(
      computeLocationFlags({
        latitude: 12.34,
        longitude: 56.78,
        accuracy: POOR_ACCURACY_THRESHOLD_METERS,
      })
    ).toEqual({
      location_missing: false,
      location_poor_accuracy: false,
      location_accuracy_unknown: false,
    });

    expect(
      computeLocationFlags({
        latitude: 12.34,
        longitude: 56.78,
        accuracy: 10,
      })
    ).toEqual({
      location_missing: false,
      location_poor_accuracy: false,
      location_accuracy_unknown: false,
    });
  });
});
