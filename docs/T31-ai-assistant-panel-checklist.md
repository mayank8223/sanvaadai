# T31 – Admin Web: AI Assistant Panel for Form Creation Checklist

**Task:** Build a side panel or modal that lets admins dictate or type descriptions and apply/merge AI-generated form definitions into the builder.

**Complexity:** High · **Priority:** P1 · **Dependencies:** T17, T30

---

## 1. Form builder integration

- [x] Extended `useFormBuilder` with `applyFormDraft(payload)` to merge AI-generated form into builder state
- [x] Added "AI assistant" button in form builder header (create and edit modes)
- [x] Panel opens as slide-over from the right

---

## 2. AI assistant panel

- [x] Added `FormBuilderAiPanel` in `apps/web/components/forms/form-builder-ai-panel.tsx`
- [x] Text area for form description (type or paste)
- [x] Microphone button for voice dictation (record → transcribe via `/api/transcribe` → populate text)
- [x] "Generate form" button calls `POST /api/ai/forms/generate`
- [x] Generated form preview with field list and "Apply to builder" / "Regenerate" actions
- [x] Error display for transcription and generation failures
- [x] Close via overlay click or X button

---

## 3. Hooks

- [x] `useAiFormAssistant` – description state, transcribe, generate, apply flow
- [x] `useAudioRecorder` – browser MediaRecorder for voice capture

---

## 4. UX

- [x] Describe → Generate → Review → Apply workflow
- [x] Voice dictation appends to or populates description
- [x] Apply replaces current builder state (title, description, fields)
- [x] Accessible labels and ARIA attributes

---

## Unlocks

- "Describe your form and tweak it" UX as a key product differentiator
- Foundation for T33 (mobile voice-powered form filling) and T34 (web collector AI flow)
