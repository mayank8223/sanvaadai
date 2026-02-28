# Sanvaadai

Monorepo for the AI-enabled data collection platform.

## Structure

- **`apps/web`** – Next.js admin & API (App Router, TypeScript)
- **`apps/mobile`** – Expo (React Native) collector app
- **`packages/tsconfig`** – Shared TypeScript configs (base, Next.js)
- **`packages/types`** – Shared TypeScript types (forms, submissions; expanded in T13)
- **`docs/`** – Implementation checklists and notes

## Prerequisites

- Node.js ≥ 20
- [Bun](https://bun.sh) (package manager; root `package.json` uses `packageManager: "bun@1.0.0"`)

## Commands (from repo root)

```bash
# Install dependencies (all workspaces)
bun install

# Build all apps and packages
bun run build

# Run dev servers (web and/or mobile)
bun run dev
```

## Running individual apps

**Web (Next.js)**

```bash
cd apps/web && bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Mobile (Expo)**

```bash
cd apps/mobile && bun run start
```

Use Expo Go on a device or an emulator to run the app.

## Implementation

See [implementation.md](./implementation.md) for the full task list and [docs/T1-infrastructure-checklist.md](./docs/T1-infrastructure-checklist.md) for infrastructure setup.
