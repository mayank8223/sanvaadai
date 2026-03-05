/* ----------------- Globals --------------- */
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

/* ----------------- Types --------------- */
type UserProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type SupabaseInsertResult = {
  error: { message: string } | null;
};

type SupabaseUsersTableClient = {
  upsert: (
    values: UserProfileRow,
    options?: { onConflict?: string; ignoreDuplicates?: boolean }
  ) => PromiseLike<SupabaseInsertResult> | SupabaseInsertResult;
};

type SupabaseClientLike = {
  from: (table: string) => SupabaseUsersTableClient;
};

/* ----------------- Helpers --------------- */
const readMetadataString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const toUserProfileRow = (user: SupabaseAuthUser): UserProfileRow => {
  const metadata = user.user_metadata ?? {};
  const fullName = readMetadataString(metadata.full_name) ?? readMetadataString(metadata.name);
  const avatarUrl = readMetadataString(metadata.avatar_url) ?? readMetadataString(metadata.picture);

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
  };
};

/* ----------------- Sync --------------- */
export const syncUserProfile = async (
  supabase: SupabaseClientLike,
  user: SupabaseAuthUser
): Promise<void> => {
  const payload = toUserProfileRow(user);
  const { error } = await supabase.from('users').upsert(payload, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Failed to sync user profile: ${error.message}`);
  }
};
