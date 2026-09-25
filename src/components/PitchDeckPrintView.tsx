import React from 'react';
import {
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
} from 'lucide-react';

export const PitchDeckPrintView: React.FC = () => {
  return (
    <div id="pitch-deck-print-container" className="hidden print:block">
      {/* ===================================================================
          SLIDE 1: TOPIC OF THE PROJECT
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              1. TOPIC OF THE PROJECT
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 1 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 shadow-sm flex-shrink-0">
              <img src="/logos/app-icon.png" alt="CodeSage" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                CodeSage Studio
              </h1>
              <p className="text-lg text-orange-600 font-playfair italic font-medium mt-1">
                Automated Codebase Geology & Grounded Retrieval-Augmented Generation Engine
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Codebase Stratigraphy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peels back repository file tree strata to calculate language distributions, identify framework signatures, and isolate entry points with complete hierarchy depth.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Grounded Gemini RAG</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero-hallucination AI Q&A powered by Google Gemini 2.5 Flash, anchored strictly in real ingested repo metadata and validated file paths.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Anti-Slop UI Craft</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built with crisp typographic hierarchy, responsive spring physics transitions, high-contrast dark/light palettes, and zero artificial marketing clutter.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 2: PROBLEM, OBJECTIVE & SCOPE
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              2. PROBLEM, OBJECTIVE & SCOPE
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 2 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Problem Statement, Objective & Scope
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Addressing software onboarding bottlenecks and AI accuracy challenges
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
              <div className="inline-flex items-center space-x-2 text-red-700 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Problem Statement</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2.5 list-disc list-inside">
                <li>Developers waste up to 70% of onboarding time navigating 10,000+ line codebases manually.</li>
                <li>Core entry points and API routes are hidden in complex nested folder hierarchies.</li>
                <li>Generic AI chat assistants hallucinate non-existent files and invalid package imports.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="inline-flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Core Objectives</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2.5 list-disc list-inside">
                <li>Compress initial codebase comprehension from hours to under 3 minutes.</li>
                <li>Deliver grounded, zero-hallucination Q&A using Gemini 2.5 Flash RAG prompts.</li>
                <li>Provide Technical Architecture vs. Simplified explanation style toggles.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="inline-flex items-center space-x-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Project Scope</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2.5 list-disc list-inside">
                <li>Public GitHub repository URL ingestion & real-time static file parsing.</li>
                <li>Language distribution ratio progress bars & framework signature matrix.</li>
                <li>Collapsible stratigraphy file tree & interactive AI learning roadmaps.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 3: HARDWARE & SOFTWARE REQUIREMENTS
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              3. HARDWARE & SOFTWARE REQUIREMENTS
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 3 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Hardware & Software Requirements
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Production Cloud Run container runtime, Vite client architecture, and Google GenAI SDK
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  <span>Backend Server & AI Engine</span>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-mono font-bold">Port 3000</span>
              </div>
              <div className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Runtime:</span>
                  <span className="font-mono text-slate-900 font-semibold">Node.js v22 LTS (ES Modules)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Server Framework:</span>
                  <span className="font-mono text-slate-900 font-semibold">Express.js 4.21 + CORS Middleware</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">AI SDK:</span>
                  <span className="font-mono text-emerald-700 font-semibold">@google/genai v0.2.0 (Gemini 2.5 Flash)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Production Bundler:</span>
                  <span className="font-mono text-amber-700 font-semibold">esbuild (dist/server.cjs)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">API Security:</span>
                  <span className="font-mono text-slate-900 font-semibold">Directory traversal guards & binary inspection</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
                  <Code2 className="w-4 h-4" />
                  <span>Frontend Client SPA</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">Vite 6 SPA</span>
              </div>
              <div className="space-y-2 text-xs pt-3">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">UI Library:</span>
                  <span className="font-mono text-slate-900 font-semibold">React 18.3 + TypeScript 5.7</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Styling Framework:</span>
                  <span className="font-mono text-slate-900 font-semibold">Tailwind CSS v3.4</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Design System:</span>
                  <span className="font-mono text-purple-700 font-semibold">Geist Sans & Geist Mono, Vercel tokens</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Motion Engine:</span>
                  <span className="font-mono text-slate-900 font-semibold">motion/react v12.4 spring physics</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Performance:</span>
                  <span className="font-mono text-emerald-700 font-semibold">Code-split PresentationMode (&lt; 70kB initial)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 4: ARCHITECTURE & TIMELINE
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              4. ARCHITECTURE & TIMELINE
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 4 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              System Topology & Process Flow
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-to-End Execution Sequence from GitHub Submission to Grounded RAG Ingestion
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { step: '1', title: 'Repo Submission', detail: 'User enters GitHub URL; frontend validates input.' },
              { step: '2', title: 'Ingestion & Clone', detail: 'Express API fetches repository trees via GitHub REST API.' },
              { step: '3', title: 'Static Parsing', detail: 'Computes language ratios & detects config manifests.' },
              { step: '4', title: 'Gemini Synthesis', detail: 'Gemini 2.5 Flash generates roadmap & summary.' },
              { step: '5', title: 'Grounded Chat', detail: 'Serves zero-hallucination RAG answers with citations.' },
            ].map((st) => (
              <div key={st.step} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center text-center space-y-2">
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                  {st.step}
                </div>
                <div className="text-xs font-bold text-slate-900">{st.title}</div>
                <div className="text-[10px] text-slate-600 leading-snug">{st.detail}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 font-bold uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution Timeline & Pipeline Sequence</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              POST /api/v1/repositories ➔ RepoCloneService.cloneOrFetch() ➔ RepoAnalysisService.analyze() ➔ geminiService.generateSummary() ➔ POST /chat RAG Streaming
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 5: USABILITY & APPLICATIONS
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              5. USABILITY & APPLICATIONS
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 5 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Usability & Real-World Applications
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Unlocking measurable efficiency gains across engineering, security, and education
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <Rocket className="w-4 h-4 text-orange-600" />
                <span>Enterprise Developer Onboarding</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Cuts initial developer orientation time from 2–3 days to under 10 minutes, enabling new software engineers to submit their first PR on Day 1.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Open Source Triage & Contributions</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Empowers open-source contributors to locate primary entry points, active frameworks, and architectural boundaries in seconds.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Code Quality & Security Auditing</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Enables security auditors to instantly inspect tech stack composition, verify config manifests (package.json, Dockerfile), and analyze dependency risks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Higher Education & Architecture Study</span>
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Allows students and computer science educators to dissect production-grade software architectures interactively with technical and simplified explanation modes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 6: TEAM CONTRIBUTIONS
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              6. TEAM CONTRIBUTIONS
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 6 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Team Member Contributions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Structured division of engineering responsibility across backend, AI, UI, and data ingestion
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Member 1</span>
                <span className="text-[10px] font-mono bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded font-bold">
                  Lead Full-Stack Architect
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Architected the Express + Vite unified server structure, REST API router endpoints, esbuild CommonJS bundling pipeline, and Cloud Run port 3000 execution setup.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Member 2</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  AI & RAG Systems Engineer
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Integrated Google GenAI SDK (@google/genai), engineered grounded system prompts, implemented technical vs simple explanation style toggles, and streaming RAG handlers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Member 3</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                  Frontend & Motion UI Developer
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Built React 18 SPA components (App.tsx, RagChatSection.tsx), integrated Motion spring physics transitions, and built the Lithos geological spotlight hero canvas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Member 4</span>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">
                  Data Parsing Specialist
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Developed repoCloneService.ts and repoAnalysisService.ts, created language regex parsing algorithms, framework signature detectors, and JSON storage schema.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>

      {/* ===================================================================
          SLIDE 7: REFERENCES & STANDARDS
          =================================================================== */}
      <div className="pitch-deck-print-page">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <img src="/logos/app-icon.png" alt="CodeSage" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-800">CodeSage Pitch Deck</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono font-semibold text-[#e8702a] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              7. REFERENCES
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Slide 7 of 7</span>
        </div>

        {/* Content */}
        <div className="my-auto space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              References & Standards
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Industry documentation, official specifications, and academic research
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { id: '[1]', title: 'Google GenAI SDK & Gemini API Guidelines', desc: 'Google DeepMind (2025-2026). @google/genai TypeScript SDK Specification & Gemini 2.5 Flash Reference.' },
              { id: '[2]', title: 'GitHub REST API v3 Specification', desc: 'GitHub Developer Network. Repositories, Git Trees, and Content Endpoints.' },
              { id: '[3]', title: 'React 18 & Vite Web Architecture', desc: 'React Core Team & Evan You. React 18 Concurrent Rendering and Vite 6 Build System.' },
              { id: '[4]', title: 'Express.js & ESM Server Standards', desc: 'Express Committee. Express 4.x API Reference & Container Integration.' },
              { id: '[5]', title: 'Retrieval-Augmented Generation (RAG) Research', desc: 'Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020.' },
            ].map((ref) => (
              <div key={ref.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start space-x-3">
                <span className="font-mono text-orange-600 font-bold">{ref.id}</span>
                <div>
                  <div className="font-bold text-slate-900">{ref.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{ref.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500 font-mono">
          <span>CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine</span>
          <span>Presentation Submission</span>
        </div>
      </div>
    </div>
  );
};
