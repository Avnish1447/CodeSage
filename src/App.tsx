import React, { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
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
import { GitReversePromptCard } from './components/GitReversePromptCard';
import { FailedRequestCard } from './components/FailedRequestCard';
import { EmptyWorkbenchState } from './components/EmptyWorkbenchState';
import { LaunchVideoModal } from './components/LaunchVideoModal';
import { BrandKitModal } from './components/BrandKitModal';
import { NotFoundPage } from './components/NotFoundPage';
import { RepoResponse, CachedAnalysisSummary, GitReversePromptData } from './types';
import { indexedDbService } from './lib/indexedDbService';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import {
  saveRepositoryToUserHistory,
  getUserRepositoryHistory,
  type UserRepoHistoryItem,
} from './lib/supabase';
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
  Cloud,
  Zap,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const PRESET_HISTORIES = [
  { name: 'Avnish1447/CodeSage', url: 'https://github.com/Avnish1447/CodeSage', lang: 'TypeScript' },
  { name: 'fastapi/fastapi', url: 'https://github.com/fastapi/fastapi', lang: 'Python' },
  { name: 'facebook/react', url: 'https://github.com/facebook/react', lang: 'JavaScript' },
  { name: 'pallets/flask', url: 'https://github.com/pallets/flask', lang: 'Python' },
];

export function App() {
  const { showSuccess, showError, showInfo } = useToast();
  const [repoData, setRepoData] = useState<RepoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptedUrl, setLastAttemptedUrl] = useState<string>('https://github.com/Avnish1447/CodeSage');
  
  // 404 Route State
  const [is404, setIs404] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/404' ||
      path === '/404.html' ||
      hash === '#404' ||
      (path !== '/' &&
        path !== '/index.html' &&
        !path.startsWith('/api') &&
        !path.startsWith('/logos') &&
        !path.startsWith('/storage') &&
        !path.startsWith("/SVG's"))
    );
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      setIs404(
        path === '/404' ||
        path === '/404.html' ||
        hash === '#404' ||
        (path !== '/' &&
          path !== '/index.html' &&
          !path.startsWith('/api') &&
          !path.startsWith('/logos') &&
          !path.startsWith('/storage') &&
          !path.startsWith("/SVG's"))
      );
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Global Theme State: defaults to light mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('codesage_theme_v2');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Clean legacy key that previously defaulted to dark
    try {
      localStorage.removeItem('codesage-theme');
    } catch {
      // ignore
    }
    return false;
  });
  const [themeTransitionKey, setThemeTransitionKey] = useState<number>(0);
  const hasViewTransition = typeof document !== 'undefined' && 'startViewTransition' in document;

  useEffect(() => {
    localStorage.setItem('codesage_theme_v2', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    const nextDark = !isDark;

    const applyThemeChange = () => {
      // 1. Immediately toggle the class on documentElement
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('codesage_theme_v2', nextDark ? 'dark' : 'light');
      setIsDark(nextDark);
    };

    // Apply global cross-fade class to <html> for duration of transition
    document.documentElement.classList.add('theme-crossfade-active');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-crossfade-active');
    }, 550);

    // If browser supports View Transitions API, execute with flushSync
    // This forces React to synchronously commit the new theme to DOM before the after-snapshot is taken
    if (hasViewTransition) {
      (document as any).startViewTransition(() => {
        flushSync(() => {
          applyThemeChange();
        });
      });
    } else {
      // Fallback: trigger ambient veil overlay and synchronous state update
      setThemeTransitionKey((k) => k + 1);
      applyThemeChange();
    }
  };
  
  // Sidebar Collapse State (open by default on desktop, collapsed on mobile for clean first-view)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  // Workbench View Modes: 'split' | 'chat' | 'explorer'
  const [viewMode, setViewMode] = useState<'split' | 'chat' | 'explorer'>('split');
  // Left Panel Sub-tab inside split view or explorer: 'all' | 'prompt' | 'stack' | 'tree' | 'learning'
  const [leftTab, setLeftTab] = useState<'all' | 'prompt' | 'stack' | 'tree' | 'learning'>('all');

  // Gemini API Health & Key Exhaustion Guard State
  const [geminiStatus, setGeminiStatus] = useState<'live' | 'missing_key' | 'quota_exhausted'>('live');

  // GitReverse Prompt state
  const [isRefreshingPrompt, setIsRefreshingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Clerk Auth & Supabase Cloud State
  const { user } = useAuth();
  const [firestoreHistory, setFirestoreHistory] = useState<UserRepoHistoryItem[]>([]);

  // Local IndexedDB Cache State
  const [cachedList, setCachedList] = useState<CachedAnalysisSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states for Launch Video and Brand Kit
  const [showLaunchVideo, setShowLaunchVideo] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);

  const loadCachedList = async () => {
    try {
      const items = await indexedDbService.listAllCachedAnalyses();
      setCachedList(items);
    } catch {
      setCachedList([]);
    }
  };

  useEffect(() => {
    loadCachedList();
  }, []);

  // Inflight execution refs to prevent duplicate submissions & support cancellation
  const activeAnalysisAbortRef = useRef<AbortController | null>(null);
  const currentInflightRepoRef = useRef<string | null>(null);

  const handleReverseEngineer = async (force: boolean = false) => {
    if (!repoData?.repository_id || isRefreshingPrompt) return;
    setIsRefreshingPrompt(true);
    setPromptError(null);

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort(new Error('GitReverse prompt generation timed out after 25s.'));
    }, 25000);

    try {
      const url = `/api/v1/repositories/${repoData.repository_id}/reverse-prompt${force ? '?force=true' : ''}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutTimer);
      if (res.ok) {
        const promptData: GitReversePromptData = await res.json();
        const updated: RepoResponse = {
          ...repoData,
          gitreverse_prompt: promptData,
        };
        setRepoData(updated);
        await indexedDbService.saveAnalysisToCache(updated);
        showSuccess('Reverse prompt ready', 'GitReverse architecture prompt generated.');
      } else {
        let errMsg = `Failed to generate prompt (status ${res.status})`;
        try {
          const errData = await res.json();
          if (errData?.detail || errData?.error) {
            errMsg = errData.detail || errData.error;
            if (errData.retry_after_seconds) {
              errMsg += ` - Retry after ${errData.retry_after_seconds}s`;
            }
          }
        } catch {
          // ignore
        }
        setPromptError(errMsg);
        showError('Prompt generation failed', errMsg);
      }
    } catch (err: any) {
      console.error('Failed to fetch GitReverse prompt:', err);
      const msg = err?.message || 'Network error fetching GitReverse prompt';
      setPromptError(msg);
      showError('Prompt generation failed', msg);
    } finally {
      setIsRefreshingPrompt(false);
    }
  };

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

  const analyzeRepository = async (url: string, branch?: string, forceRefresh = false) => {
    const trimmed = url.trim();
    const requestKey = `${trimmed}#${branch || ''}`;

    // 1. Prevent duplicate submissions: If an identical analysis is already in-flight, ignore redundant click
    if (loading && currentInflightRepoRef.current === requestKey && !forceRefresh) {
      console.log('[App] Analysis already in-flight for this repository, ignoring duplicate request.');
      return;
    }

    // 2. Abort previous active excavation if user requested a different repository
    if (activeAnalysisAbortRef.current) {
      activeAnalysisAbortRef.current.abort();
    }
    const abortController = new AbortController();
    activeAnalysisAbortRef.current = abortController;
    currentInflightRepoRef.current = requestKey;

    setError(null);
    setLastAttemptedUrl(trimmed);

    // 3. Instant Cache-First Load from Client IndexedDB (< 5ms)
    if (!forceRefresh) {
      try {
        const localCached = await indexedDbService.getCachedAnalysis(trimmed, branch);
        if (localCached) {
          setRepoData(localCached);
          setLoading(false);
          currentInflightRepoRef.current = null;
          loadCachedList();
          showInfo('Loaded from cache', `${localCached.overview.owner}/${localCached.overview.repo} (0ms instant access)`);
          return;
        }
      } catch (err) {
        console.warn('[App] IndexedDB read error, falling back to server:', err);
      }
    }

    setLoading(true);
    setIsRefreshing(forceRefresh);

    // 4. Set 90s client excavation timeout
    const timeoutId = setTimeout(() => {
      abortController.abort(
        new Error('Repository excavation timed out after 90 seconds. Deep AST analysis or remote git clone took longer than expected. Please retry.')
      );
    }, 90000);

    try {
      const res = await fetch('/api/v1/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, branch, force_refresh: forceRefresh }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        let msg = data.detail || data.error || 'Failed to analyze repository';
        if (data.retry_after_seconds) {
          msg += ` (Please retry after ${data.retry_after_seconds}s)`;
        }
        throw new Error(msg);
      }

      setRepoData(data);
      if (data.gemini_status) {
        setGeminiStatus(data.gemini_status);
      }

      // Automatically store in client-side IndexedDB for instant 0ms future reloads
      await indexedDbService.saveAnalysisToCache(data);
      loadCachedList();
      showSuccess(
        forceRefresh ? 'Repository refreshed' : 'Repository excavated',
        `${data.overview.owner}/${data.overview.repo} (${data.facts?.stats?.file_count || 0} files) analyzed.`
      );

      // Automatically sync analyzed repository to user's personal Firestore history
      if (user?.uid) {
        saveRepositoryToUserHistory(user.uid, data).then(() => {
          getUserRepositoryHistory(user.uid).then((items) => {
            setFirestoreHistory(items);
          });
        });
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        if (abortController.signal.reason instanceof Error) {
          setError(abortController.signal.reason.message);
          showError('Excavation timeout', abortController.signal.reason.message);
        } else {
          // Request was superseded by another repo request, ignore silently
          return;
        }
      } else {
        const msg = err.message || 'An unknown error occurred';
        setError(msg);
        showError('Excavation failed', msg);
      }
    } finally {
      if (currentInflightRepoRef.current === requestKey) {
        currentInflightRepoRef.current = null;
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };



  // Dynamic Page Title & SEO Meta Description Sync
  useEffect(() => {
    let title = 'CodeSage – Intelligent Codebase Stratigraphy & Grounded RAG Architecture Engine';
    let metaDescription = 'Deep codebase stratigraphy and grounded AST architecture engine. Parse Git trees, unearth layered dependencies, detect tech stacks, and query repository structures with grounded Google Gemini RAG.';

    if (showLaunchVideo) {
      title = 'CodeSage Launch Film & Cinematic Showcase | CodeSage';
      metaDescription = 'Experience the 3D cinematic film and teaser showcasing CodeSage codebase stratigraphy, speed-ramped AST coring, and grounded technical RAG.';
    } else if (showBrandKit) {
      title = 'Official Brand Assets & Identity Kit | CodeSage';
      metaDescription = 'Download official vector logos, monochrome marks, typography assets, and application icons for CodeSage.';
    } else if (loading) {
      const targetName = lastAttemptedUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '') || 'Repository';
      title = `Analyzing ${targetName}… | CodeSage`;
      metaDescription = `Excavating and analyzing ${targetName} codebase structure, stratigraphy layers, and dependency topology.`;
    } else if (error) {
      title = `Analysis Error | CodeSage Studio`;
      metaDescription = `Encountered an issue analyzing the requested repository. Review diagnostics and retry options.`;
    } else if (repoData) {
      const sectionName =
        leftTab === 'prompt' ? 'GitReverse Prompt' :
        leftTab === 'stack' ? 'Tech Stack' :
        leftTab === 'tree' ? 'File Tree' :
        leftTab === 'learning' ? 'Architecture Guide' :
        'Stratigraphy & Architecture';
      const primaryLang = Object.keys(repoData.facts?.languages || {})[0] || 'Codebase';
      title = `${repoData.overview.owner}/${repoData.overview.repo} – ${sectionName} | CodeSage`;
      metaDescription = `Architectural stratigraphy of ${repoData.overview.owner}/${repoData.overview.repo} (${primaryLang}). Explore dependencies, structural files, and ask grounded questions.`;
    }

    document.title = title;

    // Dynamically update standard meta description and Open Graph description tags
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', metaDescription);

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) ogTitleTag.setAttribute('content', title);

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) ogDescTag.setAttribute('content', metaDescription);

    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleTag) twitterTitleTag.setAttribute('content', title);

    const twitterDescTag = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescTag) twitterDescTag.setAttribute('content', metaDescription);
  }, [loading, error, viewMode, repoData, leftTab, lastAttemptedUrl, showLaunchVideo, showBrandKit]);

  // Check health and analyze the default repo on mount
  useEffect(() => {
    if (is404) return;
    checkGeminiHealth(false);
    analyzeRepository('https://github.com/Avnish1447/CodeSage');
    if (window.location.hash === '#workbench' || window.location.hash === '#studio') {
      setTimeout(scrollToWorkbench, 300);
    }
  }, [is404]);

  if (is404) {
    return <NotFoundPage />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'dark bg-black text-[#EDEDED]' : 'bg-[#FAFAFA] text-[#171717]'}`}>
      {/* Smooth Theme Cross-Fade Ambient Overlay (Fallback for non-ViewTransition browsers) */}
      <AnimatePresence>
        {!hasViewTransition && themeTransitionKey > 0 && (
          <motion.div
            key={`theme-crossfade-${themeTransitionKey}`}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 pointer-events-none z-[9999] ${
              isDark ? 'bg-black' : 'bg-[#FAFAFA]'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Lithos Full-Screen Spotlight Hero */}
      <LithosHero
        onStartDigging={scrollToWorkbench}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
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
          onToggleTheme={handleToggleTheme}
        />

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6 items-start">
          {/* IDE STUDIO COLLAPSIBLE SIDEBAR */}
          <aside
            className={`shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl transition-all duration-200 flex flex-col ${
              isDark
                ? 'bg-[#111113] text-[#EDEDED]'
                : 'bg-white text-[#171717]'
            } ${
              sidebarOpen
                ? 'w-full lg:w-72 shrink-0 p-4 space-y-5'
                : 'w-full lg:w-14 shrink-0 p-2.5 lg:p-2 lg:items-center space-y-0 lg:space-y-3'
            }`}
          >
            {/* Sidebar Header & Toggle */}
            <div className={`flex items-center justify-between w-full ${sidebarOpen ? 'pb-3 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]' : 'pb-0 lg:pb-2'}`}>
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-[#e8702a]" />
                <span className={`font-semibold text-sm tracking-[-0.28px] ${sidebarOpen ? 'inline' : 'inline lg:hidden'}`}>
                  {sidebarOpen ? 'Navigation' : 'Navigation & History'}
                </span>
              </div>
              <button
                type="button"
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
                      { id: 'prompt', label: 'Reverse Prompt', icon: Terminal },
                      { id: 'stack', label: 'Tech Stack', icon: Layers },
                      { id: 'tree', label: 'File Tree', icon: Folder },
                      { id: 'learning', label: 'Architecture Guide', icon: BookOpen },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = leftTab === item.id;
                      return (
                        <button
                          type="button"
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
                          type="button"
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
                          type="button"
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

                {/* Local IndexedDB Cache Section */}
                {cachedList.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] dark:text-[#888888]">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Local Cache</span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          ({cachedList.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await indexedDbService.clearAllCache();
                          loadCachedList();
                          showSuccess('Cache cleared', 'Local repository cache purged from IndexedDB.');
                        }}
                        className="text-[10px] text-[#8F8F8F] hover:text-rose-500 font-mono transition-colors cursor-pointer"
                        title="Purge local IndexedDB cache"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-1">
                      {cachedList.slice(0, 5).map((item) => (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          key={item.repository_id}
                          onClick={() => {
                            analyzeRepository(item.url, item.branch);
                            scrollToWorkbench();
                          }}
                          disabled={loading}
                          className="w-full text-left p-2 rounded-lg transition-colors cursor-pointer text-xs bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-between group"
                        >
                          <div className="min-w-0 pr-1">
                            <div className="font-medium text-[#171717] dark:text-[#EDEDED] truncate text-[11px]">
                              {item.owner}/{item.repo}
                            </div>
                            <div className="text-[10px] font-mono text-[#8F8F8F] dark:text-[#777777] flex items-center space-x-1">
                              <span>{item.branch}</span>
                              <span>&bull;</span>
                              <span>{item.files} files</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                            0ms
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] dark:text-[#888888] mb-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500/60" />
                      <span>Local Cache</span>
                    </div>
                    <div className="p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg text-xs bg-[#FAFAFA] dark:bg-[#161618] text-center space-y-1">
                      <p className="text-[11px] font-medium text-[#8F8F8F] dark:text-[#888888]">
                        No Cached Repositories
                      </p>
                      <p className="text-[10px] text-[#8F8F8F]/80 dark:text-[#777777] leading-relaxed">
                        Excavated codebases are cached in IndexedDB for 0ms offline access.
                      </p>
                    </div>
                  </div>
                )}

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
              <div className="hidden lg:flex flex-col items-center space-y-3 py-2">
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
                      type="button"
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

            {/* Error / Failed Request Recovery Card */}
            {error && !loading && (
              <FailedRequestCard
                error={error}
                onRetry={() => analyzeRepository(lastAttemptedUrl, undefined, true)}
                onLoadSample={() => analyzeRepository('https://github.com/Avnish1447/CodeSage')}
                onDismiss={() => setError(null)}
              />
            )}

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
                <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors duration-200">
                  {/* Primary View Switcher with Recessed Segmented Track */}
                  <div className="bg-[#F2F2F2] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-1 rounded-lg flex items-center overflow-x-auto max-w-full gap-1 no-scrollbar w-full sm:w-auto">
                    {[
                      { id: 'split', label: 'Dual Workbench', icon: LayoutGrid },
                      { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
                      { id: 'explorer', label: 'Code Explorer', icon: Code2 },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isActive = viewMode === mode.id;
                      return (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
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
                <RepoOverviewCard
                  overview={repoData.overview}
                  stats={repoData.facts.stats}
                  fromCache={repoData.from_cache}
                  cacheSource={repoData.cache_source}
                  onRefresh={() => analyzeRepository(repoData.overview.normalized_url, repoData.overview.branch, true)}
                  isRefreshing={isRefreshing}
                />

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
                        {/* GitReverse AI Builder Prompt */}
                        {(leftTab === 'all' || leftTab === 'prompt') && (
                          <GitReversePromptCard
                            promptData={repoData.gitreverse_prompt}
                            overview={repoData.overview}
                            onReverseEngineer={handleReverseEngineer}
                            isRefreshing={isRefreshingPrompt}
                            errorMessage={promptError}
                          />
                        )}

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
                          heightClass="h-[560px] sm:h-[700px] lg:h-[840px]"
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
                        heightClass="h-[540px] sm:h-[680px] lg:h-[820px]"
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
                      <GitReversePromptCard
                        promptData={repoData.gitreverse_prompt}
                        overview={repoData.overview}
                        onReverseEngineer={handleReverseEngineer}
                        isRefreshing={isRefreshingPrompt}
                        errorMessage={promptError}
                      />
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
                </AnimatePresence>
              </div>
            )}

            {/* Empty State Welcome Hub when no repository is loaded and no error */}
            {!loading && !repoData && !error && (
              <EmptyWorkbenchState onSelectSample={(sampleUrl) => analyzeRepository(sampleUrl)} />
            )}
          </main>
        </div>
      </div>

      <footer className="shadow-[0_-1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.08)] bg-white dark:bg-black pt-12 pb-8 text-xs text-[#8F8F8F] dark:text-[#888888] font-mono transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
            {/* Column 1: Brand & Stratigraphy Identity (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-3 pr-4">
              <a
                href="#workbench"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-2.5 hover:opacity-85 transition-opacity"
                title="CodeSage Studio – Back to Top"
              >
                <img src="/logos/primary-logo.svg" alt="CodeSage Logo" className="w-5 h-5 object-contain" />
                <span className="font-playfair italic text-[#171717] dark:text-[#EDEDED] text-base font-semibold">
                  CodeSage
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 rounded">
                  v0.1.0
                </span>
              </a>

              <p className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed max-w-sm font-sans">
                Deep codebase stratigraphy and grounded AST architecture engine. Excavate Git trees, unearth layered dependencies, and converse with code in real-time.
              </p>

              <div className="pt-1 flex items-center space-x-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#171717] dark:text-[#EDEDED] font-medium">All Systems Operational</span>
                <span className="text-black/20 dark:text-white/20">&bull;</span>
                <span className="text-[#8F8F8F]">99.98% SLA</span>
              </div>
            </div>

            {/* Column 2: Studio & Product */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#171717] dark:text-[#EDEDED]">
                Platform
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="#workbench"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToWorkbench();
                    }}
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors"
                  >
                    Studio Workbench
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Ecosystem & Status */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#171717] dark:text-[#EDEDED]">
                Ecosystem
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://github.com/Avnish1447/CodeSage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors flex items-center space-x-1.5"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub Repo</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.githubstatus.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors flex items-center space-x-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>GitHub Status</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors flex items-center space-x-1.5"
                  >
                    <ExternalLink className="w-3 h-3 text-[#e8702a]" />
                    <span>Gemini 2.5 API</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/api/v1/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors flex items-center space-x-1.5"
                  >
                    <span>Health Endpoint</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/404"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(null, '', '/404');
                      setIs404(true);
                    }}
                    className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Custom 404 Screen</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#666666] dark:text-[#888888]">
              <span>&copy; {new Date().getFullYear()} CodeSage Contributors. All rights reserved.</span>
              <span className="text-black/20 dark:text-white/20 hidden sm:inline">&bull;</span>
              <a
                href="https://github.com/Avnish1447/CodeSage/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#171717] dark:hover:text-[#EDEDED] underline decoration-dotted transition-colors"
              >
                MIT License
              </a>
              <span className="text-black/20 dark:text-white/20 hidden sm:inline">&bull;</span>
              <span>Grounded AST &amp; Gemini RAG</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer flex items-center space-x-1 text-xs"
                title="Scroll back to top"
              >
                <span>Back to Top</span>
                <span>&uarr;</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <LaunchVideoModal
        isOpen={showLaunchVideo}
        onClose={() => setShowLaunchVideo(false)}
      />
      <BrandKitModal
        isOpen={showBrandKit}
        onClose={() => setShowBrandKit(false)}
      />
    </div>
  );
}



