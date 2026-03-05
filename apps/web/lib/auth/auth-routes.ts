/* ----------------- Globals --------------- */
import { HOME_PATH } from '@/lib/auth/home-routing';

/* ----------------- Helpers --------------- */
export const getAuthPageRedirectPath = (hasSession: boolean): string | null =>
  hasSession ? HOME_PATH : null;
