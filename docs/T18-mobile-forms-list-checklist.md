# T18 – Mobile forms fetch and list checklist

## Scope

- Show collectors a forms screen with published forms they can fill.
- Fetch forms based on authenticated collector memberships.
- Display basic form metadata and refresh capability.

## Delivered

- Added forms loading hook in `apps/mobile/hooks/useCollectorForms.ts`:
  - resolves collector org memberships
  - fetches `PUBLISHED` forms for those orgs
  - returns loading/error/refresh state
- Added reusable helpers in `apps/mobile/lib/forms/helpers.ts`.
- Added forms screen UI in `apps/mobile/features/forms/FormsScreen.tsx`.
- Integrated forms screen into authenticated home flow:
  - `apps/mobile/features/auth/AuthenticatedHome.tsx`
  - `apps/mobile/App.tsx`
- Added copy constants in `apps/mobile/constants.ts`.
- Added unit tests in `apps/mobile/lib/forms/helpers.test.ts`.

## Validation

- Signed-in collector sees available published forms.
- Empty state appears when no forms are available.
- Manual refresh reloads form list.
- Errors are surfaced with actionable feedback.
