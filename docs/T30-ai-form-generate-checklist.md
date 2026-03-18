# T30 – AI Endpoint: description → FormDefinition Checklist

**Task:** Implement a route that takes a text description of a form and returns a validated `FormDefinition` using AI SDK (`generateObject` / `Output.object`).

**Complexity:** Medium · **Priority:** P1 · **Dependencies:** T27, T29

---

## 1. Dependencies

- [x] Uses `generateText` from `ai` with `Output.object` for structured output
- [x] Uses `aiFormDefinitionDraftSchema` from T29
- [x] Uses `chatModel()` from `lib/ai/provider`

---

## 2. Form generation logic

- [x] Added `apps/web/lib/ai/form-generate.ts`
- [x] `generateFormFromDescription()` – calls LLM with system prompt and description
- [x] `aiDraftToBuilderPayload()` – converts AI draft to `FormBuilderSubmitPayload` with field IDs
- [x] System prompt instructs field types, keys, required flags, select options
- [x] Post-processing: adds IDs, normalizes select options, sanitizes via builder

---

## 3. API route

- [x] `POST /api/ai/forms/generate` in `apps/web/app/api/ai/forms/generate/route.ts`
- [x] Request body: `{ description: string }`
- [x] Response: `{ form: FormBuilderSubmitPayload }`
- [x] Auth: `withApiGuard` with `requireAuth`, `requireMembership`, `allowedRoles: ['ADMIN']`
- [x] Returns 503 if `OPENAI_API_KEY` not configured
- [x] Returns 400 for invalid/missing description
- [x] Returns 500 on generation failure

---

## 4. Unit tests

- [x] Added `apps/web/lib/ai/form-generate.test.ts`
- [x] Tests for `aiDraftToBuilderPayload` conversion (IDs, select options, defaults)

---

## Unlocks

- Admins can describe forms in natural language instead of building from scratch
- Foundation for T31 (AI assistant panel for form creation)
