# T27 – Vercel AI SDK and LLM Provider Checklist

**Task:** Add Vercel AI SDK to the web app, configure with OpenAI, and secure API keys via environment variables.

**Complexity:** Medium · **Priority:** P1 · **Dependencies:** T1, T4

---

## 1. Dependencies

- [x] Install `ai` (Vercel AI SDK) in `apps/web`
- [x] Install `@ai-sdk/openai` (OpenAI provider) in `apps/web`

---

## 2. Environment Variables

- [x] `OPENAI_API_KEY` documented in `.env.example` (T1)
- [ ] Set `OPENAI_API_KEY` in `.env.local` for local development
- [ ] Add `OPENAI_API_KEY` to Vercel (or host) environment variables for production

---

## 3. AI Provider Configuration

- [x] Create `apps/web/lib/ai/constants.ts` with model IDs (`DEFAULT_CHAT_MODEL`, `DEFAULT_TRANSCRIPTION_MODEL`)
- [x] Create `apps/web/lib/ai/provider.ts` exporting `chatModel()`, `transcriptionModel()`, and `openai`
- [x] Provider uses `OPENAI_API_KEY` from environment (default behavior of `@ai-sdk/openai`)

---

## 4. Verification

- [x] Add `GET /api/ai/test` route that calls `generateText` with `chatModel()` (requires auth)
- [x] Route returns 503 if `OPENAI_API_KEY` is missing
- [x] Route returns `{ ok: true, message: string }` on success

---

## 5. Usage

Use the AI SDK from server handlers and React components:

```ts
import { generateText } from 'ai';
import { chatModel } from '@/lib/ai/provider';

const { text } = await generateText({
  model: chatModel(),
  prompt: 'Your prompt here',
});
```

For structured output (T29, T30, T32), use `generateObject` with Zod schemas.

---

## Unlocks

- Ability to call LLM models in a consistent way from server handlers and React components
- Foundation for T29 (AI schemas), T30 (description → FormDefinition), T31 (AI assistant panel), T32 (dictation → AnswerDraft)
