import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
    <header className="border-b border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA]/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-50 text-[#171717] dark:text-[#EDEDED] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 cursor-pointer group" title="CodeSage Studio">
            <picture>
              <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
              <source srcSet="/logos/text mark.png" type="image/png" />
              <img
                src="/logos/text mark.svg"
                alt="CodeSage"
                className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain brightness-100 dark:brightness-125 hover:opacity-85 transition-opacity duration-150"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('textmark.png')) {
                    target.src = '/logos/textmark.png';
                  }
                }}
              />
            </picture>

            <span className="text-neutral-400 dark:text-neutral-600 font-mono text-xs hidden sm:inline">/</span>
            <span className="font-medium text-xs sm:text-sm tracking-tight text-[#4D4D4D] dark:text-[#A1A1A1] hidden sm:inline">Studio</span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-md whitespace-nowrap">
              v{health?.version || '0.1.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded-md text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>API: {health?.status || 'online'}</span>
          </div>

          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[#4D4D4D] hover:text-[#171717] hover:bg-[#EBEBEB] dark:text-[#A1A1A1] dark:hover:text-[#EDEDED] dark:hover:bg-[#1a1a1d] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5]"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4D4D4D]" />}
            </motion.button>
          )}

          <div
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="hidden md:inline font-mono">CodeSage AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};

