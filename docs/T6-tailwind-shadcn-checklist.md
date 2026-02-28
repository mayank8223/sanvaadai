# T6 – Configure Tailwind, shadcn/ui, and Radix in Web App – Checklist

**Task:** Install and configure Tailwind CSS, generate base shadcn/ui components (built on Radix), and wire Lucide icons on the web app.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** T4

---

## 1. Tailwind CSS

- [x] Tailwind v4 already configured (T4): `@import 'tailwindcss'` in `app/globals.css`, `postcss.config.mjs` with `@tailwindcss/postcss`.
- [x] Theme extended with shadcn design tokens (OKLCH) in `:root` / `.dark` and `@theme inline` in `globals.css`.

---

## 2. shadcn/ui and Radix

- [x] Dependencies added: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `lucide-react`.
- [x] `components.json` added for future `npx shadcn@latest add <component>` (style: new-york, baseColor: neutral, cssVariables: true).
- [x] `lib/utils.ts` with `cn()` for merging Tailwind classes.
- [x] Base UI components added under `components/ui/`:
  - **Button** – variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon; uses Radix Slot for `asChild`.
  - **Input** – styled text input with border, focus ring, disabled state.
  - **Card** – Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.

---

## 3. Lucide icons

- [x] `lucide-react` added as dependency.
- [x] Home page (`app/page.tsx`) updated to use `CheckCircle2Icon` and demonstrate Button, Input, Card.

---

## 4. Cursor and base styles

- [x] Button cursor: `@layer base` in `globals.css` restores `cursor: pointer` for `button` and `[role="button"]` (Tailwind v4 default is `cursor: default`).

---

## Commands

| Command                             | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `bun install`                       | Install deps (from repo root or `apps/web`)  |
| `cd apps/web && bun run dev`        | Start web dev server                         |
| `npx shadcn@latest add <component>` | Add more components (e.g. `dialog`, `table`) |

---

## Unlocks

- Rapid development of consistent web UI (forms, tables, dialogs, navigation).
- Admin screens and AI panels can use shadcn components and Lucide icons.
