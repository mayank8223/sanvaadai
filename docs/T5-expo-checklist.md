# T5 – Initialize React Native (Expo) Collector App – Checklist

**Task:** Create an Expo-managed React Native app in `apps/mobile` with TypeScript template.

**Complexity:** Low · **Priority:** P0 · **Dependencies:** T2

---

## 1. Expo app in apps/mobile

- [x] Expo lives in `apps/mobile` (from T2 monorepo).
- [x] **TypeScript** enabled; `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`.
- [x] Entry: `index.ts` → `registerRootComponent(App)`; main UI in `App.tsx`.
- [x] App branded as field collector (constants + placeholder screen).

---

## 2. Expo config (app.json)

- [x] `name`: Sanvaadai Collector.
- [x] `slug`: sanvaadai-mobile (for Expo Go / build URLs).
- [x] `scheme`: sanvaadai (deep linking).
- [x] iOS `bundleIdentifier` and Android `package`: com.sanvaadai.collector.

---

## 3. App constants

- [x] `constants.ts` holds `APP_NAME` (and optional metadata) so it is not hard-coded in components.

---

## 4. Tooling alignment (T3)

- [x] `lint` and `typecheck` scripts; Turbo runs them from root.
- [x] React 19 + Expo SDK 52 for alignment with web stack.

---

## Commands

| Command                    | Description                |
| -------------------------- | -------------------------- |
| `cd apps/mobile && bun run start` | Start Expo dev server |
| `bun run start` (from apps/mobile) | Same                   |
| `bun run typecheck`        | Type-check (from root)     |
| `bun run lint`             | Lint all (from root)       |

---

## Unlocks

- Develop and test mobile flows independently of the web app.
- Next: T7 (NativeWind + base UI components), T12 (auth flow), T18 (forms list), T19 (form renderer), T20 (submit to API).
