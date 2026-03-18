/**
 * T31 – Hook for recording audio in the browser.
 * Used by AI form assistant for voice dictation.
 */

/* ----------------- Globals --------------- */
import { useCallback, useRef, useState } from 'react';

/* ----------------- Types --------------- */
type UseAudioRecorderReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  clearError: () => void;
};

/* ----------------- Constants --------------- */
const AUDIO_MIME_TYPE = 'audio/webm';

/* ----------------- Hook --------------- */
const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)
        ? AUDIO_MIME_TYPE
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not access microphone';
      setError(message);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      return null;
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const chunks = chunksRef.current;
        if (chunks.length === 0) {
          resolve(null);
          return;
        }
        const blob = new Blob(chunks, { type: chunks[0].type });
        resolve(blob);
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    clearError,
  };
};

export default useAudioRecorder;
