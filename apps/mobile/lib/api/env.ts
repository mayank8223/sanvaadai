/* ----------------- Helpers --------------- */
const getRequiredEnv = (value: string | undefined, key: string): string => {
  if (value && value.length > 0) {
    return value;
  }

  throw new Error(`Missing API env value: ${key}`);
};

const resolvePublicEnv = (primaryKey: string, fallbackKey: string): string => {
  const primaryValue = process.env[primaryKey];
  const fallbackValue = process.env[fallbackKey];
  return getRequiredEnv(primaryValue ?? fallbackValue, `${primaryKey} (or ${fallbackKey})`);
};

/* ----------------- Exports --------------- */
const apiBaseUrl = resolvePublicEnv('EXPO_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_APP_URL');

export { apiBaseUrl };
