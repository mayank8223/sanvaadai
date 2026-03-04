# T11a – Organization + Team Management Checklist

**Task:** Implement onboarding and management flows for organizations and memberships (ADMIN/COLLECTOR), including adding collectors to an organization.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T9, T10, T11

---

## 1. Organization onboarding APIs

- [x] **POST `/api/organizations`** – Create organization (`name`, optional `slug`) and create creator membership as `ADMIN` in the same server flow.
- [x] Validate duplicate slug/name conflicts and return clear `409` errors.
- [x] **GET `/api/organizations`** – Return current user memberships with organization metadata for org switcher.
- [x] **POST `/api/organizations/switch`** – Persist active org (`svd_org_id` cookie) after membership validation.

---

## 2. Team management APIs (admin-only)

- [x] **GET `/api/organizations/:id/members`** – List members with `membership_id`, user info, role, timestamps.
- [x] **POST `/api/organizations/:id/members`** – Add member by `email` or `userId` with role (`ADMIN`/`COLLECTOR`).
- [x] **PATCH `/api/organizations/:id/members/:membershipId`** – Update role (`ADMIN`/`COLLECTOR`).
- [x] **DELETE `/api/organizations/:id/members/:membershipId`** – Remove membership.
- [x] Guardrails:
  - [x] Only org admins can mutate memberships.
  - [x] Prevent removing/demoting the last org admin.
  - [x] Prevent cross-org membership mutation.

---

## 3. Invite/onboarding behavior for non-existing users

- [x] If `email` does not exist in `public.users`, return a deterministic response for invite flow (`status: pending_invite`).
- [x] Define invite strategy for MVP:
  - [x] **Option A (minimal):** Admin adds only existing users; API returns `user_not_found` with next-step guidance.
  - [ ] **Option B (full):** Add `organization_invites` table + token-based accept flow.
- [x] Document selected option in README/docs and enforce consistently in API responses.

---

## 4. Admin web UI

- [x] **Onboarding page** (`/onboarding/organization`) for users with no membership:
  - [x] Create org form.
  - [x] Empty-state guidance if invite is required.
- [x] **Team settings page** (`/settings/team`):
  - [x] Members table (name/email/role).
  - [x] Add collector/admin by email.
  - [x] Role edit + remove actions with confirmations.
- [x] Add org switcher in app shell/header for multi-org users.

---

## 5. Auth/Guard integration

- [x] Reuse `withApiGuard()` and org resolver from T11 for all new routes.
- [x] Ensure active org resolution uses request (`orgId`/header/cookie) and membership checks before every mutation.
- [x] Emit consistent `401/403/404/409` error contracts across org/team APIs.

---

## 6. Testing

- [x] Unit tests for org/team service layer:
  - [ ] create org + admin membership transaction behavior.
  - [x] role update / remove constraints (including last-admin protection).
- [ ] API integration tests:
  - [ ] Admin can add collector.
  - [ ] Collector cannot add/update/remove members.
  - [ ] User from another org cannot be mutated without explicit add.
- [ ] UI tests (or Playwright) for onboarding and team management critical paths.

---

## Unlocks

- Complete admin onboarding without manual DB operations.
- Repeatable process to assign collectors to organizations.
- Stable multi-tenant team management before scaling forms/submissions usage.
