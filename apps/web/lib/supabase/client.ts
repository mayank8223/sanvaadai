/* ----------------- Globals --------------- */
import { createBrowserClient } from '@supabase/ssr';

/* ----------------- Constants --------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Supabase client for Client Components (browser).
 * Use for client-side data fetching, auth, and realtime.
 */
export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
