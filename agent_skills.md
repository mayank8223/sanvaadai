# Agent Skill Registry – AI-Enabled Data Collection Platform

This file defines the **skills** that an AI agent should have to support this project and a process for **continuously improving** those skills over time.

The intent is:

- To give the agent a clear “capability map” for this product.
- To provide a structured place to record learnings and refinements.
- After each job/session, to **verify** which skills were used, how they performed, and update the notes.

---

## 1. Skill Schema

Each skill should be documented using this structure:

- **ID:** Short identifier, e.g. `SK_FORM_DESIGN`
- **Name:** Human-friendly skill name
- **Category:** e.g. `product`, `backend`, `web-ui`, `mobile`, `ai-workflow`, `ops`
- **Description:** What this skill does in the context of this project
- **Inputs:** Typical inputs the agent expects
- **Outputs:** Typical outputs the agent produces
- **Tools / Context:** External tools, code, or documents used
- **Quality Criteria:** How we judge if the skill was applied well
- **Failure Patterns:** Common mistakes / what to avoid
- **Improvement Notes:** Space to append new insights over time
- **Last Updated:** Date of last meaningful update

When you (or an automated process) revise a skill, update **Improvement Notes** and **Last Updated**.

---

## 2. Core Skills

### SK_FORM_DESIGN – Dynamic Form Design & Validation

- **ID:** SK_FORM_DESIGN
- **Category:** product, backend, web-ui
- **Description:**  
  Ability to design and reason about dynamic forms for organizations: choosing appropriate field types, structuring `FormDefinition`, enforcing required fields, and ensuring forms support the use cases (e.g. school meal verification, evidence capture, GPS).

- **Inputs:**
  - Natural language description of a data collection need
  - Existing `FormDefinition` JSON
  - Constraints (required fields, offline usage, validation rules)

- **Outputs:**
  - Updated `FormDefinition` including fields, types, and validation flags
  - Explanations of design decisions (why each field/type was chosen)
  - Suggestions for improvements (e.g. “add location field”, “split this text into two fields”)

- **Tools / Context:**
  - `implementation.md` (for constraints and data model)
  - TypeScript type definitions (`FormDefinition`, `FormFieldDefinition`)
  - Prisma schema for `Form` (tables in Supabase Postgres)

- **Quality Criteria:**
  - Fields cover all necessary information but avoid redundancy
  - Field types match the data (date, number, options, file, location, etc.)
  - Clear labels and `key` values (machine-friendly, no spaces)
  - Required fields correctly identified (e.g., location, date, school)

- **Failure Patterns:**
  - Overcomplicating forms with unnecessary fields
  - Mis-typing fields (e.g. using `text` where `number` is needed)
  - Ignoring validation constraints from the data model

- **Improvement Notes:**
  - (2026-02-28) Initial definition created. Future sessions should add concrete examples of good/bad form designs from real use cases.
  - (2026-03-04) UI refinement guideline: when rendering dynamic form field types in admin/collector interfaces, always map each type to a semantic icon (e.g., Lucide `Type`, `Hash`, `CalendarDays`, `ListChecks`, `Paperclip`, `MapPin`) to improve scanability and reduce configuration mistakes.

- **Last Updated:** 2026-03-04

---

### SK_AI_FORM_GEN – AI-Driven Form Generation from Description

- **ID:** SK_AI_FORM_GEN
- **Category:** ai-workflow, product
- **Description:**  
  Ability to transform a natural language or voice-transcribed description of a form into a structured `FormDefinition` using an LLM (via Vercel AI SDK), with validation and human-review steps.

- **Inputs:**
  - Text description of the desired form (possibly from STT)
  - Domain context (education, health, surveys, etc.)
  - Existing `FormDefinition` (for incremental edits)

- **Outputs:**
  - Draft `FormDefinition` that matches the description
  - List of assumptions made (e.g. “I assumed school_code is required”)
  - Suggestions for admins to review or edit

- **Tools / Context:**
  - Vercel AI SDK (`generateObject` with Zod schema)
  - STT transcription from voice input
  - `implementation.md` for allowed field types and structure

- **Quality Criteria:**
  - JSON is valid against Zod schema
  - Generated fields align closely with the description
  - Minimal hallucinations; assumptions clearly labeled
  - Easy for admins to tweak rather than rewrite from scratch

