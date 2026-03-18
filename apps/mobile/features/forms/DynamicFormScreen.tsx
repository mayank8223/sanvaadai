/* ----------------- Globals --------------- */
import type { FormFieldDefinition, GpsCoordinates } from '@sanvaadai/types';
import { ScrollView, Text, View } from 'react-native';

import { AppButton, AppInput } from '../../components';
import { FORM_FILL_COPY, GPS_COPY } from '../../constants';
import type { GpsPermissionStatus } from '../../lib/location/gps';
import type { DraftAnswers, DraftFieldErrors } from '../../lib/forms/dynamic';

/* ----------------- Types --------------- */
type VoiceFillProps = {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  followUpQuestions: Array<{ fieldKey: string; question: string }>;
  onVoiceFillPress: () => void;
  onClearVoiceError: () => void;
  onClearFollowUpQuestions: () => void;
};

type DynamicFormScreenProps = {
  title: string;
  description: string | null;
  fields: FormFieldDefinition[];
  draftAnswers: DraftAnswers;
  fieldErrors: DraftFieldErrors;
  isSubmitting: boolean;
  isCapturingGps: boolean;
  gpsPermissionStatus: GpsPermissionStatus;
  lastCapturedLocation: GpsCoordinates | null;
  submitErrorMessage: string | null;
  submitSuccessMessage: string | null;
  canRetry: boolean;
  voiceFill?: VoiceFillProps | null;
  onBack: () => void;
  onChangeField: (fieldKey: string, value: string) => void;
  onSubmit: () => Promise<void>;
  onRetrySubmit: () => Promise<void>;
  onRequestGpsPermission: () => Promise<void>;
};

/* ----------------- Helpers --------------- */
const getFieldValue = (draftAnswers: DraftAnswers, fieldKey: string): string => draftAnswers[fieldKey] ?? '';

const getFieldPlaceholder = (field: FormFieldDefinition): string => {
  if (field.type === 'text') return field.placeholder ?? FORM_FILL_COPY.textPlaceholder;
  if (field.type === 'number') return field.placeholder ?? FORM_FILL_COPY.numberPlaceholder;
  if (field.type === 'date') return FORM_FILL_COPY.datePlaceholder;
  if (field.type === 'select') return FORM_FILL_COPY.selectPlaceholder;
  if (field.type === 'file') return FORM_FILL_COPY.filePlaceholder;
  return FORM_FILL_COPY.locationPlaceholder;
};

const SelectField = ({
  field,
  value,
  onChange,
}: {
  field: Extract<FormFieldDefinition, { type: 'select' }>;
  value: string;
  onChange: (nextValue: string) => void;
}) => (
  <View className="mt-2 gap-2">
    {field.options.map((option) => {
      const isSelected = option.value === value;
      return (
        <AppButton
          key={option.value}
          label={option.label}
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          className="items-start"
          textClassName={isSelected ? '' : 'text-left'}
          onPress={() => onChange(option.value)}
        />
      );
    })}
  </View>
);

const FieldRenderer = ({
  field,
  value,
  onChange,
}: {
  field: FormFieldDefinition;
  value: string;
  onChange: (nextValue: string) => void;
}) => {
  if (field.type === 'select') {
    return <SelectField field={field} value={value} onChange={onChange} />;
  }

  const keyboardType = field.type === 'number' ? 'numeric' : 'default';
  return (
    <AppInput
      value={value}
      keyboardType={keyboardType}
      placeholder={getFieldPlaceholder(field)}
      onChangeText={onChange}
    />
  );
};

/* ----------------- Sub-components --------------- */
const GpsStatusBadge = ({
  permissionStatus,
  isCapturing,
  lastCapturedLocation,
  onRequestPermission,
}: {
  permissionStatus: GpsPermissionStatus;
  isCapturing: boolean;
  lastCapturedLocation: GpsCoordinates | null;
  onRequestPermission: () => Promise<void>;
}) => {
  if (isCapturing) {
    return (
      <View className="rounded-md bg-blue-50 px-3 py-2">
        <Text className="text-xs text-blue-600">{GPS_COPY.capturingLabel}</Text>
      </View>
    );
  }

  if (lastCapturedLocation) {
    return (
      <View className="rounded-md bg-emerald-50 px-3 py-2">
        <Text className="text-xs text-emerald-700">{GPS_COPY.capturedLabel}</Text>
        <Text className="text-xs text-emerald-600">
          {lastCapturedLocation.latitude.toFixed(5)}, {lastCapturedLocation.longitude.toFixed(5)}
          {lastCapturedLocation.accuracy !== null
            ? ` ±${Math.round(lastCapturedLocation.accuracy)}m`
            : ''}
        </Text>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View className="rounded-md bg-amber-50 px-3 py-2">
        <Text className="text-xs text-amber-700">{GPS_COPY.permissionDeniedLabel}</Text>
        <AppButton
          label={GPS_COPY.enablePermissionLabel}
          variant="outline"
          size="sm"
          className="mt-1"
          onPress={() => {
            void onRequestPermission();
          }}
        />
      </View>
    );
  }

  return null;
};

