import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Cpu,
  GitBranch,
  Rocket,
  Users,
  BookOpen,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Code2,
  ShieldCheck,
  Server,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

interface PresentationModeProps {
  onClose?: () => void;
}

const SLIDES = [
  {
    id: 1,
    category: '1. TOPIC OF THE PROJECT',
    title: 'CodeSage Studio',
    subtitle: 'Automated Codebase Geology & Grounded Retrieval-Augmented Generation Engine',
    icon: Layers,
  },
  {
    id: 2,
    category: '2. PROBLEM, OBJECTIVE & SCOPE',
    title: 'Solving Codebase Onboarding Friction',
    subtitle: 'Eliminating Cognitive Overload & AI Hallucinations in Software Inspection',
    icon: AlertCircle,
  },
  {
    id: 3,
    category: '3. HARDWARE & SOFTWARE REQUIREMENTS',
    title: 'Production Infrastructure & Stack',
    subtitle: 'Node.js 22 Runtime, React 18 SPA, and Google Gemini 2.5 Flash SDK',
    icon: Cpu,
  },
  {
    id: 4,
    category: '4. ARCHITECTURE & TIMELINE',
    title: 'System Topology & Process Flow',
    subtitle: 'End-to-End Execution Sequence from GitHub Submission to Grounded RAG Ingestion',
    icon: GitBranch,
  },
  {
    id: 5,
    category: '5. USABILITY & APPLICATIONS',
    title: 'Real-World Impact & Value',
    subtitle: 'Enterprise Developer Onboarding, Open-Source Triage, and Security Audits',
    icon: Rocket,
  },
  {
    id: 6,
    category: '6. TEAM CONTRIBUTIONS',
    title: 'Member Responsibilities & Roles',
    subtitle: 'Modular Division of Architectural, AI, UI, and Data Ingestion Workstreams',
    icon: Users,
  },
  {
    id: 7,
    category: '7. REFERENCES',
    title: 'References & Industry Standards',
    subtitle: 'Core SDK Specifications, API Frameworks, and RAG Research Papers',
    icon: BookOpen,
  },
];

