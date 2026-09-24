import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GitBranch, ShieldCheck, Sparkles, Terminal, Film, Play, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenLaunchVideo?: () => void;
  onOpenBrandKit?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLaunchVideo,
  onOpenBrandKit,
  isDark = true,
  onToggleTheme,
}) => {
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline', version: '0.1.0' }));
  }, []);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 text-slate-800 dark:text-white shadow-sm dark:shadow-2xl dark:shadow-black/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 cursor-pointer group" title="CodeSage Studio">
            <picture>
              <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
              <source srcSet="/logos/text mark.png" type="image/png" />
              <img
                src="/logos/text mark.svg"
                alt="CodeSage"
                className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] brightness-100 dark:brightness-125 hover:brightness-110 dark:hover:brightness-150 transition-all duration-200"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('textmark.png')) {
                    target.src = '/logos/textmark.png';
                  }
                }}
              />
            </picture>

            <span className="text-slate-400 dark:text-slate-600 font-mono text-sm hidden sm:inline">/</span>
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-slate-600 dark:text-slate-300 hidden sm:inline">Studio</span>
            <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full whitespace-nowrap">
              v{health?.version || '0.1.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenBrandKit && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenBrandKit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-all shadow-sm whitespace-nowrap"
              title="View Official Brand Assets"
              aria-label="View official brand assets"
            >
              <img src="/logos/primary-logo.svg" alt="" className="w-3.5 h-3.5 object-contain" />
              <span className="hidden sm:inline">Brand Kit</span>
            </motion.button>
          )}

          {onOpenLaunchVideo && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenLaunchVideo}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer shadow-sm transition-all whitespace-nowrap"
              title="Watch Launch Film"
              aria-label="Watch launch film"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Film</span>
            </motion.button>
          )}

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Terminal className="w-3.5 h-3.5 text-[#e8702a]" />
            <span>API:</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              health?.status === 'healthy' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
            }`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              {health?.status || 'checking'}
            </span>
          </div>

          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer text-xs font-semibold whitespace-nowrap shadow-sm"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden sm:inline font-medium">{isDark ? 'Light' : 'Dark'}</span>
            </motion.button>
          )}

          <div
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-[#e8702a]/10 border border-[#e8702a]/30 text-[#e8702a] text-xs font-semibold shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="hidden md:inline">CodeSage Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};

