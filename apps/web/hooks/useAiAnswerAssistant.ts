/**
 * T34 – Hook for AI answer assistant (web collector form fill).
 * Manages voice transcription, answer draft fetch, and apply to form.
 */

/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@/lib/forms/contracts';
import { useCallback, useState } from 'react';

/* ----------------- Types --------------- */
type UseAiAnswerAssistantInput = {
  fields: FormFieldDefinition[];
  onApplyAnswers: (answers: Record<string, string>) => void;
};

type UseAiAnswerAssistantReturn = {
  transcription: string;
  setTranscription: (value: string) => void;
  isTranscribing: boolean;
  isFetchingDraft: boolean;
  error: string | null;
  followUpQuestions: Array<{ fieldKey: string; question: string }>;
  transcribeFromAudio: (audioBlob: Blob) => Promise<void>;
  fetchAndApplyDraft: () => Promise<void>;
  clearError: () => void;
  clearFollowUpQuestions: () => void;
  reset: () => void;
};

/* ----------------- Constants --------------- */
const TRANSCRIBE_PATH = '/api/transcribe';
const ANSWER_DRAFT_PATH = '/api/ai/answers/draft';

/* ----------------- Helpers --------------- */
const answerDraftToDraftAnswers = (
  answers: Record<string, string | number | boolean | null | string[]>
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (value === null || value === undefined) {
      result[key] = '';
      continue;
    }
    if (typeof value === 'string') {
      result[key] = value;
      continue;
    }
    if (typeof value === 'number') {
      result[key] = String(value);
      continue;
    }
    if (typeof value === 'boolean') {
      result[key] = value ? 'true' : 'false';
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.join(', ');
      continue;
    }
    result[key] = String(value);
  }
  return result;
};

const formFieldsToDraftFields = (
  fields: FormFieldDefinition[]
): Array<{ key: string; label: string; type: FormFieldDefinition['type']; required: boolean; options?: Array<{ value: string; label: string }> }> =>
  fields.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.type === 'select' && Array.isArray(f.options) ? f.options as Array<{ value: string; label: string }> : undefined,
  }));

/* ----------------- Hook --------------- */
const useAiAnswerAssistant = ({
  fields,
  onApplyAnswers,
}: UseAiAnswerAssistantInput): UseAiAnswerAssistantReturn => {
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFetchingDraft, setIsFetchingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    Array<{ fieldKey: string; question: string }>
  >([]);

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
      setTranscription((prev) => (prev ? `${prev} ${text}` : text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const fetchAndApplyDraft = useCallback(async () => {
    const trimmed = transcription.trim();
    if (!trimmed || fields.length === 0) {
      setError('Enter or dictate content first.');
      return;
    }

    setIsFetchingDraft(true);
    setError(null);
    setFollowUpQuestions([]);

    try {
      const response = await fetch(ANSWER_DRAFT_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: trimmed,
          formDefinition: { fields: formFieldsToDraftFields(fields) },
        }),
      });

      const data = (await response.json()) as {
        answerDraft?: {
          answers: Record<string, string | number | boolean | null | string[]>;
          followUpQuestions: Array<{ fieldKey: string; question: string }>;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to generate answer draft');
      }

      if (!data.answerDraft) {
        throw new Error('No answer draft returned');
      }

      const draftAnswers = answerDraftToDraftAnswers(data.answerDraft.answers);
      onApplyAnswers(draftAnswers);

      if (data.answerDraft.followUpQuestions?.length) {
        setFollowUpQuestions(data.answerDraft.followUpQuestions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Answer draft failed');
    } finally {
      setIsFetchingDraft(false);
    }
  }, [transcription, fields, onApplyAnswers]);

  const clearError = useCallback(() => setError(null), []);
  const clearFollowUpQuestions = useCallback(() => setFollowUpQuestions([]), []);

  const reset = useCallback(() => {
    setTranscription('');
    setError(null);
    setFollowUpQuestions([]);
  }, []);

  return {
    transcription,
    setTranscription,
    isTranscribing,
    isFetchingDraft,
    error,
    followUpQuestions,
    transcribeFromAudio,
    fetchAndApplyDraft,
    clearError,
    clearFollowUpQuestions,
    reset,
  };
};

export default useAiAnswerAssistant;
