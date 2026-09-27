import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  RefreshCw,
  Sparkles,
  X,
  ExternalLink,
  Clock,
  ShieldAlert,
  WifiOff,
  FolderX,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface FailedRequestCardProps {
  error: string;
  onRetry?: () => void;
  onLoadSample?: () => void;
  onDismiss?: () => void;
}

export const FailedRequestCard: React.FC<FailedRequestCardProps> = ({
  error,
  onRetry,
  onLoadSample,
  onDismiss,
}) => {
  const { showSuccess, showError } = useToast();
  const [toppingUp, setToppingUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const errLower = error.toLowerCase();

  // Categorize error for actionable user guidance
  const isRateLimit = errLower.includes('rate limit') || errLower.includes('429') || errLower.includes('retry after');
  const isSpendingCap = errLower.includes('spending') || errLower.includes('budget') || errLower.includes('cap');
  const isTimeout = errLower.includes('timeout') || errLower.includes('timed out') || errLower.includes('504') || errLower.includes('408') || errLower.includes('etimedout');
  const isNotFound = errLower.includes('not found') || errLower.includes('404') || errLower.includes('private');
  const isTooLarge = errLower.includes('exceeded') || errLower.includes('limit') || errLower.includes('413') || errLower.includes('too large');
  const isOffline = errLower.includes('offline') || errLower.includes('network') || errLower.includes('failed to fetch');

  let title = 'Repository Analysis Request Failed';
  let badgeLabel = 'Analysis Failed';
  let badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  let icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
  let suggestion = 'We were unable to complete the analysis for this repository. Please review the details below.';

  if (isRateLimit) {
    title = 'API Rate Limit Threshold Reached';
    badgeLabel = 'Rate Limited (429)';
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    icon = <Clock className="w-5 h-5 text-amber-500" />;
    suggestion = 'Fresh repository excavations are limited to 15 per 15 minutes. Cached repositories can still be viewed with 0ms latency without consuming your quota.';
  } else if (isSpendingCap) {
    title = 'AI Spending Budget Cap Active';
    badgeLabel = 'Spending Cap';
    badgeColor = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    icon = <ShieldAlert className="w-5 h-5 text-orange-500" />;
    suggestion = 'To prevent accidental runaway API bills, your configured daily spending cap is currently enforced. Cached and local repos remain fully accessible.';
  } else if (isTimeout) {
    title = 'API Request Timed Out';
    badgeLabel = 'Timeout (504)';
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    icon = <Clock className="w-5 h-5 text-amber-500" />;
    suggestion = 'The operation exceeded our response time threshold. Remote repository cloning or deep AST analysis took longer than expected. Click "Retry Excavation" to re-attempt.';
  } else if (isNotFound) {
    title = 'Repository Not Found or Inaccessible';
    badgeLabel = 'Not Found (404)';
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    icon = <FolderX className="w-5 h-5 text-rose-500" />;
    suggestion = 'Verify that the repository URL and branch name are spelled correctly, and ensure the GitHub repository is public.';
  } else if (isTooLarge) {
    title = 'Repository Exceeds Resource Limits';
    badgeLabel = 'Limit Exceeded';
    badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    icon = <AlertTriangle className="w-5 h-5 text-purple-500" />;
    suggestion = 'CodeSage enforces bounds of max 1,200 files and 50 MB disk space per repository to guarantee sub-second in-memory navigation.';
  } else if (isOffline) {
    title = 'Network Connection Unavailable';
    badgeLabel = 'Connection Dropped';
    badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    icon = <WifiOff className="w-5 h-5 text-blue-500" />;
    suggestion = 'Could not reach the CodeSage backend. Check your local network or ensure the server is running on http://localhost:3000.';
  }

  const handleTopUp = async () => {
    if (toppingUp) return;
    setToppingUp(true);
    try {
      const idempotencyKey = `topup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch('/api/v1/payments/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          idempotencyKey,
          amountUsd: 5.0,
          description: 'CodeSage AI Spending Cap Top-Up',
        }),
      });
      if (res.ok) {
        setTopUpSuccess(true);
        showSuccess('Top-up successful', 'Added $5.00 to CodeSage spending cap.');
        setTimeout(() => {
          onRetry?.();
        }, 1200);
      } else {
        showError('Top-up failed', 'Unable to complete budget top-up.');
      }
    } catch {
      showError('Top-up failed', 'Network error during budget top-up.');
    } finally {
      setToppingUp(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-[#111113] rounded-xl shadow-[0_0_0_1px_rgba(229,72,77,0.2),0_4px_24px_rgba(229,72,77,0.06)] dark:shadow-[0_0_0_1px_rgba(229,72,77,0.3),0_4px_24px_rgba(0,0,0,0.5)] p-6 space-y-4"
    >
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#171717] dark:text-[#EDEDED] tracking-tight">
                {title}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
                {badgeLabel}
              </span>
            </div>
            <p className="text-xs text-[#666666] dark:text-[#888888] mt-1 leading-relaxed">
              {suggestion}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Dismiss error message"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Raw Error Details */}
      <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] rounded-lg font-mono text-xs text-rose-600 dark:text-rose-400 break-words leading-relaxed">
        <span className="font-semibold text-[10px] uppercase tracking-wider text-rose-500/80 mr-1.5 block sm:inline">
          Server Message:
        </span>
        {error}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {isSpendingCap && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleTopUp}
              disabled={toppingUp || topUpSuccess}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5 ${
                topUpSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {topUpSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>+$5.00 Added! Retrying...</span>
                </>
              ) : toppingUp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Securing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Top-Up $5.00 Budget</span>
                </>
              )}
            </motion.button>
          )}

          {onRetry && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onRetry}
              className="px-3.5 py-1.5 bg-[#e8702a] hover:bg-[#d66320] text-white rounded-lg text-xs font-medium shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Excavation</span>
            </motion.button>
          )}

          {onLoadSample && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onLoadSample}
              className="px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] text-[#171717] dark:text-[#EDEDED] border border-black/[0.06] dark:border-white/[0.08] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
              <span>Load CodeSage Demo</span>
            </motion.button>
          )}
        </div>

        <a
          href="https://www.githubstatus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] flex items-center space-x-1 transition-colors"
          title="Open official GitHub Status page"
        >
          <span>Check GitHub Status</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
};
