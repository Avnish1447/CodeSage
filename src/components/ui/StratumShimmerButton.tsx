import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

interface StratumShimmerButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * 21st.dev inspired Stratum Shimmer Button:
 * Fuses Magic UI Shimmer Perimeter Beam (dillionverma/shimmer-button),
 * Magma Cursor/Flame Aura (ayushmxxn/flame-button), and
 * Vercel Dark Mode Obsidian Glassmorphism (kokonutd/button-shiny).
 */
export const StratumShimmerButton: React.FC<StratumShimmerButtonProps> = ({
  onClick,
  className = '',
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
      {/* 1. 21st.dev Ambient Flame/Magma Aura (Pulsing underneath) */}
      <div
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#e8702a]/40 via-[#f59e0b]/50 to-[#e8702a]/40 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-pulse"
        style={{ animationDuration: '3s' }}
      />

      {/* 2. Interactive Button Container */}
      <motion.button
        ref={buttonRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-lg px-6 py-3 bg-[#0a0a0c] text-white font-medium text-xs sm:text-sm tracking-wide shadow-2xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2.5 border border-white/10 group-hover:border-amber-500/40"
      >
        {/* 3. 21st.dev Animated Conic Shimmer Beam traveling around perimeter */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] animate-spin"
            style={{
              animationDuration: '4s',
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 60deg, #e8702a 100deg, #fbbf24 130deg, transparent 180deg)',
            }}
          />
        </div>

        {/* 4. Mouse-following Magma Core Glow (inspired by 21st.dev flame-button) */}
        {isHovered && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-radial from-[#e8702a]/25 via-[#fbbf24]/10 to-transparent blur-md transition-opacity duration-200"
            style={{
              left: mousePos.x,
              top: mousePos.y,
            }}
          />
        )}

        {/* 5. Subtle Glass Rim Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* 6. Typography & Compass Icon with Hover Rotation */}
        <span className="relative z-10 text-white font-medium tracking-tight group-hover:text-amber-100 transition-colors drop-shadow-sm">
          Start Digging
        </span>

        <Compass className="relative z-10 w-4 h-4 text-amber-400 group-hover:text-amber-300 group-hover:rotate-45 transition-transform duration-300 ease-out drop-shadow" />
      </motion.button>
    </div>
  );
};
