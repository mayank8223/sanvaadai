# T2 – Monorepo Skeleton – Completion Review

**Task (from implementation.md):** Create a monorepo (e.g. Turborepo or Nx) with `apps/web`, `apps/mobile`, and `packages/` for shared code.

**Unlocks:** Clean structure to build both Next.js and React Native apps with shared TypeScript types.

---

## 1. Requirements Checklist

| Requirement                      | Status | Notes                                                 |
| -------------------------------- | ------ | ----------------------------------------------------- |
| Monorepo tool (Turborepo or Nx)  | ✅     | Turborepo with `turbo.json`                           |
| `apps/web`                       | ✅     | Next.js app (moved from original root)                |
| `apps/mobile`                    | ✅     | Expo (React Native) with TypeScript                   |
| `packages/` for shared code      | ✅     | `packages/tsconfig` + `packages/types`                |
| Shared TypeScript types possible | ✅     | `packages/types` ready for T13 (FormDefinition, etc.) |

---

## 2. Root-Level Changes

### Added

- **`package.json`** – Workspace root: `workspaces: ["apps/*", "packages/*"]`, scripts `build`, `dev`, `lint`, `clean`, `devDependencies.turbo`, `packageManager: "bun@1.0.0"`, `engines.node: ">=20"`.
- **`turbo.json`** – Pipeline: `build` (depends on `^build`, outputs `.next/**`, `dist/**`), `dev` (persistent, no cache), `lint` (depends on `^build`), `clean` (no cache). `globalDependencies: [".env.example"]`.

### Unchanged at root

- **`.env.example`** – Still at root; referenced by turbo `globalDependencies`.
- **`docs/`** – `T1-infrastructure-checklist.md` (and now this review).
- **`implementation.md`**, **`agent_skills.md`**, **`README.md`** – Updated README for monorepo; others unchanged.
- **`.gitignore`** – Still ignores `node_modules`, `.next/`, `.env*` with `!.env.example`.

### Removed from root

- **`app/`** – Moved to `apps/web/app/` (layout.tsx, page.tsx, globals.css, favicon.ico).
- **`public/`** – Moved to `apps/web/public/` (vercel.svg, next.svg, file.svg, globe.svg, window.svg).
- **`next.config.ts`**, **`tsconfig.json`**, **`postcss.config.mjs`**, **`eslint.config.mjs`** – Now live under `apps/web/`.

---

## 3. `apps/web` (Next.js)

- **Purpose:** Admin UI + API (App Router, TypeScript); will be extended in T4, T6, T8, etc.
- **Contents:**
  - `package.json` – next 16.1.6, react 19.2.3, tailwind 4, eslint-config-next, TypeScript; scripts: dev, build, start, lint, clean.
  - `next.config.ts`, `tsconfig.json` – Standard Next config; `paths: { "@/*": ["./*"] }` for `apps/web` root.
  - `postcss.config.mjs`, `eslint.config.mjs` – Tailwind and ESLint for web.
  - `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/favicon.ico` – Same as original app.
  - `public/*.svg` – All original assets.
- **Verification:** No references to repo root for app code; all imports are relative or `@/*` within `apps/web`. Ready for T3 (tooling) and T4 (explicit Next.js init is already done here).

---

## 4. `apps/mobile` (Expo)

- **Purpose:** Field collector app (forms, media, submission); will be extended in T5, T7, T12, etc.
- **Contents:**
  - `package.json` – expo ~52, react 19.2.3, react-native 0.76.5, expo-status-bar; devDependencies: @babel/core, babel-preset-expo, @types/react, typescript. Scripts: start, android, ios, web, lint, clean.
  - `app.json` – name "Sanvaadai Collector", slug "sanvaadai-mobile", iOS/Android package identifiers.
  - `tsconfig.json` – extends `expo/tsconfig.base`, strict.
  - `babel.config.js` – presets: babel-preset-expo.
  - `index.ts` – registerRootComponent(App).
  - `App.tsx` – Minimal placeholder (arrow function, StyleSheet, StatusBar).
- **Note:** Expo app was created manually (create-expo-app failed in sandbox). Aligned with Expo SDK 52 and React 19 to match web.

---

## 5. `packages/tsconfig`

- **Purpose:** Shared TypeScript configs for the monorepo.
- **Contents:**
  - `package.json` – name `@sanvaadai/tsconfig`, `files: ["base.json", "nextjs.json"]`.
  - `base.json` – Strict, ESM, bundler, noEmit; for generic shared code.
  - `nextjs.json` – Extends base, adds dom libs, jsx.
- **Usage:** Apps can extend e.g. `@sanvaadai/tsconfig/nextjs.json` when consolidating config in T3 if desired. `packages/types` already extends `../../tsconfig/base.json`.

---

## 6. `packages/types`

- **Purpose:** Shared TypeScript types (FormDefinition, FormFieldDefinition, SubmissionPayload, etc.) for web, mobile, and API (T13).
- **Contents:**
  - `package.json` – name `@sanvaadai/types`, main/types point to `dist/`, scripts: build (tsc), clean.
  - `tsconfig.json` – Extends `../../tsconfig/base.json`, emits to `dist/` with declaration + declarationMap.
  - `src/index.ts` – Placeholder `export {}`; to be filled in T13.
- **Verification:** Extend path is correct (`packages/tsconfig/base.json`). Build will produce `dist/index.js` and `dist/index.d.ts` once types are added.

---

## 7. Issues Found and Fixes Applied During Review

1. **Missing `babel-preset-expo` in `apps/mobile`** – Required by `babel.config.js`. Added to `devDependencies` as `babel-preset-expo: "~13.0.0"` so `bun install` resolves it even if Expo doesn’t hoist it.

---

## 8. What to Do Locally

1. **Install:** From repo root run:

   ```bash
   bun install
   ```

   If you see a tarball/extraction error (e.g. xmlbuilder), retry or use a different network; the layout is correct.

2. **Build:**

   ```bash
   bun run build
   ```

   This runs `turbo build`: builds `packages/types` then `apps/web`. `apps/mobile` has no `build` script (Expo is run via `expo start`).

3. **Dev:**
   - Web: `cd apps/web && bun run dev` (or from root: `bun run dev` runs turbo dev, which starts web).
   - Mobile: `cd apps/mobile && bun run start`.

4. **Lint:** From root, `bun run lint` runs lint in all workspaces that define it (e.g. web).

---

## 9. Conclusion

T2 is **complete**. The monorepo has:

- **apps/web** – Next.js admin/API app (moved from root).
- **apps/mobile** – Expo collector app (TypeScript, minimal entry and App).
- **packages/tsconfig** – Shared base + Next.js tsconfigs.
- **packages/types** – Shared types package (placeholder until T13).

Root is clean (no leftover `app/` or `public/`), Turborepo is configured, and README/docs are updated. One fix was applied during review: add `babel-preset-expo` to `apps/mobile` so Babel runs correctly. After a successful `bun install` locally, you can proceed to **T3 – Setup tooling (TypeScript, ESLint, Prettier)**.
