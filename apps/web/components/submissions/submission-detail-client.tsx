'use client';

/* ----------------- Globals --------------- */
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { SubmissionMapPreview } from './submission-map-preview';

/* ----------------- Types --------------- */
type FormField = {
  id: string;
  key: string;
  label: string;
  type: string;
};

type SubmissionPayload = {
  answers?: Record<string, unknown>;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    captured_at?: string;
  } | null;
  client_submitted_at?: string;
  device?: { platform?: string; app_version?: string };
};

type SubmissionMetadata = {
  flags?: {
    location_missing?: boolean;
    location_poor_accuracy?: boolean;
    location_accuracy_unknown?: boolean;
  };
  source?: string;
  membership_role?: string;
  received_at?: string;
};

type SubmissionDetailClientProps = {
  submission: {
    id: string;
    form_id: string;
    collector_user_id: string | null;
    collector: { full_name: string | null; email: string | null } | null;
    payload: SubmissionPayload;
    metadata: SubmissionMetadata;
    submitted_at: string;
    created_at: string;
    updated_at: string;
  };
  form: {
    id: string;
    title: string;
    fields: FormField[];
  };
};

/* ----------------- Helpers --------------- */
const getCollectorDisplay = (collector: SubmissionDetailClientProps['submission']['collector']) => {
  if (!collector) return '—';
  const name = collector.full_name?.trim();
  const email = collector.email ?? '';
  if (name) return `${name} (${email})`;
  return email || '—';
};

const formatAnswerValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(formatAnswerValue).join(', ');
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if ('latitude' in obj && 'longitude' in obj) {
      return `${(obj.latitude as number).toFixed(6)}, ${(obj.longitude as number).toFixed(6)}`;
    }
    if ('path' in obj) {
      return (obj.path as string) ?? '—';
    }
    return JSON.stringify(value);
  }
  return String(value);
};

const getFieldLabelByKey = (fields: FormField[], key: string): string => {
  const field = fields.find((f) => f.key === key);
  return field?.label ?? key;
};

/* ----------------- Component --------------- */
export const SubmissionDetailClient = ({
  submission,
  form,
}: SubmissionDetailClientProps) => {
  const { payload, metadata } = submission;
  const answers = payload.answers ?? {};
  const location = payload.location;
  const flags = metadata.flags ?? {};
  const fieldKeys = Object.keys(answers);
  const knownFieldKeys = new Set(form.fields.map((f) => f.key));
  const allKeys = [...new Set([...Object.keys(answers), ...knownFieldKeys])];

  const activeFlags: string[] = [];
  if (flags.location_missing) activeFlags.push('No location');
  if (flags.location_poor_accuracy) activeFlags.push('Poor accuracy');
  if (flags.location_accuracy_unknown) activeFlags.push('Accuracy unknown');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Collector, submission time, and location flags.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Collector</p>
              <p className="text-sm">{getCollectorDisplay(submission.collector)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Submitted at</p>
              <p className="text-sm">
                {new Intl.DateTimeFormat('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(submission.submitted_at))}
              </p>
            </div>
            {payload.device?.platform && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Device</p>
                <p className="text-sm">
                  {payload.device.platform}
                  {payload.device.app_version ? ` · ${payload.device.app_version}` : ''}
                </p>
              </div>
            )}
          </div>
          {activeFlags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Flags</p>
              <div className="flex flex-wrap gap-1">
                {activeFlags.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
          <CardDescription>Form field responses from the collector.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {allKeys.map((key) => {
              const label = getFieldLabelByKey(form.fields, key);
              const value = answers[key];
              return (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="text-sm">{formatAnswerValue(value)}</dd>
                </div>
              );
            })}
            {allKeys.length === 0 && (
              <p className="text-sm text-muted-foreground">No answers recorded.</p>
            )}
          </dl>
        </CardContent>
      </Card>

      {location && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              GPS coordinates at submission time.
              {location.accuracy != null && (
                <span className="ml-1">Accuracy: ±{location.accuracy}m</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionMapPreview
              location={{
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
              }}
              alt={`Submission location: ${location.latitude}, ${location.longitude}`}
            />
          </CardContent>
        </Card>
      )}

      {!location && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>No location data was captured for this submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The collector did not provide GPS coordinates when submitting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
