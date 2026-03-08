/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@sanvaadai/types';
import { ScrollView, Text, View } from 'react-native';

import { AppButton, AppInput } from '../../components';
import { FORM_FILL_COPY } from '../../constants';
import type { DraftAnswers, DraftFieldErrors } from '../../lib/forms/dynamic';

/* ----------------- Types --------------- */
type DynamicFormScreenProps = {
  title: string;
  description: string | null;
  fields: FormFieldDefinition[];
  draftAnswers: DraftAnswers;
  fieldErrors: DraftFieldErrors;
  isSubmitting: boolean;
  submitErrorMessage: string | null;
  submitSuccessMessage: string | null;
  canRetry: boolean;
  onBack: () => void;
  onChangeField: (fieldKey: string, value: string) => void;
  onSubmit: () => Promise<void>;
  onRetrySubmit: () => Promise<void>;
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

/* ----------------- Component --------------- */
const DynamicFormScreen = ({
  title,
  description,
  fields,
  draftAnswers,
  fieldErrors,
  isSubmitting,
  submitErrorMessage,
  submitSuccessMessage,
  canRetry,
  onBack,
  onChangeField,
  onSubmit,
  onRetrySubmit,
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

    {submitErrorMessage ? <Text className="text-sm text-red-500">{submitErrorMessage}</Text> : null}
    {submitSuccessMessage ? (
      <Text className="text-sm text-emerald-600">{submitSuccessMessage}</Text>
    ) : null}

    <View className="gap-2">
      <AppButton
        label={isSubmitting ? FORM_FILL_COPY.submittingLabel : FORM_FILL_COPY.submitLabel}
        disabled={isSubmitting}
        onPress={() => {
          void onSubmit();
        }}
      />
      {canRetry ? (
        <AppButton
          label={FORM_FILL_COPY.retryLabel}
          variant="outline"
          disabled={isSubmitting}
          onPress={() => {
            void onRetrySubmit();
          }}
        />
      ) : null}
    </View>
  </View>
);

export default DynamicFormScreen;
