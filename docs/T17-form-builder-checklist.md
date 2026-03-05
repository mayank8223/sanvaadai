# T17 – Admin web manual form builder checklist

## Scope

- Add a manual builder UI for admins with a field palette.
- Support field configuration for `text`, `number`, `date`, `select`, `file`, and `location`.
- Provide a live form preview before saving or publishing.
- Support both create and edit flows.

## Delivered

- Added reusable builder SDK utilities in `apps/web/lib/forms/builder.ts`.
- Added builder state hook in `apps/web/hooks/useFormBuilder.ts`.
- Added builder UI in `apps/web/components/forms/form-builder-screen.tsx` with:
  - palette controls
  - selected field configuration
  - required toggle
  - select options editor
  - live preview panel
- Added protected admin routes:
  - `apps/web/app/forms/new/page.tsx`
  - `apps/web/app/forms/[id]/edit/page.tsx`
- Updated forms list page (`apps/web/app/forms/page.tsx`) with:
  - create form action
  - edit action per row
- Added unit tests for builder helpers in `apps/web/lib/forms/builder.test.ts`.

## Validation

- Save draft creates/updates via `/api/forms`.
- Publish updates status via `/api/forms/[id]/status`.
- Duplicate keys and invalid payloads are blocked with user-visible errors.
- Field ordering and deletion update preview immediately.
