# T23 – Backend: Store and flag location data checklist

**Task:** Ensure submissions store location fields in Supabase and implement simple flagging (e.g. poor accuracy) in the backend.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T15, T13

---

## 1. Location storage

- [x] Extended `CreateSubmissionInput` in `apps/web/lib/submissions/contracts.ts` with optional `location?: GpsCoordinatesInput | null`.
- [x] Added `parseGpsCoordinates()` to parse `{ latitude, longitude, accuracy?, captured_at? }` from request body.
- [x] Updated `parseCreateSubmissionInput()` to accept and pass through `location` so it is stored in `payload` JSONB.
- [x] Mobile payloads (T22) with `location` at top level are now persisted correctly.

---

## 2. Location flagging

- [x] Added `apps/web/lib/submissions/location-flags.ts`:
  - `computeLocationFlags(location)` returns `{ location_missing, location_poor_accuracy, location_accuracy_unknown }`.
  - `POOR_ACCURACY_THRESHOLD_METERS = 100` (configurable).
  - `location_missing`: no location in payload.
  - `location_poor_accuracy`: accuracy > 100m.
  - `location_accuracy_unknown`: accuracy is null/undefined.
- [x] POST `/api/submissions` computes flags on create and stores them in `metadata.flags`.
- [x] GET `/api/submissions` enriches each row with `flags`; computes from `payload.location` when `metadata.flags` is missing (backward compatibility).

---

## 3. Tests

- [x] `apps/web/lib/submissions/contracts.test.ts` – location parsing (valid, null accuracy, explicit null).
- [x] `apps/web/lib/submissions/location-flags.test.ts` – all flag combinations.

---

## Unlocks

- Admins can quickly see which submissions might be suspect or need review (T24).
- Foundation for future distance rules or additional validation.
