# T34 – Web Collector AI Flow Checklist

**Task:** Mirror the AI-driven filling experience on the web (for users who submit via browser) using AI Elements to manage follow-up questions and streaming.

**Complexity:** Medium · **Priority:** P2 · **Dependencies:** T31, T32

---

## 1. Collector form fill page

- [x] Added `apps/web/app/collector/forms/[id]/page.tsx` – server component
- [x] Fetches published form for collector's org, redirects if not found
- [x] Renders `CollectorFormFillClient` with form data and back link to collector home

---

## 2. Collector form fill client

- [x] Added `apps/web/app/collector/forms/[id]/collector-form-fill-client.tsx`
- [x] Dynamic form fields (text, number, date, select, file, location) with semantic icons
- [x] AI voice assistant panel: textarea for transcription, record button, Apply to form button
- [x] Uses `useAiAnswerAssistant` + `useAudioRecorder` (same as form builder AI panel)
- [x] Submit to `POST /api/submissions` with validated payload
- [x] Redirect to collector home on success

---

## 3. Form fill helpers

- [x] Added `apps/web/lib/forms/collector-fill.ts`
- [x] `buildDefaultDraftAnswers`, `validateAndBuildSubmissionAnswers`, `buildSubmissionPayload`
- [x] Mirrors mobile validation logic for all field types

---

## 4. AI answer assistant hook

- [x] Added `apps/web/hooks/useAiAnswerAssistant.ts`
- [x] `transcribeFromAudio` – POST /api/transcribe
- [x] `fetchAndApplyDraft` – POST /api/ai/answers/draft, applies answers via `onApplyAnswers`
- [x] Exposes `followUpQuestions`, `error`, `clearError`, `clearFollowUpQuestions`

---

## 5. Collector home integration

- [x] Updated collector home form list – each form links to `/collector/forms/[id]`

---

## Unlocks

- Consistent AI experience across platforms (web + mobile)
- Collectors on laptops/tablets can use voice-powered form filling
