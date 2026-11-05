import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Support both standard names
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabasePublishableKey) &&
    !supabaseUrl.includes('your-project-id') &&
    !supabasePublishableKey.includes('your-supabase-publishable-key')
  );
};

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  hasKey: Boolean(supabasePublishableKey),
  isConfigured: isSupabaseConfigured(),
});

// Singleton client instance
let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient<Database>(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

// Check connection to Supabase
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase configuration missing in .env (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      message: 'Unable to initialize Supabase client.',
    };
  }

  try {
    // Attempt a light query on the job_roles table
    const { error } = await supabase.from('job_roles').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Database query returned: ${error.message}`,
        error: error.message,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase Synvora database.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: 'Network or authentication failure when connecting to Supabase.',
      error: msg,
    };
  }
}
