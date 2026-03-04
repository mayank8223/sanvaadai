# T13 – Form and Submission Schema + Shared Types Checklist

**Task:** Define `forms` and `submissions` schema in Supabase (via Drizzle migrations) and add shared TypeScript contracts for dynamic forms/submission payloads.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T8, T9

**Schema is managed with Drizzle ORM** in `apps/web` (source of truth: `db/schema.ts`). Migrations live in `apps/web/drizzle/`.

---

## 1. Database schema (Drizzle)

- [x] Added enum **`form_status`** with values `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- [x] Added table **`forms`** in `apps/web/db/schema.ts`:
  - `id`, `organization_id`, `created_by_user_id`
  - `title`, `description`, `status`
  - `fields` (JSONB)
  - `version`, `published_at`, `archived_at`
  - `created_at`, `updated_at`
- [x] Added table **`submissions`** in `apps/web/db/schema.ts`:
  - `id`, `organization_id`, `form_id`, `collector_user_id`
  - `payload` (JSONB), `metadata` (JSONB)
  - `submitted_at`, `created_at`, `updated_at`

---

## 2. Indexes and relations

- [x] `forms.organization_id -> organizations.id` (cascade)
- [x] `forms.created_by_user_id -> users.id` (set null)
- [x] `submissions.organization_id -> organizations.id` (cascade)
- [x] `submissions.form_id -> forms.id` (cascade)
- [x] `submissions.collector_user_id -> users.id` (set null)
- [x] Indexes added for future query paths:
  - `idx_forms_organization_id`
  - `idx_forms_status`
  - `idx_forms_created_by_user_id`
  - `idx_submissions_organization_id`
  - `idx_submissions_form_id`
  - `idx_submissions_collector_user_id`
  - `idx_submissions_submitted_at`

---

## 3. Migration generated

- [x] Added migration: `apps/web/drizzle/0001_first_golden_guardian.sql`
- [x] Drizzle metadata updated: `apps/web/drizzle/meta/0001_snapshot.json` and `apps/web/drizzle/meta/_journal.json`

---

## 4. Shared TypeScript contracts (`packages/types`)

- [x] Added `packages/types/src/forms-submissions.ts` with:
  - constants/types for `FormStatus` and `FormFieldType`
  - discriminated union `FormFieldDefinition` for supported field types:
    - `text`, `number`, `date`, `select`, `file`, `location`
  - `FormDefinition`
  - `SubmissionAnswerValue`
  - `SubmissionPayload`
  - `SubmissionRecord`
- [x] Updated `packages/types/src/index.ts` exports for all new T13 types/constants.

---

## 5. Validation commands

- [x] `cd apps/web && bun run typecheck`
- [x] `cd packages/types && bun run typecheck`

---

## Unlocks

- Foundation for T14 Forms CRUD API with status lifecycle (`DRAFT`/`PUBLISHED`/`ARCHIVED`).
- Foundation for T15 Submissions API with JSON payload storage.
- Shared contracts for web, mobile, and API to render/submit dynamic forms consistently.
