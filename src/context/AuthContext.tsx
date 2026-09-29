import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';
import { AuthModal } from '../components/AuthModal';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDev?: boolean;
}

export type AuthUser = AppUser;

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  loginWithGoogle: (preferRedirect?: boolean) => Promise<void>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
  loginAsDev: () => void;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  isAuthConfigured: boolean;
  isClerkConfigured: boolean; // backward-compatibility alias
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isSigningIn: false,
  authError: null,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => ({ success: false, message: '' }),
  verifyOtp: async () => ({ success: false, message: '' }),
  loginAsDev: () => {},
  logout: async () => {},
  clearAuthError: () => {},
  isAuthConfigured: false,
  isClerkConfigured: false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showError, showWarning, showSuccess } = useToast();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Local Dev User state
  const [devUser, setDevUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('codesage_dev_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Safety fallback timeout to never block UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Supabase Auth session & real-time state listeners
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[Supabase Auth] Session fetch error:', error.message);
      }
      if (session?.user) {
        setSupabaseUser(session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.warn('[Supabase Auth] Error initializing session:', err);
      setLoading(false);
    });

    // 2. Subscribe to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        if (event === 'SIGNED_IN') {
          // If signed in with real Supabase account, clear dev profile
          localStorage.removeItem('codesage_dev_user');
          setDevUser(null);
          setIsAuthModalOpen(false);
        }
      } else {
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Compute active user (devUser takes priority if manually selected; otherwise real Supabase user)
  const user: AuthUser | null = devUser
    ? devUser
    : supabaseUser
    ? {
        uid: supabaseUser.id,
        displayName:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.user_metadata?.user_name ||
          supabaseUser.email?.split('@')[0] ||
          'CodeSage User',
        email: supabaseUser.email || null,
        photoURL:
          supabaseUser.user_metadata?.avatar_url ||
          supabaseUser.user_metadata?.picture ||
          null,
        isDev: false,
      }
    : null;

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginWithGoogle = async () => {
    if (!supabase) {
      const msg = 'Supabase credentials are not configured in your environment.';
      setAuthError(msg);
      showWarning(msg, 'Auth Unconfigured', 6000);
      return;
    }

    setIsSigningIn(true);
    setAuthError(null);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('[Supabase Auth] Google login error:', err);
      const rawMsg = err?.message || 'Failed to initiate sign-in with Google.';
      let userFriendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes('provider is not enabled') || rawMsg.toLowerCase().includes('unsupported provider')) {
        userFriendlyMsg = 'Google sign-in is not enabled in your Supabase Dashboard yet. You can sign in using Email Magic Link below, or enable Google under Authentication > Providers in Supabase.';
      }
      setAuthError(userFriendlyMsg);
      showError(userFriendlyMsg, 'Sign In Notice', 7000);
      setIsAuthModalOpen(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
      const msg = 'Supabase credentials are not configured in your environment.';
      setAuthError(msg);
      showWarning(msg, 'Auth Unconfigured', 6000);
      return { success: false, message: msg };
    }

    setIsSigningIn(true);
    setAuthError(null);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      const successMsg = 'We sent a login code / magic link to your email.';
      showSuccess(successMsg, 'Check Your Inbox');
      return { success: true, message: successMsg };
    } catch (err: any) {
      console.error('[Supabase Auth] Email sign in error:', err);
      const msg = err?.message || 'Failed to send login email.';
      setAuthError(msg);
      showError(msg, 'Sign In Error', 6000);
      return { success: false, message: msg };
    } finally {
      setIsSigningIn(false);
    }
  };

  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured.' };
    }

    setIsSigningIn(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });

      if (error) throw error;

      if (data.user) {
        setSupabaseUser(data.user);
        setIsAuthModalOpen(false);
        showSuccess('Welcome back!', 'Signed In Successfully');
        return { success: true, message: 'Signed in successfully!' };
      }

      return { success: false, message: 'No user returned from verification.' };
    } catch (err: any) {
      console.error('[Supabase Auth] Verify OTP error:', err);
      const msg = err?.message || 'Invalid or expired verification code.';
      setAuthError(msg);
      showError(msg, 'Verification Error', 6000);
      return { success: false, message: msg };
    } finally {
      setIsSigningIn(false);
    }
  };

  const loginAsDev = () => {
    const mockDev: AppUser = {
      uid: 'dev-user-avnish',
      displayName: 'Avnish (Dev)',
      email: 'avnish@codesage.local',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Avnish',
      isDev: true,
    };
    try {
      localStorage.setItem('codesage_dev_user', JSON.stringify(mockDev));
    } catch {
      // ignore
    }
    setDevUser(mockDev);
    setAuthError(null);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('codesage_dev_user');
      setDevUser(null);
      if (supabase) {
        await supabase.auth.signOut();
      }
      setSupabaseUser(null);
    } catch (err) {
      console.error('[Supabase Auth] Sign out error:', err);
    } finally {
      setAuthError(null);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSigningIn,
        authError,
        loginWithGoogle,
        loginWithEmail,
        verifyOtp,
        loginAsDev,
        logout,
        clearAuthError,
        isAuthConfigured: isSupabaseConfigured,
        isClerkConfigured: isSupabaseConfigured,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
};
