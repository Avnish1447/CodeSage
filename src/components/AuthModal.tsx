import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    verifyOtp,
    loginAsDev,
    isSigningIn,
    authError,
    clearAuthError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      clearAuthError();
      setStatusMessage(null);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleGoogleSignIn = async () => {
    setStatusMessage(null);
    await loginWithGoogle();
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }
    setLocalLoading(true);
    setStatusMessage(null);
    const result = await loginWithEmail(email);
    setLocalLoading(false);
    if (result.success) {
      setOtpSent(true);
      setStatusMessage(result.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) return;
    setLocalLoading(true);
    const result = await verifyOtp(email, otpToken);
    setLocalLoading(false);
    if (result.success) {
      onClose();
    }
  };

  const handleDevLogin = () => {
    loginAsDev();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Authentication modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md my-auto z-10 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e8702a] via-amber-500 to-[#0072F5]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#e8702a]/10 border border-[#e8702a]/20 mb-3 shadow-inner">
                <Sparkles className="w-5 h-5 text-[#e8702a]" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Sign in to CodeSage
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Excavate codebases, save analysis history, and unlock AI stratigraphy
              </p>
            </div>

            {/* Error & Info Feedback */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </motion.div>
            )}

            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{statusMessage}</span>
              </motion.div>
            )}

            {/* Google OAuth Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || localLoading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.99]"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#e8702a]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <span className="relative bg-white dark:bg-neutral-950 px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  or email magic link
                </span>
              </div>

              {/* Email Form */}
              {!otpSent ? (
                <form onSubmit={handleSendMagicLink} className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#e8702a]/40 focus:border-[#e8702a] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={localLoading || !email}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#e8702a] hover:bg-[#d6611e] transition-all cursor-pointer shadow-md shadow-[#e8702a]/20 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {localLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Send Login Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-2.5">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="Enter 6-digit OTP code"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#e8702a]/40 focus:border-[#e8702a] text-neutral-900 dark:text-white placeholder:text-neutral-400 font-mono tracking-wider transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={localLoading || !otpToken}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs text-white bg-[#e8702a] hover:bg-[#d6611e] transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {localLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Verify & Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2 rounded-xl font-medium text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              {/* Dev Profile Bypass for Localhost */}
              {isLocalhost && (
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={handleDevLogin}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100/70 dark:bg-neutral-900/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/80 border border-dashed border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0072F5]" />
                    <span>Instant Dev Login (Localhost only)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <p className="mt-5 text-[11px] text-center text-neutral-400 dark:text-neutral-500">
              Powered securely by Supabase Cloud Auth • Row-Level Security
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
