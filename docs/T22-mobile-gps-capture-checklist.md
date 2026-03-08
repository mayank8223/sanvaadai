# T22 – Mobile GPS capture on submission checklist

## Scope

- Use `expo-location` to request foreground location permission.
- Capture latitude, longitude, and accuracy at the moment of submission.
- Attach GPS coordinates to the top-level `location` field of `SubmissionPayload`.
- Show GPS capture status in the form UI (capturing / captured / permission denied).
- Gracefully degrade: GPS failure does not block submission.

## Delivered

- Installed `expo-location@55.1.2` in `apps/mobile`.
- Extended shared types in `packages/types/src/forms-submissions.ts`:
  - Added `GpsCoordinates` type (`latitude`, `longitude`, `accuracy`, `captured_at`).
  - Added `location?: GpsCoordinates | null` to `SubmissionPayload`.
  - Re-exported `GpsCoordinates` from `packages/types/src/index.ts`.
- Added injectable adapter-based GPS location lib:
  - `apps/mobile/lib/location/gps.ts`
  - `LocationAdapter` interface decouples core logic from native module (testable without RN).
  - `getPermissionStatus`, `requestLocationPermission`, `captureGpsCoordinates` — all adapter-injected.
  - `getDefaultLocationAdapter` lazily creates and caches the `expo-location` adapter via dynamic import.
  - 10-second timeout via `Promise.race` on each capture attempt.
- Added `useGpsLocation` hook:
  - `apps/mobile/hooks/useGpsLocation.ts`
  - Reads current permission status on mount.
  - Exposes `requestPermission`, `captureNow`, `permissionStatus`, `isCapturing`, `lastCoordinates`, `captureError`.
- Updated `buildSubmissionPayload` (`apps/mobile/lib/forms/dynamic.ts`) to accept optional `location` parameter.
- Updated `useCollectorFormFlow` (`apps/mobile/hooks/useCollectorFormFlow.ts`):
  - Accepts optional `captureGps` callback (typed as `() => Promise<GpsCaptureResult>`).
  - Captures GPS before building the submission payload in `submitDraft`.
  - Exposes `isCapturingGps` and `lastCapturedLocation` for UI feedback.
- Updated `DynamicFormScreen` (`apps/mobile/features/forms/DynamicFormScreen.tsx`):
  - Added `GpsStatusBadge` sub-component showing capturing / captured with coordinates / permission denied states.
  - Submit and retry buttons are disabled while GPS is being captured.
  - New props: `isCapturingGps`, `gpsPermissionStatus`, `lastCapturedLocation`, `onRequestGpsPermission`.
- Updated `AuthenticatedHome` (`apps/mobile/features/auth/AuthenticatedHome.tsx`):
  - Threaded GPS props through `activeForm` prop shape.
- Updated `App.tsx`:
  - Added `useGpsLocation` hook.
  - Passed `captureNow` to `useCollectorFormFlow`.
  - Forwarded GPS state and `requestPermission` to `AuthenticatedHome`.
- Added GPS copy constants in `apps/mobile/constants.ts` (`GPS_COPY`).
- Added unit tests:
  - `apps/mobile/lib/location/gps.test.ts` — 11 tests covering permission states, coordinate capture, null accuracy, timeout, and error paths.

## Validation

- All 23 tests pass (`bun test`).
- No TypeScript or linter errors.
- GPS coordinates appear in submission payload `location` field.
- Submission proceeds without GPS if permission is denied or capture fails.
- GPS badge shows live state: capturing → captured with coords → denied with prompt.
- Submit button is locked while GPS capture is in progress.
