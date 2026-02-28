# T9 – User, Organization, and Membership Schema Checklist

**Task:** Define tables in Supabase for User (linked to auth.users), Organization, and Membership with roles. Sync app User rows from auth.users.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T8

**Schema is managed with Drizzle ORM** in `apps/web` (source of truth: `db/schema.ts`). Migrations live in `apps/web/drizzle/`.

---

## 1. Schema (Drizzle ORM)

- [x] **Enum** `membership_role`: `ADMIN`, `COLLECTOR` (`db/schema.ts`).
- [x] **Table** `organizations`: `id`, `name`, `slug` (optional unique), `created_at`, `updated_at`.
- [x] **Table** `users`: `id` (PK; FK → `auth.users(id)` added in custom migration), `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`.
- [x] **Table** `memberships`: `id`, `user_id` (FK → users), `organization_id` (FK → organizations), `role`, `created_at`, `updated_at`, UNIQUE(`user_id`, `organization_id`).
- [x] Indexes on `memberships(user_id)`, `memberships(organization_id)`, `organizations(slug)`.

---

## 2. Row Level Security (RLS)

- [x] RLS enabled on `organizations`, `users`, `memberships` (custom migration `0001_auth_users_fk_rls_and_trigger.sql`).
- [x] **users:** SELECT/UPDATE own row only (`auth.uid() = id`).
- [x] **organizations:** SELECT for authenticated users who are members (via `memberships`).
- [x] **memberships:** SELECT for authenticated users (own memberships only).
- [x] **organizations:** INSERT allowed for authenticated (e.g. create org).
- [x] **memberships:** INSERT allowed for authenticated when `user_id = auth.uid()` (add self when creating org; T11 will handle admins adding others via API/service role).

---

## 3. Sync auth.users → public.users

- [x] Function `public.handle_auth_user_sync()` (SECURITY DEFINER, `search_path = ''`) in custom migration.
- [x] Trigger `on_auth_user_created` AFTER INSERT on `auth.users` → `handle_auth_user_sync`.
- [x] Trigger `on_auth_user_updated` AFTER UPDATE on `auth.users` → `handle_auth_user_sync`.

---

## 4. Shared TypeScript types

- [x] In `packages/types`: `MembershipRole`, `User`, `Organization`, `Membership`, `MembershipWithUser`, `MembershipWithOrganization`, `MEMBERSHIP_ROLES` (see `src/user-org-membership.ts` and `src/index.ts`).

---

## 5. How to apply migrations

**Prerequisites:** Set `DATABASE_URL` in `.env` or `.env.local` to your **Supabase Connection pooler** URL (port **6543**), not the direct connection (5432). Direct connections often cause `CONNECT_TIMEOUT` from local/CI. In Supabase: **Project Settings → Database → Connection string** → choose **Connection pooler** (Transaction or Session mode) → copy the URI.

**Apply migrations (from repo root or `apps/web`):**

```bash
cd apps/web
bun run db:migrate
```

**Useful commands:**

| Command               | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `bun run db:generate` | Generate a new migration from schema changes (`db/schema.ts`) |
| `bun run db:migrate`  | Apply pending migrations to the database                      |
| `bun run db:push`     | Push schema directly to DB (dev only; no migration files)     |
| `bun run db:studio`   | Open Drizzle Studio to browse data                            |

**Adding schema changes:** Edit `apps/web/db/schema.ts`, then run `bun run db:generate`. Review the new SQL in `drizzle/`, then run `bun run db:migrate`. For Supabase-specific SQL (e.g. RLS, triggers, FK to `auth.users`), add a custom migration: `bun run db:generate -- --custom --name=my_change` and edit the generated SQL file.

**Note:** The auth trigger only runs for _new_ sign-ups and updates. If you already have rows in `auth.users`, run a one-time backfill in SQL Editor:  
`INSERT INTO public.users (id, email, full_name, avatar_url) SELECT id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url' FROM auth.users ON CONFLICT (id) DO NOTHING;`

---

## Unlocks

- Multi-tenant data scoped by organization and membership.
- Role-based access (ADMIN, COLLECTOR) for T11 guards and T14/T15 APIs.
- Application `User` records stay in sync with Supabase Auth (sign-up/update).
