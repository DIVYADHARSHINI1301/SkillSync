import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { updateProfile } from './profiles';

export interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: unknown;
  requiresEmailVerification?: boolean;
}

/**
 * Register a new user with Supabase Auth
 */
export async function registerUser({
  email,
  password,
  fullName,
}: SignUpParams): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not available.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Check if email confirmation is required
    const requiresVerification = Boolean(
      data.user && !data.session && data.user.identities && data.user.identities.length > 0
    );

    // If session is immediately active and fullName provided, initialize profile
    if (data.session && data.user && fullName?.trim()) {
      await updateProfile(data.user.id, fullName.trim()).catch((err) => {
        console.warn('Initial profile sync warning:', err);
      });
    }

    return {
      success: true,
      user: data.user,
      requiresEmailVerification: requiresVerification,
      message: requiresVerification
        ? 'Account created! Please check your email inbox to verify your account before logging in.'
        : 'Registration successful! Welcome to SkillSync.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Sign in an existing user with Supabase Auth
 */
export async function loginUser({
  email,
  password,
}: SignInParams): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not available.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      message: 'Sign in successful.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Sign out current authenticated user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
