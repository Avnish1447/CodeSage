import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GitBranch, ShieldCheck, Sparkles, Terminal, Film, Play } from 'lucide-react';

interface HeaderProps {
  onOpenLaunchVideo?: () => void;
  onOpenBrandKit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLaunchVideo, onOpenBrandKit }) => {
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline', version: '0.1.0' }));
  }, []);

  return (
    <header className="border-b border-slate-800/80 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 text-white shadow-2xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 cursor-pointer group" title="CodeSage Studio">
            <picture>
              <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
              <source srcSet="/logos/text mark.png" type="image/png" />
              <img
                src="/logos/text mark.svg"
                alt="CodeSage"
                className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain drop-shadow-[0_2px_12px_rgba(168,85,247,0.4)] brightness-125 hover:brightness-150 transition-all duration-200"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('textmark.png')) {
                    target.src = '/logos/textmark.png';
                  }
                }}
              />
            </picture>

            <span className="text-slate-600 font-mono text-sm hidden sm:inline">/</span>
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-purple-300 hidden sm:inline">Studio</span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded-full">
              v{health?.version || '0.1.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenBrandKit && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenBrandKit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all shadow-sm"
              title="View Official Brand Assets"
            >
              <img src="/logos/primary-logo.svg" alt="" className="w-3.5 h-3.5 object-contain" />
              <span className="hidden sm:inline">Brand Kit</span>
            </motion.button>
          )}

          {onOpenLaunchVideo && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenLaunchVideo}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-500/10 transition-all"
              title="Watch Launch Film"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Film</span>
            </motion.button>
          )}

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-[#e8702a]" />
            <span>API:</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              health?.status === 'healthy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              {health?.status || 'checking'}
            </span>
          </div>

          <motion.div
            whileTap={{ scale: 0.96 }}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-[#e8702a]/10 border border-[#e8702a]/30 text-[#e8702a] text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="hidden md:inline">CodeSage Engine</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

