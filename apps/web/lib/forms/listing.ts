/* ----------------- Globals --------------- */
import type { FormStatus } from '@/lib/forms/contracts';
import { parseFormStatus } from '@/lib/forms/contracts';

/* ----------------- Constants --------------- */
const DEFAULT_STATUS_FILTER = 'ALL' as const;

/* ----------------- Types --------------- */
export type FormsListStatusFilter = FormStatus | typeof DEFAULT_STATUS_FILTER;

export type FormsListFilters = {
  status: FormsListStatusFilter;
};

export type FormsListSearchParams = Record<string, string | string[] | undefined>;

export type FormsListFormRecord = {
  id: string;
  title: string;
  status: FormStatus;
  created_at: string;
  submissions?: Array<{ count: number | null }> | null;
};

/* ----------------- Helpers --------------- */
const normalizeString = (value: string | string[] | undefined): string | null => {
  if (!value) return null;
  const scalarValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = scalarValue.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

export const parseFormsListFilters = (searchParams: FormsListSearchParams): FormsListFilters => {
  const rawStatus = normalizeString(searchParams.status);
  const parsedStatus = rawStatus ? parseFormStatus(rawStatus) : null;

  return {
    status: parsedStatus ?? DEFAULT_STATUS_FILTER,
  };
};

export const getFormSubmissionCount = (form: FormsListFormRecord): number => {
  const relationCount = form.submissions?.[0]?.count;
  if (typeof relationCount !== 'number' || Number.isNaN(relationCount)) return 0;
  return relationCount;
};
