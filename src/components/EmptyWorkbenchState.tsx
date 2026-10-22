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
  Code2,
  FileCode2,
  Cpu,
} from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

interface EmptyWorkbenchStateProps {
  onSelectSample: (url: string) => void;
}

const HIGHLIGHT_CARDS = [
  {
    icon: Layers,
    title: 'Architectural Strata',
    description:
      'Deconstruct codebase layers into programming language distributions, manifest dependencies, and interactive directory trees.',
    tag: 'Analysis Engine',
    metric: 'AST Parsing',
  },
  {
    icon: MessageSquareCode,
    title: 'Grounded Gemini RAG',
    description:
      'Ask real-time questions about system topology, logic flows, and entry points with zero-hallucination context citations.',
    tag: 'Context Grounded',
    metric: 'Multimodal 2.5',
  },
  {
    icon: Terminal,
    title: 'GitReverse Specification',
    description:
      'Extract actionable natural-language prompts to recreate or bootstrap this system in Cursor, Claude Code, or v0.',
    tag: 'AI Blueprint',
    metric: 'Zero-Shot Gen',
  },
];

const QUICK_PICKS = [
  {
    label: 'CodeSage Studio',
    url: 'https://github.com/Avnish1447/CodeSage',
    meta: 'Fullstack TS & AI',
    lang: 'TypeScript',
    tag: 'Self-Analysis',
  },
  {
    label: 'Express.js',
    url: 'https://github.com/expressjs/express',
    meta: 'Node.js Framework',
    lang: 'JavaScript',
    tag: 'Backend Core',
  },
  {
    label: 'Gin Web Framework',
    url: 'https://github.com/gin-gonic/gin',
    meta: 'Go Microservices',
    lang: 'Go',
    tag: 'High Velocity',
  },
  {
    label: 'React Core',
    url: 'https://github.com/facebook/react',
    meta: 'UI Library',
    lang: 'TypeScript',
    tag: 'Frontend Engine',
  },
];

export const EmptyWorkbenchState: React.FC<EmptyWorkbenchStateProps> = ({ onSelectSample }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Hero Welcome Banner with Liquid Glass Styling */}
      <div className="apple-liquid-glass rounded-3xl p-6 sm:p-10 md:p-12 text-center relative overflow-hidden transition-all duration-300">
        {/* Ambient Subtle Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-36 bg-gradient-to-b from-[#e8702a]/20 via-[#0072F5]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <div className="flex justify-center mb-1">
            <div className="relative p-2.5 rounded-2xl apple-liquid-glass shadow-[0_0_0_1px_rgba(232,112,42,0.35)] transition-transform duration-300 hover:scale-105">
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

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-liquid-glass-subtle text-xs font-mono text-[#8F8F8F]">
            <Compass className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="text-[#171717] dark:text-[#EDEDED] font-medium">Workbench Ready for Exploration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#171717] dark:text-[#EDEDED]">
            Excavate Any <span className="font-playfair italic font-normal text-[#e8702a]">Codebase Strata</span>
          </h2>

          <p className="text-sm text-[#666666] dark:text-[#888888] leading-relaxed max-w-xl mx-auto">
            Enter a public GitHub repository in the search bar above, or launch one of our curated archetypes below to immediately inspect language ratios, explore source code, and converse with the Gemini RAG assistant.
          </p>

          {/* Quick Pick Starter Buttons */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {QUICK_PICKS.map((pick) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={pick.url}
                onClick={() => onSelectSample(pick.url)}
                className="p-3.5 rounded-2xl apple-liquid-glass hover:border-[#e8702a]/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-[#8F8F8F] group-hover:text-[#e8702a] transition-colors shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#171717] dark:text-[#EDEDED] truncate">
                      {pick.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#8F8F8F] truncate">
                      {pick.meta} &bull; {pick.lang}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-[#8F8F8F]">
                    {pick.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8F8F8F] group-hover:text-[#e8702a] group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Triad Highlights with 3D Card Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {HIGHLIGHT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <TiltCard
              key={card.title}
              maxTilt={6}
              className="h-full"
              cardClassName="h-full apple-liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] text-[#e8702a] border border-black/[0.05] dark:border-white/[0.08]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05]">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#171717] dark:text-[#EDEDED]">
                  {card.title}
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8F8F8F]">
                <span>Engine Capability</span>
                <span className="text-[#171717] dark:text-[#EDEDED] font-medium">{card.metric}</span>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </motion.div>
  );
};