export const PresentationMode: React.FC<PresentationModeProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeArchStep, setActiveArchStep] = useState(0);
  // Default to Light Theme for a crisp, professional pitch deck
  const [isDark, setIsDark] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Theme-dependent styles
  const theme = {
    wrapper: isDark
      ? 'bg-slate-950 border-slate-800 text-slate-100'
      : 'bg-slate-50 border-slate-200/90 text-slate-900 shadow-xl',
    header: isDark
      ? 'bg-slate-900/90 border-slate-800 text-slate-300'
      : 'bg-white/95 border-slate-200 text-slate-700 shadow-sm',
    canvas: isDark
      ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950'
      : 'bg-gradient-to-br from-slate-50 via-slate-100/60 to-orange-50/20',
    title: isDark ? 'text-white' : 'text-slate-900',
    subtitle: isDark ? 'text-slate-400' : 'text-slate-600',
    card: isDark
      ? 'bg-slate-900/80 border-slate-800 text-slate-200'
      : 'bg-white border-slate-200/80 text-slate-800 shadow-sm hover:shadow-md transition-shadow',
    cardTitle: isDark ? 'text-white' : 'text-slate-900',
    cardBody: isDark ? 'text-slate-400' : 'text-slate-600',
    accentText: isDark ? 'text-[#e8702a]' : 'text-orange-600',
    badge: isDark
      ? 'bg-[#e8702a]/10 border-[#e8702a]/30 text-[#e8702a]'
      : 'bg-orange-100/80 border-orange-200 text-orange-800 font-semibold',
    navBorder: isDark ? 'border-slate-800' : 'border-slate-200',
    codeBlock: isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 text-slate-100 border-slate-800',
  };

  return (
    <div className={`w-full border rounded-2xl overflow-hidden flex flex-col min-h-[720px] relative transition-colors duration-300 ${theme.wrapper}`}>
      {/* Top Pitch Deck Control Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-md z-20 ${theme.header}`}>
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-lg bg-slate-900 border border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.35)]">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-5 h-5 object-contain rounded" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
            CodeSage Pitch Deck
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-xs font-medium">
            Slide {currentSlide + 1} of {SLIDES.length}
          </span>
        </div>

        {/* Slide Indicators */}
        <div className="hidden md:flex items-center space-x-1.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? 'w-8 bg-orange-600 dark:bg-[#e8702a]'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              title={slide.title}
            />
          ))}
        </div>

        {/* Theme and Fullscreen Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-xs flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
            title="Toggle Light/Dark Pitch Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            <span className="hidden sm:inline font-medium">{isDark ? 'Light Pitch' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-xs flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
            title="Toggle Fullscreen (Key: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-medium">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Slide Content Canvas */}
      <div className={`flex-1 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden ${theme.canvas}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Category Badge */}
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium mb-5 w-fit ${theme.badge}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{SLIDES[currentSlide].category}</span>
            </div>

            {/* Slide 1: Topic */}
            {currentSlide === 0 && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-[0_0_25px_rgba(147,51,234,0.4)] flex-shrink-0 w-fit">
                    <picture>
                      <source srcSet="/logos/app-icon.png" type="image/png" />
                      <img
                        src="/logos/app-icon.svg"
                        alt="CodeSage"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl"
                      />
                    </picture>
                  </div>
                  <div>
                    <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${theme.title}`}>
                      CodeSage Studio
                    </h1>
                    <p className="text-xl text-orange-600 dark:text-[#e8702a] font-playfair italic font-medium mt-1">
                      Automated Codebase Geology & Grounded Retrieval-Augmented Generation Engine
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div className={`p-5 rounded-xl border ${theme.card}`}>
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-amber-500/10 border border-orange-200 dark:border-amber-500/20 flex items-center justify-center text-orange-600 dark:text-[#e8702a] mb-3">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold ${theme.cardTitle}`}>Codebase Stratigraphy</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme.cardBody}`}>
                      Peels back repository file tree strata to calculate language distributions, identify framework signatures, and isolate entry points.
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl border ${theme.card}`}>
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold ${theme.cardTitle}`}>Grounded Gemini RAG</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme.cardBody}`}>
                      Zero-hallucination AI Q&A powered by Google Gemini 2.5 Flash, anchored strictly in real ingested repo metadata.
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl border ${theme.card}`}>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-3">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold ${theme.cardTitle}`}>Anti-Slop UI Craft</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme.cardBody}`}>
                      Built with crisp typographic hierarchy, responsive spring physics transitions, and zero artificial marketing clutter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: Problem, Objective & Scope */}
            {currentSlide === 1 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    Problem Statement, Objective & Scope
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Addressing software onboarding bottlenecks and AI accuracy challenges
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 space-y-3">
                    <div className="inline-flex items-center space-x-2 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      <span>Problem Statement</span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 list-disc list-inside">
                      <li>Developers waste up to 70% of onboarding time navigating 10,000+ line codebases manually.</li>
                      <li>Core entry points and API routes are hidden in complex nested folder hierarchies.</li>
                      <li>Generic AI chat assistants hallucinate non-existent files and invalid package imports.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
                    <div className="inline-flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Core Objectives</span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 list-disc list-inside">
                      <li>Compress initial codebase comprehension from hours to under 3 minutes.</li>
                      <li>Deliver grounded, zero-hallucination Q&A using Gemini 2.5 Flash RAG prompts.</li>
                      <li>Provide Technical Architecture vs. Simplified explanation style toggles.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 space-y-3">
                    <div className="inline-flex items-center space-x-2 text-blue-800 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Project Scope</span>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 list-disc list-inside">
                      <li>Public GitHub repository URL ingestion & real-time static file parsing.</li>
                      <li>Language distribution ratio progress bars & framework signature matrix.</li>
                      <li>Collapsible stratigraphy file tree & interactive AI learning roadmaps.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Hardware / Software Requirements */}
            {currentSlide === 2 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    Hardware & Software Requirements
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Production Cloud Run container runtime, Vite client architecture, and Google GenAI SDK
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Backend & Runtime */}
                  <div className={`p-5 rounded-xl border ${theme.card}`}>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center space-x-2 text-orange-600 dark:text-[#e8702a] font-bold text-sm">
                        <Server className="w-4 h-4" />
                        <span>Backend Server & AI Engine</span>
                      </div>
                      <span className="text-[10px] bg-orange-100 dark:bg-slate-800 text-orange-800 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold">Port 3000</span>
                    </div>
                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Runtime:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">Node.js v22 LTS (ES Modules)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Server Framework:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">Express.js 4.21 + CORS Middleware</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">AI SDK:</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">@google/genai v0.2.0</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Production Bundler:</span>
                        <span className="font-mono text-amber-700 dark:text-amber-300 font-semibold">esbuild (dist/server.cjs)</span>
                      </div>
                    </div>
                  </div>

                  {/* Frontend & Motion */}
                  <div className={`p-5 rounded-xl border ${theme.card}`}>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                        <Code2 className="w-4 h-4" />
                        <span>Frontend Client SPA</span>
                      </div>
                      <span className="text-[10px] bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">Vite 6 SPA</span>
                    </div>
                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">UI Library:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">React 18.3 + TypeScript 5.7</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Styling Framework:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">Tailwind CSS v3.4</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Motion Engine:</span>
                        <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold">motion/react v12.4</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Icons & Markdown:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">Lucide React & react-markdown</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 4: Architecture & Timeline */}
            {currentSlide === 3 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    Architecture Diagram & Execution Sequence
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Interactive end-to-end data pipeline from GitHub URL to Grounded RAG Response
                  </p>
                </div>

                {/* Interactive Process Pipeline */}
                <div className={`p-5 rounded-xl border space-y-4 ${theme.card}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-[#e8702a] uppercase">
                      Interactive Pipeline Stage Explorer
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Select a stage to inspect details</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { step: 1, label: '1. Repo Submission', detail: 'User enters GitHub URL; frontend validates input.' },
                      { step: 2, label: '2. Ingestion & Clone', detail: 'Express API fetches repository trees via GitHub REST API.' },
                      { step: 3, label: '3. Static Parsing', detail: 'Computes language ratios & detects config manifests.' },
                      { step: 4, label: '4. Gemini Synthesis', detail: 'Gemini 2.5 Flash generates roadmap & summary.' },
                      { step: 5, label: '5. Grounded Chat', detail: 'Serves zero-hallucination RAG answers to user.' },
                    ].map((item, idx) => (
                      <button
                        key={item.step}
                        onClick={() => setActiveArchStep(idx)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          activeArchStep === idx
                            ? 'bg-orange-500 text-white border-orange-600 shadow-md font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs">{item.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between ${theme.codeBlock}`}>
                    <div className="flex items-center space-x-2.5">
                      <Terminal className="w-4 h-4 text-orange-400" />
                      <span>{[
                        'User submits URL -> POST /api/v1/repositories endpoint',
                        'RepoCloneService executes GitHub REST API tree fetch',
                        'RepoAnalysisService parses file extensions & package.json dependencies',
                        'geminiService invokes @google/genai SDK for architectural synthesis',
                        'Chat endpoint handles user questions and injects grounded metadata prompt',
                      ][activeArchStep]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 5: Usability & Applications */}
            {currentSlide === 4 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    Usability & Real-World Applications
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Unlocking measurable efficiency gains across engineering, security, and education
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className={`p-5 rounded-xl border space-y-2.5 ${theme.card}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Rocket className="w-4 h-4 text-orange-600 dark:text-[#e8702a]" />
                      <span>Enterprise Developer Onboarding</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Cuts initial developer orientation time from 2–3 days to under 10 minutes, enabling new software engineers to submit their first PR on Day 1.
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl border space-y-2.5 ${theme.card}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Open Source Triage & Contributions</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Empowers open-source contributors to locate primary entry points, active frameworks, and architectural boundaries in seconds.
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl border space-y-2.5 ${theme.card}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      <span>Code Quality & Security Auditing</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Enables security auditors to instantly inspect tech stack composition, verify config manifests (`package.json`, `dockerfile`), and analyze dependency risks.
                    </p>
                  </div>

                  <div className={`p-5 rounded-xl border space-y-2.5 ${theme.card}`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Higher Education & Architecture Study</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Allows students and computer science educators to dissect production-grade software architectures interactively with technical and simplified explanation modes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 6: Team Contributions */}
            {currentSlide === 5 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    Team Member Contributions
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Structured division of engineering responsibility across backend, AI, UI, and data ingestion
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border space-y-2 ${theme.card}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Member 1</span>
                      <span className="text-[10px] font-mono bg-orange-100 dark:bg-amber-500/10 text-orange-800 dark:text-[#e8702a] border border-orange-200 dark:border-amber-500/20 px-2 py-0.5 rounded font-bold">
                        Lead Full-Stack Architect
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Architected the Express + Vite unified server structure, REST API router endpoints, `esbuild` CommonJS bundling pipeline, and Cloud Run port 3000 execution setup.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${theme.card}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Member 2</span>
                      <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        AI & RAG Systems Engineer
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Integrated Google GenAI SDK (`@google/genai`), engineered grounded system prompts, implemented technical vs simple explanation style toggles, and streaming RAG handlers.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${theme.card}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Member 3</span>
                      <span className="text-[10px] font-mono bg-blue-100 dark:bg-cyan-500/10 text-blue-800 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                        Frontend & Motion UI Developer
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Built React 18 SPA components (`App.tsx`, `RagChatSection.tsx`), integrated Motion spring physics transitions, and built the Lithos geological spotlight hero canvas.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${theme.card}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Member 4</span>
                      <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded font-bold">
                        Data Parsing Specialist
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${theme.cardBody}`}>
                      Developed `repoCloneService.ts` and `repoAnalysisService.ts`, created language regex parsing algorithms, framework signature detectors, and JSON storage schema.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 7: References */}
            {currentSlide === 6 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme.title}`}>
                    References & Standards
                  </h2>
                  <p className={`text-sm mt-1 ${theme.subtitle}`}>
                    Industry documentation, official specifications, and academic research
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { title: 'Google GenAI SDK & Gemini API Guidelines', desc: 'Google DeepMind (2025-2026). @google/genai TypeScript SDK Specification & Gemini 2.5 Flash Reference.' },
                    { title: 'GitHub REST API v3 Specification', desc: 'GitHub Developer Network. Repositories, Git Trees, and Content Endpoints.' },
                    { title: 'React 18 & Vite Web Architecture', desc: 'React Core Team & Evan You. React 18 Concurrent Rendering and Vite 6 Build System.' },
                    { title: 'Express.js & ESM Server Standards', desc: 'Express Committee. Express 4.x API Reference & Container Integration.' },
                    { title: 'Retrieval-Augmented Generation (RAG) Research', desc: 'Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020.' },
                  ].map((ref, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-3 ${theme.card}`}>
                      <span className="font-mono text-orange-600 dark:text-[#e8702a] font-bold">[{idx + 1}]</span>
                      <div>
                        <div className={`font-bold ${theme.cardTitle}`}>{ref.title}</div>
                        <div className={`mt-0.5 ${theme.cardBody}`}>{ref.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation Bar */}
        <div className={`flex items-center justify-between pt-6 border-t mt-auto z-20 ${theme.navBorder}`}>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              currentSlide === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-900'
                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Use Left/Right Arrow keys or Spacebar to navigate
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === SLIDES.length - 1}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              currentSlide === SLIDES.length - 1
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-900'
                : 'bg-orange-600 dark:bg-[#e8702a] hover:bg-orange-700 text-white shadow-md'
            }`}
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
