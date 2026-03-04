# T14 – Forms CRUD API Checklist

**Task:** Implement API handlers for listing forms, creating/updating forms, and toggling form status (`DRAFT`/`PUBLISHED`/`ARCHIVED`) with org scoping + role guards.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T11, T13

---

## 1. API routes added

- [x] `apps/web/app/api/forms/route.ts`
  - `GET /api/forms` – list forms for active org (collector responses restricted to `PUBLISHED`)
  - `POST /api/forms` – create new form (admin only)
- [x] `apps/web/app/api/forms/[id]/route.ts`
  - `GET /api/forms/:id` – fetch form in active org
  - `PATCH /api/forms/:id` – update form metadata/fields (admin only)
- [x] `apps/web/app/api/forms/[id]/status/route.ts`
  - `PATCH /api/forms/:id/status` – toggle form status (admin only)

---

## 2. Guarding and tenancy

- [x] All routes use `withApiGuard()` for auth + membership checks.
- [x] Mutations use `allowedRoles: ['ADMIN']` to enforce admin-only behavior.
- [x] Queries are scoped to `context.activeMembership.organization_id`.
- [x] Collector visibility is restricted to published forms only.

---

## 3. Request validation helpers

- [x] Added `apps/web/lib/forms/contracts.ts`:
  - `parseFormStatus()`
  - `parseCreateFormInput()`
  - `parseUpdateFormInput()`
  - constants for form statuses and field types.
- [x] Rejects malformed request payloads with `400` responses.

---

## 4. Status lifecycle behavior

- [x] `PATCH /api/forms/:id/status` supports:
  - `DRAFT`
  - `PUBLISHED`
  - `ARCHIVED`
- [x] Status transitions update lifecycle timestamps:
  - publish sets `published_at` and clears `archived_at`
  - archive sets `archived_at`
  - draft clears `archived_at`

---

## 5. Tests and verification

- [x] Added `apps/web/lib/forms/contracts.test.ts` for payload/status parser behavior.
- [x] Verification commands passed:
  - `cd apps/web && bun run typecheck`
  - `cd apps/web && bun run lint`
  - `cd apps/web && bun test lib/forms/contracts.test.ts`

---

## Unlocks

- Foundation for T16 forms list page (`/forms`) using `GET /api/forms`.
- Foundation for T17 form builder save/publish flows.
- Foundation for T18 mobile form fetch using the same org-scoped forms API.
