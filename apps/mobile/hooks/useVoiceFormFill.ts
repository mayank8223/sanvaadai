/**
 * T33 – Hook for voice-powered form filling.
 * Records audio, transcribes via STT, fetches AnswerDraft, and applies to form.
 */

/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@sanvaadai/types';
import { type Session } from '@supabase/supabase-js';
import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import { apiBaseUrl } from '../lib/api/env';
import {
  fetchAnswerDraft,
  answerDraftToDraftAnswers,
  type AnswerDraft,
} from '../lib/api/answer-draft';
import { transcribeAudio } from '../lib/api/transcribe';

/* ----------------- Types --------------- */
type UseVoiceFormFillInput = {
  session: Session | null;
  organizationId: string | null;
  fields: FormFieldDefinition[];
  onApplyAnswers: (answers: Record<string, string>) => void;
};

type UseVoiceFormFillReturn = {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  followUpQuestions: Array<{ fieldKey: string; question: string }>;
  startRecording: () => Promise<void>;
  stopRecordingAndFill: () => Promise<void>;
  clearError: () => void;
  clearFollowUpQuestions: () => void;
};

/* ----------------- Helpers --------------- */
const formFieldsToDraftFields = (
  fields: FormFieldDefinition[]
): Array<{ key: string; label: string; type: FormFieldDefinition['type']; required: boolean; options?: Array<{ value: string; label: string }> }> =>
  fields.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.type === 'select' ? f.options : undefined,
  }));

/* ----------------- Hook --------------- */
const useVoiceFormFill = ({
  session,
  organizationId,
  fields,
  onApplyAnswers,
}: UseVoiceFormFillInput): UseVoiceFormFillReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    Array<{ fieldKey: string; question: string }>
  >([]);

  const recordingRef = useRef<Audio.Recording | null>(null);

  const accessToken = session?.access_token ?? null;

  const startRecording = useCallback(async () => {
    if (!accessToken || fields.length === 0) return;

    setError(null);
    setFollowUpQuestions([]);

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission is required for voice fill.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not start recording.';
      setError(message);
    }
  }, [accessToken, fields.length]);

  const stopRecordingAndFill = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording || !accessToken || fields.length === 0) {
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          // ignore
        }
        recordingRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      await recording.stopAndUnloadAsync();
      recordingRef.current = null;

      const uri = recording.getURI();
      if (!uri) {
        setError('Recording failed. No audio file.');
        setIsProcessing(false);
        return;
      }

      const transcribeResult = await transcribeAudio({
        apiBaseUrl,
        accessToken,
        organizationId,
        audioUri: uri,
      });

      if (!transcribeResult.ok) {
        setError(transcribeResult.errorMessage);
        setIsProcessing(false);
        return;
      }

      const transcription = transcribeResult.text.trim();
      if (!transcription) {
        setError('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      const draftFields = formFieldsToDraftFields(fields);
      const draftResult = await fetchAnswerDraft({
        apiBaseUrl,
        accessToken,
        organizationId,
        transcription,
        formDefinition: { fields: draftFields },
      });

      if (!draftResult.ok) {
        setError(draftResult.errorMessage);
        setIsProcessing(false);
        return;
      }

      const answerDraft: AnswerDraft = draftResult.answerDraft;
      const draftAnswers = answerDraftToDraftAnswers(answerDraft.answers);
      onApplyAnswers(draftAnswers);

      if (answerDraft.followUpQuestions.length > 0) {
        setFollowUpQuestions(answerDraft.followUpQuestions);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Voice fill failed.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [accessToken, fields, organizationId, onApplyAnswers]);

  const clearError = useCallback(() => setError(null), []);
  const clearFollowUpQuestions = useCallback(() => setFollowUpQuestions([]), []);

  return {
    isRecording,
    isProcessing,
    error,
    followUpQuestions,
    startRecording,
    stopRecordingAndFill,
    clearError,
    clearFollowUpQuestions,
  };
};

export default useVoiceFormFill;