- **Failure Patterns:**
  - Overly generic forms that ignore specifics in the description
  - Hallucinating fields not mentioned anywhere
  - Producing invalid JSON or mismatched types

- **Improvement Notes:**
  - (2026-02-28) Consider capturing real admin descriptions and iteratively refining prompt templates and examples in code.
- **Last Updated:** 2026-02-28

---

### SK_AI_ANSWER_DRAFT – AI Mapping of Dictation to Form Answers

- **ID:** SK_AI_ANSWER_DRAFT
- **Category:** ai-workflow, mobile
- **Description:**  
  Ability to take free-form text (from voice dictation) and map it into an `AnswerDraft` for a known `FormDefinition`, including detected answers, missing required fields, and follow-up questions.

- **Inputs:**
  - STT text from collector dictation
  - `FormDefinition` (including field keys, labels, types, required flags)

- **Outputs:**
  - `AnswerDraft` object:
    - `answers: Record<fieldKey, value>`
    - `missingRequiredFields: string[]`
    - `followUpQuestions: { fieldKey; question }[]`

- **Tools / Context:**
  - Vercel AI SDK (LLM calls)
  - Zod schema for `AnswerDraft`
  - Domain-specific examples (e.g. student meal counts, school info)

- **Quality Criteria:**
  - Majority of clear information from dictation is correctly mapped
  - All required fields that are missing are correctly identified
  - Follow-up questions are specific and easy to answer
  - No fabrication of data that wasn’t in the dictation

- **Failure Patterns:**
  - Misassigning values to wrong fields (e.g. swapping counts)
  - Missing obvious fields mentioned in dictation
  - Generating vague or redundant follow-up questions

- **Improvement Notes:**
  - (2026-02-28) As usage grows, collect ambiguous dictations and add “few-shot” examples for better disambiguation.

- **Last Updated:** 2026-02-28

---

### SK_MOBILE_FLOW – Mobile Collector Flow Design

- **ID:** SK_MOBILE_FLOW
- **Category:** mobile, product
- **Description:**  
  Ability to reason about and design the full collector journey on mobile: login, viewing forms, offline caching, form filling, media capture, AI voice flows, and submission sync.

- **Inputs:**
  - User stories for collectors
  - Constraints (offline-first, low bandwidth, simple UX)
  - `FormDefinition` and submission API contracts

- **Outputs:**
  - Screen flow diagrams / descriptions
  - Recommendations for component structure and navigation
  - Edge-case handling (no network, permission denied, conflicts)

- **Tools / Context:**
  - React Native (Expo) architecture
  - Submission queue design in AsyncStorage
  - Mobile platform best practices

- **Quality Criteria:**
  - Minimal friction for collectors to submit valid data
  - Clear feedback on sync status and errors
  - Robust behavior under poor connectivity

- **Failure Patterns:**
  - Overcomplicated navigation or deep nesting
  - Lack of clarity around sync errors
  - Under-specifying offline behavior

- **Improvement Notes:**
  - (2026-02-28) In future, add concrete patterns for “sync now” controls and conflict resolution UX.

- **Last Updated:** 2026-02-28

---

### SK_LOCATION_VALIDATION – Location Capture & Validation Reasoning

- **ID:** SK_LOCATION_VALIDATION
- **Category:** backend, product
- **Description:**  
  Ability to design and reason about location capture (GPS) and simple validation rules to flag suspicious submissions, while acknowledging limits of GPS accuracy and spoofing.

- **Inputs:**
  - Submission payloads with `latitude`, `longitude`, `accuracy`
  - Optional “trusted location” data (e.g. school coordinates)
  - Product requirements for flagging suspicious data

- **Outputs:**
  - Rules/logic for flagging (e.g., accuracy thresholds, distance thresholds)
  - Recommendations for storing and exposing flags in the UI
  - Documentation of trade-offs and limitations

- **Tools / Context:**
  - Prisma schema for `Submission` and `flags` JSON (Supabase Postgres)
  - Mapping APIs for visual checks
  - Geo-distance helpers

- **Quality Criteria:**
  - Rules are simple, explainable, and adjustable
  - Flags help admins triage potential issues without overwhelming noise
  - No claims of “perfect” anti-fraud – just realistic checks

