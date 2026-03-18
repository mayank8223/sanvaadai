# T33 – Mobile: Voice-Powered Form Filling Checklist

**Task:** Add "Fill via voice" flow in the mobile form screen: record audio, send to STT, call dictation → AnswerDraft endpoint, prefill fields, and present missing fields for manual or follow-up voice input.

**Complexity:** High · **Priority:** P1 · **Dependencies:** T28, T32, T19

---

## 1. Mobile API clients

- [x] Added `apps/mobile/lib/api/transcribe.ts` – `transcribeAudio()` sends audio file (FormData with `{ uri, type, name }`) to `POST /api/transcribe`
- [x] Added `apps/mobile/lib/api/answer-draft.ts` – `fetchAnswerDraft()` sends transcription + form definition to `POST /api/ai/answers/draft`
- [x] `answerDraftToDraftAnswers()` – converts AI answer values to string draft format for form fields

---

## 2. Voice form fill hook

- [x] Added `apps/mobile/hooks/useVoiceFormFill.ts`
- [x] Uses `expo-av` for recording: `Audio.Recording.createAsync()`, `stopAndUnloadAsync()`, `getURI()`
- [x] Requests microphone permission via `Audio.requestPermissionsAsync()`
- [x] Flow: start recording → stop → transcribe → fetch answer draft → apply to form
- [x] Exposes: `isRecording`, `isProcessing`, `error`, `followUpQuestions`, `startRecording`, `stopRecordingAndFill`, `clearError`, `clearFollowUpQuestions`

---

## 3. Form draft integration

- [x] Extended `useDynamicFormDraft` with `applyDraftAnswers(answers: Record<string, string>)` for batch prefilling

---

## 4. Dynamic form screen UI

- [x] Added optional `voiceFill` prop to `DynamicFormScreen`
- [x] "Fill via voice" button – tap to start recording, tap again to stop and process
- [x] Shows "Recording... Tap to stop" when recording, "Processing..." when transcribing/fetching
- [x] Error display with dismiss
- [x] Follow-up questions display (from AnswerDraft) with clear

---

## 5. App integration

- [x] Wired `useVoiceFormFill` in `App.tsx` with `applyDraftAnswers` as `onApplyAnswers`
- [x] Passes `voiceFill` props to `DynamicFormScreen` via `AuthenticatedHome`
- [x] `handleVoiceFillPress` toggles start/stop based on `isRecording`

---

## 6. Permissions

- [x] iOS: `NSMicrophoneUsageDescription` in `app.json` → `infoPlist`
- [x] Android: `android.permission.RECORD_AUDIO` in `app.json` → `permissions`

---

## 7. Constants

- [x] Added `FORM_FILL_COPY.fillViaVoiceLabel`, `recordingLabel`, `processingLabel`, `voiceFillErrorTitle`

---

## Unlocks

- Core AI feature for collectors: hands-light, speech-driven data collection
- Foundation for iterative follow-up voice input (user can record again to answer follow-up questions)
