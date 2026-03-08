# T26 – Admin web: CSV export of submissions checklist

**Task:** Implement an endpoint for CSV export of submissions for a given form and a UI button on the submissions table.

**Complexity:** Medium · **Priority:** P1 · **Dependencies:** T15

---

## 1. Export API implementation

- [x] Updated `apps/web/app/api/submissions/export/route.ts`:
  - Fetches form with fields and submissions for the form.
  - CSV format: returns `Response` with `Content-Type: text/csv`, `Content-Disposition: attachment`.
  - JSON format: returns structured payload with submissions array.
  - Max 10,000 rows per export (configurable in `lib/submissions/csv-export.ts`).

---

## 2. CSV builder

- [x] Added `apps/web/lib/submissions/csv-export.ts`:
  - `buildSubmissionsCsv(submissions, formFields)` – flattens payloads into CSV rows.
  - Columns: id, form_id, collector_name, collector_email, submitted_at, latitude, longitude, accuracy, …field keys.
  - Proper CSV escaping for commas, quotes, newlines.

---

## 3. Export button

- [x] Added `apps/web/components/submissions/export-csv-button.tsx`:
  - Client component that fetches `/api/submissions/export?formId=X&format=csv`.
  - Triggers browser download with suggested filename.
- [x] Added Export CSV button to `/forms/[id]/submissions` page header.

---

## Unlocks

- Makes the platform interoperable with Excel, BI tools, and custom pipelines.
