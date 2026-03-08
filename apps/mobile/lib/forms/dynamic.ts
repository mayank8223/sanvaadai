/* ----------------- Globals --------------- */
import type {
  FormFieldDefinition,
  SubmissionAnswerValue,
  SubmissionPayload,
} from '@sanvaadai/types';

/* ----------------- Types --------------- */
export type DraftAnswerValue = string;

export type DraftAnswers = Record<string, DraftAnswerValue>;

export type DraftFieldErrors = Record<string, string>;

type LocationAnswerDraft = {
  latitude: string;
  longitude: string;
  accuracy: string;
};

/* ----------------- Constants --------------- */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* ----------------- Helpers --------------- */
const hasTextValue = (value: string): boolean => value.trim().length > 0;

const toLocationAnswerDraft = (rawValue: string): LocationAnswerDraft => {
  const [latitude = '', longitude = '', accuracy = ''] = rawValue
    .split(',')
    .map((segment) => segment.trim());

  return { latitude, longitude, accuracy };
};

const isLocationDraftEmpty = (draft: LocationAnswerDraft): boolean =>
  !hasTextValue(draft.latitude) && !hasTextValue(draft.longitude) && !hasTextValue(draft.accuracy);

const isValidDateInput = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime());
};

const parseNumberAnswer = (
  field: Extract<FormFieldDefinition, { type: 'number' }>,
  rawValue: string
): { value: number | null; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'This field is required.' : null,
    };
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || Number.isNaN(parsedValue)) {
    return { value: null, error: 'Enter a valid number.' };
  }

  if (field.min !== null && field.min !== undefined && parsedValue < field.min) {
    return { value: null, error: `Value must be at least ${field.min}.` };
  }

  if (field.max !== null && field.max !== undefined && parsedValue > field.max) {
    return { value: null, error: `Value must be at most ${field.max}.` };
  }

  return { value: parsedValue, error: null };
};

const parseDateAnswer = (
  field: Extract<FormFieldDefinition, { type: 'date' }>,
  rawValue: string
): { value: string | null; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'This field is required.' : null,
    };
  }

  const normalizedValue = rawValue.trim();
  if (!isValidDateInput(normalizedValue)) {
    return { value: null, error: 'Enter date as YYYY-MM-DD.' };
  }

  if (field.min_date && normalizedValue < field.min_date) {
    return { value: null, error: `Date must be on or after ${field.min_date}.` };
  }

  if (field.max_date && normalizedValue > field.max_date) {
    return { value: null, error: `Date must be on or before ${field.max_date}.` };
  }

  return { value: normalizedValue, error: null };
};

const parseSelectAnswer = (
  field: Extract<FormFieldDefinition, { type: 'select' }>,
  rawValue: string
): { value: string | null; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'Please choose an option.' : null,
    };
  }

  const normalizedValue = rawValue.trim();
  const isAllowed = field.options.some((option) => option.value === normalizedValue);
  if (!isAllowed) {
    return { value: null, error: 'Choose a valid option.' };
  }

  return { value: normalizedValue, error: null };
};

const parseFileAnswer = (
  field: Extract<FormFieldDefinition, { type: 'file' }>,
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'File path is required.' : null,
    };
  }

  return {
    value: {
      path: rawValue.trim(),
    },
    error: null,
  };
};

const parseLocationAnswer = (
  field: Extract<FormFieldDefinition, { type: 'location' }>,
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  const draft = toLocationAnswerDraft(rawValue);
  if (!hasTextValue(rawValue) || isLocationDraftEmpty(draft)) {
    return {
      value: null,
      error: field.required ? 'Location is required.' : null,
    };
  }
  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);
  const accuracy = hasTextValue(draft.accuracy) ? Number(draft.accuracy) : null;

  if (!Number.isFinite(latitude) || Number.isNaN(latitude)) {
    return { value: null, error: 'Latitude must be a valid number.' };
  }

  if (!Number.isFinite(longitude) || Number.isNaN(longitude)) {
    return { value: null, error: 'Longitude must be a valid number.' };
  }

  if (accuracy !== null && (!Number.isFinite(accuracy) || Number.isNaN(accuracy) || accuracy < 0)) {
    return { value: null, error: 'Accuracy must be a positive number.' };
  }

  return {
    value: {
      latitude,
      longitude,
      accuracy,
    },
    error: null,
  };
};

const parseTextAnswer = (
  field: Extract<FormFieldDefinition, { type: 'text' }>,
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  const normalizedValue = rawValue.trim();

  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'This field is required.' : null,
    };
  }

  return {
    value: normalizedValue,
    error: null,
  };
};

const getFieldDefaultDraftAnswer = (field: FormFieldDefinition): DraftAnswerValue => {
  if (field.type === 'text') {
    return field.default_value ?? '';
  }

  if (field.type === 'number') {
    return field.default_value === null || field.default_value === undefined
      ? ''
      : String(field.default_value);
  }

  if (field.type === 'date') {
    return field.default_value ?? '';
  }

  if (field.type === 'select') {
    return field.default_value ?? '';
  }

  if (field.type === 'location') {
    return '';
  }

  return '';
};

/* ----------------- Exports --------------- */
export const buildDefaultDraftAnswers = (fields: FormFieldDefinition[]): DraftAnswers =>
  Object.fromEntries(fields.map((field) => [field.key, getFieldDefaultDraftAnswer(field)]));

export const validateAndBuildSubmissionAnswers = (
  fields: FormFieldDefinition[],
  draftAnswers: DraftAnswers
): {
  answers: Record<string, SubmissionAnswerValue>;
  errors: DraftFieldErrors;
} => {
  const answers: Record<string, SubmissionAnswerValue> = {};
  const errors: DraftFieldErrors = {};

  fields.forEach((field) => {
    const rawValue = draftAnswers[field.key] ?? '';

    if (field.type === 'text') {
      const result = parseTextAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }

    if (field.type === 'number') {
      const result = parseNumberAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }

    if (field.type === 'date') {
      const result = parseDateAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }

    if (field.type === 'select') {
      const result = parseSelectAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }

    if (field.type === 'file') {
      const result = parseFileAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }

    if (field.type === 'location') {
      const result = parseLocationAnswer(field, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
    }
  });

  return { answers, errors };
};

export const buildSubmissionPayload = (
  formId: string,
  answers: Record<string, SubmissionAnswerValue>,
  platform: string
): SubmissionPayload => ({
  form_id: formId,
  answers,
  client_submitted_at: new Date().toISOString(),
  device: {
    platform,
  },
});
