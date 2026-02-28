# Implementation Plan – AI-Enabled Data Collection Platform

This document breaks the work into independent tasks with:

- **Complexity:** low / medium / high
- **Priority:** P0 (must-have for MVP), P1 (important, next), P2 (nice-to-have / later)
- **Dependencies:** other task IDs that should be completed first

---

## Stack decision (through T9 and beyond)

**Backend and data (T1–T9):** This project uses **Supabase** as the chosen backend:

- **Database** – Supabase Postgres; access via Supabase client (`@supabase/supabase-js`, `@supabase/ssr`). **Schema and migrations are managed with Drizzle ORM** in `apps/web` (`db/schema.ts`, `drizzle/`); no Prisma.
- **Auth** – Supabase Auth for email/password (and optional social logins) on web and mobile.
- **Storage** – Supabase Storage for media files when needed; optional and can be added later.

There is no separate ORM (e.g. Prisma) for the database; all data access goes through the Supabase client. See `docs/T1-infrastructure-checklist.md`, `docs/T8-supabase-checklist.md`, and `.env.example` for setup.

---

## Prerequisites – External Setup (Non-code)

Before or alongside implementation, you’ll need to set up the following external resources:

**Backend & data (Supabase):** This project uses **Supabase** for:

- **Managed PostgreSQL database** – tables and queries via Supabase client (no Prisma). Schema and migrations are managed in the Supabase project (Dashboard SQL Editor or Supabase CLI).
- **Auth** – Supabase Auth for email/password (and optional social logins) on web and mobile.
- **Object storage (optional)** – Supabase Storage for media files when needed; S3/R2 can be used instead if preferred.

One Supabase project provides the database (via client), Auth URL/keys, and optionally storage; see `docs/T1-infrastructure-checklist.md`, `docs/T8-supabase-checklist.md`, and `.env.example`.

**Other external resources:**

- **Cloud hosting for web + API**
  - e.g. Vercel project connected to your Git repo.

- **LLM provider & API keys**
  - e.g. OpenAI / Anthropic, to be used via Vercel AI SDK.

- **Speech-to-Text provider**
  - e.g. OpenAI Whisper API / Google Speech-to-Text.

- **Maps provider (optional but recommended)**
  - e.g. Google Maps / Mapbox key for showing submission locations.

- **Mobile platform accounts**
  - Apple Developer and Google Play Console (for eventual distribution).

Some of these are captured as tasks below (e.g. wiring DB and auth into the code), but the _actual account/project creation_ must be done in your cloud consoles.

---

## Task List

---

### T1 – Choose and provision core infrastructure

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** None
- **Description:**
  - **What:** Create a **Supabase project** (for Postgres via Supabase client, Auth, and optionally Storage), a Vercel project (or alternative) for web/API, and obtain LLM + STT provider keys. Use `docs/T1-infrastructure-checklist.md` and `.env.example` as the contract.
  - **Why:** All subsequent work (DB schema in Supabase, auth integration, AI endpoints) depends on having Supabase credentials and API keys.
  - **Unlocks:** Ability to connect the app to Supabase (database via client, auth) and AI services instead of mocks.

---

### T2 – Create monorepo skeleton

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** None
- **Description:**
  - **What:** Create a monorepo (e.g. Turborepo or Nx) with `apps/web`, `apps/mobile`, and `packages/` for shared code.
  - **Why:** A monorepo makes it easier to share types, design tokens, and business logic between web, mobile, and backend.
  - **Unlocks:** Clean structure to build both Next.js and React Native apps with shared TypeScript types.

---

### T3 – Setup tooling (TypeScript, ESLint, Prettier)

- **Complexity:** Low
- **Priority:** P0
- **Dependencies:** T2
- **Description:**
  - **What:** Configure TypeScript with strict mode, ESLint, and Prettier in the monorepo, plus basic GitHub Actions for lint/check.
  - **Why:** Enforces code quality and consistency across all apps/packages from day one.
  - **Unlocks:** Safer refactors and fewer runtime errors as the codebase grows.

---

### T4 – Initialize Next.js admin & API app

