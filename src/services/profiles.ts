import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { ProfileRow } from '@/types/database.types';

/**
 * Retrieve user profile from the profiles table.
 * Returns null if no row has been created yet.
 */
export async function getProfile(userId: string): Promise<{
  profile: ProfileRow | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured() || !userId) {
    return { profile: null, error: null };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { profile: null, error: 'Supabase client is not available.' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile from profiles table:', error);
      return { profile: null, error: error.message };
    }

    return { profile: data as ProfileRow | null, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { profile: null, error: msg };
  }
}

/**
 * Upsert or create user profile in the profiles table.
 * If no profile row exists, it safely inserts one.
 */
export async function updateProfile(
  userId: string,
  fullName: string
): Promise<{
  profile: ProfileRow | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured() || !userId) {
    return {
      profile: null,
      error: 'Cannot update profile: Supabase connection is not active.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { profile: null, error: 'Supabase client is unavailable.' };
  }

  try {
    const now = new Date().toISOString();
    const payload = {
      id: userId,
      full_name: fullName.trim(),
      updated_at: now,
    };

    const { data, error } = await (supabase
      .from('profiles') as any)
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return {
        profile: null,
        error: `Failed to update profile: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    return { profile: data as ProfileRow, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { profile: null, error: `Unexpected error: ${msg}` };
  }
}
