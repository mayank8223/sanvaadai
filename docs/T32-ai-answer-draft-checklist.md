# T32 – AI Endpoint: Dictation → AnswerDraft (Form Filling) Checklist

**Task:** Implement a route that takes transcription text + FormDefinition and returns AnswerDraft using the AI SDK.

**Complexity:** Medium · **Priority:** P1 · **Dependencies:** T27, T29

---

## 1. Answer draft generation logic

- [x] Added `apps/web/lib/ai/answer-draft.ts`
- [x] `generateAnswerDraftFromTranscription()` – calls LLM with transcription and form fields
- [x] Uses `generateText` + `Output.object` with `answerDraftSchema`
- [x] System prompt instructs mapping spoken content to fields, identifying missing required fields, generating follow-up questions

---

## 2. API route

- [x] `POST /api/ai/answers/draft` in `apps/web/app/api/ai/answers/draft/route.ts`
- [x] Request body: `{ transcription: string, formDefinition: { fields: [...] } }`
- [x] Each field: `key`, `label`, `type`, `required`, optional `options` (for select)
- [x] Response: `{ answerDraft: AnswerDraft }`
- [x] Auth: `withApiGuard` with `requireAuth`, `requireMembership` (no role restriction – collectors can use)
- [x] Returns 503 if `OPENAI_API_KEY` not configured
- [x] Returns 400 for invalid/missing transcription or formDefinition
- [x] Returns 500 on generation failure

---

## 3. Unit tests

- [x] Added `apps/web/lib/ai/answer-draft.test.ts`
- [x] Tests for rejection of empty transcription and empty fields

---

## Unlocks

- Voice-first data entry with automatic detection of missing information
- Foundation for T33 (mobile voice-powered form filling) and T34 (web collector AI flow)
