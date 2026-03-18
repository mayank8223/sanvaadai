/**
 * T34 – Web collector form fill helpers.
 * Validation and payload building for collector form submission (mirrors mobile logic).
 */

/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from './contracts';

/* ----------------- Types --------------- */
export type DraftAnswerValue = string;
export type DraftAnswers = Record<string, DraftAnswerValue>;
export type DraftFieldErrors = Record<string, string>;

type SubmissionAnswerValue =
  | string
  | number
  | boolean
  | null
  | { latitude: number; longitude: number; accuracy?: number | null }
  | { path: string };

type SubmissionPayload = {
  form_id: string;
  answers: Record<string, SubmissionAnswerValue>;
  location: { latitude: number; longitude: number; accuracy: number | null } | null;
  client_submitted_at: string;
  device: { platform: string };
};

/* ----------------- Constants --------------- */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* ----------------- Helpers --------------- */
const hasTextValue = (value: string): boolean => value.trim().length > 0;

const isValidDateInput = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime());
};

const parseNumberAnswer = (
  field: FormFieldDefinition & { type: 'number'; min?: number; max?: number },
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
  if (field.min != null && parsedValue < field.min) {
    return { value: null, error: `Value must be at least ${field.min}.` };
  }
  if (field.max != null && parsedValue > field.max) {
    return { value: null, error: `Value must be at most ${field.max}.` };
  }
  return { value: parsedValue, error: null };
};

const parseDateAnswer = (
  field: FormFieldDefinition & { type: 'date'; min_date?: string; max_date?: string },
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
  field: FormFieldDefinition & { type: 'select'; options: Array<{ value: string; label: string }> },
  rawValue: string
): { value: string | null; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'Please choose an option.' : null,
    };
  }
  const options = field.options ?? [];
  const normalizedValue = rawValue.trim();
  const isAllowed = options.some((option: { value: string }) => option.value === normalizedValue);
  if (!isAllowed) {
    return { value: null, error: 'Choose a valid option.' };
  }
  return { value: normalizedValue, error: null };
};

const parseTextAnswer = (
  field: FormFieldDefinition & { type: 'text' },
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'This field is required.' : null,
    };
  }
  return { value: rawValue.trim(), error: null };
};

const parseFileAnswer = (
  field: FormFieldDefinition & { type: 'file' },
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  if (!hasTextValue(rawValue)) {
    return {
      value: null,
      error: field.required ? 'File path is required.' : null,
    };
  }
  return { value: { path: rawValue.trim() }, error: null };
};

const parseLocationAnswer = (
  field: FormFieldDefinition & { type: 'location' },
  rawValue: string
): { value: SubmissionAnswerValue; error: string | null } => {
  const [latitude = '', longitude = '', accuracy = ''] = rawValue
    .split(',')
    .map((s) => s.trim());
  if (!hasTextValue(rawValue) || (!latitude && !longitude)) {
    return {
      value: null,
      error: field.required ? 'Location is required.' : null,
    };
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  const acc = hasTextValue(accuracy) ? Number(accuracy) : null;
  if (!Number.isFinite(lat) || Number.isNaN(lat)) {
    return { value: null, error: 'Latitude must be a valid number.' };
  }
  if (!Number.isFinite(lng) || Number.isNaN(lng)) {
    return { value: null, error: 'Longitude must be a valid number.' };
  }
  if (acc !== null && (!Number.isFinite(acc) || Number.isNaN(acc) || acc < 0)) {
    return { value: null, error: 'Accuracy must be a positive number.' };
  }
  return {
    value: { latitude: lat, longitude: lng, accuracy: acc },
    error: null,
  };
};

const getFieldDefaultDraftAnswer = (field: FormFieldDefinition): DraftAnswerValue => {
  const dv = field.default_value;
  if (field.type === 'text' || field.type === 'date' || field.type === 'select') {
    return dv == null || typeof dv !== 'string' ? '' : dv;
  }
  if (field.type === 'number') {
    return dv == null ? '' : String(dv);
  }
  if (field.type === 'location' || field.type === 'file') {
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
): { answers: Record<string, SubmissionAnswerValue>; errors: DraftFieldErrors } => {
  const answers: Record<string, SubmissionAnswerValue> = {};
  const errors: DraftFieldErrors = {};

  fields.forEach((field) => {
    const rawValue = draftAnswers[field.key] ?? '';
    if (field.type === 'text') {
      const result = parseTextAnswer(field as FormFieldDefinition & { type: 'text' }, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }
    if (field.type === 'number') {
      const result = parseNumberAnswer(
        field as FormFieldDefinition & { type: 'number'; min?: number; max?: number },
        rawValue
      );
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }
    if (field.type === 'date') {
      const result = parseDateAnswer(
        field as FormFieldDefinition & { type: 'date'; min_date?: string; max_date?: string },
        rawValue
      );
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }
    if (field.type === 'select') {
      const result = parseSelectAnswer(
        field as FormFieldDefinition & { type: 'select'; options: Array<{ value: string; label: string }> },
        rawValue
      );
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }
    if (field.type === 'file') {
      const result = parseFileAnswer(field as FormFieldDefinition & { type: 'file' }, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
      return;
    }
    if (field.type === 'location') {
      const result = parseLocationAnswer(field as FormFieldDefinition & { type: 'location' }, rawValue);
      answers[field.key] = result.value;
      if (result.error) errors[field.key] = result.error;
    }
  });

  return { answers, errors };
};

export const buildSubmissionPayload = (
  formId: string,
  answers: Record<string, SubmissionAnswerValue>,
  location?: { latitude: number; longitude: number; accuracy: number | null } | null
): SubmissionPayload => ({
  form_id: formId,
  answers,
  location: location ?? null,
  client_submitted_at: new Date().toISOString(),
  device: { platform: 'web' },
});
