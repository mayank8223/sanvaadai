/* ----------------- Globals --------------- */
import type { FormDefinition } from '@sanvaadai/types';

/* ----------------- Types --------------- */
type FetchFormDefinitionInput = {
  apiBaseUrl: string;
  accessToken: string;
  formId: string;
  organizationId: string;
};

type FetchFormDefinitionResult =
  | {
      ok: true;
      form: FormDefinition;
    }
  | {
      ok: false;
      errorMessage: string;
    };

type FormResponseBody = {
  form?: FormDefinition;
  error?: string;
};

/* ----------------- API --------------- */
export const fetchFormDefinition = async ({
  apiBaseUrl,
  accessToken,
  formId,
  organizationId,
}: FetchFormDefinitionInput): Promise<FetchFormDefinitionResult> => {
  const response = await fetch(`${apiBaseUrl}/api/forms/${formId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-organization-id': organizationId,
    },
  });

  let body: FormResponseBody | null = null;
  try {
    body = (await response.json()) as FormResponseBody;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      errorMessage: body?.error ?? 'Unable to load form details.',
    };
  }

  if (!body?.form) {
    return {
      ok: false,
      errorMessage: 'Form response is missing details.',
    };
  }

  return {
    ok: true,
    form: body.form,
  };
};