- **Complexity:** Low
- **Priority:** P0
- **Dependencies:** T2
- **Description:**
  - **What:** Create a Next.js app in `apps/web` (App Router, TypeScript), configured to run on Vercel or equivalent.
  - **Why:** This is the main admin interface and backend API host; most business logic will live here.
  - **Unlocks:** You can start building admin screens and API route handlers.

---

### T5 – Initialize React Native (Expo) collector app

- **Complexity:** Low
- **Priority:** P0
- **Dependencies:** T2
- **Description:**
  - **What:** Create an Expo-managed React Native app in `apps/mobile` with TypeScript template.
  - **Why:** This will be the field collector app used to fill forms, capture media, and submit data.
  - **Unlocks:** Ability to develop and test mobile flows independently of the web app.

---

### T6 – Configure Tailwind, shadcn/ui, and Radix in web app

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T4
- **Description:**
  - **What:** Install and configure Tailwind CSS, generate base shadcn/ui components (built on Radix), and wire Lucide icons on the web app.
  - **Why:** Provides a robust, accessible component system and utility-first styling for admin UI and AI panels.
  - **Unlocks:** Rapid development of consistent web UI (forms, tables, dialogs, navigation).

---

### T7 – Configure NativeWind and base UI components in mobile app

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T5
- **Description:**
  - **What:** Add NativeWind to the Expo app and create a minimal component layer (`AppButton`, `AppInput`, `Screen`, `Icon` wrapper).
  - **Why:** Mirrors Tailwind-style development from web on mobile and standardizes UI.
  - **Unlocks:** Faster development of mobile screens with consistent styling.

---

### T8 – Connect web app to Supabase (database + auth clients)

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T1, T4
- **Description:**
  - **What:** Install and configure **Supabase** in `apps/web`: `@supabase/supabase-js` and `@supabase/ssr`. Create a browser client (e.g. `createBrowserClient`) for Client Components and a server client (e.g. `createServerClient` with `cookies()`) for Server Components and API routes. Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase project. No Prisma; all database access is via the Supabase client.
  - **Why:** Supabase is the chosen backend; the web app must use the same project for both database and auth. See `docs/T8-supabase-checklist.md`.
  - **Unlocks:** Ability to query Supabase Postgres and use Auth from the web app; foundation for T9 (schema), T10 (auth), and T11+ (APIs and guards).

---

### T9 – Define User, Organization, and Membership schema (Supabase)

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T8
- **Description:**
  - **What:** Define tables in the **Supabase** project for `User` (or link to `auth.users`), `Organization`, and `Membership` (with roles e.g. ADMIN, COLLECTOR). **Use Drizzle ORM** in `apps/web` (`db/schema.ts`) as source of truth; run migrations with `bun run db:migrate` (see `docs/T9-schema-checklist.md`). Sync application `User` records with Supabase Auth users via a DB trigger (custom migration).
  - **Why:** These entities are required for multi-tenancy and role-based access control; they live in Supabase Postgres and are accessed via the Supabase client.
  - **Unlocks:** Enforces organizational boundaries and lets you scope all data by org and user role.

---

### T10 – Integrate Supabase Auth in web app

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T1, T4, T9
- **Description:**
  - **What:** Connect Next.js to **Supabase Auth** using the Supabase clients from T8 (`@supabase/supabase-js` and `@supabase/ssr` for server components/cookies). Implement login/logout and expose the current user in server components and API routes (from session or JWT).
  - **Why:** Auth is required to know who is performing actions and to bind them to an org/membership; Supabase Auth provides the identity layer.
  - **Unlocks:** Access-controlled admin UI and authenticated API calls using Supabase sessions/tokens.

---

### T11 – Implement org + role middleware/guards

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T9, T10
- **Description:**
  - **What:** Create middleware/utility to resolve the user’s current organization, membership, and role for each request, and guard routes accordingly.
  - **Why:** Prevents cross-org data leakage and ensures only admins perform admin actions.
  - **Unlocks:** Safe multi-tenant behavior and a foundation for all secured APIs.

---

### T12 – Implement auth flow in mobile app

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T5, T10
- **Description:**
  - **What:** Build login UI in the mobile app and integrate with **Supabase Auth** (e.g. `@supabase/supabase-js` with secure token storage such as Expo SecureStore), so collectors sign in via the same Supabase project as the web app.
  - **Why:** Mobile collectors must be authenticated so submissions are tied to known users and orgs.
  - **Unlocks:** Secure access to forms and submission APIs from the mobile app using Supabase sessions.

