# T8 – Supabase Connection (no Prisma) Checklist

**Task:** Connect the web app to Supabase for database and auth. No Prisma; use Supabase client only.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T1, T4

---

## 1. Packages

- [x] `@supabase/supabase-js` and `@supabase/ssr` installed in `apps/web`.
- [x] No Prisma or `DATABASE_URL`; DB access is via Supabase client (same project URL and keys as Auth).

---

## 2. Supabase clients

- [x] **Browser client** – `lib/supabase/client.ts`: `createClient()` using `createBrowserClient` from `@supabase/ssr` (for Client Components).
- [x] **Server client** – `lib/supabase/server.ts`: async `createClient()` using `createServerClient` and `cookies()` from `next/headers` (for Server Components, Route Handlers, Server Actions).

Both use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

from `.env` / `.env.local` (see T1 and `.env.example`).

---

## 3. Environment

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set (e.g. in `.env.local` or root `.env`).
- No `DATABASE_URL` required for app code; schema/migrations are managed in Supabase (Dashboard SQL Editor or Supabase CLI).

---

## 4. Usage

- **Server (e.g. API route or Server Component):**  
  `const supabase = await createClient();` then `supabase.from('table').select()`, `supabase.auth.getUser()`, etc.
- **Client:**  
  `const supabase = createClient();` then same `.from()` / `.auth` usage.

---

## 5. Schema and migrations

- Define tables in the Supabase project (Dashboard → SQL Editor, or migration files with Supabase CLI).
- T9 (User, Organization, Membership) and T13 (Form, Submission) will define the schema in SQL or via Supabase migrations, not Prisma.

---

## Unlocks

- Query Supabase Postgres and use Auth from the web app via the same Supabase project.
- Foundation for T9 (schema), T10 (auth), and T11+ (APIs and guards).
