import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { RepoOverviewCard } from './components/RepoOverviewCard';
import { TechStackCard } from './components/TechStackCard';
import { FileTreeViewer } from './components/FileTreeViewer';
import { LearningPathCard } from './components/LearningPathCard';
import { RagChatSection } from './components/RagChatSection';
import { SkeletonLoader } from './components/SkeletonLoader';
import { LithosHero } from './components/LithosHero';
import { PresentationMode } from './components/PresentationMode';
import { LaunchVideoModal } from './components/LaunchVideoModal';
import { LaunchVideoShowcase } from './components/LaunchVideoShowcase';
import { BrandKitModal } from './components/BrandKitModal';
import { RepoResponse } from './types';
import {
  Sparkles,
  Terminal,
  Code2,
  Compass,
  MessageSquare,
  LayoutGrid,
  Layers,
  Folder,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Github,
  History,
  FolderGit2,
  CheckCircle2,
  ChevronRight,
  Presentation,
  Film,
  Play
} from 'lucide-react';

const PRESET_HISTORIES = [
  { name: 'Avnish1447/CodeSage', url: 'https://github.com/Avnish1447/CodeSage', lang: 'TypeScript' },
  { name: 'fastapi/fastapi', url: 'https://github.com/fastapi/fastapi', lang: 'Python' },
  { name: 'facebook/react', url: 'https://github.com/facebook/react', lang: 'JavaScript' },
  { name: 'pallets/flask', url: 'https://github.com/pallets/flask', lang: 'Python' },
];

