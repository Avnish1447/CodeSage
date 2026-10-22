import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import {
  Layers,
  Sparkles,
  GitFork,
  Cpu,
  ArrowDown,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

interface StratigraphyTransitionSectionProps {
  isDark: boolean;
  onExploreClick: () => void;
  onSelectSample?: (url: string) => void;
}

const STRATA_PILLARS = [
  {
    id: 'strata-ast',
    icon: Layers,
    accent: '#e8702a',
    pill: 'Stratum 01',
    title: 'AST Tree Stratigraphy',
    subtitle: 'Hierarchical Code Excavation',
    description:
      'Parse raw codebases into typed syntax trees, language depth ratios, and circular dependency maps with sub-millisecond local caching.',
    metric: 'Sub-ms AST Parse',
    badge: 'AST Level 4',
  },
  {
    id: 'strata-rag',
    icon: Cpu,
    accent: '#0072F5',
    pill: 'Stratum 02',
    title: 'Grounded Gemini RAG',
    subtitle: 'Zero-Hallucination Assistant',
    description:
      'Converse directly with codebase architecture. Pose deep topology questions and receive file-grounded citations with precise code provenance.',
    metric: '1M+ Context Token Window',
    badge: 'Gemini 2.5 Pro',
  },
  {
    id: 'strata-reverse',
    icon: Terminal,
    accent: '#45A557',
    pill: 'Stratum 03',
    title: 'GitReverse Blueprints',
    subtitle: 'Autonomous Reconstruction',
    description:
      'Synthesize comprehensive system specifications and generative prompts ready for Cursor, Claude Code, or v0 to recreate the application.',
    metric: 'Zero-Shot Spec',
    badge: 'Spec Synthesis',
  },
];

export const StratigraphyTransitionSection: React.FC<StratigraphyTransitionSectionProps> = ({
  isDark,
  onExploreClick,
  onSelectSample,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll animation hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Parallax transformations
  const titleY = useTransform(smoothProgress, [0, 0.45], [40, 0]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.25], [0.2, 1]);
  const glowScale = useTransform(smoothProgress, [0.1, 0.5], [0.8, 1.15]);
  const cardsY = useTransform(smoothProgress, [0.15, 0.55], [60, 0]);
  const cardsOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1]);

  return (
    <section
      ref={containerRef}
      className={`relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-black text-[#EDEDED]' : 'bg-[#FAFAFA] text-[#171717]'
      }`}
    >
      {/* Dynamic Ambient Stratigraphy Background Glow */}
      <motion.div
        style={{ scale: glowScale }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[380px] sm:h-[460px] pointer-events-none rounded-full blur-[110px] opacity-40 dark:opacity-30 -z-0"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-tr from-[#e8702a]/30 via-[#0072F5]/20 to-[#45A557]/20" />
      </motion.div>

      {/* Decorative Subtle Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] -z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* Main Section Headline with Apple-Grade Typography */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          {/* Stratum Tag Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full apple-liquid-glass-subtle text-xs font-mono tracking-tight text-[#8F8F8F] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e8702a] animate-pulse" />
            <span className="text-[#171717] dark:text-[#EDEDED] font-medium">Architecture Stratigraphy</span>
            <span>&bull;</span>
            <span>Interactive Studio</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-[#171717] dark:text-white leading-[1.12]">
            Unearth Architecture &{' '}
            <span className="font-playfair italic font-normal text-[#e8702a]">
              Deep Code Knowledge
            </span>
          </h2>

          <p className="text-sm sm:text-base max-w-2xl mx-auto text-[#666666] dark:text-[#8F8F8F] leading-relaxed font-sans font-normal">
            Transition seamlessly from planetary geology to codebase inspection. Clone any repository,
            explore tree structures, and chat with Gemini RAG in real-time.
          </p>

          {/* Quick jump anchor pill */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium text-[#171717] dark:text-[#EDEDED] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer group"
            >
              <span>Scroll to Studio Workbench</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#e8702a] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Interactive 3D Bento Strata Cards with Cursor-Tracked Glare */}
        <motion.div
          style={{ y: cardsY, opacity: cardsOpacity }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
        >
          {STRATA_PILLARS.map((stratum, index) => {
            const Icon = stratum.icon;
            return (
              <TiltCard
                key={stratum.id}
                maxTilt={7}
                className="group h-full cursor-pointer"
                cardClassName="h-full rounded-2xl apple-liquid-glass p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl"
                onClick={onExploreClick}
              >
                <div className="space-y-4">
                  {/* Card Header & Accent Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${stratum.accent}12`,
                        color: stratum.accent,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[#8F8F8F]">
                      {stratum.pill}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8F8F8F] mb-0.5">
                      {stratum.subtitle}
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#171717] dark:text-[#EDEDED]">
                      {stratum.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#666666] dark:text-[#888888] leading-relaxed">
                    {stratum.description}
                  </p>
                </div>

                {/* Bottom Metric Strip */}
                <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-[#171717] dark:text-[#EDEDED]">
                    <Zap className="w-3.5 h-3.5 text-[#e8702a]" />
                    <span className="font-medium">{stratum.metric}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/[0.03] dark:bg-white/[0.05] text-[#8F8F8F]">
                    {stratum.badge}
                  </span>
                </div>
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
