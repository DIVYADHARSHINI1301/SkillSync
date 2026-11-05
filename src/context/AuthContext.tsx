import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabase';
import { getProfile } from '@/services/profiles';
import { ProfileRow } from '@/types/database.types';
import { loginUser, registerUser, logoutUser, SignInParams, SignUpParams, AuthResponse } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  profile: ProfileRow | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (params: SignInParams) => Promise<AuthResponse>;
  signUp: (params: SignUpParams) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  // Load user profile safely
  const loadProfile = async (userId: string) => {
    try {
      const { profile: userProfile } = await getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.warn('Could not load user profile row:', err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    // Check local guest session
    const isGuest = localStorage.getItem('skillsync_guest_session');
    if (isGuest) {
      const guestUser = {
        id: 'guest-preview-00000000-0000-0000-000000000000',
        email: 'reviewer@skillsync.internal',
        app_metadata: {},
        user_metadata: { full_name: 'Guest Reviewer' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(guestUser);
      setProfile({
        id: guestUser.id,
        full_name: 'Guest Reviewer',
        created_at: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        loadProfile(initialSession.user.id);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error('Error getting initial session:', err);
      setIsLoading(false);
    });

    // 2. Listen to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const handleSignIn = async (params: SignInParams): Promise<AuthResponse> => {
    localStorage.removeItem('skillsync_guest_session');
    const res = await loginUser(params);
    return res;
  };

  const handleSignUp = async (params: SignUpParams): Promise<AuthResponse> => {
    localStorage.removeItem('skillsync_guest_session');
    const res = await registerUser(params);
    return res;
  };

  const handleSignOut = async (): Promise<void> => {
    localStorage.removeItem('skillsync_guest_session');
    await logoutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const handleSignInAsGuest = () => {
    localStorage.setItem('skillsync_guest_session', 'true');
    const guestUser = {
      id: 'guest-preview-00000000-0000-0000-000000000000',
      email: 'guest@skillsync.internal',
      app_metadata: {},
      user_metadata: { full_name: 'Guest Reviewer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setUser(guestUser);
    setProfile({
      id: guestUser.id,
      full_name: 'Guest Reviewer',
      created_at: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        refreshProfile,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        signInAsGuest: handleSignInAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
