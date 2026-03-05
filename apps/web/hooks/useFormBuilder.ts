'use client';

/* ----------------- Globals --------------- */
import { useCallback, useMemo, useState } from 'react';

import { FORM_FIELD_TYPES, type FormFieldDefinition, type FormFieldType } from '@/lib/forms/contracts';
import {
  buildDefaultField,
  parseSelectOptionsInput,
  sanitizeBuilderPayload,
  serializeSelectOptionsInput,
  slugifyFieldKey,
  type BuilderFormRecord,
  type BuilderSubmitTarget,
  validateBuilderPayload,
} from '@/lib/forms/builder';

/* ----------------- Types --------------- */
type UseFormBuilderInput = {
  initialForm?: BuilderFormRecord;
  onComplete?: () => void;
};

type UpdateFieldInput = {
  fieldId: string;
  patch: Partial<FormFieldDefinition> & {
    optionsInput?: string;
  };
};

/* ----------------- Hooks --------------- */
const useFormBuilder = ({ initialForm, onComplete }: UseFormBuilderInput) => {
  const [title, setTitle] = useState<string>(initialForm?.title ?? '');
  const [description, setDescription] = useState<string>(initialForm?.description ?? '');
  const [fields, setFields] = useState<FormFieldDefinition[]>(initialForm?.fields ?? []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialForm?.fields[0]?.id ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedField = useMemo<FormFieldDefinition | null>(() => {
    if (!selectedFieldId) {
      return null;
    }

    return fields.find((field) => field.id === selectedFieldId) ?? null;
  }, [fields, selectedFieldId]);

  const addField = useCallback((fieldType: FormFieldType) => {
    if (!FORM_FIELD_TYPES.includes(fieldType)) {
      return;
    }

    setFields((currentFields) => {
      const nextField = buildDefaultField(fieldType, currentFields.length);
      setSelectedFieldId(nextField.id);
      return [...currentFields, nextField];
    });

    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFields((currentFields) => {
      const nextFields = currentFields.filter((field) => field.id !== fieldId);

      if (selectedFieldId === fieldId) {
        setSelectedFieldId(nextFields[0]?.id ?? null);
      }

      return nextFields;
    });

    setErrorMessage(null);
    setSuccessMessage(null);
  }, [selectedFieldId]);

  const updateField = useCallback(({ fieldId, patch }: UpdateFieldInput) => {
    setFields((currentFields) =>
      currentFields.map((field) => {
        if (field.id !== fieldId) {
          return field;
        }

        const nextField = {
          ...field,
          ...patch,
        };

        if (typeof patch.label === 'string' && (!patch.key || patch.key === field.key)) {
          const autoKey = slugifyFieldKey(patch.label);
          if (autoKey) {
            nextField.key = autoKey;
          }
        }

        if (nextField.type === 'select') {
          const rawOptions =
            typeof patch.optionsInput === 'string'
              ? parseSelectOptionsInput(patch.optionsInput)
              : Array.isArray(nextField.options)
                ? nextField.options
                : [];

          return {
            ...nextField,
            options: rawOptions,
          };
        }

        return nextField;
      })
    );

    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const moveField = useCallback((fieldId: string, direction: -1 | 1) => {
    setFields((currentFields) => {
      const sourceIndex = currentFields.findIndex((field) => field.id === fieldId);
      const targetIndex = sourceIndex + direction;

      if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= currentFields.length) {
        return currentFields;
      }

      const nextFields = [...currentFields];
      const [movedField] = nextFields.splice(sourceIndex, 1);
      nextFields.splice(targetIndex, 0, movedField);
      return nextFields;
    });
  }, []);

  const submitForm = useCallback(
    async (targetStatus: BuilderSubmitTarget) => {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const validationError = validateBuilderPayload({
        title,
        description,
        fields,
      });

      if (validationError) {
        setErrorMessage(validationError);
        setIsSubmitting(false);
        return;
      }

      const payload = sanitizeBuilderPayload({
        title,
        description,
        fields,
      });

      try {
        const endpoint = initialForm ? `/api/forms/${initialForm.id}` : '/api/forms';
        const method = initialForm ? 'PATCH' : 'POST';
        const saveResponse = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const saveData = (await saveResponse.json()) as {
          error?: string;
          form?: { id: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' };
        };

        if (!saveResponse.ok || !saveData.form) {
          throw new Error(saveData.error ?? 'Failed to save form.');
        }

        if (targetStatus === 'PUBLISHED') {
          const statusResponse = await fetch(`/api/forms/${saveData.form.id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'PUBLISHED' }),
          });

          const statusData = (await statusResponse.json()) as { error?: string };
          if (!statusResponse.ok) {
            throw new Error(statusData.error ?? 'Failed to publish form.');
          }
        }

        setSuccessMessage(
          targetStatus === 'PUBLISHED'
            ? 'Form saved and published.'
            : initialForm
              ? 'Form updated as draft.'
              : 'Form created as draft.'
        );

        if (typeof onComplete === 'function') {
          onComplete();
        }
      } catch (error) {
        const fallbackMessage =
          targetStatus === 'PUBLISHED'
            ? 'Unable to publish this form right now.'
            : 'Unable to save this form right now.';
        setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [description, fields, initialForm, onComplete, title]
  );

  const selectedFieldOptionsInput = useMemo<string>(() => {
    if (!selectedField || selectedField.type !== 'select') {
      return '';
    }

    const options = Array.isArray(selectedField.options)
      ? (selectedField.options as Array<{ value: string; label: string }>)
      : [];
    return serializeSelectOptionsInput(options);
  }, [selectedField]);

  return {
    title,
    description,
    fields,
    selectedField,
    selectedFieldId,
    selectedFieldOptionsInput,
    isSubmitting,
    errorMessage,
    successMessage,
    setTitle,
    setDescription,
    setSelectedFieldId,
    addField,
    removeField,
    updateField,
    moveField,
    submitForm,
  };
};

export default useFormBuilder;
