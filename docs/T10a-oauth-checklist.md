# T10a – Web App: Login via Google and Other OAuth Providers Checklist

**Task:** Add OAuth sign-in in the web app using Supabase Auth (Google and optionally GitHub). Use the existing `/auth/callback` for the OAuth redirect so the session is stored in cookies.

**Complexity:** Low · **Priority:** P1 · **Dependencies:** T10

---

## 1. OAuth constants

- [x] **`lib/auth/constants.ts`** – `AUTH_CALLBACK_PATH` (`/auth/callback`) and `OAUTH_PROVIDERS` array (e.g. `{ id: 'google', label: 'Google' }`, `{ id: 'github', label: 'GitHub' }`). Provider ids match Supabase Auth identifiers. Add or remove providers here to control which buttons appear on the login page.

---

## 2. Login page OAuth UI

- [x] **Login page** – `app/login/login-client.tsx` includes:
  - "Or continue with" divider below the email/password form.
  - "Sign in with Google" and "Sign in with GitHub" buttons (or others per `OAUTH_PROVIDERS`).
  - On click: `signInWithOAuth({ provider, options: { redirectTo } })` with `redirectTo` = current origin + `AUTH_CALLBACK_PATH` + optional `?next=...` for post-login redirect.
  - On success: redirect to `data.url` via `window.location.href`.
  - Loading and error state: buttons disabled and one button shows "Signing in with …" while OAuth is in progress; errors shown in the existing alert area.
  - Accessible labels: `aria-label="Sign in with Google"` (and equivalent for other providers).

---

## 3. Auth callback (no code change)

- [x] **GET `/auth/callback`** – Already exchanges `code` for session and redirects to `?next=` or `/`. When initiating OAuth, `redirectTo` is set to `/auth/callback?next=...` so the callback receives `next` and redirects the user to the intended page after login.

---

## 4. Supabase Dashboard configuration

- [ ] **Redirect URLs** – In Supabase Dashboard → Authentication → URL Configuration, ensure the following are in **Redirect URLs**:
  - `http://localhost:3000/auth/callback` (and with query params allowed, e.g. `http://localhost:3000/auth/callback*` if your project uses a wildcard).
  - Production: `https://<your-domain>/auth/callback`.
- [ ] **Providers** – In Authentication → Providers, enable **Google** (and **GitHub** if used). Configure Client ID and Client Secret for each from the provider's developer console. For Google: use the same redirect URI Supabase shows (e.g. `https://<project-ref>.supabase.co/auth/v1/callback`) in the OAuth client configuration.

---

## Unlocks

- One-click sign-in for admins (and later collectors on mobile in T12) using the same Supabase project.
- Fewer passwords to manage; teams can use existing Google/GitHub accounts.

---

## Notes

- To add another provider (e.g. Microsoft, Apple): add an entry to `OAUTH_PROVIDERS` in `lib/auth/constants.ts` and enable and configure that provider in the Supabase Dashboard. No other code change required.
- If a provider is disabled in the Dashboard, the button will still appear; the user will see an error from Supabase when they click it. Optionally you could gate buttons by env (e.g. `NEXT_PUBLIC_OAUTH_PROVIDERS`) for a more controlled rollout.
