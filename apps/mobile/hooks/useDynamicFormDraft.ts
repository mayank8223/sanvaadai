/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@sanvaadai/types';
import { useEffect, useMemo, useState } from 'react';

import {
  buildDefaultDraftAnswers,
  type DraftAnswers,
  type DraftFieldErrors,
  validateAndBuildSubmissionAnswers,
} from '../lib/forms/dynamic';

/* ----------------- Hooks --------------- */
const useDynamicFormDraft = (fields: FormFieldDefinition[]) => {
  const defaultDraftAnswers = useMemo(() => buildDefaultDraftAnswers(fields), [fields]);
  const [draftAnswers, setDraftAnswers] = useState<DraftAnswers>(defaultDraftAnswers);
  const [fieldErrors, setFieldErrors] = useState<DraftFieldErrors>({});

  useEffect(() => {
    setDraftAnswers(defaultDraftAnswers);
    setFieldErrors({});
  }, [defaultDraftAnswers]);

  const setDraftValue = (fieldKey: string, value: string) => {
    setDraftAnswers((previousValue) => ({
      ...previousValue,
      [fieldKey]: value,
    }));

    setFieldErrors((previousValue) => {
      if (!previousValue[fieldKey]) {
        return previousValue;
      }

      const nextValue = { ...previousValue };
      delete nextValue[fieldKey];
      return nextValue;
    });
  };

  const applyDraftAnswers = (answers: Record<string, string>) => {
    setDraftAnswers((previousValue) => ({ ...previousValue, ...answers }));
    setFieldErrors((previousValue) => {
      const nextValue = { ...previousValue };
      for (const key of Object.keys(answers)) {
        delete nextValue[key];
      }
      return nextValue;
    });
  };

  const validate = () => {
    const result = validateAndBuildSubmissionAnswers(fields, draftAnswers);
    setFieldErrors(result.errors);
    return result;
  };

  return {
    draftAnswers,
    fieldErrors,
    setDraftValue,
    applyDraftAnswers,
    validate,
    reset: () => {
      setDraftAnswers(defaultDraftAnswers);
      setFieldErrors({});
    },
  };
};

export default useDynamicFormDraft;
