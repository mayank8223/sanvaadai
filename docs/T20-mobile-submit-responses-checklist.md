# T20 – Mobile submit form responses checklist

## Scope

- Submit `SubmissionPayload` from mobile dynamic form flow to web Submissions API.
- Handle success and error states in collector UX.
- Support basic retry for last failed submission attempt.

## Delivered

- Added mobile API environment resolver in `apps/mobile/lib/api/env.ts`:
  - prefers `EXPO_PUBLIC_API_BASE_URL`
  - falls back to `NEXT_PUBLIC_APP_URL`.
- Added API clients:
  - `apps/mobile/lib/api/forms.ts` for loading form definitions from `/api/forms/[id]`
  - `apps/mobile/lib/api/submissions.ts` for creating submissions via `POST /api/submissions`.
- Added bearer-token support in web API guard path so mobile requests can be authenticated:
  - `apps/web/lib/auth/server.ts` resolves user from `Authorization: Bearer <token>` when present
  - `apps/web/lib/auth/guards.ts` now uses request-aware auth resolution.
- Submission flow integrated in `apps/mobile/hooks/useCollectorFormFlow.ts`:
  - builds payload with `client_submitted_at` and device platform
  - submits to API with org scoping header
  - stores last failed payload for retry.
- UI states wired in `apps/mobile/features/forms/DynamicFormScreen.tsx`:
  - submit loading label
  - success/error messages
  - retry action shown when failed payload exists.
- Added environment contract update in `.env.example`:
  - `EXPO_PUBLIC_API_BASE_URL`.

## Validation

- Successful submit returns confirmation and clears retry state.
- Failed submit shows server error and enables retry.
- Retry reuses last payload without forcing re-entry.
- Mobile API auth works with bearer token + org header on guarded endpoints.