---

### T13 – Define Form and Submission schema + shared types

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T8, T9
- **Description:**
  - **What:** In **Supabase**, define tables for `Form` and `Submission` (including fields JSON and submission payload JSON) via SQL/migrations. Define shared TypeScript types (`FormDefinition`, `FormFieldDefinition`, `SubmissionPayload`) in a shared package.
  - **Why:** This models the dynamic form structure and stored responses in Supabase tables and keeps contracts consistent across backend, web, and mobile.
  - **Unlocks:** Implementation of APIs and UIs that consume and render arbitrary forms via the Supabase client.

---

### T14 – Implement Forms CRUD API (create, list, get, update, publish)

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T11, T13
- **Description:**
  - **What:** Create API handlers for listing forms for an org, creating/updating forms (admin-only), and toggling status (DRAFT/PUBLISHED/ARCHIVED).
  - **Why:** Organizations need to define and manage the forms collectors will use.
  - **Unlocks:** Admin UI and mobile app can fetch and present forms dynamically.

---

### T15 – Implement Submissions API (create, list, export base)

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T11, T13
- **Description:**
  - **What:** Create API handlers to accept new submissions, list submissions for a form, and provide a basic data-export endpoint skeleton.
  - **Why:** Core of the system: capturing and retrieving collected data.
  - **Unlocks:** Mobile app can submit real data; admin can view raw submissions programmatically.

---

### T16 – Admin web: Forms list page

- **Complexity:** Low
- **Priority:** P0
- **Dependencies:** T6, T14
- **Description:**
  - **What:** Implement `/forms` page showing title, status, createdAt, and submission counts, with basic filters.
  - **Why:** Admins need a central place to browse and manage forms.
  - **Unlocks:** Entry point for editing forms and viewing their data.

---

### T17 – Admin web: Manual form builder UI

- **Complexity:** High
- **Priority:** P0
- **Dependencies:** T16, T13
- **Description:**
  - **What:** Build a form builder page with field palette (text, number, date, select, file, location), field configuration (label, required, options), and live preview.
  - **Why:** Even with AI, you must support manual creation and editing of forms for reliability and fine control.
  - **Unlocks:** Admins can define arbitrary forms to collect any type of structured data.

---

### T18 – Mobile: Fetch and list available forms

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T12, T14, T7
- **Description:**
  - **What:** Implement a “Forms” screen that fetches published forms assigned/visible to the collector and lists them with status and basic metadata.
  - **Why:** Collectors need an easy way to see which forms they should fill.
  - **Unlocks:** Pathway to start filling forms on mobile.

---

### T19 – Mobile: Dynamic form renderer

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T18, T13
- **Description:**
  - **What:** Implement a generic form renderer that takes a `FormDefinition` and renders inputs for each field type with basic validation (required fields, numeric inputs, etc.).
  - **Why:** Supports arbitrary forms without hardcoding fields in the mobile app.
  - **Unlocks:** Enables collectors to fill any form that the organization defines.

---

### T20 – Mobile: Submit form responses to API

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T19, T15
- **Description:**
  - **What:** Wire the form screen to post a `SubmissionPayload` to the Submissions API, handle success/error states, and basic retry on failure.
  - **Why:** This is the main data collection flow for mobile users.
  - **Unlocks:** Actual data starts flowing from collectors to the backend.

---

### T21 – Mobile: Offline caching of forms and queued submissions

- **Complexity:** High
- **Priority:** P0
- **Dependencies:** T18, T20
- **Description:**
  - **What:** Cache forms locally (AsyncStorage) and implement a submission queue that stores unsent submissions offline and syncs them when connectivity returns.
  - **Why:** Field scenarios often have poor connectivity; offline-first behavior is critical.
  - **Unlocks:** Collectors can keep working in remote areas and trust that data will sync later.

---

### T22 – Mobile: GPS capture on submission

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T7, T20
- **Description:**
  - **What:** Use `expo-location` to request permissions and capture latitude, longitude, and accuracy at the moment of submission; attach to the submission payload.
  - **Why:** Location is key to verifying that data was collected at the correct place.
  - **Unlocks:** Enables location-based validation, auditing, and map views.

