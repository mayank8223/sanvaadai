import { createClient } from '@supabase/supabase-js';

import { supabaseAnonKey, supabaseUrl } from './env';
import { secureStoreAdapter } from './storage';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { supabase };
