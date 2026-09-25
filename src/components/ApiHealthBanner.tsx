import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  ZapOff,
  RefreshCw,
  ExternalLink,
  X,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export interface ApiHealthBannerProps {
  status?: 'live' | 'missing_key' | 'quota_exhausted' | 'model_error';
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export const ApiHealthBanner: React.FC<ApiHealthBannerProps> = ({
  status = 'live',
  onRetry,
  onDismiss,
  className = '',
  compact = false,
}) => {
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (status === 'live' || dismissed) {
    return null;
  }

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 600);
    }
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY=your_key_here');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const isMissingKey = status === 'missing_key';
  const isQuotaExhausted = status === 'quota_exhausted';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={`w-full rounded-xl transition-all ${
          isMissingKey
            ? 'bg-amber-500/[0.05] border border-amber-500/20 text-slate-800 dark:text-slate-200'
            : 'bg-orange-500/[0.05] border border-orange-500/25 text-slate-800 dark:text-slate-200'
        } ${compact ? 'p-3' : 'p-4 sm:p-4.5'} ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 min-w-0">
            {/* Icon */}
            <div
              className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                isMissingKey
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-orange-500/10 text-orange-600 dark:text-[#e8702a] border border-orange-500/20'
              }`}
            >
              {isMissingKey ? (
                <KeyRound className="w-4 h-4" />
              ) : (
                <ZapOff className="w-4 h-4" />
              )}
            </div>

            {/* Banner Text */}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  {isMissingKey
                    ? 'Gemini API Key Missing'
                    : 'Gemini Free-Tier Rate Limit Reached'}
                </span>
                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                    isMissingKey
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-orange-500/10 text-orange-700 dark:text-[#e8702a] border border-orange-500/20'
                  }`}
                >
                  {isMissingKey ? 'Action Required' : 'Temporary Quota Limit'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isMissingKey ? (
                  <>
                    Live AI Q&A and learning paths are running in{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      static heuristic mode
                    </span>
                    . Add your key to <code className="font-mono text-[11px] bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> to activate live Gemini RAG analysis.
                  </>
                ) : (
                  <>
                    Gemini API free-tier quotas (RPM/TPM) are currently saturated. The
                    workbench has safely switched to{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      grounded static heuristics
                    </span>
                    . Free limits usually reset in 60 seconds.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                {isMissingKey ? (
                  <>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={handleCopyEnv}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied .env format!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy .env snippet</span>
                        </>
                      )}
                    </button>
                    {onRetry && (
                      <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${retrying ? 'animate-spin text-amber-500' : ''}`}
                        />
                        <span>{retrying ? 'Checking .env...' : 'Check Key Status'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {onRetry && (
                      <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-medium bg-orange-600 dark:bg-[#e8702a] hover:bg-orange-700 text-white transition-colors cursor-pointer shadow-sm"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`}
                        />
                        <span>{retrying ? 'Re-probing quota...' : 'Retry Connection'}</span>
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-slate-500">
                      Auto-retries on next chat message
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
