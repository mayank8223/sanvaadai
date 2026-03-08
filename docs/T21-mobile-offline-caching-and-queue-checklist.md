# T21 – Mobile offline caching and queued submissions checklist

## Scope

- Cache published forms locally for offline availability.
- Queue unsent submissions on retryable failures.
- Sync queued submissions automatically when connectivity returns.

## Delivered

- Added offline dependencies in `apps/mobile`:
  - `@react-native-async-storage/async-storage`
  - `@react-native-community/netinfo`
- Added reusable offline storage and cache modules:
  - `apps/mobile/lib/offline/storage.ts`
  - `apps/mobile/lib/offline/forms-cache.ts`
- Added persisted submission queue module:
  - `apps/mobile/lib/offline/submission-queue.ts`
  - queue enqueue/read/flush behavior with retryable vs non-retryable failure handling.
- Added reconnect/interval sync hook:
  - `apps/mobile/hooks/useSubmissionQueueSync.ts`
  - flushes queue on session restore, on network reconnect, and on periodic interval.
- Updated forms fetch flow to support offline cached read:
  - `apps/mobile/hooks/useCollectorForms.ts`
  - saves cache on successful fetch and falls back to cache on fetch failure.
- Updated submit flow to enqueue retryable failures:
  - `apps/mobile/hooks/useCollectorFormFlow.ts`
  - `apps/mobile/lib/api/submissions.ts` now returns status metadata for retry policy decisions.
- Added queue status UI in authenticated home:
  - shows queued count and manual `Sync now` action in `apps/mobile/features/auth/AuthenticatedHome.tsx`
  - wired in `apps/mobile/App.tsx`.
- Added unit tests:
  - `apps/mobile/lib/offline/forms-cache.test.ts`
  - `apps/mobile/lib/offline/submission-queue.test.ts`

## Validation

- Forms list still loads from API online and writes local cache.
- On fetch failure, app displays cached forms when available.
- Retryable submit failures are persisted in queue.
- Queue auto-sync triggers after reconnect and clears successful items.
- Manual sync button triggers immediate queue flush.
