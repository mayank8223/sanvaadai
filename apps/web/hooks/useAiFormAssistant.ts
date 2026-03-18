/**
 * T31 – Hook for AI form assistant panel.
 * Manages description input, voice transcription, form generation, and apply flow.
 */

/* ----------------- Globals --------------- */
import { useCallback, useState } from 'react';

import type { FormBuilderSubmitPayload } from '@/lib/forms/builder';

/* ----------------- Types --------------- */
type UseAiFormAssistantInput = {
  onApplyForm: (payload: FormBuilderSubmitPayload) => void;
};

type UseAiFormAssistantReturn = {
  description: string;
  setDescription: (value: string) => void;
  isTranscribing: boolean;
  isGenerating: boolean;
  generatedForm: FormBuilderSubmitPayload | null;
  error: string | null;
  transcribeFromAudio: (audioBlob: Blob) => Promise<void>;
  generateForm: () => Promise<void>;
  applyAndClose: () => void;
  clearError: () => void;
  reset: () => void;
};

/* ----------------- Constants --------------- */
const FORMS_GENERATE_PATH = '/api/ai/forms/generate';
const TRANSCRIBE_PATH = '/api/transcribe';

/* ----------------- Hook --------------- */
const useAiFormAssistant = ({
  onApplyForm,
}: UseAiFormAssistantInput): UseAiFormAssistantReturn => {
  const [description, setDescription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<FormBuilderSubmitPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcribeFromAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(TRANSCRIBE_PATH, {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Transcription failed');
      }

      const text = data.text ?? '';
      setDescription((prev) => (prev ? `${prev} ${text}` : text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const generateForm = useCallback(async () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setError('Enter or dictate a form description first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedForm(null);

    try {
      const response = await fetch(FORMS_GENERATE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed }),
      });

      const data = (await response.json()) as { form?: FormBuilderSubmitPayload; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Form generation failed');
      }

      if (!data.form) {
        throw new Error('No form returned');
      }

      setGeneratedForm(data.form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Form generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [description]);

  const applyAndClose = useCallback(() => {
    if (generatedForm) {
      onApplyForm(generatedForm);
      setGeneratedForm(null);
      setDescription('');
      setError(null);
    }
  }, [generatedForm, onApplyForm]);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setDescription('');
    setGeneratedForm(null);
    setError(null);
  }, []);

  return {
    description,
    setDescription,
    isTranscribing,
    isGenerating,
    generatedForm,
    error,
    transcribeFromAudio,
    generateForm,
    applyAndClose,
    clearError,
    reset,
  };
};

export default useAiFormAssistant;
