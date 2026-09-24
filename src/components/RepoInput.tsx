import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Github, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RepoInputProps {
  onAnalyze: (url: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SAMPLE_REPOS = [
  { label: 'CodeSage', url: 'https://github.com/Avnish1447/CodeSage' },
  { label: 'FastAPI Framework', url: 'https://github.com/fastapi/fastapi' },
  { label: 'React Core', url: 'https://github.com/facebook/react' },
  { label: 'Flask Web', url: 'https://github.com/pallets/flask' },
];

export const RepoInput: React.FC<RepoInputProps> = ({ onAnalyze, loading, error }) => {
  const [url, setUrl] = useState('https://github.com/Avnish1447/CodeSage');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 relative overflow-hidden">
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

        {error && (
          <div className="p-3 bg-rose-500/10 shadow-[0_0_0_1px_rgba(229,72,77,0.3)] rounded-lg text-rose-600 dark:text-rose-400 text-xs font-mono">
            <strong>Error:</strong> {error}
          </div>
        )}

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

