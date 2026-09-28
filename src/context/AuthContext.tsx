import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/react';
import { useToast } from './ToastContext';

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
  const { showError, showWarning } = useToast();

  // Safety fallback timeout: if Clerk CDN/origin restrictions stall isLoaded on localhost,
  // ensure we do not block UI rendering indefinitely.
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => {
      setLoadTimedOut(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isLoaded]);

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
      // If Clerk is not loaded or failed to connect to Clerk servers
      if (!clerk || !clerk.loaded) {
        const msg =
          'Clerk authentication is not reachable or still initializing. If using a production key without custom DNS, click "Dev Login" to continue locally.';
        setAuthError(msg);
        showError(msg, 'Clerk Authentication Unavailable', 7000);
        return;
      }

      if (typeof clerk.openSignIn === 'function') {
        await clerk.openSignIn();
      } else {
        const msg = 'Clerk sign-in modal is not available in this environment. Click "Dev Login" to continue.';
        setAuthError(msg);
        showWarning(msg, 'Sign In Notice', 6000);
      }
    } catch (err: any) {
      console.error('[Clerk] Sign in error:', err);
      const msg = err?.message || 'Could not open Clerk sign-in modal. Click "Dev Login" to continue.';
      setAuthError(msg);
      showError(msg, 'Sign In Failed', 6000);
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
        loading: !isLoaded && !loadTimedOut,
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
  const { showWarning } = useToast();
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
    const msg =
      'Clerk authentication is not configured yet. Add VITE_CLERK_PUBLISHABLE_CONFIG in your .env file, or click "Dev Login" to continue locally.';
    setAuthError(msg);
    showWarning(msg, 'Clerk Unconfigured', 6000);
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
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    import.meta.env.VITE_CLERK_PUBLISHABLE_CONFIG?.trim() ||
    import.meta.env.VITE_CLERK_CONFIG?.trim() ||
    ''
  );
  const isClerkAvailable = Boolean(clerkPubKey && clerkPubKey.startsWith('pk_'));
  const customProxyUrl = (
    import.meta.env.VITE_CLERK_PROXY_URL?.trim() ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app') && clerkPubKey.startsWith('pk_live_')
      ? `${window.location.origin}/__clerk`
      : undefined)
  );

  if (isClerkAvailable) {
    return (
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={customProxyUrl || undefined}
        afterSignOutUrl="/"
      >
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return <LocalAuthProvider>{children}</LocalAuthProvider>;
};
