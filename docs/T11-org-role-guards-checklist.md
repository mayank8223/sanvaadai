# T11 – Org + Role Middleware/Guards Checklist

**Task:** Implement middleware and reusable auth guard utilities that resolve current organization membership and role for each request, then enforce access rules.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T9, T10

---

## 1. Request context + org resolution helpers

- [x] **`apps/web/lib/auth/organization.ts`** – Added reusable auth-org context utilities:
  - `resolveRequestedOrganizationId()` resolves active org with precedence: query (`orgId`) -> header (`x-organization-id`) -> cookie (`svd_org_id`) -> fallback membership org.
  - `getUserMemberships()` loads current user memberships from Supabase (`memberships` table).
  - `pickActiveMembership()` resolves the active membership from a requested org.
  - `resolveAuthOrganizationContext()` returns `{ user, memberships, requestedOrganizationId, activeMembership }`.

---

## 2. API guard abstraction (RBAC-ready)

- [x] **`apps/web/lib/auth/guards.ts`** – Added a composable `withApiGuard()` wrapper for Route Handlers:
  - Options: `requireAuth`, `requireMembership`, and `allowedRoles`.
  - Standardized guard responses: `401 Unauthorized`, `403 Forbidden`.
  - Injects resolved context into handlers to avoid duplicating auth + membership checks.
  - Adds response headers (`x-organization-id`, `x-membership-role`) when an active membership exists.

---

## 3. Apply guard to API route

- [x] **`apps/web/app/api/me/route.ts`** – Migrated to `withApiGuard()`:
  - Requires authentication.
  - Returns user identity plus resolved organization membership context.
  - Keeps membership optional for this endpoint (`requireMembership: false`) so it can still be used for onboarding/debugging when a user has no membership yet.

---

## 4. Middleware route policy hardening

- [x] **`apps/web/lib/supabase/proxy.ts`** – Improved unauthenticated route handling:
  - Added explicit public route prefixes (`/login`, `/signup`, `/auth`, `/api/health`).
  - Preserves post-login return path via `?next=` when redirecting unauthenticated users.
  - Keeps existing session refresh behavior via Supabase SSR middleware client.

---

## 5. Unit tests

- [x] **`apps/web/lib/auth/organization.test.ts`** – Added focused tests for core guard helper logic:
  - Org resolution precedence (query > header > cookie > fallback).
  - Active membership selection behavior for matching/non-matching org ids.
  - Default active membership behavior when org is not explicitly requested.

---

## Unlocks

- Consistent org + role context resolution for all future secured endpoints (Forms/Submissions APIs in T14/T15).
- Easy role-based enforcement with minimal per-route boilerplate.
- Safer multi-tenant expansion through centralized guard behavior.
