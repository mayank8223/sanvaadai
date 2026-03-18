/**
 * Supabase admin client (service role).
 * Use only on the server for admin operations (e.g. inviteUserByEmail).
 * Never expose the service role key to the client.
 */

import { createClient } from '@supabase/supabase-js';

/* ----------------- Constants --------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/* ----------------- Client --------------- */
export const createAdminClient = () => {
  if (!serviceRoleKey || serviceRoleKey.length < 10) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};