- **Failure Patterns:**
  - Overly strict rules that flag most legitimate submissions
  - Overpromising on anti-spoofing capabilities
  - Forgetting to store enough metadata for later analysis

- **Improvement Notes:**
  - (2026-02-28) Later iterations may include device integrity signals or past-location pattern checks.

- **Last Updated:** 2026-02-28

---

### SK_IMPL_PLANNING – Implementation Planning & Task Breakdown

- **ID:** SK_IMPL_PLANNING
- **Category:** ops, product, engineering
- **Description:**  
  Ability to convert product requirements into detailed implementation plans, task breakdowns, priorities, and dependencies (as in `implementation.md`).

- **Inputs:**
  - High-level product description and constraints
  - Tech stack decisions
  - Existing system architecture and gaps

- **Outputs:**
  - Structured task list with complexity, priority, dependencies
  - Milestone/sprint suggestions
  - Clear explanations of “what, why, unlocks” per task

- **Tools / Context:**
  - `implementation.md`
  - Knowledge of chosen stack (Next.js, React Native, Supabase for DB + Auth; **no Prisma**; Vercel AI SDK)

- **Quality Criteria:**
  - Tasks are independent and implementable by a developer
  - Correct ordering via dependencies
  - Coverage of backend, web, mobile, AI, and infra

- **Failure Patterns:**
  - Tasks too vague to execute
  - Missing critical dependencies
  - Overly optimistic or unrealistic scope

