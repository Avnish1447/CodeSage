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
import { ApiHealthBanner } from './components/ApiHealthBanner';
const PresentationMode = React.lazy(() =>
  import('./components/PresentationMode').then((m) => ({ default: m.PresentationMode }))
);
import { RepoResponse } from './types';
import { useAuth } from './context/AuthContext';
import {
  saveRepositoryToUserHistory,
  getUserRepositoryHistory,
  type UserRepoHistoryItem,
} from './lib/firebase';
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
  Cloud,
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

  // Workbench View Modes: 'split' | 'chat' | 'explorer' | 'presentation'
  const [viewMode, setViewMode] = useState<'split' | 'chat' | 'explorer' | 'presentation'>('split');
  // Left Panel Sub-tab inside split view or explorer: 'all' | 'stack' | 'tree' | 'learning'
  const [leftTab, setLeftTab] = useState<'all' | 'stack' | 'tree' | 'learning'>('all');

  // Gemini API Health & Key Exhaustion Guard State
  const [geminiStatus, setGeminiStatus] = useState<'live' | 'missing_key' | 'quota_exhausted'>('live');

  // Firebase Auth & Firestore State
  const { user } = useAuth();
  const [firestoreHistory, setFirestoreHistory] = useState<UserRepoHistoryItem[]>([]);

  // Load user repository history from Firestore when authenticated
  useEffect(() => {
    if (user?.uid) {
      getUserRepositoryHistory(user.uid).then((items) => {
        setFirestoreHistory(items);
      });
    } else {
      setFirestoreHistory([]);
    }
  }, [user]);

  const checkGeminiHealth = async (forceProbe: boolean = false) => {
    try {
      const res = await fetch(`/api/v1/gemini/health?probe=${forceProbe}`);
      if (res.ok) {
        const data = await res.json();
        setGeminiStatus(data.status || (data.configured ? 'live' : 'missing_key'));
      }
    } catch {
      // network error, ignore
    }
  };

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
      if (data.gemini_status) {
        setGeminiStatus(data.gemini_status);
      }

      // Automatically sync analyzed repository to user's personal Firestore history
      if (user?.uid) {
        saveRepositoryToUserHistory(user.uid, data).then(() => {
          getUserRepositoryHistory(user.uid).then((items) => {
            setFirestoreHistory(items);
          });
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check health and analyze the default repo on mount
  useEffect(() => {
    checkGeminiHealth(false);
    analyzeRepository('https://github.com/Avnish1447/CodeSage');
    if (window.location.hash === '#workbench' || window.location.hash === '#studio') {
      setTimeout(scrollToWorkbench, 300);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'dark bg-black text-[#EDEDED]' : 'bg-[#FAFAFA] text-[#171717]'}`}>
      {/* Lithos Full-Screen Spotlight Hero */}
      <LithosHero
        onStartDigging={scrollToWorkbench}
      />

      {/* Transitional Section Banner */}
      <section className={`py-9 px-6 text-center relative overflow-hidden transition-colors duration-200 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)] ${isDark ? 'bg-black' : 'bg-[#FAFAFA]'}`}>
        <div className="max-w-4xl mx-auto space-y-3.5">

          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-[-1.28px] ${isDark ? 'text-white' : 'text-[#171717]'}`}>
            Unearth Architecture & <span className="font-playfair italic font-normal text-[#e8702a]">Deep Code Knowledge</span>
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed ${isDark ? 'text-[#8F8F8F]' : 'text-[#4D4D4D]'}`}>
            Transition seamlessly from planetary geology to codebase inspection. Clone any repository, explore tree structures, and chat with Gemini RAG in real-time.
          </p>
        </div>
      </section>

      {/* Main Studio Container */}
      <div ref={workbenchRef} id="workbench" className={`pt-2 flex-1 transition-colors duration-200 ${isDark ? 'bg-black' : 'bg-[#FAFAFA]'}`}>
        <Header
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
          {/* IDE STUDIO COLLAPSIBLE SIDEBAR */}
          <aside
            className={`shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-4 transition-all duration-200 flex flex-col space-y-5 ${
              isDark
                ? 'bg-[#111113] text-[#EDEDED]'
                : 'bg-white text-[#171717]'
            } ${
              sidebarOpen ? 'w-full lg:w-72 shrink-0' : 'w-14 shrink-0 items-center px-2'
            }`}
          >
            {/* Sidebar Header & Toggle */}
            <div className="flex items-center justify-between w-full pb-3 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-[#e8702a]" />
                  <span className="font-semibold text-sm tracking-[-0.28px]">Navigation</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-[#1f1f23] text-[#8F8F8F] hover:text-white'
                    : 'hover:bg-[#F2F2F2] text-[#8F8F8F] hover:text-[#171717]'
                }`}
                title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar Navigation Options */}
            {sidebarOpen ? (
              <div className="space-y-5 w-full">
                {/* Sub-section Filter */}
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider mb-2 block text-[#8F8F8F] dark:text-[#888888]">
                    Quick Filter
                  </span>
                  <div className="space-y-1">
                    {[
                      { id: 'all', label: 'Show All Sections', icon: LayoutGrid },
                      { id: 'stack', label: 'Tech Stack', icon: Layers },
                      { id: 'tree', label: 'File Tree', icon: Folder },
                      { id: 'learning', label: 'Architecture Guide', icon: BookOpen },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = leftTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setViewMode('split'); setLeftTab(item.id as any); }}
                          className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-[#F2F2F2] dark:bg-[#202024] text-[#171717] dark:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                              : 'text-[#8F8F8F] dark:text-[#888888] hover:bg-[#FAFAFA] dark:hover:bg-[#161618] hover:text-[#171717] dark:hover:text-[#EDEDED]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-[#e8702a]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Repositories History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] dark:text-[#888888]">
                      <History className="w-3.5 h-3.5 text-[#e8702a]" />
                      <span>{user ? 'Your Repositories' : 'Recent Repositories'}</span>
                    </div>
                    {user && (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-500 font-mono" title="Synced with Firestore">
                        <Cloud className="w-3 h-3" />
                        <span>Cloud</span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {user && firestoreHistory.length > 0 ? (
                      firestoreHistory.map((item) => (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          key={item.repositoryId}
                          onClick={() => {
                            analyzeRepository(item.url);
                            scrollToWorkbench();
                          }}
                          disabled={loading}
                          className="w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer text-xs bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        >
                          <div className="font-medium text-[#171717] dark:text-[#EDEDED] truncate">{item.name}</div>
                          <div className="text-[10px] font-mono text-[#8F8F8F] dark:text-[#888888] mt-0.5">
                            {item.primaryLang} &bull; {item.filesCount} files
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      PRESET_HISTORIES.map((preset) => (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          key={preset.url}
                          onClick={() => {
                            analyzeRepository(preset.url);
                            scrollToWorkbench();
                          }}
                          disabled={loading}
                          className="w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer text-xs bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        >
                          <div className="font-medium text-[#171717] dark:text-[#EDEDED] truncate">{preset.name}</div>
                          <div className="text-[10px] font-mono text-[#8F8F8F] dark:text-[#888888] mt-0.5">{preset.lang}</div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Current Active Repo Meta */}
                {repoData && (
                  <div className="p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg space-y-1 text-xs bg-[#FAFAFA] dark:bg-[#161618]">
                    <div className="font-medium text-[#e8702a] truncate">
                      {repoData.overview.owner}/{repoData.overview.repo}
                    </div>
                    <div className="text-[11px] font-mono text-[#8F8F8F] dark:text-[#888888]">
                      Files: {repoData.facts.stats.file_count} &bull; {repoData.overview.size_mb} MB
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 py-2">
                {[
                  { id: 'all', title: 'Show All Sections', icon: LayoutGrid },
                  { id: 'stack', title: 'Tech Stack', icon: Layers },
                  { id: 'tree', title: 'File Tree', icon: Folder },
                  { id: 'learning', title: 'Architecture Guide', icon: BookOpen },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = leftTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setViewMode('split'); setLeftTab(item.id as any); }}
                      title={item.title}
                      className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#171717] text-white dark:bg-[#EDEDED] dark:text-[#171717]'
                          : 'text-[#8F8F8F] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] hover:text-[#171717] dark:hover:text-[#EDEDED]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
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
                {/* API Health & Key Exhaustion Guard Banner */}
                <ApiHealthBanner
                  status={geminiStatus}
                  onRetry={() => checkGeminiHealth(true)}
                />

                {/* Top Control Header Bar */}
                <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors duration-200">
                  {/* Primary View Switcher with Recessed Segmented Track */}
                  <div className="bg-[#F2F2F2] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-1 rounded-lg flex items-center overflow-x-auto max-w-full gap-1">
                    {[
                      { id: 'split', label: 'Dual Workbench', icon: LayoutGrid },
                      { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
                      { id: 'explorer', label: 'Code Explorer', icon: Code2 },
                      { id: 'presentation', label: 'Pitch Deck', icon: Presentation },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isActive = viewMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-[#EDEDED] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                              : 'text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-[#e8702a]" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Status Indicator Dot */}
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-xs font-mono text-[#171717] dark:text-[#EDEDED]">
                      <span className={`w-2 h-2 rounded-full ${
                        geminiStatus === 'missing_key'
                          ? 'bg-amber-500'
                          : geminiStatus === 'quota_exhausted'
                          ? 'bg-orange-500'
                          : 'bg-[#45A557] animate-pulse'
                      }`} />
                      <span>
                        AI Engine:{' '}
                        <strong className={`font-medium ${
                          geminiStatus === 'missing_key'
                            ? 'text-amber-500'
                            : geminiStatus === 'quota_exhausted'
                            ? 'text-orange-500'
                            : 'text-[#45A557]'
                        }`}>
                          {geminiStatus === 'missing_key' ? 'Key Missing' : geminiStatus === 'quota_exhausted' ? 'Quota Busy' : 'Online'}
                        </strong>
                      </span>
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
                          <FileTreeViewer
                            tree={repoData.facts.tree_summary}
                            repositoryId={repoData.repository_id}
                          />
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
                        <RagChatSection
                          key={repoData.repository_id}
                          repoData={repoData}
                          heightClass="h-[840px]"
                          geminiStatus={geminiStatus}
                          onStatusChange={setGeminiStatus}
                        />
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
                      <RagChatSection
                        key={repoData.repository_id}
                        repoData={repoData}
                        heightClass="h-[820px]"
                        geminiStatus={geminiStatus}
                        onStatusChange={setGeminiStatus}
                      />
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
                        <FileTreeViewer
                          tree={repoData.facts.tree_summary}
                          repositoryId={repoData.repository_id}
                        />
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
                      <React.Suspense
                        fallback={
                          <div className="flex flex-col items-center justify-center p-16 space-y-3 rounded-xl bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)]">
                            <div className="w-5 h-5 border-2 border-[#e8702a] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-mono text-[#8F8F8F]">Loading presentation deck...</span>
                          </div>
                        }
                      >
                        <PresentationMode isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
                      </React.Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State Welcome Hub featuring Updated Brand Emblem */}
            {!loading && !repoData && (
              <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-4">
                  <div className="relative p-2 rounded-xl bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(232,112,42,0.3)]">
                    <picture>
                      <source srcSet="/logos/app-icon.png" type="image/png" />
                      <img
                        src="/logos/app-icon.svg"
                        alt="CodeSage Official Emblem"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg"
                      />
                    </picture>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] dark:text-[#EDEDED] tracking-[-0.03em]">
                      Ready to Excavate Your Codebase
                    </h3>
                    <p className="text-sm text-[#4D4D4D] dark:text-[#A1A1A1] mt-1 leading-relaxed">
                      Enter any public repository link above, or launch one of our curated archetypes to explore file structures and RAG intelligence:
                    </p>
                  </div>

                  {/* Quick Pick Sample Repos */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {[
                      { label: 'Fastify Web Framework', repo: 'https://github.com/fastify/fastify' },
                      { label: 'Express.js Core', repo: 'https://github.com/expressjs/express' },
                      { label: 'Lucide Icons', repo: 'https://github.com/lucide-icons/lucide' },
                    ].map((sample) => (
                      <button
                        key={sample.repo}
                        onClick={() => analyzeRepository(sample.repo)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#FAFAFA] hover:bg-[#F2F2F2] dark:bg-[#161618] dark:hover:bg-[#1f1f23] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-xs font-mono text-[#171717] dark:text-[#EDEDED] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Github className="w-3.5 h-3.5 text-[#e8702a]" />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="shadow-[0_-1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.08)] bg-white dark:bg-black py-7 text-center text-xs text-[#8F8F8F] dark:text-[#888888] font-mono transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src="/logos/primary-logo.svg" alt="CodeSage" className="w-4 h-4 object-contain" />
            <span className="font-playfair italic text-[#171717] dark:text-[#EDEDED] text-sm">CodeSage</span>
            <span>&bull;</span>
            <span className="text-[#4D4D4D] dark:text-[#A1A1A1]">Code Stratigraphy & Gemini RAG Studio</span>
          </div>

          <div className="text-xs text-[#8F8F8F] dark:text-[#666666] font-mono">
            Powered by Gemini RAG & AST Stratigraphy
          </div>
        </div>
      </footer>
    </div>
  );
}



