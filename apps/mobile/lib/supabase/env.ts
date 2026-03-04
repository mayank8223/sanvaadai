const getRequiredEnv = (value: string | undefined, key: string): string => {
  if (value && value.length > 0) {
    return value;
  }

  throw new Error(`Missing Supabase env value: ${key}`);
};

const resolvePublicEnv = (primaryKey: string, fallbackKey: string): string => {
  const primaryValue = process.env[primaryKey];
  const fallbackValue = process.env[fallbackKey];

  return getRequiredEnv(primaryValue ?? fallbackValue, `${primaryKey} (or ${fallbackKey})`);
};

const supabaseUrl = resolvePublicEnv('EXPO_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = resolvePublicEnv(
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
);

export { supabaseAnonKey, supabaseUrl };
