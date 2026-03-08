# T24 – Admin web: Submissions table for a form checklist

**Task:** Build `/forms/[id]/submissions` with a table (TanStack Table + shadcn styling) showing collector, submittedAt, and key flags, with filters (date range, collector).

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T6, T15, T23

---

## 1. Page and routing

- [x] Added `apps/web/app/forms/[id]/submissions/page.tsx`:
  - Server component with auth/org/admin checks.
  - Loads form and collectors (COLLECTOR role) for the active org.
  - Renders `SubmissionsTableClient` with formId, formTitle, collectors.
- [x] Linked from forms list: "Submissions" button per form row.

---

## 2. Submissions table client

- [x] Added `apps/web/components/forms/submissions-table-client.tsx`:
  - Uses TanStack Table (`@tanstack/react-table`) with shadcn `Table` components.
  - Columns: Collector, Submitted at, Flags, Actions.
  - Flags displayed as badges: "No location", "Poor accuracy", "Accuracy unknown".
  - Actions: "View" link to `/submissions/[id]` (T25).
- [x] Installed `@tanstack/react-table` and shadcn `table` component.

---

## 3. Filters

- [x] **Collector filter:** Select dropdown populated from org collectors; filters by `collectorUserId`.
- [x] **Date range filter:** Select with options: All time, Last 7 days, Last 30 days, Last 90 days.
- [x] Filters applied via query params to `GET /api/submissions`.

---

## 4. Pagination

- [x] Client-side pagination state; server-side data fetch with `limit` and `offset`.
- [x] Page size 20; Previous/Next buttons; total count display.

---

## Unlocks

- Day-to-day monitoring and analysis of collected data.
- Foundation for T25 (submission detail view with map).
