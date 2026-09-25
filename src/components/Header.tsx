import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sun, Moon, LogOut, Loader2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark = true,
  onToggleTheme,
}) => {
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const {
    user,
    loading: authLoading,
    isSigningIn,
    authError,
    clearAuthError,
    loginWithGoogle,
    loginAsDev,
    logout,
  } = useAuth();

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline', version: '0.1.0' }));
  }, []);

  return (
    <header className="border-b border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA]/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-50 text-[#171717] dark:text-[#EDEDED] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 cursor-pointer group" title="CodeSage Studio">
            <picture>
              <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
              <source srcSet="/logos/text mark.png" type="image/png" />
              <img
                src="/logos/text mark.svg"
                alt="CodeSage"
                className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain brightness-100 dark:brightness-125 hover:opacity-85 transition-opacity duration-150"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('textmark.png')) {
                    target.src = '/logos/textmark.png';
                  }
                }}
              />
            </picture>

            <span className="text-neutral-400 dark:text-neutral-600 font-mono text-xs hidden sm:inline">/</span>
            <span className="font-medium text-xs sm:text-sm tracking-tight text-[#4D4D4D] dark:text-[#A1A1A1] hidden sm:inline">Studio</span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-md whitespace-nowrap">
              v{health?.version || '0.1.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded-md text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>API: {health?.status || 'online'}</span>
          </div>

          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[#4D4D4D] hover:text-[#171717] hover:bg-[#EBEBEB] dark:text-[#A1A1A1] dark:hover:text-[#EDEDED] dark:hover:bg-[#1a1a1d] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5]"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4D4D4D]" />}
            </motion.button>
          )}

          {/* Firebase Authentication State */}
          {!authLoading && (
            user ? (
              <div className="flex items-center space-x-2 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-2 py-1 rounded-lg">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-black/10 dark:border-white/20"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#e8702a] text-white text-[10px] font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium hidden sm:inline max-w-[110px] truncate text-[#171717] dark:text-[#EDEDED]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {user.isDev && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    DEV
                  </span>
                )}
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign out"
                  className="p-1 rounded text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => loginWithGoogle()}
                  disabled={isSigningIn}
                  className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-medium bg-[#171717] hover:bg-[#2c2c2c] dark:bg-white dark:hover:bg-[#EDEDED] text-white dark:text-[#171717] transition-all cursor-pointer shadow-sm disabled:opacity-60"
                  title="Sign in with Google"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e8702a]" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in</span>
                    </>
                  )}
                </motion.button>

                {isLocalhost && (
                  <button
                    onClick={loginAsDev}
                    title="Quick sign-in with local dev profile (bypasses Google OAuth domain limit)"
                    className="hidden sm:inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer"
                  >
                    Dev Login
                  </button>
                )}
              </div>
            )
          )}

          <div
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="hidden md:inline font-mono">CodeSage AI</span>
          </div>
        </div>
      </div>

      {/* Floating Auth Error Notification */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 sm:right-8 z-[60] max-w-md bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 text-slate-800 dark:text-slate-200 p-3.5 rounded-xl shadow-2xl text-xs space-y-2.5 backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400">
                    Firebase Sign-In Notice
                  </div>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {authError}
                  </p>
                </div>
              </div>
              <button
                onClick={clearAuthError}
                aria-label="Dismiss error"
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
              {isLocalhost && (
                <button
                  onClick={loginAsDev}
                  className="px-2.5 py-1 rounded bg-[#0072F5] hover:bg-[#0060df] text-white font-medium text-[11px] transition-colors cursor-pointer shadow-sm flex items-center space-x-1"
                >
                  <span>Continue with Dev Profile</span>
                </button>
              )}
              <a
                href="https://console.cloud.google.com/customer-identity/settings?project=modern-night-4t8c4"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <span>Add in Cloud Console ↗</span>
              </a>
              <button
                onClick={clearAuthError}
                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-[11px] transition-colors cursor-pointer ml-auto"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


