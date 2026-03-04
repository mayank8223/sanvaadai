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
