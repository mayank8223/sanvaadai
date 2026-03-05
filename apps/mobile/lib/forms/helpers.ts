/* ----------------- Types --------------- */
export type CollectorFormRecord = {
  id: string;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  updated_at: string;
  published_at: string | null;
  organization_id: string;
  version: number;
};

/* ----------------- Helpers --------------- */
export const formatRelativeDateLabel = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
};

export const buildFormMetadataLine = (form: CollectorFormRecord): string => {
  const updatedLabel = formatRelativeDateLabel(form.updated_at);
  const versionLabel = `v${form.version}`;
  return `${versionLabel} • Updated ${updatedLabel}`;
};
