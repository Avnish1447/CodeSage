import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Github, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-slate-900/80 border border-slate-800/80 border-t-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#e8702a]/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center space-x-2.5 mb-3">
        <div className="p-1 rounded-lg bg-slate-900 border border-purple-500/40 shadow-[0_0_12px_rgba(147,51,234,0.4)]">
          <picture>
            <source srcSet="/logos/app-icon.png" type="image/png" />
            <img src="/logos/app-icon.svg" alt="CodeSage" className="w-5 h-5 object-contain rounded" />
          </picture>
        </div>
        <span className="text-purple-300 text-xs font-mono font-semibold uppercase tracking-wider">
          Codebase Geology &bull; Gemini RAG Engine
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
        Peel Back the Layers of Any <span className="font-playfair italic font-normal text-[#e8702a]">GitHub Repository</span>
      </h2>
      <p className="text-slate-300 text-sm mb-6 max-w-2xl leading-relaxed">
        Enter a public GitHub repository URL to excavate file structures, detect tech stacks, and conduct deep RAG queries with Gemini AI.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            <Github className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            disabled={loading}
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-[#e8702a] focus:ring-2 focus:ring-[#e8702a]/20 text-white placeholder-slate-500 rounded-xl pl-12 pr-32 py-3.5 text-sm font-mono transition-all disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-2 px-5 py-2 bg-[#e8702a] hover:bg-[#d2611f] text-white font-medium text-sm rounded-lg shadow-md shadow-[#e8702a]/20 flex items-center space-x-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Excavating...</span>
              </>
            ) : (
              <>
                <span>Dig Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
          {SAMPLE_REPOS.map((sample) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={sample.url}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                onAnalyze(sample.url);
              }}
              disabled={loading}
              className="text-xs font-mono px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
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

