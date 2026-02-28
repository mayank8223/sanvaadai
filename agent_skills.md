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

- **Last Updated:** 2026-02-28

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
  - Knowledge of chosen stack (Next.js, React Native, Supabase for DB + Auth, Prisma, Vercel AI SDK)

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

- **Last Updated:** 2026-02-28

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
