import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  Github,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';
import { RepoBranchesResponse } from '../types';

interface RepoInputProps {
  onAnalyze: (url: string, branch?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SAMPLE_REPOS = [
  { label: 'CodeSage', url: 'https://github.com/Avnish1447/CodeSage' },
  { label: 'Express.js', url: 'https://github.com/expressjs/express' },
  { label: 'FastAPI Framework', url: 'https://github.com/fastapi/fastapi' },
  { label: 'React Core', url: 'https://github.com/facebook/react' },
  { label: 'Flask Web', url: 'https://github.com/pallets/flask' },
];

export const RepoInput: React.FC<RepoInputProps> = ({ onAnalyze, loading, error }) => {
  const [url, setUrl] = useState('https://github.com/Avnish1447/CodeSage');
  const [branches, setBranches] = useState<string[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [hasMultipleBranches, setHasMultipleBranches] = useState<boolean>(false);
  const [isCheckingBranches, setIsCheckingBranches] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Validate GitHub URL format
  const isValidGitHubUrl = (input: string): boolean => {
    const trimmed = input.trim();
    return /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/)?.*$/.test(trimmed);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      setSearchQuery('');
    }
  }, [dropdownOpen]);

  // Debounced branch detection: inspect remote repository branches without cloning
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || !isValidGitHubUrl(trimmed)) {
      setHasMultipleBranches(false);
      setBranches([]);
      setSelectedBranch('');
      setIsCheckingBranches(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsCheckingBranches(true);
      try {
        const res = await fetch(`/api/v1/repositories/branches?url=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Failed to fetch remote branches');
        }
        const data: RepoBranchesResponse = await res.json();
        
        // Strictly show branch selector ONLY when multiple branches are confirmed
        if (data.has_multiple_branches && Array.isArray(data.branches) && data.branches.length > 1) {
          setBranches(data.branches);
          setDefaultBranch(data.default_branch || data.branches[0]);
          setSelectedBranch((prev) =>
            prev && data.branches.includes(prev) ? prev : data.default_branch || data.branches[0]
          );
          setHasMultipleBranches(true);
        } else {
          setHasMultipleBranches(false);
          setBranches(data.branches || []);
          setDefaultBranch(data.default_branch || 'main');
          setSelectedBranch(data.default_branch || 'main');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setHasMultipleBranches(false);
          setBranches([]);
        }
      } finally {
        setIsCheckingBranches(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onAnalyze(url.trim(), hasMultipleBranches && selectedBranch ? selectedBranch : undefined);
    }
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    setDropdownOpen(false);
    // Instantly switch and analyze the selected branch
    if (url.trim() && !loading) {
      onAnalyze(url.trim(), branch);
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 relative overflow-visible">
      {/* Brand & Engine Identifier */}
      <div className="flex items-center space-x-2.5 mb-3">
        <div className="p-1 rounded-md bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
          <picture>
            <source srcSet="/logos/app-icon.png" type="image/png" />
            <img src="/logos/app-icon.svg" alt="CodeSage" className="w-4 h-4 object-contain rounded" />
          </picture>
        </div>
        <span className="text-[#8F8F8F] dark:text-[#888888] text-xs font-mono uppercase tracking-wider font-medium">
          Stratigraphy Engine &bull; Gemini RAG
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-[#171717] dark:text-[#EDEDED] mb-2 tracking-[-0.03em]">
        Excavate & Inspect Any <span className="font-playfair italic font-normal text-[#e8702a]">GitHub Repository</span>
      </h2>
      <p className="text-[#4D4D4D] dark:text-[#A1A1A1] text-sm mb-6 max-w-2xl leading-relaxed">
        Enter a public GitHub repository URL to unearth file trees, detect tech stacks, and conduct context-grounded queries with Gemini AI.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-[#8F8F8F] dark:text-[#888888] pointer-events-none">
            <Github className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            aria-label="GitHub repository URL"
            disabled={loading}
            className="w-full bg-[#FAFAFA] dark:bg-[#161618] text-[#171717] dark:text-[#EDEDED] placeholder-[#8F8F8F] dark:placeholder-[#666666] shadow-[0_0_0_1px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] focus:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#0072F5] dark:focus:shadow-[0_0_0_2px_#000000,0_0_0_4px_#0072F5] outline-none rounded-lg pl-10 pr-32 py-2.5 text-xs sm:text-sm font-mono transition-all disabled:opacity-50"
          />

          {/* Micro Branch Checking Spinner */}
          {isCheckingBranches && (
            <div className="absolute right-32 hidden sm:flex items-center space-x-1.5 text-[#8F8F8F] text-[11px] font-mono pointer-events-none animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-[#e8702a]" />
              <span>inspecting branches...</span>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !url.trim()}
            aria-label="Dig and analyze repository"
            className="absolute right-1.5 px-4 py-1.5 bg-[#e8702a] hover:bg-[#d66320] text-white font-medium text-xs rounded-md shadow-sm flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Digging...</span>
              </>
            ) : (
              <>
                <span>Dig Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>

        {/* CONDITIONAL BRANCH SELECTOR: Rendered strictly when multiple branches exist */}
        <AnimatePresence>
          {hasMultipleBranches && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="overflow-visible"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-[#FAFAFA] dark:bg-[#161618] rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-[#EFEFEF] dark:bg-[#202024] text-[#e8702a]">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-[#4D4D4D] dark:text-[#A1A1A1] font-medium">
                      Branch:
                    </span>
                    <span className="text-[11px] font-mono text-[#8F8F8F] dark:text-[#777777]">
                      ({branches.length} detected)
                    </span>
                  </div>
                </div>

                {/* Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="px-2.5 py-1 bg-white dark:bg-[#1E1E22] hover:bg-[#F2F2F2] dark:hover:bg-[#26262B] text-[#171717] dark:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] rounded-md text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <GitBranch className="w-3 h-3 text-[#e8702a]" />
                    <span className="font-semibold text-xs">{selectedBranch || defaultBranch}</span>
                    {selectedBranch === defaultBranch && (
                      <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-[#8F8F8F]">
                        default
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#8F8F8F] transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180 text-[#e8702a]' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Dropdown Menu Popover */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-1.5 w-72 max-w-[90vw] bg-white dark:bg-[#18181B] shadow-[0_16px_36px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.14)] rounded-xl z-50 overflow-hidden"
                      >
                        {/* Popover Header & Search */}
                        <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#141416]">
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#888888] pointer-events-none" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Filter branches..."
                              className="w-full bg-white dark:bg-[#1F1F23] text-[#171717] dark:text-[#EDEDED] placeholder-[#888888] text-xs font-mono pl-8 pr-7 py-1.5 rounded-md outline-none shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] focus:shadow-[0_0_0_2px_#e8702a]"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 text-[#888888] hover:text-[#171717] dark:hover:text-[#EDEDED] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Branches List */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.03] scrollbar-thin">
                          {filteredBranches.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#888888] font-mono">
                              No matching branches found
                            </div>
                          ) : (
                            filteredBranches.map((branch) => {
                              const isSelected = branch === selectedBranch;
                              const isDefault = branch === defaultBranch;
                              return (
                                <button
                                  key={branch}
                                  type="button"
                                  onClick={() => handleBranchSelect(branch)}
                                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#e8702a]/10 text-[#e8702a] font-medium'
                                      : 'text-[#4D4D4D] dark:text-[#CCCCCC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                                    <div className="w-4 flex-shrink-0">
                                      {isSelected && <Check className="w-3.5 h-3.5 text-[#e8702a]" />}
                                    </div>
                                    <span className="truncate">{branch}</span>
                                  </div>
                                  {isDefault && (
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-[#8F8F8F] flex-shrink-0">
                                      default
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* Popover Footer */}
                        <div className="px-3 py-1.5 bg-[#FAFAFA] dark:bg-[#141416] border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-[#8F8F8F] flex items-center justify-between">
                          <span>
                            {filteredBranches.length} of {branches.length} branches
                          </span>
                          <span className="text-[10px] text-[#e8702a] font-medium">Click to excavate</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-rose-500/10 shadow-[0_0_0_1px_rgba(229,72,77,0.3)] rounded-lg text-rose-600 dark:text-rose-400 text-xs font-mono">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Preset Quick Repositories */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-[#8F8F8F] dark:text-[#888888] font-medium mr-1">Presets:</span>
          {SAMPLE_REPOS.map((sample) => (
            <motion.button
              whileTap={{ scale: 0.97 }}
              key={sample.url}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                onAnalyze(sample.url);
              }}
              disabled={loading}
              className="text-xs font-mono px-2.5 py-1 bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] text-[#4D4D4D] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-md transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-[#e8702a]" />
              <span>{sample.label}</span>
            </motion.button>
          ))}
        </div>
      </form>
    </div>
  );
};
