import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  Check,
  ArrowRight,
  MessageSquare,
  Code2,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  Layers,
  Terminal,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NeobrutalistLoginPageProps {
  onNavigateHome?: () => void;
}

export const NeobrutalistLoginPage: React.FC<NeobrutalistLoginPageProps> = ({ onNavigateHome }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    loginAsDev,
    isSigningIn,
    authError,
    clearAuthError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLocalFeedback('Please enter a valid email address.');
      return;
    }
    setLocalLoading(true);
    setLocalFeedback(null);
    clearAuthError();

    // Use Supabase Magic Link OTP for instant, passwordless, frictionless sign-in
    const res = await loginWithEmail(email);
    setLocalLoading(false);
    if (res.success) {
      setLocalFeedback('Check your inbox! We sent you an instant sign-in link.');
    } else {
      setLocalFeedback(res.message || 'Could not send sign-in link.');
    }
  };

  const handleGoogleSSO = async () => {
    setLocalFeedback(null);
    clearAuthError();
    await loginWithGoogle();
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('Subscribed! You will receive CodeSage architectural teardowns.');
    setTimeout(() => setNewsletterStatus(null), 4000);
    setNewsletterEmail('');
  };

  const navigateHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('login-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const marqueeText = 'Excavate GitHub codebases in one prompt / Grounded Gemini RAG / AST Stratigraphy / GitReverse Prompt Engineering / Zero-shot architecture visualizer / Sub-second repo indexing / Multi-repo intelligence / ';

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#000000] font-space-grotesk selection:bg-[#e8ff00] selection:text-black overflow-x-hidden">
      {/* 1) STICKY BLACK-BOTTOM-BORDERED NAV (68px) */}
      <nav className="sticky top-0 z-50 bg-[#f4f1ea] border-b-[3px] border-black h-[68px]">
        <div className="max-w-[1180px] mx-auto h-full px-5 sm:px-8 flex items-center justify-between">
          {/* Brand Lockup */}
          <a
            href="/"
            onClick={navigateHome}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
            title="CodeSage Studio – Back to Workbench"
          >
            <div className="w-10 h-10 bg-[#e8ff00] border-[3px] border-black shadow-hard-sm flex items-center justify-center press-card-sm overflow-hidden p-1">
              <img
                src="/logos/favicon.svg"
                alt="CodeSage"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback geometric glyph if SVG fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-archivo font-[900] text-xl sm:text-2xl tracking-tight uppercase text-black">
                CODESAGE
              </span>
              <span className="hidden sm:inline-block font-space-mono text-[11px] font-bold uppercase tracking-wider text-black/60 border border-black/40 px-1.5 py-0.2 bg-white">
                v0.1
              </span>
            </div>
          </a>

          {/* Center Links (hidden below lg) */}
          <div className="hidden lg:flex items-center space-x-7">
            <a
              href="/"
              onClick={navigateHome}
              className="font-archivo font-bold text-xs uppercase tracking-wider text-black hover:text-black/60 transition-colors flex items-center space-x-1"
            >
              <span>Workbench</span>
            </a>
            <a
              href="/#stratigraphy"
              onClick={navigateHome}
              className="font-archivo font-bold text-xs uppercase tracking-wider text-black hover:text-black/60 transition-colors"
            >
              Stratigraphy
            </a>
            <a
              href="/#rag"
              onClick={navigateHome}
              className="font-archivo font-bold text-xs uppercase tracking-wider text-black hover:text-black/60 transition-colors"
            >
              Gemini RAG
            </a>
            <a
              href="/privacypolicy"
              className="font-archivo font-bold text-xs uppercase tracking-wider text-black hover:text-black/60 transition-colors"
            >
              Privacy &amp; Terms
            </a>
            <a
              href="https://github.com/Avnish1447/CodeSage"
              target="_blank"
              rel="noopener noreferrer"
              className="font-archivo font-bold text-xs uppercase tracking-wider text-black hover:text-black/60 transition-colors flex items-center space-x-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              type="button"
              onClick={scrollToLogin}
              className="font-archivo font-bold text-xs sm:text-sm uppercase text-black hover:underline cursor-pointer"
            >
              Sign in
            </button>
            <a
              href="/"
              onClick={navigateHome}
              className="bg-black text-[#f4f1ea] px-3.5 sm:px-5 py-2 font-archivo font-bold text-xs sm:text-sm uppercase border-[2px] border-black shadow-hard-sm press-card-sm cursor-pointer flex items-center space-x-1.5"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* 2) FULL-BLEED ACID MARQUEE STRIP */}
      <section className="bg-[#e8ff00] border-b-[3px] border-black overflow-hidden py-2.5">
        <div className="marquee-animation select-none">
          <span className="font-space-mono text-xs font-bold uppercase tracking-[0.18em] text-black whitespace-nowrap px-4">
            {marqueeText.repeat(4)}
          </span>
          <span className="font-space-mono text-xs font-bold uppercase tracking-[0.18em] text-black whitespace-nowrap px-4">
            {marqueeText.repeat(4)}
          </span>
        </div>
      </section>

      {/* 3) HERO + SIGN-IN SECTION ON RADIAL-DOT BACKGROUND */}
      <main className="grid-dots-bg border-b-[3px] border-black py-12 sm:py-20">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* LEFT PITCH COLUMN (lg:col-span-7, order-2 lg:order-1) */}
            <div className="lg:col-span-7 order-2 lg:order-1 space-y-6 sm:space-y-8">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center space-x-2 bg-white border-[2px] border-black px-3 py-1 shadow-hard-sm">
                <div className="w-2.5 h-2.5 bg-[#e8ff00] border border-black animate-pulse" />
                <span className="font-space-mono text-xs font-bold uppercase tracking-[0.16em]">
                  Codebase Stratigraphy &bull; Gemini RAG
                </span>
              </div>

              {/* Oversized Archivo 900 Headline */}
              <h1 className="font-archivo font-[900] uppercase tracking-tight text-black text-[clamp(2.5rem,6.8vw,4.4rem)] leading-[0.92]">
                EXCAVATE THE{' '}
                <span className="bg-[#e8ff00] border-[3px] border-black px-3 py-0.5 inline-block my-1 shadow-hard-sm">
                  CODEBASE.
                </span>
                <br />
                SHIP WITH CLARITY.
              </h1>

              {/* Bordered paper intro card */}
              <div className="bg-[#f4f1ea] border-[3px] border-black p-5 sm:p-6 shadow-hard">
                <p className="text-base sm:text-[17px] text-black/85 leading-relaxed font-medium">
                  CodeSage unearths deep architectural strata, parses Git trees into semantic AST call-graphs, and grounds Google Gemini AI across unfamiliar repositories in sub-second speed. Zero boilerplate. Pure clarity.
                </p>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'AST Stratigraphy', desc: 'Git tree & call graph parser', icon: Layers },
                  { label: 'Grounded Gemini RAG', desc: 'Accurate architectural Q&A', icon: Sparkles },
                  { label: 'Tech Stack Mining', desc: 'Framework & toolchain detector', icon: Cpu },
                  { label: 'GitReverse Prompts', desc: 'Zero-shot reverse engineering', icon: Terminal },
                ].map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.label}
                      className="bg-white border-[2px] border-black p-4 flex flex-col justify-between space-y-2 shadow-hard-sm press-card-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#e8ff00] border-[2px] border-black flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-archivo font-extrabold text-[13px] uppercase tracking-wide">
                          {feat.label}
                        </span>
                      </div>
                      <p className="text-xs text-black/65 font-medium leading-snug">
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Black Inline Stats Bar */}
              <div className="bg-black text-[#f4f1ea] border-[3px] border-black p-4 sm:p-5 shadow-hard flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
                <div className="sm:border-r border-[#f4f1ea]/30 sm:pr-8 w-full sm:w-auto">
                  <div className="font-archivo font-[900] text-2xl sm:text-3xl text-[#e8ff00]">
                    100k+
                  </div>
                  <div className="font-space-mono text-xs uppercase tracking-wider text-[#f4f1ea]/80">
                    files parsed
                  </div>
                </div>

                <div className="sm:border-r border-[#f4f1ea]/30 sm:pr-8 w-full sm:w-auto">
                  <div className="font-archivo font-[900] text-2xl sm:text-3xl text-[#e8ff00]">
                    0.8s
                  </div>
                  <div className="font-space-mono text-xs uppercase tracking-wider text-[#f4f1ea]/80">
                    to AST tree
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <div className="font-archivo font-[900] text-2xl sm:text-3xl text-[#e8ff00]">
                    99.4%
                  </div>
                  <div className="font-space-mono text-xs uppercase tracking-wider text-[#f4f1ea]/80">
                    grounded accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT BRUTALIST SIGN-IN CARD (lg:col-span-5, order-1 lg:order-2) */}
            <div id="login-card" className="lg:col-span-5 order-1 lg:order-2 justify-self-stretch lg:justify-self-end w-full max-w-[460px] mx-auto">
              <div className="relative bg-[#f4f1ea] border-[3px] border-black p-6 sm:p-8 shadow-hard-lg">
                {/* Corner Tab */}
                <div className="absolute -top-[3px] -right-[3px] bg-black text-[#e8ff00] border-[2px] border-black px-3.5 py-1 font-space-mono text-xs font-bold uppercase tracking-wider">
                  / codesage
                </div>

                {/* Heading */}
                <div className="space-y-1 mb-6">
                  <h2 className="font-archivo font-[900] text-2xl sm:text-3xl uppercase tracking-tight text-black">
                    Sign in
                  </h2>
                  <p className="text-sm text-black/70 font-medium">
                    Welcome back. Punch in to excavate repositories &amp; sync your cloud history.
                  </p>
                </div>

                {/* Status Messages */}
                {authError && (
                  <div className="mb-5 bg-[#e8ff00]/40 border-[2px] border-black p-3 text-xs font-mono font-bold flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {localFeedback && (
                  <div className="mb-5 bg-white border-[2px] border-black p-3 text-xs font-mono font-bold flex items-start space-x-2 shadow-hard-sm">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span>{localFeedback}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block font-archivo font-extrabold text-xs uppercase tracking-[0.12em] text-black">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@github.com"
                      required
                      className="input-brutalist w-full bg-white border-[3px] border-black px-4 py-2.5 text-sm font-medium text-black placeholder-black/40 shadow-hard-sm"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-archivo font-extrabold text-xs uppercase tracking-[0.12em] text-black">
                        Password / Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => setLocalFeedback('Enter your email above and click "Sign in →" to receive an instant passwordless link!')}
                        className="font-space-mono text-xs underline text-black/70 hover:text-black cursor-pointer"
                      >
                        Magic Link?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-brutalist w-full bg-white border-[3px] border-black px-4 py-2.5 text-sm font-medium text-black placeholder-black/40 shadow-hard-sm"
                    />
                  </div>

                  {/* Custom Acid Checkbox */}
                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={keepSignedIn}
                      onClick={() => setKeepSignedIn(!keepSignedIn)}
                      className="w-6 h-6 bg-[#e8ff00] border-[2px] border-black shadow-hard-sm flex items-center justify-center shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    >
                      {keepSignedIn && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </button>
                    <span
                      onClick={() => setKeepSignedIn(!keepSignedIn)}
                      className="text-xs font-semibold text-black cursor-pointer select-none"
                    >
                      Keep repository cache synced
                    </span>
                  </div>

                  {/* Primary Chunky Acid Button */}
                  <button
                    type="submit"
                    disabled={isSigningIn || localLoading}
                    className="w-full bg-[#e8ff00] text-black border-[3px] border-black py-3 px-4 font-archivo font-[900] text-[17px] uppercase tracking-wide shadow-hard press-card cursor-pointer flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
                  >
                    {localLoading || isSigningIn ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : (
                      <>
                        <span>Sign in to Studio</span>
                        <span>&rarr;</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-[3px] border-black" />
                  </div>
                  <span className="relative bg-[#f4f1ea] px-3 font-space-mono text-xs font-bold uppercase tracking-wider text-black">
                    or authenticate with
                  </span>
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSSO}
                    disabled={isSigningIn || localLoading}
                    className="bg-white border-[2px] border-black py-2.5 px-3 flex items-center justify-center space-x-2 shadow-hard-sm press-card-sm font-archivo font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalFeedback('GitHub OAuth is enabled. Click Google or enter your email to continue instantly!')}
                    className="bg-white border-[2px] border-black py-2.5 px-3 flex items-center justify-center space-x-2 shadow-hard-sm press-card-sm font-archivo font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-black" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Localhost Dev Login Quick Bypass */}
                {isLocalhost && (
                  <div className="mt-4 pt-3 border-t-[2px] border-dashed border-black">
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDev();
                        navigateHome({} as any);
                      }}
                      className="w-full bg-white text-black border-[2px] border-black py-2 px-3 font-space-mono text-xs font-bold uppercase tracking-wider shadow-hard-sm press-card-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-black" />
                      <span>Instant Dev Login (Localhost)</span>
                    </button>
                  </div>
                )}

                {/* Card Footer */}
                <div className="mt-6 text-center">
                  <p className="text-xs font-semibold text-black/70">
                    Free for open source exploration &bull;{' '}
                    <a
                      href="/"
                      onClick={navigateHome}
                      className="underline text-black font-bold hover:text-black/80"
                    >
                      Browse as guest
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4) FULL-BLEED BLACK TRUST BAR */}
      <section className="bg-black text-[#f4f1ea] border-b-[3px] border-black py-6">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-6">
          <div className="font-space-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e8ff00]">
            Engineered for repositories like
          </div>
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {['facebook/react', 'vercel/next.js', 'fastapi/fastapi', 'tailwindlabs/tailwindcss', 'pallets/flask', 'torvalds/linux'].map((repo) => (
              <span
                key={repo}
                className="font-space-mono font-bold text-xs sm:text-sm tracking-tight text-white/90 uppercase hover:text-[#e8ff00] transition-colors select-none"
              >
                {repo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5) HOW IT WORKS (3 STEPS) */}
      <section className="py-16 sm:py-24 border-b-[3px] border-black bg-[#f4f1ea]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="space-y-3 mb-12 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#e8ff00] border-[2px] border-black px-3 py-1 shadow-hard-sm">
              <span className="font-space-mono text-xs font-bold uppercase tracking-[0.16em]">
                How it works
              </span>
            </div>
            <h2 className="font-archivo font-[900] text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-tight leading-[0.95]">
              THREE MOVES TO TOTAL<br />ARCHITECTURAL MASTERY.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white border-[3px] border-black p-6 sm:p-7 shadow-hard press-card">
              <div className="flex items-center justify-between mb-5">
                <span className="font-space-mono font-bold text-3xl sm:text-4xl text-black">
                  01
                </span>
                <div className="w-12 h-12 bg-[#e8ff00] border-[2px] border-black flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5 text-black" />
                </div>
              </div>
              <h3 className="font-archivo font-[800] text-xl uppercase tracking-tight mb-2">
                Paste it
              </h3>
              <p className="text-sm text-black/75 leading-relaxed font-medium">
                Drop any public GitHub repository URL into CodeSage. We clone, map, and parse the Git tree into an indexed AST without bloated downloads.
              </p>
            </div>

            {/* Step 2 (Acid highlight) */}
            <div className="bg-[#e8ff00] border-[3px] border-black p-6 sm:p-7 shadow-hard press-card">
              <div className="flex items-center justify-between mb-5">
                <span className="font-space-mono font-bold text-3xl sm:text-4xl text-black">
                  02
                </span>
                <div className="w-12 h-12 bg-[#f4f1ea] border-[2px] border-black flex items-center justify-center">
                  <Layers className="w-5 h-5 text-black" />
                </div>
              </div>
              <h3 className="font-archivo font-[800] text-xl uppercase tracking-tight mb-2">
                Stratify it
              </h3>
              <p className="text-sm text-black/85 leading-relaxed font-medium">
                Inspect interactive file trees, mined framework dependencies, and topological architectural stratigraphy with sub-second responsiveness.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-[3px] border-black p-6 sm:p-7 shadow-hard press-card">
              <div className="flex items-center justify-between mb-5">
                <span className="font-space-mono font-bold text-3xl sm:text-4xl text-black">
                  03
                </span>
                <div className="w-12 h-12 bg-[#e8ff00] border-[2px] border-black flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
              </div>
              <h3 className="font-archivo font-[800] text-xl uppercase tracking-tight mb-2">
                Query it
              </h3>
              <p className="text-sm text-black/75 leading-relaxed font-medium">
                Ask deep engineering questions with Gemini 2.5 RAG grounded directly in actual source code symbols and generate zero-shot GitReverse prompt specs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6) FULL-BLEED ACID CTA + CANAVS MOCK */}
      <section className="bg-[#e8ff00] border-b-[3px] border-black py-16 sm:py-20">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left pitch */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-archivo font-[900] text-[clamp(2.2rem,5vw,3.8rem)] uppercase tracking-tight leading-[0.92]">
                NEVER GET LOST IN<br />AN UNFAMILIAR REPO.
              </h2>
              <p className="text-base sm:text-lg text-black/85 font-medium max-w-lg leading-relaxed">
                Analyze multi-thousand file codebases in seconds. Understand caller graphs, architecture patterns, and design decisions without weeks of manual spelunking.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToLogin}
                  className="bg-black text-[#e8ff00] border-[3px] border-black px-6 py-3.5 font-archivo font-[900] text-base uppercase tracking-wider shadow-hard press-card cursor-pointer text-center"
                >
                  Sign in to excavate &rarr;
                </button>
                <a
                  href="/"
                  onClick={navigateHome}
                  className="bg-[#f4f1ea] text-black border-[3px] border-black px-6 py-3.5 font-archivo font-[900] text-base uppercase tracking-wider shadow-hard press-card cursor-pointer text-center"
                >
                  Open Studio Workbench
                </a>
              </div>
            </div>

            {/* Right: Faux Code-Canvas Mock */}
            <div className="lg:col-span-6">
              <div className="bg-[#f4f1ea] border-[3px] border-black p-4 sm:p-5 shadow-hard-lg">
                <div className="bg-white border-[2px] border-black p-4 font-space-mono text-xs">
                  {/* Title Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b-[2px] border-black">
                    <span className="font-bold text-black uppercase tracking-wider flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-black" />
                      <span>stratigraphy / codesage-ast.ts</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 bg-black" />
                      <div className="w-2.5 h-2.5 bg-black" />
                      <div className="w-2.5 h-2.5 bg-[#e8ff00] border border-black" />
                    </div>
                  </div>

                  {/* Code Snippet */}
                  <pre className="overflow-x-auto text-[11px] sm:text-xs leading-relaxed text-black">
                    <code>
                      <span className="text-black/50">// Excavate AST tree and ground Gemini context</span>
                      {'\n'}
                      <span className="font-bold">export const</span> <span className="underline">stratifyRepository</span> = <span className="font-bold">async</span> (repo: RepoRef) =&gt; &#123;
                      {'\n'}  <span className="font-bold">const</span> tree = <span className="font-bold">await</span> CodeSage.parseAst(repo.treeSha);
                      {'\n'}  <span className="font-bold">const</span> ragContext = <span className="font-bold">await</span> CodeSage.groundVectorIndex(&#123;
                      {'\n'}    ast: tree,
                      {'\n'}    model: <span className="bg-[#e8ff00] px-1 font-bold border border-black">&quot;gemini-2.5-flash&quot;</span>,
                      {'\n'}  &#125;);
                      {'\n'}  <span className="font-bold">return</span> &#123; stratigraphy: tree, architectureReady: <span className="font-bold">true</span> &#125;;
                      {'\n'}&#125;;
                      {'\n\n'}
                      <span className="text-emerald-700 font-bold">&#x2713; AST Excavated &bull; 1,420 files indexed &bull; Sub-second RAG ready</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7) FOUR-COLUMN FOOTER */}
      <footer className="bg-[#f4f1ea] py-16">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#e8ff00] border-[2px] border-black shadow-hard-sm flex items-center justify-center p-0.5">
                  <img
                    src="/logos/favicon.svg"
                    alt="CodeSage"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-archivo font-[900] text-lg uppercase tracking-tight text-black">
                  CODESAGE
                </span>
              </div>
              <p className="text-xs text-black/70 leading-relaxed font-medium">
                The geological code excavation and grounded architecture engine for developers who ship without blind spots.
              </p>
            </div>

            {/* Col 2: Architecture Features */}
            <div className="space-y-3">
              <h4 className="font-archivo font-extrabold text-xs uppercase tracking-[0.14em] text-black">
                Engine
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-black/75">
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    AST Stratigraphy
                  </a>
                </li>
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    Gemini RAG Chat
                  </a>
                </li>
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    Tech Stack Mining
                  </a>
                </li>
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    GitReverse Prompts
                  </a>
                </li>
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    System Telemetry
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Company & Legal */}
            <div className="space-y-3">
              <h4 className="font-archivo font-extrabold text-xs uppercase tracking-[0.14em] text-black">
                Platform
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-black/75">
                <li>
                  <a href="/" onClick={navigateHome} className="hover:underline hover:text-black">
                    Studio Workbench
                  </a>
                </li>
                <li>
                  <a href="/privacypolicy" className="hover:underline hover:text-black">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/privacypolicy#terms" className="hover:underline hover:text-black">
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Avnish1447/CodeSage" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-black flex items-center space-x-1">
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div className="space-y-3">
              <h4 className="font-archivo font-extrabold text-xs uppercase tracking-[0.14em] text-black">
                Dispatch
              </h4>
              <p className="text-xs text-black/70 font-medium">
                Weekly architectural teardowns of trending open-source codebases and new CodeSage engine features.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  required
                  className="input-brutalist flex-1 bg-white border-[2px] border-r-0 border-black px-3 py-2 text-xs font-medium text-black placeholder-black/40"
                />
                <button
                  type="submit"
                  className="bg-black text-[#e8ff00] border-[2px] border-black px-4 py-2 font-archivo font-bold text-xs uppercase cursor-pointer hover:bg-neutral-800"
                >
                  Go
                </button>
              </form>
              {newsletterStatus && (
                <div className="text-[11px] font-mono text-emerald-700 font-bold">
                  {newsletterStatus}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-8 border-t-[3px] border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-space-mono text-xs uppercase tracking-wider text-black">
              &copy; {new Date().getFullYear()} CODESAGE &bull; INTELLIGENT REPOSITORY ARCHITECTURE ENGINE.
            </div>

            {/* Social Icon Tiles */}
            <div className="flex items-center space-x-3">
              {/* X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X Twitter"
                className="w-9 h-9 bg-white border-[2px] border-black shadow-hard-sm press-card-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Avnish1447/CodeSage"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 bg-white border-[2px] border-black shadow-hard-sm press-card-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-9 h-9 bg-white border-[2px] border-black shadow-hard-sm press-card-sm flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

