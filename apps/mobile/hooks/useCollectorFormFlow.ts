/* ----------------- Globals --------------- */
import type { GpsCoordinates, FormDefinition, SubmissionPayload } from '@sanvaadai/types';
import { type Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { useCallback, useMemo, useState } from 'react';

import { type CollectorFormListItem } from './useCollectorForms';
import { OFFLINE_COPY } from '../constants';
import { apiBaseUrl } from '../lib/api/env';
import { fetchFormDefinition } from '../lib/api/forms';
import { createSubmission } from '../lib/api/submissions';
import { buildSubmissionPayload, type DraftFieldErrors } from '../lib/forms/dynamic';
import { type GpsCaptureResult } from '../lib/location/gps';
import { enqueueSubmission } from '../lib/offline/submission-queue';

/* ----------------- Types --------------- */
type CaptureGpsFn = () => Promise<GpsCaptureResult>;

/* ----------------- Constants --------------- */
const DEFAULT_SUBMISSION_ERROR = 'Unable to submit. Please retry.';

/* ----------------- Hooks --------------- */
const useCollectorFormFlow = (session: Session | null, captureGps?: CaptureGpsFn) => {
  const [activeFormSummary, setActiveFormSummary] = useState<CollectorFormListItem | null>(null);
  const [activeFormDefinition, setActiveFormDefinition] = useState<FormDefinition | null>(null);
  const [isLoadingFormDefinition, setIsLoadingFormDefinition] = useState<boolean>(false);
  const [loadFormErrorMessage, setLoadFormErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [lastCapturedLocation, setLastCapturedLocation] = useState<GpsCoordinates | null>(null);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);
  const [submissionSuccessMessage, setSubmissionSuccessMessage] = useState<string | null>(null);
  const [pendingRetryPayload, setPendingRetryPayload] = useState<SubmissionPayload | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [lastQueuedSubmissionId, setLastQueuedSubmissionId] = useState<string | null>(null);

  const accessToken = session?.access_token ?? null;

  const openForm = useCallback(
    async (form: CollectorFormListItem) => {
      if (!accessToken) return;

      setActiveFormSummary(form);
      setIsLoadingFormDefinition(true);
      setLoadFormErrorMessage(null);
      setActiveFormDefinition(null);
      setSubmissionErrorMessage(null);
      setSubmissionSuccessMessage(null);
      setPendingRetryPayload(null);
      setLastSubmissionId(null);

      const response = await fetchFormDefinition({
        apiBaseUrl,
        accessToken,
        formId: form.id,
        organizationId: form.organization_id,
      });

      if (!response.ok) {
        setLoadFormErrorMessage(response.errorMessage);
        setIsLoadingFormDefinition(false);
        return;
      }

      setActiveFormDefinition(response.form);
      setIsLoadingFormDefinition(false);
    },
    [accessToken]
  );

  const closeForm = useCallback(() => {
    setActiveFormSummary(null);
    setActiveFormDefinition(null);
    setIsLoadingFormDefinition(false);
    setLoadFormErrorMessage(null);
    setSubmissionErrorMessage(null);
    setSubmissionSuccessMessage(null);
    setPendingRetryPayload(null);
    setLastSubmissionId(null);
    setLastCapturedLocation(null);
  }, []);

  const submitPayload = useCallback(
    async (payload: SubmissionPayload, organizationId: string) => {
      if (!accessToken) {
        setSubmissionErrorMessage('Session expired. Please sign in again.');
        setPendingRetryPayload(payload);
        return false;
      }

      setIsSubmitting(true);
      setSubmissionErrorMessage(null);
      setSubmissionSuccessMessage(null);

      const response = await createSubmission({
        apiBaseUrl,
        accessToken,
        organizationId,
        payload,
      });

      setIsSubmitting(false);

      if (!response.ok) {
        const isRetryableFailure =
          response.statusCode === null ||
          response.statusCode >= 500 ||
          response.statusCode === 408 ||
          response.statusCode === 429;

        if (isRetryableFailure) {
          const queueItems = await enqueueSubmission({
            organizationId,
            payload,
          });

          setSubmissionErrorMessage(OFFLINE_COPY.queuedSubmissionLabel);
          setLastQueuedSubmissionId(queueItems[queueItems.length - 1]?.id ?? null);
          setPendingRetryPayload(null);
          return true;
        }

        setSubmissionErrorMessage(response.errorMessage || DEFAULT_SUBMISSION_ERROR);
        setPendingRetryPayload(payload);
        return false;
      }

      setSubmissionSuccessMessage('Submission saved successfully.');
      setPendingRetryPayload(null);
      setLastSubmissionId(response.submissionId);
      setLastQueuedSubmissionId(null);
      return true;
    },
    [accessToken]
  );

  const submitDraft = useCallback(
    async (params: {
      formId: string;
      organizationId: string;
      answers: SubmissionPayload['answers'];
      fieldErrors: DraftFieldErrors;
    }): Promise<boolean> => {
      if (Object.keys(params.fieldErrors).length > 0) {
        setSubmissionErrorMessage('Please fix the highlighted fields before submitting.');
        return false;
      }

      let capturedLocation: GpsCoordinates | null = null;

      if (captureGps) {
        setIsCapturingGps(true);
        const gpsResult = await captureGps();
        setIsCapturingGps(false);

        if (gpsResult.ok) {
          capturedLocation = gpsResult.coordinates;
          setLastCapturedLocation(capturedLocation);
        }
      }

      const payload = buildSubmissionPayload(params.formId, params.answers, Platform.OS, capturedLocation);
      return submitPayload(payload, params.organizationId);
    },
    [captureGps, submitPayload]
  );

  const retryLastSubmit = useCallback(async (): Promise<boolean> => {
    if (!pendingRetryPayload || !activeFormSummary?.organization_id) {
      return false;
    }

    return submitPayload(pendingRetryPayload, activeFormSummary.organization_id);
  }, [activeFormSummary?.organization_id, pendingRetryPayload, submitPayload]);

  const hasActiveForm = useMemo<boolean>(
    () => activeFormSummary !== null || isLoadingFormDefinition,
    [activeFormSummary, isLoadingFormDefinition]
  );

  return {
    hasActiveForm,
    activeFormSummary,
    activeFormDefinition,
    isLoadingFormDefinition,
    loadFormErrorMessage,
    openForm,
    closeForm,
    isSubmitting,
    isCapturingGps,
    lastCapturedLocation,
    submissionErrorMessage,
    submissionSuccessMessage,
    pendingRetryPayload,
    lastSubmissionId,
    lastQueuedSubmissionId,
    submitDraft,
    retryLastSubmit,
  };
};

export default useCollectorFormFlow;