- **Improvement Notes:**
  - (2026-02-28) Future sessions should attach estimates and owner roles for each task if needed for team planning.
  - (2026-02-28) **T4 completed:** Next.js app in `apps/web` initialized as admin & API host. App Router, TypeScript, `lib/constants.ts` for app name/metadata. Home page branded as Sanvaadai Admin with link to `/api/health`. Skeleton `GET /api/health` returns `{ ok: true }`. `next.config.ts` uses `output: 'standalone'` for Docker/non-Vercel hosting; Vercel ignores it and uses default. See `docs/T4-nextjs-checklist.md`.
  - (2026-02-28) **T5 completed:** Expo collector app in `apps/mobile` initialized. TypeScript with strict mode, `constants.ts` for APP_NAME/APP_TAGLINE, App.tsx placeholder branded as Sanvaadai Collector. app.json has name, slug, scheme, bundle IDs. See `docs/T5-expo-checklist.md`.
  - (2026-02-28) **T6 completed:** Tailwind v4 already present; added shadcn/ui (new-york, neutral) and Lucide to web app. `components.json`, `lib/utils.ts`, and base components: Button, Input, Card under `components/ui/`. Theme variables (OKLCH) in `app/globals.css` with `@theme inline`. Home page demonstrates Button, Input, Card and Lucide icons. See `docs/T6-tailwind-shadcn-checklist.md`.
  - (2026-02-28) **T7 completed:** NativeWind added to Expo app: tailwind.config.js (preset + theme colors), global.css, babel + metro config, nativewind-env.d.ts. Base components: AppButton, AppInput, Screen, Icon (wrapper for Lucide RN) in `components/`. App.tsx uses SafeAreaProvider, Screen, and new components. See `docs/T7-nativewind-mobile-checklist.md`.
  - (2026-02-28) **T3 completed:** TypeScript strict mode hardened in `packages/tsconfig/base.json` (noFallthroughCasesInSwitch, forceConsistentCasingInFileNames). Prettier at root with `.prettierrc` and `.prettierignore`; root scripts `format` and `format:check`. ESLint in web extended with `eslint-config-prettier`. Typecheck task added to Turbo; `typecheck` scripts in apps/web, apps/mobile, packages/types. GitHub Actions workflow `.github/workflows/lint.yml` runs lint, typecheck, and format:check on push/PR to main or master. See `docs/T3-tooling-checklist.md`.
  - (2026-02-28) **T2 completed:** Monorepo created with Turborepo. Structure: `apps/web` (Next.js, moved from root), `apps/mobile` (Expo blank TypeScript), `packages/tsconfig` (base + nextjs shared configs), `packages/types` (shared types; placeholder until T13). Root has workspaces, turbo.json, and high-level scripts. Expo app was created manually (create-expo-app failed in sandbox); use Expo SDK 52 and React 19 for alignment with web. After creating workspaces, run `bun install` (or npm/pnpm) from root; if install fails (e.g. tarball errors), suggest user retry or use npm.
  - (2026-02-28) **T1 completed:** T1 is non-code; output is `docs/T1-infrastructure-checklist.md` (provisioning checklist with env var names) and `.env.example` (contract for later tasks). **This project uses Supabase for database (tables), auth, and optional storage.** Agent should not write code for “provisioning” – only docs and env placeholders. Actual account/project creation is done by the user in cloud consoles. Later tasks (T4, T8, T10, T12, T27, T28) consume these env vars.
  - (2026-02-28) **T8 completed (Supabase, no Prisma):** Prisma removed; web app uses Supabase only. Installed `@supabase/supabase-js` and `@supabase/ssr` in `apps/web`. Added `lib/supabase/client.ts` (createBrowserClient) and `lib/supabase/server.ts` (createServerClient with cookies) using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Schema/migrations are done in Supabase Dashboard or Supabase CLI, not Prisma. See `docs/T8-supabase-checklist.md`.
  - (2026-02-28) **T9 completed:** User, Organization, and Membership schema in Supabase. Migrations in `supabase/migrations/`: enum `membership_role` (ADMIN, COLLECTOR), tables `organizations`, `users` (FK to auth.users), `memberships` with RLS. Trigger `handle_auth_user_sync` syncs auth.users → public.users on insert/update. Shared types in `packages/types` (User, Organization, Membership, MembershipRole, etc.). See `docs/T9-schema-checklist.md`.
  - (2026-02-28) **T10 completed:** Supabase Auth integrated in web app. Auth callback at `/auth/callback` (code exchange); login page at `/login` (email/password); **sign-up page at `/signup`** so new admins can create an account (email confirmation handled via callback); logout via client `signOut` + redirect. Server helpers `getCurrentUser()` and `getSession()` in `lib/auth/server.ts`. Current user exposed on home page and via GET `/api/me`. **T10a (P1)** added in implementation.md: Login via Google and other OAuth providers. See `docs/T10-auth-checklist.md`.
  - (2026-02-28) **T10a completed:** OAuth sign-in (Google, GitHub) added to web app. `lib/auth/constants.ts` defines `AUTH_CALLBACK_PATH` and `OAUTH_PROVIDERS`. Login page has “Or continue with” divider and “Sign in with Google” / “Sign in with GitHub” buttons using `signInWithOAuth` with `redirectTo` to existing `/auth/callback` (preserves `next`). Dashboard setup (redirect URLs, enable providers) is manual. See `docs/T10a-oauth-checklist.md`.
  - (2026-03-04) **T11 completed:** Added reusable org/role guard layer for Next.js route handlers in `apps/web/lib/auth/guards.ts` + organization context resolver in `apps/web/lib/auth/organization.ts` (org resolution precedence: query/header/cookie/fallback membership). `/api/me` now uses `withApiGuard` and returns resolved membership context. Middleware auth flow hardened in `apps/web/lib/supabase/proxy.ts` to allow public `/api/health` and preserve `next` on login redirects. Added unit tests in `apps/web/lib/auth/organization.test.ts`. See `docs/T11-org-role-guards-checklist.md`.
  - (2026-03-04) **T11a completed:** Added org/team management flows in `apps/web/app/api/organizations/*` and admin UI pages at `/onboarding/organization` + `/settings/team`. APIs now support organization creation, memberships listing, org switching via `svd_org_id` cookie, admin member management (add/update/remove), and pending-invite responses for unknown emails (Option A). Added reusable parsers/policies in `apps/web/lib/organizations/*` with unit tests. Added multi-org switcher component in header contexts. See `docs/T11a-org-team-management-checklist.md`.
  - (2026-03-04) **T12 completed:** Mobile collector auth flow implemented in `apps/mobile` using Supabase Auth + Expo SecureStore-backed session persistence. Added reusable auth/session hook (`hooks/useAuthSession.ts`), login form hook (`hooks/useLoginForm.ts`), presentational screens (`features/auth/LoginScreen.tsx`, `features/auth/AuthenticatedHome.tsx`), and Supabase client/env modules (`lib/supabase/*`). Added auth error mapping unit tests in `lib/auth/errors.test.ts`. See `docs/T12-mobile-auth-checklist.md`.
  - (2026-03-04) **T13 completed:** Added form/submission schema via Drizzle in `apps/web/db/schema.ts` with enum `form_status`, tables `forms` and `submissions`, JSONB fields (`forms.fields`, `submissions.payload`, `submissions.metadata`), and supporting indexes/FKs. Generated migration `apps/web/drizzle/0001_first_golden_guardian.sql`. Added shared contracts in `packages/types/src/forms-submissions.ts` (`FormDefinition`, `FormFieldDefinition`, `SubmissionPayload`, `SubmissionRecord`, field/status constants) and exported from `packages/types/src/index.ts`. See `docs/T13-form-submission-schema-checklist.md`.
  - (2026-03-04) **T14 completed:** Implemented Forms CRUD API routes in `apps/web/app/api/forms/*` with org scoping via `withApiGuard`: list/create, get/update, and status transitions (`/status`). Admin-only mutation routes enforced with `allowedRoles: ['ADMIN']`; collector access is restricted to published forms. Added reusable request validators in `apps/web/lib/forms/contracts.ts` and unit tests in `apps/web/lib/forms/contracts.test.ts`. See `docs/T14-forms-crud-api-checklist.md`.
  - (2026-03-04) **T15 completed:** Implemented Submissions API in `apps/web/app/api/submissions/*`: create submission (`POST /api/submissions`), list submissions with filters + pagination (`GET /api/submissions`, admin-only), and export skeleton (`GET /api/submissions/export`, admin-only) for T26 follow-up. Added request/query parsers in `apps/web/lib/submissions/contracts.ts` and unit tests in `apps/web/lib/submissions/contracts.test.ts`. See `docs/T15-submissions-api-checklist.md`.
  - (2026-03-04) **T16 completed:** Added admin forms list page at `apps/web/app/forms/page.tsx` with org-scoped server rendering, status filter (`ALL`, `DRAFT`, `PUBLISHED`, `ARCHIVED`), submission counts, and access gating (login redirect, membership/admin checks). Added reusable listing helpers in `apps/web/lib/forms/listing.ts` with tests in `apps/web/lib/forms/listing.test.ts`. Linked dashboard home to `/forms`. See `docs/T16-forms-list-page-checklist.md`.
  - (2026-03-04) **T17 completed:** Added manual form builder flow for admins with create/edit pages (`/forms/new`, `/forms/[id]/edit`), field palette (`text`, `number`, `date`, `select`, `file`, `location`), field-level configuration, and live preview in `apps/web/components/forms/form-builder-screen.tsx`. Added reusable builder SDK utilities in `apps/web/lib/forms/builder.ts` and state orchestration hook in `apps/web/hooks/useFormBuilder.ts`; extended forms list page with create/edit actions. Added unit tests in `apps/web/lib/forms/builder.test.ts`. See `docs/T17-form-builder-checklist.md`.
  - (2026-03-04) **T18 completed:** Implemented collector forms listing on mobile with Supabase-backed fetch flow in `apps/mobile/hooks/useCollectorForms.ts` (membership-aware published form fetch), new UI screen `apps/mobile/features/forms/FormsScreen.tsx`, and authenticated integration via `apps/mobile/App.tsx` + `apps/mobile/features/auth/AuthenticatedHome.tsx`. Added metadata helpers/tests in `apps/mobile/lib/forms/helpers.ts` and `apps/mobile/lib/forms/helpers.test.ts`. See `docs/T18-mobile-forms-list-checklist.md`.
  - (2026-03-05) **T16a/T16b/T16c/T16d completed:** Added reusable authenticated web shell in `apps/web/components/layout/authenticated-shell.tsx` with org badge/switcher, role badge, auth actions, and footer links. Added auth-page UX guards for signed-in users on `/login` and `/signup` via server-side session checks (`apps/web/app/login/page.tsx`, `apps/web/app/signup/page.tsx`). Reworked `/` into server-driven role router with explicit no-membership and invalid-org states (`apps/web/app/page.tsx`, `apps/web/lib/auth/home-routing.ts`, `apps/web/lib/auth/shell.ts`) and added dedicated role homes (`/home/admin`, `/home/collector`). Added unit tests for route decisions and auth redirects in `apps/web/lib/auth/home-routing.test.ts` and `apps/web/lib/auth/auth-routes.test.ts`. See `docs/T16a-app-shell-and-role-home-checklist.md`.
  - (2026-03-07) **T19 completed:** Added mobile dynamic form renderer with API-loaded `FormDefinition`, reusable draft/validation helpers, and typed field rendering for `text`, `number`, `date`, `select`, `file`, and `location`. Added `useCollectorFormFlow` + `useDynamicFormDraft`, integrated in authenticated mobile home, and added helper tests in `apps/mobile/lib/forms/dynamic.test.ts`. See `docs/T19-mobile-dynamic-form-renderer-checklist.md`.
  - (2026-03-07) **T20 completed:** Wired mobile form submit flow to `POST /api/submissions` with success/error handling and retry of last failed payload. Added mobile API env + clients, payload builder integration, and bearer-token auth resolution in web API guards so mobile can call protected endpoints with `Authorization` header and `x-organization-id`. See `docs/T20-mobile-submit-responses-checklist.md`.
  - (2026-03-07) **T21 completed:** Added offline-first mobile behavior with local forms cache (AsyncStorage), persisted submission queue, and auto-sync on reconnect/interval using NetInfo. Updated collector flows to use cached forms when network fetch fails and enqueue retryable submission failures for later sync; added queue sync UI and offline tests in `apps/mobile/lib/offline/*.test.ts`. See `docs/T21-mobile-offline-caching-and-queue-checklist.md`.
  - (2026-03-08) **T22 completed:** Mobile GPS capture on submission using expo-location. See `docs/T22-mobile-gps-capture-checklist.md`.
  - (2026-03-08) **T23 completed:** Backend stores location in submission payload and computes flags (location_missing, location_poor_accuracy, location_accuracy_unknown) in metadata. Added `lib/submissions/location-flags.ts` and extended contracts. See `docs/T23-location-store-flag-checklist.md`.
  - (2026-03-08) **T24 completed:** Admin submissions table at `/forms/[id]/submissions` with TanStack Table, collector/date filters, pagination, and flag badges. See `docs/T24-submissions-table-checklist.md`.
  - (2026-03-08) **T25 completed:** Admin submission detail view at `/submissions/[id]` with answers, metadata, and map preview (Google Maps or Mapbox static map; fallback to coordinates link). Added GET `/api/submissions/[id]`, `SubmissionDetailClient`, `SubmissionMapPreview`, and `lib/maps/constants.ts`. See `docs/T25-submission-detail-checklist.md`.
  - (2026-03-08) **T26 completed:** CSV export of submissions via `/api/submissions/export?formId=X&format=csv`, `buildSubmissionsCsv` helper, and Export CSV button on submissions page. See `docs/T26-csv-export-checklist.md`.

