# T4 – Initialize Next.js Admin & API App – Checklist

**Task:** Create a Next.js app in `apps/web` (App Router, TypeScript), configured to run on Vercel or equivalent.

**Complexity:** Low · **Priority:** P0 · **Dependencies:** T2

---

## 1. Next.js app in apps/web

- [x] Next.js lives in `apps/web` (from T2 monorepo).
- [x] **App Router** used: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- [x] **TypeScript** enabled; `tsconfig.json` with strict mode (aligned with monorepo tooling from T3).
- [x] App branded as admin interface (metadata and home placeholder).

---

## 2. Vercel or equivalent

- [x] No extra config required for Vercel; Next.js is detected automatically.
- [x] Optional: `output: 'standalone'` in `next.config.ts` for Docker or non-Vercel hosting (see config).

---

## 3. API route handlers

- [x] Skeleton API route: `app/api/health/route.ts` (GET returns `{ ok: true }`).
- [x] Unlocks adding more API routes under `app/api/*` for forms, submissions, auth, etc.

---

## 4. App constants

- [x] `lib/constants.ts` (or similar) holds app name and metadata defaults to avoid hard-coding in layout/page.

---

## Commands

| Command                      | Description                      |
| ---------------------------- | -------------------------------- |
| `bun run dev`                | Start dev server (from root)     |
| `cd apps/web && bun run dev` | Start web app only               |
| `bun run build`              | Build all (Turbo); web → `.next` |

---

## Unlocks

- Start building admin screens under `app/**`.
- Add API route handlers under `app/api/**` for forms, submissions, and auth (T8, T10, T14, T15).
