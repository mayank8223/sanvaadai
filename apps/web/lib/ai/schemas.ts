/**
 * T29 – Zod schemas for AI outputs.
 * Used to validate and shape LLM responses for form creation and form filling.
 */

/* ----------------- Globals --------------- */
import { z } from 'zod';

/* ----------------- Constants --------------- */
export const AI_FORM_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'select',
  'file',
  'location',
] as const;

/* ----------------- Form Definition (AI output) --------------- */

const selectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

/**
 * Single schema for all field types – AI populates type-specific fields.
 * Uses .nullable() instead of .optional() so OpenAI strict JSON Schema
 * receives a proper "required" array (all keys must be present; use null for unused).
 */
const aiFormFieldSchema = z.object({
  key: z.string().min(1).describe('Machine-friendly field key (snake_case, no spaces)'),
  label: z.string().min(1).describe('Human-readable field label'),
  type: z.enum(AI_FORM_FIELD_TYPES).describe('Field type'),
  required: z.boolean().describe('Whether the field is required'),
  help_text: z.string().nullable().describe('Help text; null if none'),
  placeholder: z.string().nullable().describe('Placeholder; null if none'),
  default_value: z.union([z.string(), z.number()]).nullable().describe('Default value; null if none'),
  min: z.number().nullable().describe('Min value for number; null if none'),
  max: z.number().nullable().describe('Max value for number; null if none'),
  min_date: z.string().nullable().describe('Min date; null if none'),
  max_date: z.string().nullable().describe('Max date; null if none'),
  options: z
    .array(selectOptionSchema)
    .nullable()
    .describe('Select options; null for non-select fields'),
  accept: z.array(z.string()).nullable().describe('Accepted file types; null for non-file fields'),
  max_size_mb: z.number().nullable().describe('Max file size in MB; null if none'),
  multiple: z.boolean().nullable().describe('Allow multiple files; null for non-file fields'),
  require_gps_accuracy_meters: z
    .number()
    .nullable()
    .describe('Required GPS accuracy; null for non-location fields'),
});

/** AI-generated form draft – title, description, and fields. */
export const aiFormDefinitionDraftSchema = z.object({
  title: z.string().min(1).describe('Form title'),
  description: z.string().nullable().describe('Brief form description'),
  fields: z
    .array(aiFormFieldSchema)
    .min(1)
    .describe('Form fields with keys, labels, types, and type-specific config'),
});

export type AiFormDefinitionDraft = z.infer<typeof aiFormDefinitionDraftSchema>;
export type AiFormFieldDraft = z.infer<typeof aiFormFieldSchema>;

/* ----------------- Answer Draft (AI output for form filling) --------------- */

/** Follow-up question for a specific field. */
export const followUpQuestionSchema = z.object({
  fieldKey: z.string().describe('Field key from FormDefinition'),
  question: z.string().min(1).describe('Specific question to fill the field'),
});

/** AI-generated answer draft from dictation – maps spoken content to form fields. */
export const answerDraftSchema = z.object({
  answers: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(z.string()),
      ])
    )
    .describe('Answers keyed by field key'),
  missingRequiredFields: z
    .array(z.string())
    .describe('Field keys that are required but have no value'),
  followUpQuestions: z
    .array(followUpQuestionSchema)
    .describe('Specific questions to gather missing required fields'),
});

export type AnswerDraft = z.infer<typeof answerDraftSchema>;
export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;
