import { Text, View } from 'react-native';

import { AppButton, Screen } from '../../components';
import { APP_TAGLINE, AUTH_COPY, OFFLINE_COPY } from '../../constants';
import DynamicFormScreen from '../forms/DynamicFormScreen';
import FormsScreen, { type FormsScreenItem } from '../forms/FormsScreen';
import type { DraftAnswers, DraftFieldErrors } from '../../lib/forms/dynamic';
import type { FormFieldDefinition } from '@sanvaadai/types';

export type AuthenticatedHomeProps = {
  email: string;
  onSignOut: () => Promise<void>;
  forms: FormsScreenItem[];
  formsLoading: boolean;
  formsErrorMessage: string | null;
  onRefreshForms: () => Promise<void>;
  queuedSubmissionCount: number;
  isSyncingQueue: boolean;
  onSyncQueue: () => Promise<void>;
  onOpenForm: (form: FormsScreenItem) => Promise<void>;
  activeForm: {
    title: string;
    description: string | null;
    fields: FormFieldDefinition[];
    draftAnswers: DraftAnswers;
    fieldErrors: DraftFieldErrors;
    isLoading: boolean;
    loadErrorMessage: string | null;
    isSubmitting: boolean;
    submitErrorMessage: string | null;
    submitSuccessMessage: string | null;
    canRetry: boolean;
    onChangeField: (fieldKey: string, value: string) => void;
    onSubmit: () => Promise<void>;
    onRetrySubmit: () => Promise<void>;
    onBack: () => void;
  } | null;
};

const AuthenticatedHome = ({
  email,
  onSignOut,
  forms,
  formsLoading,
  formsErrorMessage,
  onRefreshForms,
  queuedSubmissionCount,
  isSyncingQueue,
  onSyncQueue,
  onOpenForm,
  activeForm,
}: AuthenticatedHomeProps) => (
  <Screen className="px-6">
    <View className="w-full gap-4 py-6">
      <Text className="text-xl font-semibold text-foreground">{AUTH_COPY.welcomeTitle}</Text>
      <Text className="text-sm text-muted-foreground">{APP_TAGLINE}</Text>
      <Text className="text-sm text-foreground">{email}</Text>
      <View className="rounded-lg border border-border bg-card p-3">
        <Text className="text-sm font-medium text-foreground">
          {OFFLINE_COPY.queuedSummaryLabel}: {queuedSubmissionCount}
        </Text>
        <View className="mt-2">
          <AppButton
            size="sm"
            variant="outline"
            label={isSyncingQueue ? OFFLINE_COPY.syncingQueueLabel : OFFLINE_COPY.syncQueueLabel}
            disabled={isSyncingQueue}
            onPress={() => {
              void onSyncQueue();
            }}
          />
        </View>
      </View>
      {activeForm ? (
        activeForm.isLoading ? (
          <View className="rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-muted-foreground">Loading form details...</Text>
          </View>
        ) : activeForm.loadErrorMessage ? (
          <View className="rounded-lg border border-border bg-card p-3">
            <Text className="text-sm text-red-500">{activeForm.loadErrorMessage}</Text>
            <View className="mt-3">
              <AppButton label="Back to forms" variant="outline" onPress={activeForm.onBack} />
            </View>
          </View>
        ) : (
          <DynamicFormScreen
            title={activeForm.title}
            description={activeForm.description}
            fields={activeForm.fields}
            draftAnswers={activeForm.draftAnswers}
            fieldErrors={activeForm.fieldErrors}
            isSubmitting={activeForm.isSubmitting}
            submitErrorMessage={activeForm.submitErrorMessage}
            submitSuccessMessage={activeForm.submitSuccessMessage}
            canRetry={activeForm.canRetry}
            onBack={activeForm.onBack}
            onChangeField={activeForm.onChangeField}
            onSubmit={activeForm.onSubmit}
            onRetrySubmit={activeForm.onRetrySubmit}
          />
        )
      ) : (
        <FormsScreen
          forms={forms}
          isLoading={formsLoading}
          errorMessage={formsErrorMessage}
          onRefresh={onRefreshForms}
          onOpenForm={(form) => {
            void onOpenForm(form);
          }}
        />
      )}
      <AppButton
        accessibilityLabel="Sign out"
        label={AUTH_COPY.signOutLabel}
        variant="outline"
        onPress={onSignOut}
      />
    </View>
  </Screen>
);

export default AuthenticatedHome;
