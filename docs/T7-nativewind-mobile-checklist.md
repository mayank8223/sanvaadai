# T7 – Configure NativeWind and Base UI Components in Mobile App – Checklist

**Task:** Add NativeWind to the Expo app and create a minimal component layer (`AppButton`, `AppInput`, `Screen`, `Icon` wrapper).

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T5

---

## 1. NativeWind

- [x] Dependencies added: `nativewind`, `tailwindcss@^3.4.17`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-svg`, `lucide-react-native`.
- [x] `tailwind.config.mjs` with `content` paths and `nativewind/preset`; theme extended with design tokens (primary, secondary, muted, border, input, background, foreground).
- [x] `global.css` with `@tailwind base`, `@tailwind components`, `@tailwind utilities`.
- [x] `babel.config.js` updated: `babel-preset-expo` with `jsxImportSource: 'nativewind'`, plus `nativewind/babel` preset.
- [x] `metro.config.mjs` created with `withNativeWind(config, { input: './global.css' })` (ESM to satisfy ESLint no-require-imports).
- [x] `nativewind-env.d.ts` added with `/// <reference types="nativewind/types" />`; `tsconfig.json` includes it.
- [x] `App.tsx` imports `./global.css`. Root wrapped in `SafeAreaProvider` for safe area hooks.

---

## 2. Base UI components

- [x] **AppButton** – `components/AppButton.tsx`: Pressable-based; variants `default`, `secondary`, `outline`, `ghost`; sizes `default`, `sm`, `lg`; required `label` prop; optional `className`, `textClassName`.
- [x] **AppInput** – `components/AppInput.tsx`: TextInput with border, padding, placeholder styling; optional `className`.
- [x] **Screen** – `components/Screen.tsx`: View with `flex-1 bg-background`; optional `safe` (default true) uses `useSafeAreaInsets()` for padding; optional `className`.
- [x] **Icon** – `components/Icon.tsx`: Wrapper accepting `as` (Lucide icon component), `size`, `color`, `strokeWidth` for consistent icon usage.
- [x] `components/index.ts` re-exports all four components.

---

## 3. App integration

- [x] `App.tsx` uses `Screen`, `AppButton`, `AppInput`, `Icon` (with `CheckCircle2Icon` from `lucide-react-native`) to demonstrate the stack.

---

## Commands

| Command | Description |
|--------|-------------|
| `bun install` | Install deps (from repo root or `apps/mobile`) |
| `cd apps/mobile && bun run start` | Start Expo dev server |
| `bun run ios` / `bun run android` | Run on simulator/device |

---

## Unlocks

- Tailwind-style development on mobile; consistent styling with design tokens.
- Faster development of mobile screens using `AppButton`, `AppInput`, `Screen`, and `Icon`.
