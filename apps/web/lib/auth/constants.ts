/**
 * Auth-related constants for web app.
 * OAuth provider ids must match Supabase Auth provider identifiers.
 */

export const AUTH_CALLBACK_PATH = '/auth/callback';

export const OAUTH_PROVIDERS = [
  { id: 'google' as const, label: 'Google' },
  { id: 'github' as const, label: 'GitHub' },
] as const;

export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number]['id'];
