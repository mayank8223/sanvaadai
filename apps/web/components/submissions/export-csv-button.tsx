'use client';

/* ----------------- Globals --------------- */
import { useState } from 'react';

import { Button } from '@/components/ui/button';

/* ----------------- Types --------------- */
type ExportCsvButtonProps = {
  formId: string;
  formTitle: string;
  disabled?: boolean;
};

/* ----------------- Helpers --------------- */
const getSuggestedFilename = (formTitle: string): string => {
  const sanitized = formTitle.replace(/[^a-z0-9-_]/gi, '-');
  const date = new Date().toISOString().slice(0, 10);
  return `submissions-${sanitized}-${date}.csv`;
};

/* ----------------- Component --------------- */
export const ExportCsvButton = ({
  formId,
  formTitle,
  disabled = false,
}: ExportCsvButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/submissions/export?formId=${encodeURIComponent(formId)}&format=csv`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getSuggestedFilename(formTitle);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || isExporting}
      onClick={() => void handleExport()}
    >
      {isExporting ? 'Exporting…' : 'Export CSV'}
    </Button>
  );
};