/* ----------------- Component --------------- */
const DynamicFormScreen = ({
  title,
  description,
  fields,
  draftAnswers,
  fieldErrors,
  isSubmitting,
  isCapturingGps,
  gpsPermissionStatus,
  lastCapturedLocation,
  submitErrorMessage,
  submitSuccessMessage,
  canRetry,
  voiceFill,
  onBack,
  onChangeField,
  onSubmit,
  onRetrySubmit,
  onRequestGpsPermission,
}: DynamicFormScreenProps) => (
  <View className="w-full gap-4">
    <View className="flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-foreground">{FORM_FILL_COPY.title}</Text>
      <AppButton label={FORM_FILL_COPY.backLabel} variant="outline" size="sm" onPress={onBack} />
    </View>

    <View className="rounded-lg border border-border bg-card p-3">
      <Text className="text-base font-medium text-foreground">{title}</Text>
      {description ? <Text className="mt-1 text-sm text-muted-foreground">{description}</Text> : null}
    </View>

    {voiceFill && (
      <View className="gap-2">
        <AppButton
          label={
            voiceFill.isRecording
              ? FORM_FILL_COPY.recordingLabel
              : voiceFill.isProcessing
                ? FORM_FILL_COPY.processingLabel
                : FORM_FILL_COPY.fillViaVoiceLabel
          }
          variant="outline"
          size="sm"
          disabled={voiceFill.isProcessing || isSubmitting || isCapturingGps}
          onPress={() => {
            if (voiceFill.isRecording || !voiceFill.isProcessing) {
              void voiceFill.onVoiceFillPress();
            }
          }}
        />
        {voiceFill.error ? (
          <View className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <Text className="text-xs text-red-600">{voiceFill.error}</Text>
            <AppButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              className="mt-1 self-start"
              onPress={voiceFill.onClearVoiceError}
            />
          </View>
        ) : null}
        {voiceFill.followUpQuestions.length > 0 ? (
          <View className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <Text className="text-xs font-medium text-amber-800">Follow-up:</Text>
            {voiceFill.followUpQuestions.map((q) => (
              <Text key={q.fieldKey} className="mt-1 text-xs text-amber-700">
                {q.question}
              </Text>
            ))}
            <AppButton
              label="Clear"
              variant="ghost"
              size="sm"
              className="mt-1 self-start"
              onPress={voiceFill.onClearFollowUpQuestions}
            />
          </View>
        ) : null}
      </View>
    )}

    <ScrollView className="max-h-96" contentContainerClassName="gap-3">
      {fields.map((field) => (
        <View key={field.id} className="rounded-lg border border-border bg-card p-3">
          <Text className="text-sm font-medium text-foreground">
            {field.label}
            {field.required ? ' *' : ''}
          </Text>
          {field.help_text ? (
            <Text className="mt-1 text-xs text-muted-foreground">{field.help_text}</Text>
          ) : null}
          <View className="mt-2">
            <FieldRenderer
              field={field}
              value={getFieldValue(draftAnswers, field.key)}
              onChange={(nextValue) => onChangeField(field.key, nextValue)}
            />
          </View>
          {fieldErrors[field.key] ? (
            <Text className="mt-1 text-xs text-red-500">{fieldErrors[field.key]}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>

    <GpsStatusBadge
      permissionStatus={gpsPermissionStatus}
      isCapturing={isCapturingGps}
      lastCapturedLocation={lastCapturedLocation}
      onRequestPermission={onRequestGpsPermission}
    />

    {submitErrorMessage ? <Text className="text-sm text-red-500">{submitErrorMessage}</Text> : null}
    {submitSuccessMessage ? (
      <Text className="text-sm text-emerald-600">{submitSuccessMessage}</Text>
    ) : null}

    <View className="gap-2">
      <AppButton
        label={isSubmitting || isCapturingGps ? FORM_FILL_COPY.submittingLabel : FORM_FILL_COPY.submitLabel}
        disabled={isSubmitting || isCapturingGps}
        onPress={() => {
          void onSubmit();
        }}
      />
      {canRetry ? (
        <AppButton
          label={FORM_FILL_COPY.retryLabel}
          variant="outline"
          disabled={isSubmitting || isCapturingGps}
          onPress={() => {
            void onRetrySubmit();
          }}
        />
      ) : null}
    </View>
  </View>
);

export default DynamicFormScreen;
