/* ----------------- Constants --------------- */
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

/* ----------------- Types --------------- */
export type CreateSubmissionInput = {
  form_id: string;
  answers: Record<string, unknown>;
  client_submitted_at?: string;
  device?: {
    platform?: string;
    app_version?: string;
  };
};

export type ListSubmissionsQuery = {
  formId: string;
  limit: number;
  offset: number;
  collectorUserId: string | null;
  submittedAfter: string | null;
  submittedBefore: string | null;
};

export type ExportSubmissionsQuery = {
  formId: string;
  format: 'csv' | 'json';
};

/* ----------------- Helpers --------------- */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const parseIsoDateTimeString = (value: unknown): string | null => {
  const parsedValue = parseString(value);
  if (!parsedValue) return null;
  const timestamp = Date.parse(parsedValue);
  if (Number.isNaN(timestamp)) return null;
  return parsedValue;
};

const parsePositiveInteger = (value: string | null): number | null => {
  if (!value) return null;
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue) || Number.isNaN(parsedValue)) return null;
  if (parsedValue < 0) return null;
  return parsedValue;
};

/* ----------------- Parsers --------------- */
export const parseCreateSubmissionInput = (value: unknown): CreateSubmissionInput | null => {
  if (!isObjectRecord(value)) return null;

  const formId = parseString(value.form_id);
  if (!formId) return null;

  if (!isObjectRecord(value.answers)) return null;

  const parsedInput: CreateSubmissionInput = {
    form_id: formId,
    answers: value.answers,
  };

  if (Object.prototype.hasOwnProperty.call(value, 'client_submitted_at')) {
    const submittedAt = parseIsoDateTimeString(value.client_submitted_at);
    if (!submittedAt) return null;
    parsedInput.client_submitted_at = submittedAt;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'device')) {
    if (!isObjectRecord(value.device)) return null;

    const platform =
      value.device.platform === undefined ? undefined : parseString(value.device.platform);
    const appVersion =
      value.device.app_version === undefined ? undefined : parseString(value.device.app_version);

    if (value.device.platform !== undefined && !platform) return null;
    if (value.device.app_version !== undefined && !appVersion) return null;

    parsedInput.device = {};
    if (platform) parsedInput.device.platform = platform;
    if (appVersion) parsedInput.device.app_version = appVersion;
  }

  return parsedInput;
};

export const parseListSubmissionsQuery = (requestUrl: URL): ListSubmissionsQuery | null => {
  const formId = parseString(requestUrl.searchParams.get('formId'));
  if (!formId) return null;

  const requestedLimit = parsePositiveInteger(requestUrl.searchParams.get('limit'));
  if (requestUrl.searchParams.has('limit') && requestedLimit === null) return null;

  const requestedOffset = parsePositiveInteger(requestUrl.searchParams.get('offset'));
  if (requestUrl.searchParams.has('offset') && requestedOffset === null) return null;

  const collectorUserId = parseString(requestUrl.searchParams.get('collectorUserId'));

  const rawSubmittedAfter = requestUrl.searchParams.get('submittedAfter');
  const submittedAfter =
    rawSubmittedAfter === null ? null : parseIsoDateTimeString(rawSubmittedAfter);
  if (rawSubmittedAfter !== null && !submittedAfter) return null;

  const rawSubmittedBefore = requestUrl.searchParams.get('submittedBefore');
  const submittedBefore =
    rawSubmittedBefore === null ? null : parseIsoDateTimeString(rawSubmittedBefore);
  if (rawSubmittedBefore !== null && !submittedBefore) return null;

  return {
    formId,
    limit: Math.min(requestedLimit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT),
    offset: requestedOffset ?? 0,
    collectorUserId,
    submittedAfter,
    submittedBefore,
  };
};

export const parseExportSubmissionsQuery = (requestUrl: URL): ExportSubmissionsQuery | null => {
  const formId = parseString(requestUrl.searchParams.get('formId'));
  if (!formId) return null;

  const rawFormat = requestUrl.searchParams.get('format');
  if (!rawFormat) {
    return {
      formId,
      format: 'csv',
    };
  }

  const normalizedFormat = rawFormat.trim().toLowerCase();
  if (normalizedFormat !== 'csv' && normalizedFormat !== 'json') return null;

  return {
    formId,
    format: normalizedFormat,
  };
};