- **Last Updated:** 2026-03-08

---

## 3. Update Process (Self-Improvement Loop)

At the **end of each significant job/session** where the agent works on this project:

1. **Identify used skills**
   - List which skills were applied (e.g. `SK_AI_FORM_GEN`, `SK_FORM_DESIGN`).

2. **Evaluate performance**
   - For each skill, quickly rate: _worked well_, _minor issues_, or _needs correction_
   - Note any mistakes, confusion, or user feedback.

3. **Update Improvement Notes**
   - Append a dated bullet under **Improvement Notes** describing:
     - The scenario (short description)
     - What went wrong/right
     - What to do differently next time (prompt tweaks, additional constraints, etc.)

4. **Adjust schemas / prompts if needed**
   - If a skill is repeatedly failing in a specific pattern, update:
     - Its description / failure patterns
     - Related schemas or prompt templates in code (not stored in this file, but referenced).

5. **Update Last Updated**
   - Change the **Last Updated** date when a skill meaningfully changes.

This file is meant to be **append-only in spirit**: you don’t erase history, you layer learnings on top so future work can see how the skill evolved.

---

## 4. Future Skills to Define

As the product grows, you can add more skills, for example:

- `SK_ANOMALY_DETECTION` – spotting suspicious patterns across submissions.
- `SK_REPORT_SUMMARY` – generating human-readable summaries of collected data per school/region.
- `SK_MULTILINGUAL_SUPPORT` – handling dictation and forms in multiple languages.
- `SK_OCR_EXTRACTION` – extracting structured data from images (attendance registers, receipts, etc.).

When adding a new skill, copy the **Skill Schema** from Section 1 and fill it in.
