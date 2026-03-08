import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthenticatedHome from './features/auth/AuthenticatedHome';
import LoginScreen from './features/auth/LoginScreen';
import useCollectorFormFlow from './hooks/useCollectorFormFlow';
import useCollectorForms from './hooks/useCollectorForms';
import useAuthSession from './hooks/useAuthSession';
import useDynamicFormDraft from './hooks/useDynamicFormDraft';
import useSubmissionQueueSync from './hooks/useSubmissionQueueSync';

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
  } = useCollectorFormFlow(session);
  const { queuedCount, isSyncing, flushQueue, refreshQueueCount } = useSubmissionQueueSync(session);
  const { draftAnswers, fieldErrors, setDraftValue, validate, reset } = useDynamicFormDraft(
    activeFormDefinition?.fields ?? []
  );

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
                  submitErrorMessage: submissionErrorMessage,
                  submitSuccessMessage: submissionSuccessMessage,
                  canRetry: pendingRetryPayload !== null,
                  onChangeField: setDraftValue,
                  onSubmit: handleSubmitForm,
                  onRetrySubmit: handleRetrySubmit,
                  onBack: handleBackToForms,
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
