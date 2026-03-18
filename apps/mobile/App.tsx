import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthenticatedHome from './features/auth/AuthenticatedHome';
import LoginScreen from './features/auth/LoginScreen';
import useCollectorFormFlow from './hooks/useCollectorFormFlow';
import useCollectorForms from './hooks/useCollectorForms';
import useAuthSession from './hooks/useAuthSession';
import useDynamicFormDraft from './hooks/useDynamicFormDraft';
import useGpsLocation from './hooks/useGpsLocation';
import useSubmissionQueueSync from './hooks/useSubmissionQueueSync';
import useVoiceFormFill from './hooks/useVoiceFormFill';

import './global.css';

const App = () => {
  const { isLoading, session, email, errorMessage, signIn, signOut } = useAuthSession();
  const {
    forms,
    isLoading: formsLoading,
    errorMessage: formsErrorMessage,
    refreshForms,
  } = useCollectorForms(session);
  const {
    permissionStatus: gpsPermissionStatus,
    isCapturing: isCapturingGps,
    lastCoordinates: lastCapturedLocation,
    requestPermission: requestGpsPermission,
    captureNow: captureGpsNow,
  } = useGpsLocation();
  const {
    hasActiveForm,
    activeFormSummary,
    activeFormDefinition,
    isLoadingFormDefinition,
    loadFormErrorMessage,
    openForm,
    closeForm,
    isSubmitting,
    submissionErrorMessage,
    submissionSuccessMessage,
    pendingRetryPayload,
    submitDraft,
    retryLastSubmit,
  } = useCollectorFormFlow(session, captureGpsNow);
  const { queuedCount, isSyncing, flushQueue, refreshQueueCount } = useSubmissionQueueSync(session);
  const { draftAnswers, fieldErrors, setDraftValue, applyDraftAnswers, validate, reset } =
    useDynamicFormDraft(activeFormDefinition?.fields ?? []);

  const voiceFormFill = useVoiceFormFill({
    session,
    organizationId: activeFormDefinition?.organization_id ?? null,
    fields: activeFormDefinition?.fields ?? [],
    onApplyAnswers: applyDraftAnswers,
  });

  const handleVoiceFillPress = async () => {
    if (voiceFormFill.isRecording) {
      await voiceFormFill.stopRecordingAndFill();
    } else {
      await voiceFormFill.startRecording();
    }
  };

  const handleOpenForm = async (form: (typeof forms)[number]) => {
    await openForm(form);
  };

  const handleBackToForms = () => {
    closeForm();
    reset();
  };

  const handleSubmitForm = async () => {
    if (!activeFormDefinition) return;
    const validationResult = validate();

    const submitted = await submitDraft({
      formId: activeFormDefinition.id,
      organizationId: activeFormDefinition.organization_id,
      answers: validationResult.answers,
      fieldErrors: validationResult.errors,
    });

    if (submitted) {
      reset();
      await refreshForms();
      await refreshQueueCount();
    }
  };

  const handleRetrySubmit = async () => {
    const submitted = await retryLastSubmit();
    if (submitted) {
      await refreshForms();
      await refreshQueueCount();
    }
  };

  return (
    <SafeAreaProvider>
      {session ? (
        <AuthenticatedHome
          email={email}
          onSignOut={signOut}
          forms={forms}
          formsLoading={formsLoading}
          formsErrorMessage={formsErrorMessage}
          onRefreshForms={refreshForms}
          queuedSubmissionCount={queuedCount}
          isSyncingQueue={isSyncing}
          onSyncQueue={flushQueue}
          onOpenForm={handleOpenForm}
          activeForm={
            hasActiveForm && activeFormSummary
              ? {
                  title: activeFormDefinition?.title ?? activeFormSummary.title,
                  description: activeFormDefinition?.description ?? activeFormSummary.description,
                  fields: activeFormDefinition?.fields ?? [],
                  draftAnswers,
                  fieldErrors,
                  isLoading: isLoadingFormDefinition,
                  loadErrorMessage: loadFormErrorMessage,
                  isSubmitting,
                  isCapturingGps,
                  gpsPermissionStatus,
                  lastCapturedLocation,
                  submitErrorMessage: submissionErrorMessage,
                  submitSuccessMessage: submissionSuccessMessage,
                  canRetry: pendingRetryPayload !== null,
                  voiceFill: {
                    isRecording: voiceFormFill.isRecording,
                    isProcessing: voiceFormFill.isProcessing,
                    error: voiceFormFill.error,
                    followUpQuestions: voiceFormFill.followUpQuestions,
                    onVoiceFillPress: handleVoiceFillPress,
                    onClearVoiceError: voiceFormFill.clearError,
                    onClearFollowUpQuestions: voiceFormFill.clearFollowUpQuestions,
                  },
                  onChangeField: setDraftValue,
                  onSubmit: handleSubmitForm,
                  onRetrySubmit: handleRetrySubmit,
                  onBack: handleBackToForms,
                  onRequestGpsPermission: async () => {
                    await requestGpsPermission();
                  },
                }
              : null
          }
        />
      ) : (
        <LoginScreen isLoading={isLoading} errorMessage={errorMessage} onSubmit={signIn} />
      )}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default App;
