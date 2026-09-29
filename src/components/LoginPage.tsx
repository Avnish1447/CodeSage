import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  Mail,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  GitBranch,
  Terminal,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isDark = true, onToggleTheme }) => {
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
    document.title = 'Sign In to CodeSage – Intelligent Codebase Stratigraphy';
    clearAuthError();
  }, []);

  const handleGoogleSignIn = async () => {
    setStatusMessage(null);
    clearAuthError();
    await loginWithGoogle();
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLocalLoading(true);
    setStatusMessage(null);
    clearAuthError();
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
    setStatusMessage(null);
    clearAuthError();
    const result = await verifyOtp(email, otpToken);
    setLocalLoading(false);
    if (result.success) {
      setStatusMessage('Signed in successfully! Redirecting to studio...');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans selection:bg-[#e8702a]/30 transition-colors duration-200 ${
        isDark ? 'dark bg-[#0a0a0c] text-white' : 'bg-[#FAFAFA] text-neutral-900'
      }`}
    >
      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20 border-b border-black/[0.05] dark:border-white/[0.06] backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8702a] to-[#d6611e] flex items-center justify-center shadow-lg shadow-[#e8702a]/20 border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
                CodeSage
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e8702a]/10 text-[#e8702a] border border-[#e8702a]/20 font-semibold">
                v0.1.0
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              Codebase Stratigraphy Engine
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/privacypolicy"
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Privacy &amp; Terms
          </a>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#e8702a]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#0072F5]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Product Showcase & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20">
              <Lock className="w-3.5 h-3.5 text-[#e8702a]" />
              <span>Authentication Required to Access Workbench</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-neutral-900 dark:text-white">
              Excavate any codebase.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8702a] via-amber-500 to-[#0072F5]">
                Understand software in seconds.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
              CodeSage parses Git trees, maps architectural dependencies, detects tech stacks, and runs grounded Google Gemini RAG across entire repository structures.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-[#e8702a] font-semibold text-xs mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>AST Stratigraphy</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Layered component hierarchy &amp; structural metrics without heavy cloning.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-[#0072F5] font-semibold text-xs mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Gemini 2.5 RAG</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Ask questions grounded directly in real code files, imports, and exports.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-emerald-500 font-semibold text-xs mb-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Cloud Sync</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Personal repository excavation history securely preserved in Supabase.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs mb-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitReverse Generation</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Synthesize structured reverse-engineering engineering prompts in 1-click.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e8702a] via-amber-500 to-[#0072F5]" />

              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Welcome to CodeSage
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Sign in or create an account to unlock the full codebase analysis suite.
                </p>
              </div>

              {/* Error Callout */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{authError}</span>
                </motion.div>
              )}

              {/* Status Message */}
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{statusMessage}</span>
                </motion.div>
              )}

              {/* Auth Form & Options */}
              <div className="space-y-3.5">
                {/* Google Sign In */}
                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn || localLoading}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
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
                  <span className="relative bg-white dark:bg-neutral-900 px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    or continue with email
                  </span>
                </div>

                {/* Email Form */}
                {!otpSent ? (
                  <form onSubmit={handleSendMagicLink} className="space-y-2.5">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-[#e8702a]/40 focus:border-[#e8702a] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
                      />
                    </div>
                    <button
                      id="send-magic-link-btn"
                      type="submit"
                      disabled={localLoading || !email}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#e8702a] hover:bg-[#d6611e] transition-all cursor-pointer shadow-md shadow-[#e8702a]/20 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {localLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Send Magic Login Link</span>
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
                        id="otp-input"
                        type="text"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        placeholder="Enter 6-digit verification code"
                        required
                        autoFocus
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-[#e8702a]/40 focus:border-[#e8702a] text-neutral-900 dark:text-white placeholder:text-neutral-400 font-mono tracking-wider transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="verify-otp-btn"
                        type="submit"
                        disabled={localLoading || !otpToken}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-[#e8702a] hover:bg-[#d6611e] transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {localLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Verify & Launch'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-3 py-2.5 rounded-xl font-medium text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}

                {/* Localhost Instant Dev Login */}
                {isLocalhost && (
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      id="dev-login-bypass-btn"
                      type="button"
                      onClick={loginAsDev}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100/70 dark:bg-neutral-800/50 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0072F5]" />
                      <span>Instant Dev Login (Localhost only)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Terms & Privacy Notice */}
              <p className="mt-5 text-[11px] text-center text-neutral-400 dark:text-neutral-500 leading-relaxed">
                By continuing, you agree to CodeSage&rsquo;s{' '}
                <a
                  href="/privacypolicy"
                  className="underline hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="/privacypolicy#terms"
                  className="underline hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom Legal Bar */}
      <footer className="w-full py-4 text-center text-xs text-neutral-500 dark:text-neutral-400 border-t border-black/[0.05] dark:border-white/[0.06]">
        <span>&copy; {new Date().getFullYear()} CodeSage Technologies. All rights reserved.</span>
      </footer>
    </div>
  );
};
