'use client';

/* ----------------- Globals --------------- */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  HashIcon,
  ListChecksIcon,
  MapPinIcon,
  PaperclipIcon,
  TypeIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useFormBuilder from '@/hooks/useFormBuilder';
import { FORM_FIELD_TYPES } from '@/lib/forms/contracts';
import { type BuilderFormRecord } from '@/lib/forms/builder';

/* ----------------- Types --------------- */
type FormBuilderScreenProps = {
  mode: 'create' | 'edit';
  initialForm?: BuilderFormRecord;
};

/* ----------------- Constants --------------- */
const STATUS_BACK_PATH = '/forms';
const FIELD_TYPE_LABELS: Record<(typeof FORM_FIELD_TYPES)[number], string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  select: 'Select',
  file: 'File',
  location: 'Location',
};
const FIELD_TYPE_ICONS: Record<(typeof FORM_FIELD_TYPES)[number], LucideIcon> = {
  text: TypeIcon,
  number: HashIcon,
  date: CalendarDaysIcon,
  select: ListChecksIcon,
  file: PaperclipIcon,
  location: MapPinIcon,
};

const getNumericInputValue = (value: unknown): string | number =>
  typeof value === 'number' ? value : '';

/* ----------------- Component --------------- */
const FormBuilderScreen = ({ mode, initialForm }: FormBuilderScreenProps) => {
  const router = useRouter();
  const {
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
  } = useFormBuilder({
    initialForm,
    onComplete: () => {
      router.refresh();
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'create' ? 'Create form' : 'Edit form'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Build forms manually with field-level controls and live preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={STATUS_BACK_PATH}>Back to forms</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            variant="outline"
            onClick={() => void submitForm('DRAFT')}
          >
            {isSubmitting ? 'Saving...' : 'Save draft'}
          </Button>
          <Button disabled={isSubmitting} onClick={() => void submitForm('PUBLISHED')}>
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </header>

      {(errorMessage || successMessage) && (
        <Card className={errorMessage ? 'border-destructive/50' : 'border-green-500'}>
          <CardContent className="pt-6">
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : (
              <p className="text-sm text-green-500">{successMessage}</p>
            )}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Field palette</CardTitle>
            <CardDescription>Add fields to this form definition.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FORM_FIELD_TYPES.map((fieldType) =>
              (() => {
                const FieldTypeIcon = FIELD_TYPE_ICONS[fieldType];
                return (
                  <Button
                    key={fieldType}
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addField(fieldType)}
                  >
                    <FieldTypeIcon />
                    {FIELD_TYPE_LABELS[fieldType]}
                  </Button>
                );
              })()
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Form configuration</CardTitle>
            <CardDescription>Title, description, and selected field settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="form-title" className="text-sm font-medium text-foreground">
                Title
              </label>
              <Input
                id="form-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Daily School Meal Verification"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="form-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="form-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Optional context for collectors."
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Fields ({fields.length})</p>
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {fields.map((field, index) =>
                  (() => {
                    const FieldTypeIcon = FIELD_TYPE_ICONS[field.type];
                    return (
                      <button
                        key={field.id}
                        type="button"
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                          selectedFieldId === field.id
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border text-muted-foreground'
                        }`}
                        onClick={() => setSelectedFieldId(field.id)}
                      >
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <FieldTypeIcon className="size-4 text-muted-foreground" />
                          {field.label || `Field ${index + 1}`}
                        </span>
                        <span className="ml-6 text-xs uppercase text-muted-foreground">
                          {field.type}
                        </span>
                      </button>
                    );
                  })()
                )}
              </div>
            </div>

            {selectedField && (
              <div className="space-y-3 rounded-md border border-border p-3">
                {(() => {
                  const SelectedFieldTypeIcon = FIELD_TYPE_ICONS[selectedField.type];
                  return (
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <SelectedFieldTypeIcon className="size-4 text-muted-foreground" />
                      Selected field configuration
                    </p>
                  );
                })()}

                <Input
                  value={selectedField.label}
                  onChange={(event) =>
                    updateField({ fieldId: selectedField.id, patch: { label: event.target.value } })
                  }
                  placeholder="Field label"
                />

                <Input
                  value={selectedField.key}
                  onChange={(event) =>
                    updateField({ fieldId: selectedField.id, patch: { key: event.target.value } })
                  }
                  placeholder="field_key"
                />

                <textarea
                  value={selectedField.help_text ?? ''}
                  onChange={(event) =>
                    updateField({
                      fieldId: selectedField.id,
                      patch: { help_text: event.target.value },
                    })
                  }
                  className="min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Optional helper text"
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={(event) =>
                      updateField({
                        fieldId: selectedField.id,
                        patch: { required: event.target.checked },
                      })
                    }
                  />
                  Required field
                </label>

                {selectedField.type === 'select' && (
                  <textarea
                    value={selectedFieldOptionsInput}
                    onChange={(event) =>
                      updateField({
                        fieldId: selectedField.id,
                        patch: { optionsInput: event.target.value },
                      })
                    }
                    className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={'One option per line\nBreakfast\nLunch'}
                  />
                )}

                {selectedField.type === 'number' && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={getNumericInputValue(selectedField.min)}
                      onChange={(event) =>
                        updateField({
                          fieldId: selectedField.id,
                          patch: {
                            min: event.target.value.length > 0 ? Number(event.target.value) : null,
                          },
                        })
                      }
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={getNumericInputValue(selectedField.max)}
                      onChange={(event) =>
                        updateField({
                          fieldId: selectedField.id,
                          patch: {
                            max: event.target.value.length > 0 ? Number(event.target.value) : null,
                          },
                        })
                      }
                      placeholder="Max"
                    />
                  </div>
                )}

                {selectedField.type === 'location' && (
                  <Input
                    type="number"
                    value={getNumericInputValue(selectedField.require_gps_accuracy_meters)}
                    onChange={(event) =>
                      updateField({
                        fieldId: selectedField.id,
                        patch: {
                          require_gps_accuracy_meters:
                            event.target.value.length > 0 ? Number(event.target.value) : null,
                        },
                      })
                    }
                    placeholder="Required GPS accuracy (meters)"
                  />
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveField(selectedField.id, -1)}
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveField(selectedField.id, 1)}
                  >
                    Move down
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeField(selectedField.id)}
                  >
                    Remove field
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>Collector-facing form structure preview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{title || 'Untitled form'}</p>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add fields from the palette to preview the form.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field) =>
                  (() => {
                    const FieldTypeIcon = FIELD_TYPE_ICONS[field.type];
                    return (
                      <div key={field.id} className="rounded-md border border-border p-3">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <FieldTypeIcon className="size-4 text-muted-foreground" />
                          {field.label}{' '}
                          {field.required ? (
                            <span className="text-xs text-destructive">*</span>
                          ) : null}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {field.type}
                        </p>
                        {field.help_text && (
                          <p className="text-xs text-muted-foreground">{field.help_text}</p>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default FormBuilderScreen;
