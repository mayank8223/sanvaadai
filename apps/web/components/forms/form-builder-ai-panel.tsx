'use client';

/**
 * T31 – AI assistant panel for form creation.
 * Side panel for describing forms via text or voice, generating with AI, and applying to builder.
 */

/* ----------------- Globals --------------- */
import {
  MicIcon,
  MicOffIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FieldTypeIcon } from '@/components/forms/field-type-icon';
import useAiFormAssistant from '@/hooks/useAiFormAssistant';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import type { FormBuilderSubmitPayload } from '@/lib/forms/builder';

/* ----------------- Types --------------- */
type FormBuilderAiPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onApplyForm: (payload: FormBuilderSubmitPayload) => void;
};

/* ----------------- Component --------------- */
const FormBuilderAiPanel = ({
  isOpen,
  onClose,
  onApplyForm,
}: FormBuilderAiPanelProps) => {
  const {
    description,
    setDescription,
    isTranscribing,
    isGenerating,
    generatedForm,
    error,
    transcribeFromAudio,
    generateForm,
    applyAndClose,
    clearError,
  } = useAiFormAssistant({ onApplyForm });

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError,
    clearError: clearRecorderError,
  } = useAudioRecorder();

  const handleMicClick = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        await transcribeFromAudio(blob);
      }
    } else {
      await startRecording();
    }
  };

  const handleApply = () => {
    applyAndClose();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close panel"
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-lg"
        role="dialog"
        aria-label="AI form assistant"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">AI form assistant</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </Button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Describe your form in natural language. Type or use the microphone to dictate.
          </p>

          <div className="mb-4 flex gap-2">
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError();
                clearRecorderError();
              }}
              placeholder="e.g. School meal verification with school name, date, meal count, and photo upload"
              className="min-h-24 flex-1"
              disabled={isTranscribing || isGenerating}
            />
            <Button
              type="button"
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={() => void handleMicClick()}
              disabled={isTranscribing || isGenerating}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              title={isRecording ? 'Stop recording' : 'Record voice'}
            >
              {isRecording ? (
                <MicOffIcon className="size-4" />
              ) : (
                <MicIcon className="size-4" />
              )}
            </Button>
          </div>

          {(error || recorderError) && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error ?? recorderError}
            </div>
          )}

          <Button
            type="button"
            className="mb-6 w-full"
            onClick={() => void generateForm()}
            disabled={!description.trim() || isTranscribing || isGenerating}
          >
            {isGenerating ? (
              'Generating...'
            ) : (
              <>
                <SparklesIcon className="size-4" />
                Generate form
              </>
            )}
          </Button>

          {generatedForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generated form</CardTitle>
                <CardDescription>
                  {generatedForm.title} · {generatedForm.fields.length} fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {generatedForm.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 rounded border border-border px-2 py-1.5 text-sm"
                    >
                      <FieldTypeIcon type={field.type} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{field.label}</span>
                      <span className="text-xs text-muted-foreground">({field.type})</span>
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => void generateForm()}
                  >
                    Regenerate
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleApply}>
                    Apply to builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </aside>
    </>
  );
};

export default FormBuilderAiPanel;