---

### T23 – Backend: Store and flag location data

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T15, T13
- **Description:**
  - **What:** Ensure submissions store location fields in **Supabase** (via the Supabase client) and implement simple flagging (e.g. poor accuracy, optional distance rules in the future) in the backend.
  - **Why:** Raw coordinates alone are less useful without basic sanity checks and flags.
  - **Unlocks:** Admins can quickly see which submissions might be suspect or need review.

---

### T24 – Admin web: Submissions table for a form

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T6, T15, T23
- **Description:**
  - **What:** Build `/forms/[id]/submissions` with a table (TanStack Table + shadcn styling) showing collector, submittedAt, and key flags, with filters (date range, collector).
  - **Why:** Admins need to browse and filter submissions at scale.
  - **Unlocks:** Day-to-day monitoring and analysis of collected data.

---

### T25 – Admin web: Submission detail view with map

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T24, T1
- **Description:**
  - **What:** Implement `/submissions/[id]` that shows all answers, metadata, and a map preview of the submission location using a maps provider.
  - **Why:** Detailed inspection helps verify specific submissions and investigate issues.
  - **Unlocks:** Fine-grained auditing and debugging of suspicious or important data points.

---

### T26 – Admin web: CSV export of submissions

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T15
- **Description:**
  - **What:** Implement an endpoint for CSV export of submissions for a given form and a UI button on the submissions table.
  - **Why:** Many organizations will want to pull data into Excel, BI tools, or custom pipelines.
  - **Unlocks:** Makes the platform interoperable with existing workflows and tools.

---

### T27 – Integrate Vercel AI SDK and LLM provider

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T1, T4
- **Description:**
  - **What:** Add Vercel AI SDK to the web app, configure it with your chosen LLM provider (e.g. OpenAI) and secure API keys via environment variables.
  - **Why:** This is the core AI integration point for both form creation and form filling.
  - **Unlocks:** Ability to call models in a consistent way from server handlers and React components.

---

### T28 – Implement Speech-to-Text endpoint (shared for web & mobile)

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T1, T4
- **Description:**
  - **What:** Implement an API route that accepts audio uploads, passes them to your STT provider (Whisper/Google), and returns transcription text.
  - **Why:** Both admin form creation and collector form filling rely on dictation.
  - **Unlocks:** Voice-first interactions on both web and mobile.

---

### T29 – Define AI schemas with Zod (FormDefinition & AnswerDraft)

- **Complexity:** Low
- **Priority:** P1
- **Dependencies:** T13, T27
- **Description:**
  - **What:** Use Zod to define schemas for AI outputs – e.g., `FormDefinition` (fields, types, required flags) and `AnswerDraft` (answers keyed by field, missing fields, follow-up questions).
  - **Why:** LLM outputs must be validated and shaped into predictable structures.
  - **Unlocks:** Reliable, typed AI responses that integrate cleanly with your form builder and renderer.

---

### T30 – AI endpoint: description → FormDefinition

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T27, T29
- **Description:**
  - **What:** Implement a route that takes a text description of a form and returns a validated `FormDefinition` using AI SDK (`generateObject` or equivalent).
  - **Why:** Enables admins to describe forms in natural language instead of building from scratch.
  - **Unlocks:** Faster form creation, especially for non-technical users or repetitive domains.

---

### T31 – Admin web: AI assistant panel for form creation

- **Complexity:** High
- **Priority:** P1
- **Dependencies:** T17, T30
- **Description:**
  - **What:** Build a side panel or modal using Vercel AI Elements hooked up to `useChat` that lets admins dictate or type descriptions and then apply/merge AI-generated form definitions into the builder.
  - **Why:** Smoothly integrates AI into the form authoring workflow with human review.
  - **Unlocks:** “Describe your form and tweak it” UX that is a key selling point for the product.

---

### T32 – AI endpoint: dictation → AnswerDraft (form filling)

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T27, T29
- **Description:**
  - **What:** Implement a route that takes transcription text + `FormDefinition` and returns `AnswerDraft` (field values, missing required fields, follow-up questions) using the AI SDK.
  - **Why:** Automatically maps spoken descriptions to form fields for collectors.
  - **Unlocks:** Voice-first data entry with automatic detection of missing information.

---

