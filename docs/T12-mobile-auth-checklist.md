# T12 – Implement Auth Flow in Mobile App Checklist

**Task:** Build collector login UI in `apps/mobile` and integrate Supabase Auth with secure token storage.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T5, T10

---

## 1. Supabase mobile client + secure storage

- [x] Added `@supabase/supabase-js` and `expo-secure-store` in `apps/mobile`.
- [x] Added `lib/supabase/client.ts` with Supabase client configured for mobile auth:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: false`
  - storage adapter backed by Expo SecureStore.
- [x] Added `lib/supabase/env.ts` for environment resolution:
  - prefers `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - falls back to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for shared local env setup.

---

## 2. Auth state/session hook

- [x] Added `hooks/useAuthSession.ts` as reusable auth logic:
  - hydrates session with `supabase.auth.getSession()`
  - subscribes to `onAuthStateChange()` for live session updates
  - exposes `signIn()` via `signInWithPassword()`
  - exposes `signOut()` via `signOut()`
  - normalizes auth errors for UI display.

---

## 3. Login UI and authenticated state UI

- [x] Added `features/auth/LoginScreen.tsx`:
  - email/password inputs
  - loading + disabled submit state
  - inline auth error feedback.
- [x] Added `hooks/useLoginForm.ts` to keep form state/validation logic out of UI.
- [x] Added `features/auth/AuthenticatedHome.tsx` for signed-in state and logout action.
- [x] Updated `App.tsx` to toggle between login and authenticated home based on Supabase session.

---

## 4. Shared auth copy + error mapping

- [x] Added auth copy constants in `apps/mobile/constants.ts` for labels/messages.
- [x] Added `lib/auth/errors.ts` to map Supabase auth errors to user-facing copy (invalid credentials vs fallback error).

---

## 5. Unit tests and verification

- [x] Added `lib/auth/errors.test.ts` to validate auth error mapping behavior.
- [x] Added local Bun test type declaration (`types/bun-test.d.ts`) so strict TypeScript checks pass in the Expo app.
- [x] Validation commands run successfully in `apps/mobile`:
  - `bun run typecheck`
  - `bun run lint`
  - `bun test lib/auth/errors.test.ts`

---

## Unlocks

- Collectors can sign in to the same Supabase project used by web auth.
- Mobile sessions are persisted securely with Expo SecureStore.
- Foundation is ready for T18+ authenticated form fetch/submission flows.
