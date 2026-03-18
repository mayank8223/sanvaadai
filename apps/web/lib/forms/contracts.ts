/* ----------------- Globals --------------- */
import {
  CalendarDaysIcon,
  HashIcon,
  ListChecksIcon,
  MapPinIcon,
  PaperclipIcon,
  TypeIcon,
  type LucideIcon,
} from 'lucide-react';

/* ----------------- Constants --------------- */
export const FORM_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const FORM_FIELD_TYPES = ['text', 'number', 'date', 'select', 'file', 'location'] as const;

export const FIELD_TYPE_ICONS: Record<(typeof FORM_FIELD_TYPES)[number], LucideIcon> = {
  text: TypeIcon,
  number: HashIcon,
  date: CalendarDaysIcon,
  select: ListChecksIcon,
  file: PaperclipIcon,
  location: MapPinIcon,
};

/* ----------------- Types --------------- */
export type FormStatus = (typeof FORM_STATUSES)[number];
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export type FormFieldDefinition = {
  id: string;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  help_text?: string | null;
  [key: string]: unknown;
};

export type CreateFormInput = {
  title: string;
  description: string | null;
  fields: FormFieldDefinition[];
};

export type UpdateFormInput = Partial<CreateFormInput>;

/* ----------------- Helpers --------------- */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const parseBoolean = (value: unknown): boolean | null =>
  typeof value === 'boolean' ? value : null;

const isValidFieldType = (value: unknown): value is FormFieldType =>
  typeof value === 'string' && FORM_FIELD_TYPES.includes(value as FormFieldType);

const parseFieldDefinition = (value: unknown): FormFieldDefinition | null => {
  if (!isObjectRecord(value)) return null;

  const id = parseString(value.id);
  const key = parseString(value.key);
  const label = parseString(value.label);
  const required = parseBoolean(value.required);
  const type = value.type;

  if (!id || !key || !label || required === null || !isValidFieldType(type)) {
    return null;
  }

  return {
    ...value,
    id,
    key,
    label,
    required,
    type,
  };
};

const parseFieldList = (value: unknown): FormFieldDefinition[] | null => {
  if (!Array.isArray(value)) return null;

  const parsedFields = value.map(parseFieldDefinition);
  if (parsedFields.some((field) => field === null)) return null;
  return parsedFields as FormFieldDefinition[];
};

export const parseFormStatus = (value: unknown): FormStatus | null =>
  typeof value === 'string' && FORM_STATUSES.includes(value as FormStatus)
    ? (value as FormStatus)
    : null;

export const parseCreateFormInput = (value: unknown): CreateFormInput | null => {
  if (!isObjectRecord(value)) return null;

  const title = parseString(value.title);
  const descriptionValue = value.description;
  const description =
    descriptionValue === null || descriptionValue === undefined
      ? null
      : parseString(descriptionValue);
  const fields = parseFieldList(value.fields);

  if (!title || fields === null) return null;
  if (descriptionValue !== null && descriptionValue !== undefined && description === null)
    return null;

  return {
    title,
    description,
    fields,
  };
};

export const parseUpdateFormInput = (value: unknown): UpdateFormInput | null => {
  if (!isObjectRecord(value)) return null;

  const hasTitle = Object.prototype.hasOwnProperty.call(value, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(value, 'description');
  const hasFields = Object.prototype.hasOwnProperty.call(value, 'fields');

  if (!hasTitle && !hasDescription && !hasFields) return null;

  const parsedInput: UpdateFormInput = {};

  if (hasTitle) {
    const title = parseString(value.title);
    if (!title) return null;
    parsedInput.title = title;
  }

  if (hasDescription) {
    if (value.description === null) {
      parsedInput.description = null;
    } else {
      const description = parseString(value.description);
      if (!description) return null;
      parsedInput.description = description;
    }
  }

  if (hasFields) {
    const fields = parseFieldList(value.fields);
    if (!fields) return null;
    parsedInput.fields = fields;
  }

  return parsedInput;
};
