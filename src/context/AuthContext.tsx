import React, { createContext, useContext, useState } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/react';

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
  loginAsDev: () => void;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  isClerkConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isSigningIn: false,
  authError: null,
  loginWithGoogle: async () => {},
  loginAsDev: () => {},
  logout: async () => {},
  clearAuthError: () => {},
  isClerkConfigured: false,
});

export const useAuth = () => useContext(AuthContext);

/**
 * Bridge component rendered inside ClerkProvider when VITE_CLERK_PUBLISHABLE_KEY is present
 */
const ClerkAuthBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  const [devUser, setDevUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('codesage_dev_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Prioritize active Clerk user; fallback to dev user if active
  const user: AuthUser | null = devUser
    ? devUser
    : isSignedIn && clerkUser
    ? {
        uid: clerkUser.id,
        displayName:
          clerkUser.fullName ||
          clerkUser.firstName ||
          clerkUser.username ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          'Clerk User',
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        photoURL: clerkUser.imageUrl || null,
        isDev: false,
      }
    : null;

  const loginWithGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      clerk.openSignIn();
    } catch (err: any) {
      console.error('[Clerk] Sign in error:', err);
      setAuthError(err?.message || 'Could not open Clerk sign-in modal.');
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
  };

  const logout = async () => {
    try {
      localStorage.removeItem('codesage_dev_user');
      setDevUser(null);
      if (isSignedIn) {
        await clerk.signOut();
      }
    } catch (err) {
      console.error('[Clerk] Sign out error:', err);
    } finally {
      setAuthError(null);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !isLoaded,
        isSigningIn,
        authError,
        loginWithGoogle,
        loginAsDev,
        logout,
        clearAuthError,
        isClerkConfigured: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Local auth provider used when VITE_CLERK_PUBLISHABLE_KEY is not configured yet.
 * Prevents Clerk crashes while providing local dev session capabilities.
 */
const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('codesage_dev_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    setAuthError(
      'Clerk authentication is not configured yet. Add VITE_CLERK_PUBLISHABLE_CONFIG in your .env file to enable Clerk cloud sign-in, or click "Dev Login" to continue locally.'
    );
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
    setUser(mockDev);
    setAuthError(null);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('codesage_dev_user');
    } catch {
      // ignore
    }
    setUser(null);
    setAuthError(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        isSigningIn: false,
        authError,
        loginWithGoogle,
        loginAsDev,
        logout,
        clearAuthError,
        isClerkConfigured: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clerkPubKey = (
    import.meta.env.VITE_CLERK_PUBLISHABLE_CONFIG?.trim() ||
    import.meta.env.VITE_CLERK_CONFIG?.trim() ||
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    ''
  );
  const isClerkAvailable = Boolean(clerkPubKey && clerkPubKey.startsWith('pk_'));

  if (isClerkAvailable) {
    return (
      <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return <LocalAuthProvider>{children}</LocalAuthProvider>;
};
