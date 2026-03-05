# T16a/T16b/T16c/T16d – App Shell, Auth Redirects, and Role Home Checklist

**Task:** Add production-grade shell/navigation and role-aware home experience after T16 completion.

**Complexity:** Medium · **Priority:** P0/P1 · **Dependencies:** T10, T11, T11a, T14, T15, T16

---

## 1. Shared app shell (Header + Footer)

- [x] Add authenticated layout wrapper used by admin and collector web pages.
- [ ] Header includes:
  - [x] Active organization name.
  - [x] Organization switcher (for multi-org memberships).
  - [x] Current role badge (`ADMIN`/`COLLECTOR`).
  - [x] User identity/menu + sign-out.
- [x] Footer includes support links and stable product metadata.
- [x] Use design tokens/components only (no hardcoded colors).

---

## 2. Auth route guard UX

- [x] When session exists, visiting `/login` redirects to `/` (or computed role home).
- [x] When session exists, visiting `/signup` redirects to `/` (or computed role home).
- [x] Ensure redirect handling does not break callback flows (`/auth/callback`).
- [x] Preserve `next` semantics only for unauthenticated users.

---

## 3. Role-aware home behavior (`/`)

- [x] Implement server-driven role resolution using active membership.
- [x] Admin landing: welcome state + quick actions (`Create form`, `Manage team`, `View submissions`).
- [x] Collector landing: welcome state + quick actions (`Open forms`, `Continue draft`, `Recent submissions`).
- [x] No membership state: org creation/invite guidance.
- [x] Invalid org selection state: clear action to switch org.

---

## 4. Dedicated role home pages

- [x] `/home/admin` page with admin-centric widgets.
- [x] `/home/collector` page with collector-centric widgets.
- [x] Add guard checks so role mismatch returns `403` or redirects safely.
- [x] Keep pages responsive and accessible.

---

## 5. API and data dependencies

- [x] `/api/me` returns data needed for shell (user + active org + role + memberships).
- [x] Add/extend memberships query endpoint if shell needs richer org metadata.
- [x] Keep org context synced with `svd_org_id` switching behavior.

---

## 6. Testing

- [x] Unit tests for role resolution and route redirect logic.
- [ ] Integration tests for:
  - [ ] logged-in user blocked from `/login` and `/signup`.
  - [ ] admin lands on admin home.
  - [ ] collector lands on collector home.
  - [ ] no-membership user lands on onboarding state.
- [ ] UI tests for header org/role display and org switching.

---

## Unlocks

- Professional shell/navigation UX (header/footer).
- Clear organization and role awareness at all times.
- Correct home experience for both admin and collector users.
