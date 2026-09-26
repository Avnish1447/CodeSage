import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Sparkles, RefreshCw } from 'lucide-react';

export interface FloatingDotsButtonProps extends HTMLMotionProps<'button'> {
  label?: string;
  loading?: boolean;
  loadingText?: string;
  showSparkle?: boolean;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 21st.dev inspired "Floating Dots CTA" button (ThreeUI / Meng To pattern):
 * Features:
 * - Rising floating dot particles (@keyframes fdc-floating-points) drifting upward
 * - Ambient warm magma/amber glow aura underneath on hover
 * - High-index top-rim specular sheen and deep gradient fill
 * - Animated sliding arrow icon on hover with dash line physics (@keyframes fdc-dash)
 * - Accessible button semantics with smooth Framer Motion spring interactions
 */
export const FloatingDotsButton: React.FC<FloatingDotsButtonProps> = ({
  label = 'Reverse Engineer This',
  loading = false,
  loadingText = 'Reverse Engineering...',
  showSparkle = true,
  showArrow = true,
  size = 'md',
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full',
    md: 'text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl',
    lg: 'text-sm sm:text-base font-semibold px-6 py-3.5 rounded-xl',
  }[size];

  // 12 staggered floating dot particle configurations
  const points = [
    { left: '8%', duration: '2.1s', delay: '0.1s', size: '2px', opacity: 0.85 },
    { left: '16%', duration: '2.6s', delay: '0.7s', size: '3px', opacity: 0.9 },
    { left: '25%', duration: '1.9s', delay: '0.3s', size: '2px', opacity: 0.8 },
    { left: '34%', duration: '2.8s', delay: '1.1s', size: '3.5px', opacity: 0.95 },
    { left: '44%', duration: '2.3s', delay: '0.5s', size: '2.5px', opacity: 0.85 },
    { left: '53%', duration: '2.0s', delay: '0.0s', size: '3px', opacity: 0.9 },
    { left: '62%', duration: '2.7s', delay: '0.9s', size: '2px', opacity: 0.8 },
    { left: '71%', duration: '2.4s', delay: '0.4s', size: '3.5px', opacity: 0.95 },
    { left: '80%', duration: '2.2s', delay: '0.8s', size: '2.5px', opacity: 0.85 },
    { left: '89%', duration: '2.9s', delay: '1.3s', size: '3px', opacity: 0.9 },
    { left: '95%', duration: '2.1s', delay: '0.2s', size: '2px', opacity: 0.8 },
    { left: '48%', duration: '3.1s', delay: '1.5s', size: '3px', opacity: 0.9 },
  ];

  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* 1. Ambient Amber Glow Aura */}
      <div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e8702a]/40 via-[#f59e0b]/50 to-[#d6601c]/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-pulse pointer-events-none"
        style={{ animationDuration: '3s' }}
      />

      {/* 2. Main Interactive Button */}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        className={`relative overflow-hidden cursor-pointer select-none transition-all duration-300 text-white shadow-lg shadow-[#e8702a]/25 group-hover:shadow-xl group-hover:shadow-[#e8702a]/40 border border-white/20 bg-gradient-to-r from-[#e8702a] via-[#f27a32] to-[#d6601c] active:opacity-95 disabled:opacity-75 disabled:cursor-not-allowed ${sizeClasses}`}
        {...props}
      >
        {/* Specular Top Rim Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* 3. 21st.dev Floating Dots Particles Wrapper */}
        <span
          className="fdc-points_wrapper absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]"
          aria-hidden="true"
        >
          {points.map((pt, i) => (
            <i
              key={i}
              className="fdc-point absolute rounded-full pointer-events-none"
              style={{
                left: pt.left,
                bottom: '-6px',
                width: pt.size,
                height: pt.size,
                backgroundColor: '#ffffff',
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 10px rgba(254, 215, 170, 0.7)',
                animation: `fdc-floating-points ${pt.duration} infinite ease-in-out`,
                animationDelay: pt.delay,
                opacity: pt.opacity,
              }}
            />
          ))}
        </span>

        {/* 4. Button Inner Content */}
        <span className="relative z-10 flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              {showSparkle && (
                <Sparkles className="w-4 h-4 text-amber-100 group-hover:rotate-12 transition-transform duration-300" />
              )}
              <span className="tracking-tight">{label}</span>
              {showArrow && (
                <svg
                  className="w-4 h-4 text-white transform group-hover:translate-x-1 transition-transform duration-300 stroke-[2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path className="fdc-path" d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
};

export default FloatingDotsButton;
