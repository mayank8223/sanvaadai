# T10 – Integrate Supabase Auth in Web App Checklist

**Task:** Connect Next.js to Supabase Auth using the Supabase clients from T8. Implement login/logout and expose the current user in server components and API routes.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T1, T4, T9

---

## 1. Auth callback route

- [x] **GET `/auth/callback`** – `app/auth/callback/route.ts` exchanges `code` for session via `supabase.auth.exchangeCodeForSession(code)` using the server client. Redirects to `?next=` or `/` on success; redirects to `/login?error=...` on failure. Required for email confirmation and OAuth redirects.

---

## 2. Server-side auth helpers

- [x] **`lib/auth/server.ts`** – `getCurrentUser()` returns the validated user from the session (uses `supabase.auth.getUser()`). Use in Server Components and API Route Handlers. Returns `null` when unauthenticated.
- [x] **`getSession()`** – Optional helper that returns the current session without a server round-trip; use when you only need to check presence of a session.

---

## 3. Login page

- [x] **`/login`** – `app/login/page.tsx` (server) + `app/login/login-client.tsx` (client). Email/password form using `supabase.auth.signInWithPassword()`. Supports `?next=` redirect and `?error=` from callback. Link to **Create account** (sign-up). Accessible labels and error display.

---

## 3a. Sign-up page (new admin registration)

- [x] **`/signup`** – `app/signup/page.tsx` (server) + `app/signup/signup-client.tsx` (client). Email, password, optional full name; uses `supabase.auth.signUp()`. If Supabase requires email confirmation, shows “Check your email” and link to sign in; `/auth/callback` handles the confirmation link. Link to **Sign in** for existing users. Middleware allows unauthenticated access to `/signup`.

---

## 4. Logout

- [x] **Sign out** – Client component `components/auth/auth-actions.tsx` calls `supabase.auth.signOut()` then `router.push('/login')` and `router.refresh()`. Rendered on the home page when the user is present.

---

## 5. Expose current user

- [x] **Server Components** – Home page (`app/page.tsx`) uses `getCurrentUser()` and renders `AuthActions` (user email + Sign out) when authenticated.
- [x] **API routes** – **GET `/api/me`** returns `{ user: { id, email } }` when authenticated, or `401` when not. Demonstrates using `getCurrentUser()` in Route Handlers.

---

## 6. Middleware

- [x] Existing middleware (`lib/supabase/proxy.ts`) refreshes the session and redirects unauthenticated users to `/login` (except for `/login`, `/signup`, and `/auth`). No code change required for T10 beyond allowing `/signup`.

---

## Unlocks

- Access-controlled admin UI: unauthenticated users are sent to `/login`.
- **New admins** can register via **`/signup`** (Create account); after email confirmation (if enabled), they sign in and can be assigned to orgs (T11).
- Authenticated API calls using Supabase sessions/tokens; `/api/me` and Server Components can read the current user.
- Foundation for T11 (org + role middleware/guards) which will resolve membership and role from the authenticated user.
- **T10a (P1):** Login via Google and other OAuth providers – see `implementation.md`.

---

## Env / Supabase Dashboard

- Ensure **Redirect URLs** in Supabase Dashboard → Authentication → URL Configuration include:
  - `http://localhost:3000/auth/callback` (local)
  - Your production origin + `/auth/callback`
- Email auth (and optional OAuth) must be enabled in Authentication → Providers.
