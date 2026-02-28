# T3 – Tooling (TypeScript, ESLint, Prettier) – Checklist

**Task:** Configure TypeScript with strict mode, ESLint, and Prettier in the monorepo, plus basic GitHub Actions for lint/check.

**Complexity:** Low · **Priority:** P0 · **Dependencies:** T2

---

## 1. TypeScript strict mode

- [x] Shared base config `packages/tsconfig/base.json`: `strict: true`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`.
- [x] `apps/web` and `apps/mobile` already use `strict: true` in their tsconfig.
- [x] `packages/types` extends shared base.

---

## 2. ESLint

- [x] **Web:** ESLint 9 with `eslint-config-next` (core-web-vitals + TypeScript); flat config in `apps/web/eslint.config.mjs`.
- [x] **Web:** Integrated `eslint-config-prettier` so Prettier and ESLint do not conflict.
- [x] **Mobile:** ESLint 8 with `.eslintrc.js` (minimal config: `@typescript-eslint`, `react`, `react-hooks`). Uses `eslint .` script for monorepo-friendly resolution; `expo lint` was replaced to avoid auto-install and plugin resolution issues.
- [x] **Root:** `bun run lint` runs `turbo lint` across all workspaces.

---

## 3. Prettier

- [x] Root `.prettierrc`: singleQuote, semi, tabWidth 2, trailingComma es5, printWidth 100.
- [x] Root `.prettierignore`: node_modules, .next, out, .expo, dist, build, lockfiles, coverage, logs.
- [x] Root scripts: `format` (write), `format:check` (CI).
- [x] Prettier installed at root; web app also has Prettier for editor integration.

---

## 4. Typecheck

- [x] Turbo task `typecheck` with `dependsOn: ["^build"]`.
- [x] **Web:** `tsc --noEmit` in `apps/web`.
- [x] **Mobile:** `tsc --noEmit` in `apps/mobile`.
- [x] **packages/types:** `tsc --noEmit` (uses existing tsconfig).
- [x] Root script: `bun run typecheck` runs `turbo typecheck`.

---

## 5. GitHub Actions

- [x] `.github/workflows/lint.yml`: on push/PR to main/master.
- [x] Steps: checkout → setup Bun → install → lint → typecheck → format:check.
- [x] Uses `bun install` (no lockfile required; add `--frozen-lockfile` once lockfile is committed).

---

## Commands

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| `bun run lint`         | Lint all workspaces (Turbo)       |
| `bun run typecheck`    | Type-check all workspaces (Turbo) |
| `bun run format`       | Format with Prettier              |
| `bun run format:check` | Check formatting (CI)             |

---

## Unlocks

- Safer refactors and fewer runtime errors as the codebase grows.
- Consistent style and quality across web, mobile, and packages.
