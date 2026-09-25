import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  getRedirectResult,
  type User,
} from '../lib/firebase';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDev?: boolean;
}

export type AuthUser = (User & { isDev?: boolean }) | AppUser;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  loginWithGoogle: (preferRedirect?: boolean) => Promise<void>;
  loginAsDev: () => void;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSigningIn: false,
  authError: null,
  loginWithGoogle: async () => {},
  loginAsDev: () => {},
  logout: async () => {},
  clearAuthError: () => {},
});

function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is not enabled yet in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method, click Google, and toggle "Enable".';
    case 'auth/unauthorized-domain':
      return 'Google AI Studio manages authorized domains in Google Cloud Console. Click "Dev Login" below to test locally immediately, or add localhost in Google Cloud Console > Identity Platform.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for localhost:3000, or try the redirect flow.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup window was closed before completion.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was interrupted by another action.';
    default:
      return error.message || `Authentication error: ${code}`;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for saved local dev session first
    const savedDevUser = localStorage.getItem('codesage_dev_user');
    if (savedDevUser) {
      try {
        const parsed = JSON.parse(savedDevUser);
        setUser(parsed);
        setLoading(false);
      } catch {
        // ignore JSON parse error
      }
    }

    // 2. Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('codesage_dev_user');
      } else if (!localStorage.getItem('codesage_dev_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    // 3. Check for redirect results (if redirect flow was triggered)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          localStorage.removeItem('codesage_dev_user');
          setAuthError(null);
        }
      })
      .catch((error: any) => {
        if (error.code !== 'auth/popup-closed-by-user') {
          console.error('[Auth] Redirect sign-in error:', error);
          setAuthError(getFriendlyAuthErrorMessage(error));
        }
      });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (preferRedirect = false) => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const loggedUser = await signInWithGoogle(preferRedirect);
      if (loggedUser) {
        setUser(loggedUser);
        localStorage.removeItem('codesage_dev_user');
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const friendlyMsg = getFriendlyAuthErrorMessage(error);
        console.error('[Auth] Google Sign-In error:', error);
        setAuthError(friendlyMsg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const loginAsDev = () => {
    const devUser: AppUser = {
      uid: 'dev-user-avnish',
      displayName: 'Avnish (Dev)',
      email: 'avnish@codesage.local',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Avnish',
      isDev: true,
    };
    try {
      localStorage.setItem('codesage_dev_user', JSON.stringify(devUser));
    } catch {
      // ignore
    }
    setUser(devUser);
    setAuthError(null);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('codesage_dev_user');
      await signOutUser();
    } catch (error) {
      console.error('[Auth] Sign-out error:', error);
    } finally {
      setUser(null);
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
        loginAsDev,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

