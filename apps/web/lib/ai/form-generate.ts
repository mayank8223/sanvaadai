/**
 * T30 – AI form generation: description → FormDefinition.
 * Converts AI output to form builder payload and provides the generation logic.
 */

/* ----------------- Globals --------------- */
import { generateText, Output } from 'ai';

import {
  sanitizeBuilderPayload,
  type FormBuilderSubmitPayload,
} from '@/lib/forms/builder';
import type { FormFieldDefinition } from '@/lib/forms/contracts';

import { chatModel } from './provider';
import {
  aiFormDefinitionDraftSchema,
  type AiFormDefinitionDraft,
  type AiFormFieldDraft,
} from './schemas';

/* ----------------- Constants --------------- */
const FORM_GENERATION_SYSTEM_PROMPT = `You are a form design assistant. Given a natural language description of a data collection need, you produce a structured form definition.

Rules:
- Use field types: text, number, date, select, file, location
- For "select" fields, always provide at least 2 options with value and label; use null for options on non-select fields
- Use machine-friendly keys (snake_case, e.g. school_name, meal_count)
- Mark fields as required when the description implies they are mandatory
- Add help_text when it clarifies what to enter; use null when not needed
- Use null for type-specific fields that do not apply (e.g. min/max for text, options for number)
- Keep the form focused; avoid unnecessary fields`;

/* ----------------- Helpers --------------- */
const createFieldId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `field_${Math.random().toString(36).slice(2, 10)}`;
};

const aiDraftToFormFields = (draft: AiFormDefinitionDraft): FormFieldDefinition[] =>
  draft.fields.map((field: AiFormFieldDraft) => {
    const base: FormFieldDefinition = {
      id: createFieldId(),
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      help_text: field.help_text ?? null,
    };

    if (field.type === 'text') {
      return {
        ...base,
        placeholder: field.placeholder ?? '',
        default_value: field.default_value ?? null,
      };
    }
    if (field.type === 'number') {
      return {
        ...base,
        placeholder: field.placeholder ?? '',
        default_value: field.default_value ?? null,
        min: field.min ?? null,
        max: field.max ?? null,
      };
    }
    if (field.type === 'date') {
      return {
        ...base,
        default_value: field.default_value ?? null,
        min_date: field.min_date ?? null,
        max_date: field.max_date ?? null,
      };
    }
    if (field.type === 'select') {
      return {
        ...base,
        options: Array.isArray(field.options) && field.options.length > 0
          ? field.options
          : [{ value: 'option_1', label: 'Option 1' }, { value: 'option_2', label: 'Option 2' }],
        default_value: field.default_value ?? null,
      };
    }
    if (field.type === 'file') {
      return {
        ...base,
        accept: field.accept ?? [],
        multiple: field.multiple ?? false,
        max_size_mb: field.max_size_mb ?? null,
      };
    }
    return {
      ...base,
      require_gps_accuracy_meters: field.require_gps_accuracy_meters ?? null,
    };
  });

/** Converts AI draft to form builder payload with IDs and normalized fields. */
export const aiDraftToBuilderPayload = (
  draft: AiFormDefinitionDraft
): FormBuilderSubmitPayload => {
  const fields = aiDraftToFormFields(draft);
  return sanitizeBuilderPayload({
    title: draft.title.trim(),
    description: draft.description?.trim() || null,
    fields,
  });
};

/* ----------------- Main --------------- */
export type GenerateFormFromDescriptionInput = {
  description: string;
};

export type GenerateFormFromDescriptionResult =
  | { ok: true; form: FormBuilderSubmitPayload }
  | { ok: false; error: string };

export const generateFormFromDescription = async (
  input: GenerateFormFromDescriptionInput
): Promise<GenerateFormFromDescriptionResult> => {
  const { description } = input;
  const trimmed = description.trim();
  if (!trimmed) {
    return { ok: false, error: 'Description is required.' };
  }

  try {
    const { output } = await generateText({
      model: chatModel(),
      system: FORM_GENERATION_SYSTEM_PROMPT,
      prompt: `Create a form for: ${trimmed}`,
      output: Output.object({
        schema: aiFormDefinitionDraftSchema,
        name: 'FormDefinition',
        description: 'Structured form definition with title, description, and fields',
      }),
    });

    const form = aiDraftToBuilderPayload(output);
    return { ok: true, form };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Form generation failed';
    return { ok: false, error: message };
  }
};
