import { AUTH_CALLBACK_PATH } from './constants';

const DEFAULT_REDIRECT_PATH = '/';

/**
 * Builds the full redirect URL for OAuth callback, including optional next path.
 * Used when initiating signInWithOAuth so the callback can redirect the user after login.
 */
export const buildOAuthRedirectUrl = (nextPath: string): string => {
  if (typeof window === 'undefined') return '';
  const base = `${window.location.origin}${AUTH_CALLBACK_PATH}`;
  return nextPath !== DEFAULT_REDIRECT_PATH ? `${base}?next=${encodeURIComponent(nextPath)}` : base;
};
