import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

interface LiquidGlassButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

/**
 * 21st.dev inspired Liquid Glass Button (Apple Tahoe / Ali Imam designali-in pattern).
 * Features:
 * - Refractive optical lens using SVG feDisplacementMap + feTurbulence filter
 * - High-index multi-layered box-shadow stack (specular top rim, ambient depth, amber core)
 * - Fluid molten sheen tracking cursor interaction
 * - Isolated z-index text layer ensuring zero ghosting or legibility loss
 */
export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  onClick,
  className = '',
  label = 'Start Digging',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* 1. SVG Refraction Displacement Filter for genuine curved glass physics */}
      <svg
        aria-hidden="true"
        className="absolute w-0 h-0 pointer-events-none"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id="liquid-glass-refract" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="2"
              result="fluidNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="fluidNoise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />
            <feBlend mode="normal" in="SourceGraphic" in2="refracted" />
          </filter>
        </defs>
      </svg>

      {/* 2. Ambient Under-Glass Amber Glow Halo */}
      <div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e8702a]/30 via-[#fbbf24]/40 to-[#e8702a]/30 blur-xl opacity-50 group-hover:opacity-90 group-hover:blur-2xl transition-all duration-500 -z-10"
      />

      {/* 3. The Liquid Glass Capsule Button */}
      <motion.button
        ref={buttonRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-2xl px-7 py-3.5 sm:px-8 sm:py-4 transition-all duration-300 cursor-pointer flex items-center justify-center space-x-3 select-none"
        style={{
          // Liquid Glass Layering: Translucent frosted glass + refractive depth
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(20, 20, 24, 0.55) 50%, rgba(10, 10, 14, 0.75) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: `
            inset 0 1.5px 0 0 rgba(255, 255, 255, 0.45),
            inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4),
            inset 0 0 16px 0 rgba(255, 255, 255, 0.08),
            0 10px 30px -5px rgba(0, 0, 0, 0.65),
            0 0 25px -2px rgba(232, 112, 42, 0.35)
          `,
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        {/* 4. Fluid Molten Ripple on Hover (Simulating liquid displacement under glass) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: isHovered
              ? `radial-gradient(140px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.35), rgba(245, 158, 11, 0.2) 40%, transparent 80%)`
              : 'none',
          }}
        />

        {/* 5. Liquid Glass Specular Edge Highlights */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />

        {/* 6. Isolated Z-Index Content (Guarantees zero ghosting) */}
        <span className="relative z-20 text-white font-medium text-xs sm:text-sm tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] group-hover:text-amber-100 transition-colors">
          {label}
        </span>

        {/* 7. Amber Compass Icon floating inside the glass lens */}
        <div className="relative z-20 p-1 rounded-full bg-black/40 border border-amber-500/40 shadow-[0_0_10px_rgba(232,112,42,0.4)] group-hover:border-amber-400 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.6)] transition-all duration-300">
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:text-amber-200 group-hover:rotate-45 transition-transform duration-300 ease-out" />
        </div>
      </motion.button>
    </div>
  );
};