### T33 – Mobile: Voice-powered form filling integration

- **Complexity:** High
- **Priority:** P1
- **Dependencies:** T28, T32, T19
- **Description:**
  - **What:** Add a “Fill via voice” flow in the mobile form screen: record audio, send to STT, call dictation → AnswerDraft endpoint, prefill fields, and present any missing fields for manual or follow-up voice input.
  - **Why:** Makes the collector experience faster and more usable in real-world field conditions.
  - **Unlocks:** Core AI feature for collectors: hands-light, speech-driven data collection.

---

### T34 – Optional: Web collector AI flow (if web collectors exist)

- **Complexity:** Medium
- **Priority:** P2
- **Dependencies:** T31, T32
- **Description:**
  - **What:** Mirror the AI-driven filling experience on the web (for users who submit via browser) using AI Elements to manage follow-up questions and streaming.
  - **Why:** Some orgs may have collectors on laptops/tablets instead of phones.
  - **Unlocks:** Consistent AI experience across platforms (web + mobile).

---

### T35 – Security hardening & RBAC tests

- **Complexity:** Medium
- **Priority:** P0
- **Dependencies:** T11, T14, T15
- **Description:**
  - **What:** Add tests and checks for org scoping and roles on all APIs; ensure no data can be accessed cross-org; verify collectors cannot modify forms.
  - **Why:** Multi-tenant platforms must be airtight to maintain trust.
  - **Unlocks:** Confidence that you can onboard multiple organizations safely.

---

### T36 – Observability: logging and error monitoring

- **Complexity:** Medium
- **Priority:** P1
- **Dependencies:** T14, T15, T27
- **Description:**
  - **What:** Integrate a logging/monitoring stack (e.g. console structured logs + Sentry) for web, mobile, and AI endpoints; add basic metrics for AI usage and submission volume.
  - **Why:** You need visibility into failures, performance, and AI costs.
  - **Unlocks:** Faster debugging and cost control once the system hits real usage.

---

### T37 – E2E tests for core flows

- **Complexity:** High
- **Priority:** P0
- **Dependencies:** T17, T20, T24, T25
- **Description:**
  - **What:** Write end-to-end tests (e.g. Playwright / Detox / Cypress) for: admin creates form → collector submits submission (with location) → admin views submission.
  - **Why:** Ensures that top-critical paths keep working as the codebase evolves.
  - **Unlocks:** Ability to refactor and extend features without constant manual regression testing.

---

### T38 – Documentation & deployment playbook

- **Complexity:** Medium
- **Priority:** P2
- **Dependencies:** T1–T37
- **Description:**
  - **What:** Create developer docs (README, architecture overview, environment variables, how to run locally) and deployment checklists (DB migrations, env setup).
  - **Why:** New contributors and future you need clarity on how the system fits together.
  - **Unlocks:** Faster onboarding, smoother deployments, and easier hand-offs.

---

### T39 – Shared design tokens & theming alignment (web + mobile)

- **Complexity:** Medium
- **Priority:** P2
- **Dependencies:** T6, T7
- **Description:**
  - **What:** Define a shared set of design tokens (colors, radii, spacing, typography) in a shared package and wire them into Tailwind (web) and NativeWind/theme (mobile).
  - **Why:** Keeps branding and visual language consistent across platforms and simplifies future re-theming or white-labeling.
  - **Unlocks:** Easier visual refreshes, org-specific theming, and more cohesive UI/UX.

---

## Summary

- **Backend & data (T1–T9 and beyond):** **Supabase** is the chosen backend: Postgres (accessed via Supabase client; **schema/migrations via Drizzle ORM** in `apps/web`), Auth (web + mobile), and optional Storage. There is no Prisma; all data access uses the Supabase client.
- **P0 tasks** give you a fully functional, secure data-collection platform with manual form creation, mobile submission (offline + GPS), and admin dashboards.
- **P1 tasks** layer in AI (voice dictation for form creation and form filling), CSV export, and observability.
- **P2 tasks** refine the developer experience and UX (design tokens, extended AI flows, deep documentation).

You can now import these as issues into Jira/Linear/ClickUp and wire dependencies exactly as listed.

The plan is also saved as **`implementation.md`** in your project workspace, so you can download and keep it with your repo or share it with your team.
