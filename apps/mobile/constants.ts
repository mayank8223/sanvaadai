/**
 * Shared constants for the collector mobile app.
 * Keeps app name and copy in one place for screens and future i18n.
 */

export const APP_NAME = 'Sanvaadai Collector';

export const APP_TAGLINE = 'Field data collection';

export const AUTH_COPY = {
  loginSubtitle: 'Sign in with your collector account',
  emailPlaceholder: 'name@organization.com',
  passwordPlaceholder: 'Your password',
  signInLabel: 'Sign in',
  signingInLabel: 'Signing in...',
  signOutLabel: 'Sign out',
  welcomeTitle: 'You are signed in',
  unknownEmailLabel: 'Unknown email',
  invalidCredentialsMessage: 'Invalid email or password.',
  genericAuthErrorMessage: 'Unable to authenticate. Please try again.',
} as const;

export const FORMS_COPY = {
  title: 'Available forms',
  subtitle: 'Published forms assigned to your organization',
  emptyState: 'No published forms are available right now.',
  loadingState: 'Loading forms...',
  refreshLabel: 'Refresh forms',
  openFormLabel: 'Open form',
} as const;

export const FORM_FILL_COPY = {
  title: 'Fill form',
  backLabel: 'Back to list',
  submitLabel: 'Submit response',
  submittingLabel: 'Submitting...',
  retryLabel: 'Retry last submit',
  textPlaceholder: 'Enter text',
  numberPlaceholder: 'Enter number',
  datePlaceholder: 'YYYY-MM-DD',
  selectPlaceholder: 'Choose an option',
  filePlaceholder: 'Enter uploaded file path',
  locationPlaceholder: 'lat,long,accuracy',
  fillViaVoiceLabel: 'Fill via voice',
  recordingLabel: 'Recording... Tap to stop',
  processingLabel: 'Processing...',
  voiceFillErrorTitle: 'Voice fill',
} as const;

export const OFFLINE_COPY = {
  usingCachedFormsMessage: 'Showing cached forms while connection is unavailable.',
  queuedSubmissionLabel: 'Submission queued for sync.',
  queuedSummaryLabel: 'Queued submissions',
  syncingQueueLabel: 'Syncing queued submissions...',
  syncQueueLabel: 'Sync now',
} as const;

export const GPS_COPY = {
  capturingLabel: 'Capturing GPS location...',
  capturedLabel: 'GPS location captured',
  permissionDeniedLabel: 'Location permission denied. Submission will proceed without GPS.',
  enablePermissionLabel: 'Enable location',
  permissionGrantedStatus: 'Location: enabled',
  permissionDeniedStatus: 'Location: disabled',
  permissionUndeterminedStatus: 'Location: not set',
} as const;
