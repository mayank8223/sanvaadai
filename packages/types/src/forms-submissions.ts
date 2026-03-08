/**
 * T13 – Form and Submission shared types for dynamic forms.
 * Used by web, mobile, and API contracts.
 */

export const FORM_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type FormStatus = (typeof FORM_STATUSES)[number];

export const FORM_FIELD_TYPES = ['text', 'number', 'date', 'select', 'file', 'location'] as const;
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

type BaseFormFieldDefinition = {
  id: string;
  key: string;
  label: string;
  required: boolean;
  help_text?: string | null;
};

export type TextFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'text';
  placeholder?: string | null;
  default_value?: string | null;
};

export type NumberFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'number';
  placeholder?: string | null;
  default_value?: number | null;
  min?: number | null;
  max?: number | null;
};

export type DateFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'date';
  default_value?: string | null;
  min_date?: string | null;
  max_date?: string | null;
};

export type SelectFormFieldOption = {
  value: string;
  label: string;
};

export type SelectFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'select';
  options: SelectFormFieldOption[];
  default_value?: string | null;
};

export type FileFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'file';
  accept?: string[] | null;
  max_size_mb?: number | null;
  multiple?: boolean;
};

export type LocationFormFieldDefinition = BaseFormFieldDefinition & {
  type: 'location';
  require_gps_accuracy_meters?: number | null;
};

export type FormFieldDefinition =
  | TextFormFieldDefinition
  | NumberFormFieldDefinition
  | DateFormFieldDefinition
  | SelectFormFieldDefinition
  | FileFormFieldDefinition
  | LocationFormFieldDefinition;

export type FormDefinition = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  fields: FormFieldDefinition[];
  version: number;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionAnswerValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
    }
  | {
      path: string;
      content_type?: string | null;
      size_bytes?: number | null;
    }
  | {
      path: string;
      content_type?: string | null;
      size_bytes?: number | null;
    }[];

export type GpsCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  captured_at: string;
};

export type SubmissionPayload = {
  form_id: string;
  answers: Record<string, SubmissionAnswerValue>;
  location?: GpsCoordinates | null;
  client_submitted_at?: string;
  device?: {
    platform?: string;
    app_version?: string;
  };
};

export type SubmissionRecord = {
  id: string;
  organization_id: string;
  form_id: string;
  collector_user_id: string | null;
  payload: SubmissionPayload;
  metadata: {
    [key: string]: unknown;
  };
  submitted_at: string;
  created_at: string;
  updated_at: string;
};
