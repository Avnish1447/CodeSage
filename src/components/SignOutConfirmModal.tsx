import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, LogOut, X, Loader2, ArrowRight } from 'lucide-react';
import type { AuthUser } from '../context/AuthContext';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  user: AuthUser | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSigningOut) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, isSigningOut]);

  const handleConfirm = async () => {
    try {
      setIsSigningOut(true);
      await onConfirm();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSigningOut ? undefined : onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="signout-dialog-title"
            aria-describedby="signout-dialog-desc"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md my-auto z-10 bg-white dark:bg-[#111113] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden"
          >
            {/* Top gradient warning bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-[#e8702a]" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSigningOut}
              aria-label="Cancel and close dialog"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon & Title */}
            <div className="flex items-start space-x-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="pt-0.5">
                <h2
                  id="signout-dialog-title"
                  className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white"
                >
                  Sign out of CodeSage?
                </h2>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider font-medium">
                  Authentication Required
                </span>
              </div>
            </div>

            {/* User Account Details */}
            {user && (
              <div className="mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-[#18181b] border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#e8702a] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                    {user.email && (
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Active
                </span>
              </div>
            )}

            {/* Warning Description */}
            <div
              id="signout-dialog-desc"
              className="p-3.5 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.1] border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed mb-6 space-y-1.5"
            >
              <p className="font-semibold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
                <span>⚠️ You will be redirected to the sign-in page.</span>
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11.5px]">
                Because signing in is compulsory to use CodeSage, signing out will immediately end your studio session. You must sign in or sign up again to excavate repositories, access the AI workbench, or view your cloud-synced analyses.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSigningOut}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSigningOut}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out &amp; Redirect</span>
                    <ArrowRight className="w-3 h-3 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
