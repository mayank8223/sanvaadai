/**
 * T26 – CSV export helpers for submissions.
 * Flattens submission payloads into CSV rows with form field columns.
 */

/* ----------------- Constants --------------- */
export const MAX_EXPORT_ROWS = 10_000;

/* ----------------- Types --------------- */
type FormField = {
  key: string;
  label: string;
};

type SubmissionRow = {
  id: string;
  form_id: string;
  collector_user_id: string | null;
  collector_name: string | null;
  collector_email: string | null;
  submitted_at: string;
  payload: {
    answers?: Record<string, unknown>;
    location?: {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
    } | null;
  };
  metadata: { flags?: Record<string, boolean> };
};

/* ----------------- Helpers --------------- */
const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatAnswerForCsv = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if ('latitude' in obj && 'longitude' in obj) {
      return `${obj.latitude},${obj.longitude}`;
    }
    if ('path' in obj) return String(obj.path ?? '');
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * Build CSV content from submissions and form fields.
 * Columns: id, form_id, collector_name, collector_email, submitted_at, latitude, longitude, accuracy, ...field keys
 */
export const buildSubmissionsCsv = (
  submissions: SubmissionRow[],
  formFields: FormField[]
): string => {
  const fieldKeys = formFields.map((f) => f.key);
  const baseHeaders = [
    'id',
    'form_id',
    'collector_name',
    'collector_email',
    'submitted_at',
    'latitude',
    'longitude',
    'accuracy',
  ];
  const answerHeaders = fieldKeys.length > 0 ? fieldKeys : [];
  const headers = [...baseHeaders, ...answerHeaders];

  const rows = submissions.map((sub) => {
    const payload = sub.payload ?? {};
    const answers = payload.answers ?? {};
    const location = payload.location;

    const baseValues = [
      sub.id,
      sub.form_id,
      sub.collector_name ?? '',
      sub.collector_email ?? '',
      sub.submitted_at,
      location?.latitude ?? '',
      location?.longitude ?? '',
      location?.accuracy ?? '',
    ];
    const answerValues = fieldKeys.map((key) => formatAnswerForCsv(answers[key]));
    return [...baseValues, ...answerValues];
  });

  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...dataLines].join('\r\n');
};
