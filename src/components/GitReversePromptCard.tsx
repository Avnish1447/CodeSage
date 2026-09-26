import React, { useState } from 'react';
import { GitReversePromptData, RepoOverview } from '../types';
import { Sparkles, Copy, Check, RefreshCw, Terminal } from 'lucide-react';
import { FloatingDotsButton } from './ui/FloatingDotsButton';

interface GitReversePromptCardProps {
  promptData?: GitReversePromptData;
  overview: RepoOverview;
  onRefreshPrompt?: (force?: boolean) => Promise<void> | void;
  onReverseEngineer?: (force?: boolean) => Promise<void> | void;
  isRefreshing?: boolean;
}

export const GitReversePromptCard: React.FC<GitReversePromptCardProps> = ({
  promptData,
  overview: _overview,
  onRefreshPrompt,
  onReverseEngineer,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAction = onReverseEngineer || onRefreshPrompt;

  const promptText = promptData?.prompt || '';

  const handleCopy = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const textArea = document.createElement('textarea');
      textArea.value = promptText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const paragraphs = promptText.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="bg-white dark:bg-[#0f0f11] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] rounded-xl p-6 space-y-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-[#e8702a] rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-[#171717] dark:text-[#EDEDED] tracking-tight">
                GitReverse AI Builder Prompt
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#8F8F8F] mt-0.5">
              Natural-language reverse-engineered specification prompt to build or replicate this codebase
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {promptText && handleAction && (
            <button
              onClick={() => handleAction(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] transition-colors cursor-pointer"
              title="Re-generate prompt from GitReverse"
              aria-label="Refresh GitReverse prompt"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#e8702a]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!promptText && isRefreshing ? (
        <div className="p-8 text-center space-y-3 bg-[#FAFAFA] dark:bg-[#161618] rounded-lg border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#e8702a]" />
          </div>
          <p className="text-sm font-medium text-[#171717] dark:text-[#EDEDED]">
            Reverse-engineering codebase with GitReverse...
          </p>
          <p className="text-xs text-[#8F8F8F]">
            Extracting file tree strata, manifest dependencies, and generating reconstruction prompt.
          </p>
        </div>
      ) : !promptText ? (
        <div className="p-8 text-center space-y-4 bg-[#FAFAFA] dark:bg-[#161618] rounded-lg border border-black/[0.06] dark:border-white/[0.08]">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-[#e8702a]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-sm font-semibold text-[#171717] dark:text-[#EDEDED]">
              Want a Reverse-Engineered Prompt?
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#8F8F8F] leading-relaxed">
              We keep this prompt generation strictly optional to keep repository analysis instant and prevent unwanted API requests. Click below when you're ready to extract the Cursor &amp; Claude Code build prompt.
            </p>
          </div>
          {handleAction && (
            <div className="pt-2 flex justify-center">
              <FloatingDotsButton
                onClick={() => handleAction(false)}
                loading={isRefreshing}
                loadingText="Reverse Engineering..."
                label="Reverse Engineer This"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#64748B] dark:text-[#8F8F8F] font-medium">
              Specification Prompt
            </span>

            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${copied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#e8702a] text-white hover:bg-[#d6601c] shadow-sm'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  
                </>
              )}
            </button>
          </div>

          {/* Prompt Body Box */}
          <div className="relative rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#0c0c0e] overflow-hidden">
            <div
              className={`p-4 text-xs sm:text-sm font-sans leading-relaxed text-[#171717] dark:text-[#E2E8F0] ${expanded ? 'max-h-none' : 'max-h-[260px] overflow-hidden'
                }`}
            >
              <div className="space-y-3.5">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Fade overlay if collapsed and long */}
            {!expanded && promptText.length > 350 && (
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAFAFA] dark:from-[#0c0c0e] to-transparent pointer-events-none" />
            )}
          </div>

          {/* Expand/Collapse Toggle */}
          {promptText.length > 350 && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium text-[#e8702a] hover:text-[#d6601c] transition-colors cursor-pointer"
              >
                {expanded ? '▲ Collapse Prompt' : '▼ Read Full Prompt'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
