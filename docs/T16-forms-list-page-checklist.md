# T16 – Admin Web Forms List Page Checklist

**Task:** Implement `/forms` page showing title, status, created date, and submission counts with basic filters.

**Complexity:** Low · **Priority:** P0 · **Dependencies:** T6, T14

---

## 1. Page route added

- [x] `apps/web/app/forms/page.tsx`
  - Server-rendered forms list page for admin users.
  - Redirects unauthenticated users to `/login?next=/forms`.
  - Handles no-membership and non-admin access states.

---

## 2. Data and filters

- [x] Loads forms scoped to the user’s active organization membership.
- [x] Supports basic status filter via query params:
  - `ALL` (default)
  - `DRAFT`
  - `PUBLISHED`
  - `ARCHIVED`
- [x] Displays per-form submission count via relational select (`submissions(count)`).

---

## 3. Reusable listing helpers

- [x] Added `apps/web/lib/forms/listing.ts`:
  - `parseFormsListFilters()`
  - `getFormSubmissionCount()`
- [x] Added unit tests in `apps/web/lib/forms/listing.test.ts`.

---

## 4. UI behavior

- [x] Table columns implemented:
  - `Title`
  - `Status`
  - `Created`
  - `Submissions`
- [x] Status badges with clear visual distinction.
- [x] Empty-state and load-error messages added.
- [x] Added dashboard shortcut button to `/forms` on `apps/web/app/page.tsx`.

---

## 5. Verification

- [ ] Run and verify:
  - `cd apps/web && bun run typecheck`
  - `cd apps/web && bun run lint`
  - `cd apps/web && bun test lib/forms/listing.test.ts`

---

## Unlocks

- Foundation for T17 form builder entry and form-management flow.
- Admin visibility into form creation cadence and submission volume.
