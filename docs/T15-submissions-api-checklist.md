# T15 – Submissions API Checklist

**Task:** Implement API handlers to create submissions, list submissions for a form, and provide a base export endpoint skeleton.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T11, T13

---

## 1. API routes added

- [x] `apps/web/app/api/submissions/route.ts`
  - `POST /api/submissions` – create submission for an org-scoped form.
  - `GET /api/submissions` – list submissions for a form with filters and pagination.
- [x] `apps/web/app/api/submissions/export/route.ts`
  - `GET /api/submissions/export` – export endpoint skeleton for T26 follow-up.

---

## 2. Guarding and tenancy

- [x] All submissions routes use `withApiGuard()` for auth + membership checks.
- [x] `GET /api/submissions` and `GET /api/submissions/export` are admin-only (`allowedRoles: ['ADMIN']`).
- [x] Submission create/list/export queries are scoped to `context.activeMembership.organization_id`.
- [x] Collector submission creation is blocked for non-published forms.

---

## 3. Request and query validation helpers

- [x] Added `apps/web/lib/submissions/contracts.ts`:
  - `parseCreateSubmissionInput()`
  - `parseListSubmissionsQuery()`
  - `parseExportSubmissionsQuery()`
- [x] Rejects malformed body/query inputs with `400` responses.

---

## 4. API behavior details

- [x] `POST /api/submissions`
  - Validates payload contract.
  - Verifies form exists in active org.
  - Stores `payload`, `metadata`, and `submitted_at` (client timestamp fallback to server time).
- [x] `GET /api/submissions`
  - Requires `formId`.
  - Supports `limit`, `offset`, `collectorUserId`, `submittedAfter`, and `submittedBefore`.
  - Returns `submissions` plus pagination metadata.
- [x] `GET /api/submissions/export`
  - Validates form ownership and format (`csv` or `json`).
  - Returns a structured placeholder payload (`ready: false`) for the full CSV implementation in T26.

---

## 5. Tests and verification

- [x] Added `apps/web/lib/submissions/contracts.test.ts` for parser behavior.
- [ ] Run and verify:
  - `cd apps/web && bun run typecheck`
  - `cd apps/web && bun run lint`
  - `cd apps/web && bun test lib/submissions/contracts.test.ts`

---

## Unlocks

- Foundation for mobile submission integration in T20.
- Foundation for admin submissions table in T24.
- Starter export contract for T26 CSV export.
