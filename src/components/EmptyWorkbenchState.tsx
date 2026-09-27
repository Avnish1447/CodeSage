import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  MessageSquareCode,
  Terminal,
  ArrowRight,
  GitBranch,
  Github,
  Compass,
} from 'lucide-react';

interface EmptyWorkbenchStateProps {
  onSelectSample: (url: string) => void;
}

const HIGHLIGHT_CARDS = [
  {
    icon: Layers,
    title: 'Architectural Strata',
    description: 'Deconstruct codebase layers into programming language distributions, manifest dependencies, and interactive directory trees.',
    tag: 'Analysis Engine',
  },
  {
    icon: MessageSquareCode,
    title: 'Grounded Gemini RAG',
    description: 'Ask real-time questions about system topology, logic flows, and entry points with zero-hallucination context citations.',
    tag: 'Context Grounded',
  },
  {
    icon: Terminal,
    title: 'GitReverse Specification',
    description: 'Extract actionable natural-language prompts to recreate or bootstrap this system in Cursor, Claude Code, or v0.',
    tag: 'AI Blueprint',
  },
];

const QUICK_PICKS = [
  { label: 'CodeSage Studio', url: 'https://github.com/Avnish1447/CodeSage', meta: 'Fullstack TS & AI' },
  { label: 'Express.js', url: 'https://github.com/expressjs/express', meta: 'Node.js Framework' },
  { label: 'Gin Web Framework', url: 'https://github.com/gin-gonic/gin', meta: 'Go Microservices' },
  { label: 'React Core', url: 'https://github.com/facebook/react', meta: 'UI Library' },
];

export const EmptyWorkbenchState: React.FC<EmptyWorkbenchStateProps> = ({ onSelectSample }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Hero Welcome Banner */}
      <div className="bg-white dark:bg-[#111113] rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_4px_20px_rgba(0,0,0,0.3)] p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Ambient Subtle Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-b from-[#e8702a]/15 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center mb-1">
            <div className="relative p-2 rounded-2xl bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(232,112,42,0.3)]">
              <picture>
                <source srcSet="/logos/app-icon.png" type="image/png" />
                <img
                  src="/logos/app-icon.svg"
                  alt="CodeSage Official Emblem"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl"
                />
              </picture>
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[#8F8F8F]">
            <Compass className="w-3.5 h-3.5 text-[#e8702a]" />
            <span>Workbench Ready for Exploration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#EDEDED]">
            Excavate Any <span className="font-playfair italic font-normal text-[#e8702a]">Codebase Strata</span>
          </h2>

          <p className="text-sm text-[#666666] dark:text-[#888888] leading-relaxed">
            Enter a public GitHub repository in the search bar above, or launch one of our curated archetypes below to immediately inspect language ratios, explore source code, and converse with the Gemini RAG assistant.
          </p>

          {/* Quick Pick Starter Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {QUICK_PICKS.map((pick) => (
              <motion.button
                whileTap={{ scale: 0.97 }}
                key={pick.url}
                onClick={() => onSelectSample(pick.url)}
                className="px-3.5 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1f1f23] text-[#171717] dark:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-all cursor-pointer flex items-center space-x-2 group text-left"
              >
                <div className="p-1 rounded bg-black/[0.03] dark:bg-white/[0.06] group-hover:text-[#e8702a] transition-colors">
                  <Github className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{pick.label}</div>
                  <div className="text-[10px] font-mono text-[#8F8F8F]">{pick.meta}</div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#8F8F8F] group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Triad Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {HIGHLIGHT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 + 0.1 }}
              key={card.title}
              className="bg-white dark:bg-[#111113] rounded-xl p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-[#FAFAFA] dark:bg-[#161618] text-[#e8702a] border border-black/[0.05] dark:border-white/[0.08]">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider">
                  {card.tag}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#171717] dark:text-[#EDEDED]">
                {card.title}
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