export function App() {
  const [repoData, setRepoData] = useState<RepoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global Theme State: defaults to dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('codesage-theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('codesage-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  // Sidebar Collapse State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Launch Video Modal State
  const [launchVideoModalOpen, setLaunchVideoModalOpen] = useState(false);
  // Brand Kit Modal State
  const [brandKitModalOpen, setBrandKitModalOpen] = useState(false);

  // Workbench View Modes: 'split' | 'chat' | 'explorer' | 'presentation' | 'video'
  const [viewMode, setViewMode] = useState<'split' | 'chat' | 'explorer' | 'presentation' | 'video'>('split');
  // Left Panel Sub-tab inside split view or explorer: 'all' | 'stack' | 'tree' | 'learning'
  const [leftTab, setLeftTab] = useState<'all' | 'stack' | 'tree' | 'learning'>('all');

  const workbenchRef = useRef<HTMLDivElement | null>(null);

  const scrollToWorkbench = () => {
    workbenchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeRepository = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to analyze repository');
      }

      setRepoData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Analyze the default repo on mount
  useEffect(() => {
    analyzeRepository('https://github.com/Avnish1447/CodeSage');
    if (window.location.hash === '#workbench' || window.location.hash === '#studio') {
      setTimeout(scrollToWorkbench, 300);
    } else if (window.location.hash === '#launch' || window.location.hash === '#video') {
      setLaunchVideoModalOpen(true);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col tracking-[-0.02em] transition-colors duration-300 ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Lithos Full-Screen Spotlight Hero */}
      <LithosHero
        onStartDigging={scrollToWorkbench}
        onWatchLaunchVideo={() => setLaunchVideoModalOpen(true)}
      />

      {/* Transitional Section Banner */}
      <section className={`border-y py-10 px-6 text-center relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-slate-800/80' : 'bg-gradient-to-b from-slate-100 via-white to-slate-100 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-[#e8702a]/30 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-[0_0_15px_rgba(232,112,42,0.15)] whitespace-nowrap">
              <picture>
                <source srcSet="/logos/app-icon.png" type="image/png" />
                <img src="/logos/app-icon.svg" alt="CodeSage" className="w-4 h-4 object-contain rounded" />
              </picture>
              <span>CodeSage Stratigraphy Engine</span>
            </div>

            <button
              onClick={() => setBrandKitModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
              <span>Brand Assets</span>
            </button>

            <button
              onClick={() => setLaunchVideoModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25 border border-emerald-500/30 dark:border-emerald-500/35 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Video</span>
            </button>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Unearth Architecture & <span className="font-playfair italic text-[#e8702a]">Deep Code Knowledge</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Transition seamlessly from planetary geology to codebase inspection. Clone any repository, explore tree structures, and chat with Gemini RAG in real-time.
          </p>
        </div>
      </section>

      {/* Main Studio Container */}
      <div ref={workbenchRef} id="workbench" className={`pt-2 flex-1 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-100/70'}`}>
        <Header
          onOpenLaunchVideo={() => setLaunchVideoModalOpen(true)}
          onOpenBrandKit={() => setBrandKitModalOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
          {/* IDE STUDIO COLLAPSIBLE SIDEBAR */}
          <aside
            className={`border rounded-2xl p-4 transition-all duration-300 flex flex-col space-y-6 backdrop-blur-md ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 shadow-xl shadow-black/40 text-slate-100'
                : 'bg-white/95 border-slate-200 shadow-xl shadow-slate-200/50 text-slate-800'
            } ${
              sidebarOpen ? 'w-full lg:w-72 shrink-0' : 'w-14 shrink-0 items-center px-2'
            }`}
          >
            {/* Sidebar Header & Toggle */}
            <div className={`flex items-center justify-between w-full border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-5 h-5 text-[#e8702a]" />
                  <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Lithos Navigation</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            </div>

            {/* Sidebar Navigation Options */}
            {sidebarOpen ? (
              <div className="space-y-6 w-full">
                {/* Workbench Modes */}
                <div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Workbench View
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => setViewMode('split')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'split'
                          ? 'bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/20'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <LayoutGrid className="w-4 h-4" />
                        <span>Dual Workbench</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <button
                      onClick={() => setViewMode('chat')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'chat'
                          ? 'bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/20'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Full Chat Mode</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <button
                      onClick={() => setViewMode('explorer')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'explorer'
                          ? 'bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/20'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Code2 className="w-4 h-4" />
                        <span>Codebase Explorer</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <button
                      onClick={() => setViewMode('presentation')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'presentation'
                          ? 'bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/20'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Presentation className="w-4 h-4" />
                        <span>Pitch Deck Slides</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <button
                      onClick={() => setViewMode('video')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'video'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : isDark
                            ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                            : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Film className="w-4 h-4" />
                        <span>Launch Film & Kit</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>
                </div>

                {/* Sub-section Filter */}
                <div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Quick Section Filter
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setViewMode('split'); setLeftTab('all'); }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                        leftTab === 'all'
                          ? isDark
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'bg-slate-200 text-slate-900 font-semibold'
                          : isDark
                            ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-[#e8702a]" />
                      <span>Show All Sections</span>
                    </button>
                    <button
                      onClick={() => { setViewMode('split'); setLeftTab('stack'); }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                        leftTab === 'stack' ? 'bg-[#e8702a]/20 text-[#e8702a] font-semibold' : (isDark ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#e8702a]" />
                      <span>Tech Stack</span>
                    </button>
                    <button
                      onClick={() => { setViewMode('split'); setLeftTab('tree'); }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                        leftTab === 'tree' ? 'bg-[#e8702a]/20 text-[#e8702a] font-semibold' : (isDark ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-[#e8702a]" />
                      <span>File Tree</span>
                    </button>
                    <button
                      onClick={() => { setViewMode('split'); setLeftTab('learning'); }}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                        leftTab === 'learning' ? 'bg-[#e8702a]/20 text-[#e8702a] font-semibold' : (isDark ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#e8702a]" />
                      <span>Architecture Guide</span>
                    </button>
                  </div>
                </div>

                {/* Preset Repositories History */}
                <div>
                  <div className={`flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <History className="w-3.5 h-3.5 text-[#e8702a]" />
                    <span>Recent Repositories</span>
                  </div>
                  <div className="space-y-1">
                    {PRESET_HISTORIES.map((preset) => (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        key={preset.url}
                        onClick={() => {
                          analyzeRepository(preset.url);
                          scrollToWorkbench();
                        }}
                        disabled={loading}
                        className={`w-full text-left p-2 rounded-xl transition-colors cursor-pointer text-xs border ${
                          isDark
                            ? 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{preset.name}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{preset.lang}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Current Active Repo Meta */}
                {repoData && (
                  <div className={`p-3 border rounded-xl space-y-1 text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    <div className="font-bold text-[#e8702a] truncate">
                      {repoData.overview.owner}/{repoData.overview.repo}
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Files: {repoData.facts.stats.file_count} &bull; {repoData.overview.size_mb} MB
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-2">
                <button
                  onClick={() => setViewMode('split')}
                  title="Dual Workbench"
                  className={`p-2 rounded-xl text-xs font-semibold ${
                    viewMode === 'split'
                      ? 'bg-[#e8702a] text-white'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('chat')}
                  title="Full Chat Mode"
                  className={`p-2 rounded-xl text-xs font-semibold ${
                    viewMode === 'chat'
                      ? 'bg-[#e8702a] text-white'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('explorer')}
                  title="Codebase Explorer"
                  className={`p-2 rounded-xl text-xs font-semibold ${
                    viewMode === 'explorer'
                      ? 'bg-[#e8702a] text-white'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </aside>

          {/* MAIN STUDIO CANVAS */}
          <main className="flex-1 space-y-6 min-w-0">
            {/* Repo Input Box */}
            <RepoInput onAnalyze={analyzeRepository} loading={loading} error={error} />

            {/* Loading Skeleton State */}
            {loading && <SkeletonLoader />}

            {/* Results View */}
            {!loading && repoData && (
              <div className="space-y-6">
                {/* Top Control Header Bar */}
                <div className={`border rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-slate-800/80 shadow-2xl shadow-black/50 text-white' : 'bg-white/95 border-slate-200 shadow-xl shadow-slate-200/50 text-slate-900'}`}>
                  {/* Primary View Switcher with Liquid Spring Pills */}
                  <div className={`relative flex items-center overflow-x-auto max-w-full gap-1 sm:gap-1.5 p-1.5 rounded-full border shadow-inner ${isDark ? 'bg-slate-950/90 border-slate-800/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 rounded-full mr-1 whitespace-nowrap">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Active View</span>
                    </div>
                    
                    {[
                      { id: 'split', label: 'Dual Workbench', icon: LayoutGrid },
                      { id: 'chat', label: 'Full Chat Workbench', icon: MessageSquare },
                      { id: 'explorer', label: 'Codebase Explorer', icon: Code2 },
                      { id: 'presentation', label: 'Pitch Deck', icon: Presentation },
                      { id: 'video', label: 'Launch Film (38s / 18s)', icon: Film },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isActive = viewMode === mode.id;
                      return (
                        <motion.button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          whileTap={{ scale: 0.96 }}
                          className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer z-10 whitespace-nowrap ${
                            isActive
                              ? 'text-white'
                              : isDark
                                ? 'text-slate-400 hover:text-white'
                                : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeViewIndicator"
                              className="absolute inset-0 bg-[#e8702a] rounded-full shadow-lg shadow-[#e8702a]/30 -z-10"
                              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            />
                          )}
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/80 border-t-emerald-400/20 rounded-full text-emerald-400 font-semibold shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>RAG Indexing: <strong className="text-emerald-300">Ready</strong></span>
                    </span>
                  </div>
                </div>

                {/* Repo Summary & Key Metrics */}
                <RepoOverviewCard overview={repoData.overview} stats={repoData.facts.stats} />

                {/* WORKBENCH BODY WITH SPRING MOTION */}
                <AnimatePresence mode="wait">
                  {viewMode === 'split' && (
                    <motion.div
                      key="split"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                    >
                      {/* Left Workspace (7 cols): Codebase Insights */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Render based on sub-tab filter */}
                        {(leftTab === 'all' || leftTab === 'stack') && (
                          <TechStackCard facts={repoData.facts} />
                        )}
                        {(leftTab === 'all' || leftTab === 'tree') && (
                          <FileTreeViewer tree={repoData.facts.tree_summary} />
                        )}
                        {(leftTab === 'all' || leftTab === 'learning') && (
                          <LearningPathCard
                            learningPath={repoData.learning_path}
                            architectureSummary={repoData.architecture_summary}
                          />
                        )}
                      </div>

                      {/* Right Workspace (5 cols): RAG Chat Assistant */}
                      <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
                        <RagChatSection key={repoData.repository_id} repoData={repoData} heightClass="h-[840px]" />
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                      className="w-full"
                    >
                      <RagChatSection key={repoData.repository_id} repoData={repoData} heightClass="h-[820px]" />
                    </motion.div>
                  )}

                  {viewMode === 'explorer' && (
                    <motion.div
                      key="explorer"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TechStackCard facts={repoData.facts} />
                        <FileTreeViewer tree={repoData.facts.tree_summary} />
                      </div>
                      <LearningPathCard
                        learningPath={repoData.learning_path}
                        architectureSummary={repoData.architecture_summary}
                      />
                    </motion.div>
                  )}

                  {viewMode === 'presentation' && (
                    <motion.div
                      key="presentation"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                      className="w-full"
                    >
                      <PresentationMode isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
                    </motion.div>
                  )}

                  {viewMode === 'video' && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                      className="w-full"
                    >
                      <LaunchVideoShowcase />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State Welcome Hub featuring Updated Brand Emblem */}
            {!loading && !repoData && (
              <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl shadow-xl dark:shadow-2xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e8702a]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-5">
                  <div className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-[#e8702a]/30 shadow-[0_0_30px_rgba(232,112,42,0.25)]">
                    <picture>
                      <source srcSet="/logos/app-icon.png" type="image/png" />
                      <img
                        src="/logos/app-icon.svg"
                        alt="CodeSage Official Emblem"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
                      />
                    </picture>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Ready to Excavate Your Codebase
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Enter any public repository link above, or launch one of our curated archetypes to explore file structures and RAG intelligence:
                    </p>
                  </div>

                  {/* Quick Pick Sample Repos */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {[
                      { label: 'Fastify Web Framework', repo: 'https://github.com/fastify/fastify' },
                      { label: 'Express.js Core', repo: 'https://github.com/expressjs/express' },
                      { label: 'Lucide Icons', repo: 'https://github.com/lucide-icons/lucide' },
                    ].map((sample) => (
                      <button
                        key={sample.repo}
                        onClick={() => analyzeRepository(sample.repo)}
                        className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 hover:border-[#e8702a]/40 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm whitespace-nowrap"
                      >
                        <Github className="w-3.5 h-3.5 text-[#e8702a]" />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center space-x-3 text-xs">
                    <button
                      onClick={() => setBrandKitModalOpen(true)}
                      className="text-[#e8702a] hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Official Brand Kit</span>
                    </button>
                    <span className="text-slate-400 dark:text-slate-700">&bull;</span>
                    <button
                      onClick={() => setLaunchVideoModalOpen(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Cinematic Launch Video</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Launch Video Modal */}
      <LaunchVideoModal
        isOpen={launchVideoModalOpen}
        onClose={() => setLaunchVideoModalOpen(false)}
      />

      {/* Global Brand Kit Modal */}
      <BrandKitModal
        isOpen={brandKitModalOpen}
        onClose={() => setBrandKitModalOpen(false)}
      />

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src="/logos/primary-logo.svg" alt="CodeSage" className="w-5 h-5 object-contain" />
            <span className="font-playfair italic text-slate-900 dark:text-white text-sm">CodeSage</span>
            <span>&bull;</span>
            <span className="text-slate-600 dark:text-slate-400">Code Stratigraphy & Gemini RAG Studio</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setBrandKitModalOpen(true)}
              className="text-[#e8702a] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Brand Kit</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setLaunchVideoModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Video</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}



