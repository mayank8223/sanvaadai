# T29 – Define AI Schemas with Zod (FormDefinition & AnswerDraft) Checklist

**Task:** Use Zod to define schemas for AI outputs – FormDefinition draft and AnswerDraft.

**Complexity:** Low · **Priority:** P1 · **Dependencies:** T13, T27

---

## 1. FormDefinition draft schema

- [x] Added `aiFormDefinitionDraftSchema` in `apps/web/lib/ai/schemas.ts`
- [x] Schema includes `title`, `description`, `fields` (min 1)
- [x] Field schema supports all types: `text`, `number`, `date`, `select`, `file`, `location`
- [x] Type-specific fields: placeholder, min/max, options, accept, etc.
- [x] Exported types: `AiFormDefinitionDraft`, `AiFormFieldDraft`

---

## 2. AnswerDraft schema

- [x] Added `answerDraftSchema` in `apps/web/lib/ai/schemas.ts`
- [x] `answers`: Record<fieldKey, value> (string, number, boolean, null, string[])
- [x] `missingRequiredFields`: string[]
- [x] `followUpQuestions`: array of `{ fieldKey, question }`
- [x] Exported types: `AnswerDraft`, `FollowUpQuestion`

---

## 3. Unit tests

- [x] Added `apps/web/lib/ai/schemas.test.ts`
- [x] Tests for valid/invalid form draft, answer draft, follow-up question

---

## Unlocks

- Reliable, typed AI responses for form builder (T30) and form filling (T32)
- Foundation for AI assistant panel (T31) and voice-powered form filling (T33)
