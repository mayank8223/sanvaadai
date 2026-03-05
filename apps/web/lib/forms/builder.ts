/* ----------------- Globals --------------- */
import { FORM_FIELD_TYPES, type FormFieldDefinition, type FormFieldType } from './contracts';

/* ----------------- Constants --------------- */
const NON_ALPHA_NUMERIC_REGEX = /[^a-z0-9]+/g;
const EDGE_DASH_REGEX = /^-+|-+$/g;
const MULTI_DASH_REGEX = /-{2,}/g;

const DEFAULT_FIELD_LABELS: Record<FormFieldType, string> = {
  text: 'Text field',
  number: 'Number field',
  date: 'Date field',
  select: 'Select field',
  file: 'File upload',
  location: 'Location capture',
};

const DEFAULT_FIELD_KEYS: Record<FormFieldType, string> = {
  text: 'text_field',
  number: 'number_field',
  date: 'date_field',
  select: 'select_field',
  file: 'file_upload',
  location: 'location_capture',
};

/* ----------------- Types --------------- */
export type BuilderFormRecord = {
  id: string;
  title: string;
  description: string | null;
  fields: FormFieldDefinition[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
};

export type BuilderSubmitTarget = 'DRAFT' | 'PUBLISHED';

export type FormBuilderSubmitPayload = {
  title: string;
  description: string | null;
  fields: FormFieldDefinition[];
};

/* ----------------- Helpers --------------- */
const createFieldId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `field_${Math.random().toString(36).slice(2, 10)}`;
};

export const isSupportedFieldType = (value: unknown): value is FormFieldType =>
  typeof value === 'string' && FORM_FIELD_TYPES.includes(value as FormFieldType);

export const slugifyFieldKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(NON_ALPHA_NUMERIC_REGEX, '-')
    .replace(MULTI_DASH_REGEX, '-')
    .replace(EDGE_DASH_REGEX, '')
    .replace(/-/g, '_');

export const buildDefaultField = (
  fieldType: FormFieldType,
  fallbackIndex: number
): FormFieldDefinition => {
  const label = DEFAULT_FIELD_LABELS[fieldType];
  const fallbackKey = `${DEFAULT_FIELD_KEYS[fieldType]}_${fallbackIndex + 1}`;

  const baseField: FormFieldDefinition = {
    id: createFieldId(),
    key: fallbackKey,
    label,
    type: fieldType,
    required: false,
    help_text: null,
  };

  if (fieldType === 'text') {
    return {
      ...baseField,
      placeholder: '',
      default_value: null,
    };
  }

  if (fieldType === 'number') {
    return {
      ...baseField,
      placeholder: '',
      default_value: null,
      min: null,
      max: null,
    };
  }

  if (fieldType === 'date') {
    return {
      ...baseField,
      default_value: null,
      min_date: null,
      max_date: null,
    };
  }

  if (fieldType === 'select') {
    return {
      ...baseField,
      options: [
        { value: 'option_1', label: 'Option 1' },
        { value: 'option_2', label: 'Option 2' },
      ],
      default_value: null,
    };
  }

  if (fieldType === 'file') {
    return {
      ...baseField,
      accept: [],
      multiple: false,
      max_size_mb: null,
    };
  }

  return {
    ...baseField,
    require_gps_accuracy_meters: null,
  };
};

export const normalizeSelectOptions = (
  optionsInput: Array<{ value: string; label: string }>
): Array<{ value: string; label: string }> => {
  const dedupeMap = new Map<string, { value: string; label: string }>();

  optionsInput.forEach((option, index) => {
    const rawLabel = option.label.trim();
    if (!rawLabel) {
      return;
    }

    const normalizedValue = slugifyFieldKey(option.value || rawLabel);
    const value = normalizedValue.length > 0 ? normalizedValue : `option_${index + 1}`;
    if (!dedupeMap.has(value)) {
      dedupeMap.set(value, {
        value,
        label: rawLabel,
      });
    }
  });

  return Array.from(dedupeMap.values());
};

export const parseSelectOptionsInput = (value: string): Array<{ value: string; label: string }> =>
  normalizeSelectOptions(
    value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((label) => ({ label, value: label }))
  );

export const serializeSelectOptionsInput = (
  options: Array<{ value: string; label: string }> | undefined
): string => (options ?? []).map((option) => option.label).join('\n');

export const sanitizeBuilderPayload = (
  payload: FormBuilderSubmitPayload
): FormBuilderSubmitPayload => {
  const normalizedFields = payload.fields.map((field, index) => {
    const normalizedLabel = field.label.trim();
    const normalizedKey = slugifyFieldKey(field.key);

    const nextField: FormFieldDefinition = {
      ...field,
      label: normalizedLabel || `Field ${index + 1}`,
      key: normalizedKey.length > 0 ? normalizedKey : `field_${index + 1}`,
      help_text: typeof field.help_text === 'string' ? field.help_text.trim() || null : null,
      required: Boolean(field.required),
    };

    if (field.type === 'select') {
      return {
        ...nextField,
        options: normalizeSelectOptions(
          Array.isArray(field.options)
            ? field.options.map((option) => ({
                value: String(option.value ?? ''),
                label: String(option.label ?? ''),
              }))
            : []
        ),
      };
    }

    return nextField;
  });

  return {
    title: payload.title.trim(),
    description: payload.description?.trim() ? payload.description.trim() : null,
    fields: normalizedFields,
  };
};

export const validateBuilderPayload = (payload: FormBuilderSubmitPayload): string | null => {
  if (!payload.title.trim()) {
    return 'Form title is required.';
  }

  if (payload.fields.length === 0) {
    return 'Add at least one field to the form.';
  }

  const fieldKeys = new Set<string>();
  for (const field of payload.fields) {
    if (!field.label.trim()) {
      return 'Each field must include a label.';
    }

    const normalizedKey = slugifyFieldKey(field.key);
    if (!normalizedKey) {
      return 'Each field must include a valid key (letters/numbers).';
    }

    if (fieldKeys.has(normalizedKey)) {
      return `Duplicate field key detected: ${normalizedKey}`;
    }

    fieldKeys.add(normalizedKey);

    if (field.type === 'select') {
      const options = normalizeSelectOptions(
        Array.isArray(field.options)
          ? field.options.map((option) => ({
              value: String(option.value ?? ''),
              label: String(option.label ?? ''),
            }))
          : []
      );

      if (options.length === 0) {
        return `Select field "${field.label}" needs at least one option.`;
      }
    }
  }

  return null;
};
