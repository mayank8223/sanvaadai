# T25 – Admin web: Submission detail view with map checklist

**Task:** Implement `/submissions/[id]` that shows all answers, metadata, and a map preview of the submission location using a maps provider.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T24, T1

---

## 1. API route

- [x] Added `apps/web/app/api/submissions/[id]/route.ts`:
  - `GET /api/submissions/[id]` – fetch single submission by ID, org-scoped, admin-only.
  - Returns submission with collector info, payload, metadata, and computed flags.

---

## 2. Submission detail page

- [x] Added `apps/web/app/submissions/[id]/page.tsx`:
  - Server component with auth/org/admin checks.
  - Loads submission and form from Supabase.
  - Renders `SubmissionDetailClient` with submission and form data.
  - Header with back-to-submissions and edit-form links.

---

## 3. Submission detail client

- [x] Added `apps/web/components/submissions/submission-detail-client.tsx`:
  - Metadata card: collector, submitted at, device, flags.
  - Answers card: form field labels and values (from form definition).
  - Location card: map preview or “no location” message.

---

## 4. Map preview component

- [x] Added `apps/web/components/submissions/submission-map-preview.tsx`:
  - Uses Google Static Maps API when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.
  - Uses Mapbox Static Images API when `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set.
  - Fallback: coordinates + “Open in Google Maps” link when no key.
- [x] Added `apps/web/lib/maps/constants.ts` for provider detection.

---

## 5. Navigation

- [x] Submissions table “View” button links to `/submissions/[id]` (from T24).
- [x] Detail page “Back to submissions” links to `/forms/[formId]/submissions`.

---

## Unlocks

- Fine-grained auditing and debugging of suspicious or important data points.
- Foundation for E2E tests in T37.
