# T28 – Speech-to-Text Endpoint Checklist

**Task:** Implement an API route that accepts audio uploads, passes them to the STT provider (Whisper), and returns transcription text.

**Complexity:** Medium · **Priority:** P1 · **Dependencies:** T1, T4

---

## 1. Dependencies

- [x] Uses Vercel AI SDK `experimental_transcribe` (from T27)
- [x] Uses OpenAI Whisper via `@ai-sdk/openai` transcription model
- [x] `OPENAI_API_KEY` reused for Whisper (same as LLM)

---

## 2. API Route

- [x] `POST /api/transcribe` in `apps/web/app/api/transcribe/route.ts`
- [x] Accepts `multipart/form-data` with field `audio` (file)
- [x] Optional query/field `language` (ISO-639-1, e.g. `en`) for improved accuracy
- [x] Returns `{ text, language?, durationInSeconds?, segments? }`
- [x] Requires authentication (`withApiGuard`, `requireAuth: true`)

---

## 3. Validation

- [x] Max file size: 25MB (Whisper API limit)
- [x] Allowed MIME types: mp3, mp4, m4a, wav, webm, ogg, flac, etc. (see `lib/ai/constants.ts`)
- [x] Empty or unknown type allowed (Whisper will validate format)

---

## 4. Error Handling

- [x] 503 if `OPENAI_API_KEY` not configured
- [x] 400 for missing/invalid file, unsupported format, or file too large
- [x] 500 for transcription failures with error message

---

## 5. Shared for Web & Mobile

- [x] Same endpoint used by web admin (form creation dictation) and mobile collector (form filling dictation)
- [x] Auth via cookie (web) or `Authorization: Bearer <token>` (mobile) – both supported by `withApiGuard`

---

## 6. Usage Example

**Web (fetch):**
```ts
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('language', 'en');
const res = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData,
  credentials: 'include',
});
const { text } = await res.json();
```

**Mobile (Expo):**
```ts
const formData = new FormData();
formData.append('audio', { uri, type: 'audio/m4a', name: 'recording.m4a' } as any);
const res = await fetch(`${API_BASE}/api/transcribe`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: formData,
});
const { text } = await res.json();
```

---

## Unlocks

- Voice-first interactions on both web (T31 AI assistant) and mobile (T33 voice-powered form filling)
- Foundation for dictation flows in form creation and form filling
