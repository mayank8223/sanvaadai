'use client';

/**
 * T34 – Web collector form fill with AI voice assistant.
 */

/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@/lib/forms/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import {
  CalendarDaysIcon,
  HashIcon,
  ListChecksIcon,
  MapPinIcon,
  MicIcon,
  MicOffIcon,
  PaperclipIcon,
  SparklesIcon,
  TypeIcon,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useAiAnswerAssistant from '@/hooks/useAiAnswerAssistant';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import {
  buildDefaultDraftAnswers,
  buildSubmissionPayload,
  validateAndBuildSubmissionAnswers,
  type DraftAnswers,
  type DraftFieldErrors,
} from '@/lib/forms/collector-fill';

/* ----------------- Types --------------- */
type CollectorFormFillClientProps = {
  form: {
    id: string;
    organization_id: string;
    title: string;
    description: string | null;
    fields: FormFieldDefinition[];
  };
  backHref: string;
};

/* ----------------- Constants --------------- */
const FIELD_TYPE_ICONS: Record<FormFieldDefinition['type'], LucideIcon> = {
  text: TypeIcon,
  number: HashIcon,
  date: CalendarDaysIcon,
  select: ListChecksIcon,
  file: PaperclipIcon,
  location: MapPinIcon,
};

/* ----------------- Component --------------- */
const CollectorFormFillClient = ({ form, backHref }: CollectorFormFillClientProps) => {
  const router = useRouter();
  const [draftAnswers, setDraftAnswers] = useState<DraftAnswers>(() =>
    buildDefaultDraftAnswers(form.fields)
  );
  const [fieldErrors, setFieldErrors] = useState<DraftFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const applyDraftAnswers = useCallback((answers: Record<string, string>) => {
    setDraftAnswers((prev) => ({ ...prev, ...answers }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(answers)) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const aiAssistant = useAiAnswerAssistant({
    fields: form.fields,
    onApplyAnswers: applyDraftAnswers,
  });

  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();

  const handleMicClick = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        await aiAssistant.transcribeFromAudio(blob);
      }
    } else {
      await startRecording();
    }
  };

  const handleFieldChange = useCallback((fieldKey: string, value: string) => {
    setDraftAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const { answers, errors } = validateAndBuildSubmissionAnswers(form.fields, draftAnswers);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError('Please fix the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildSubmissionPayload(form.id, answers);

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; submission?: { id?: string } };

      if (!response.ok) {
        throw new Error(data.error ?? 'Submission failed');
      }

      router.push(backHref);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [form.id, form.fields, draftAnswers, backHref, router]);

  const handleFetchAndApply = async () => {
    await aiAssistant.fetchAndApplyDraft();
  };

  const isProcessing = aiAssistant.isTranscribing || aiAssistant.isFetchingDraft;

  return (
    <section className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fill form</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description ? (
            <CardDescription>{form.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI voice assistant */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="size-4 text-primary" />
              Fill via voice
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Record or type your answers and we&apos;ll map them to the form fields.
            </p>
            <Textarea
              value={aiAssistant.transcription}
              onChange={(e) => {
                aiAssistant.setTranscription(e.target.value);
                aiAssistant.clearError();
              }}
              placeholder="e.g. School name is ABC Primary, date is 2026-03-08, meal count 45"
              className="mb-3"
              disabled={isProcessing || isSubmitting}
            />
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => void handleMicClick()}
                  disabled={isProcessing || isSubmitting}
                  aria-label={isRecording ? 'Stop recording' : 'Record'}
                >
                  {isRecording ? (
                    <MicOffIcon className="size-4" />
                  ) : (
                    <MicIcon className="size-4" />
                  )}
                  {isRecording ? ' Stop' : ' Record'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleFetchAndApply()}
                  disabled={!aiAssistant.transcription.trim() || isProcessing || isSubmitting}
                >
                  {aiAssistant.isFetchingDraft ? 'Processing...' : 'Apply to form'}
                </Button>
              </div>
              {(aiAssistant.error || recorderError) && (
                <p className="w-full text-xs text-destructive">
                  {aiAssistant.error ?? recorderError}
                </p>
              )}
              {aiAssistant.followUpQuestions.length > 0 && (
                <div className="w-full rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
                  <p className="font-medium text-amber-800">Follow-up:</p>
                  {aiAssistant.followUpQuestions.map((q) => (
                    <p key={q.fieldKey} className="text-amber-700">
                      {q.question}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {form.fields.map((field) => {
              const Icon = FIELD_TYPE_ICONS[field.type];
              const value = draftAnswers[field.key] ?? '';
              const error = fieldErrors[field.key];

              return (
                <div key={field.id} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-muted-foreground" />
                    {field.label}
                    {field.required ? <span className="text-destructive">*</span> : null}
                  </label>
                  {field.help_text ? (
                    <p className="text-xs text-muted-foreground">{field.help_text}</p>
                  ) : null}
                  {field.type === 'select' ? (
                    <Select
                      value={value || undefined}
                      onValueChange={(v) => handleFieldChange(field.key, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(field.options) ? field.options : []).map((opt: { value: string; label: string }) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      value={value}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={
                        field.type === 'location'
                          ? 'lat, long, accuracy'
                          : field.type === 'file'
                            ? 'File path'
                            : undefined
                      }
                    />
                  )}
                  {error ? (
                    <p className="text-xs text-destructive">{error}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default CollectorFormFillClient;
