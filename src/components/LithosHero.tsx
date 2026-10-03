import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiquidGlassButton } from './ui/LiquidGlassButton';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 260;

interface LithosHeroProps {
  onStartDigging?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const LithosHero: React.FC<LithosHeroProps> = ({ onStartDigging, isDark = false, onToggleTheme }) => {
  const { user, logout, requestSignOut } = useAuth();
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const coverRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const userInteracted = useRef(false);
  const sweepStartTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      userInteracted.current = true;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (smoothRef.current.x === -999) {
        smoothRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        userInteracted.current = true;
        const touch = e.touches[0];
        mouseRef.current = { x: touch.clientX, y: touch.clientY };
        if (smoothRef.current.x === -999) {
          smoothRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    const sweepDuration = 3200;

    const loop = (timestamp: number) => {
      if (coverRef.current) {
        if (userInteracted.current) {
          // Direct user tracking
          if (mouseRef.current.x !== -999) {
            const dx = mouseRef.current.x - smoothRef.current.x;
            const dy = mouseRef.current.y - smoothRef.current.y;

            if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
              smoothRef.current.x += dx * 0.15;
              smoothRef.current.y += dy * 0.15;
              const maskStyle = `radial-gradient(circle ${SPOTLIGHT_R}px at ${smoothRef.current.x}px ${smoothRef.current.y}px, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0.7) 72%, black 88%, black 100%)`;
              coverRef.current.style.webkitMaskImage = maskStyle;
              coverRef.current.style.maskImage = maskStyle;
            }
          }
        } else {
          // Automated sweep run once across hero canvas
          if (sweepStartTime.current === null) {
            sweepStartTime.current = timestamp;
          }
          const elapsed = timestamp - sweepStartTime.current;
          if (elapsed < sweepDuration) {
            const progress = elapsed / sweepDuration;
            const w = window.innerWidth;
            const h = window.innerHeight;
            // Smooth natural arc from left-top to center-right
            const autoX = w * (0.15 + progress * 0.7);
            const autoY = h * (0.35 + Math.sin(progress * Math.PI) * 0.25);

            if (smoothRef.current.x === -999) {
              smoothRef.current = { x: autoX, y: autoY };
            } else {
              smoothRef.current.x += (autoX - smoothRef.current.x) * 0.12;
              smoothRef.current.y += (autoY - smoothRef.current.y) * 0.12;
            }

            const maskStyle = `radial-gradient(circle ${SPOTLIGHT_R}px at ${smoothRef.current.x}px ${smoothRef.current.y}px, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0.7) 72%, black 88%, black 100%)`;
            coverRef.current.style.webkitMaskImage = maskStyle;
            coverRef.current.style.maskImage = maskStyle;
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      className={`relative w-full overflow-hidden h-screen transition-colors duration-300 ${
        isDark ? 'bg-black text-[#EDEDED]' : 'bg-[#FAFAFA] text-[#171717]'
      }`}
      style={{ height: '100dvh' }}
    >
      {/* 1. Underlying Geological Strata Image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom pointer-events-none transition-all duration-500"
        style={{ backgroundImage: `url("${BG_IMAGE_2}")` }}
      />

      {/* 2. Theme-Adaptive Cover Layer (Black in dark mode, White in light mode) with Torch Cutout */}
      <div
        ref={coverRef}
        className={`absolute inset-0 z-20 pointer-events-none transition-colors duration-300 ${
          isDark ? 'bg-black' : 'bg-[#FAFAFA]'
        }`}
        style={{
          WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at 50% 45%, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0.7) 72%, black 88%, black 100%)`,
          maskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at 50% 45%, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0.7) 72%, black 88%, black 100%)`,
        }}
      />

      {/* 3. Subtle Architectural Blueprint Grid */}
      <div
        className="absolute inset-0 z-25 pointer-events-none transition-all duration-300"
        style={{
          opacity: isDark ? 0.25 : 0.45,
          backgroundImage: isDark
            ? `
                linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
              `
            : `
                linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
              `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Navigation Header */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-4 sm:px-6 backdrop-blur-md transition-colors duration-200 ${
          isDark
            ? 'bg-black/60 shadow-[0_1px_0_0_rgba(255,255,255,0.08)]'
            : 'bg-[#FAFAFA]/85 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]'
        }`}
      >
        {/* Left Brand - Official Text Mark */}
        <a
          href="#workbench"
          onClick={(e) => {
            e.preventDefault();
            if (onStartDigging) onStartDigging();
          }}
          className="flex items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5] rounded-md"
          title="CodeSage – Unearth Architecture"
        >
          <picture>
            <source srcSet="/logos/text-mark.svg" type="image/svg+xml" />
            <source srcSet="/logos/text-mark.png" type="image/png" />
            <img
              src="/logos/text-mark.svg"
              alt="CodeSage"
              className={`h-8 sm:h-9 w-auto max-w-[170px] sm:max-w-[240px] object-contain transition-all duration-200 ${
                isDark
                  ? 'brightness-125 hover:brightness-150 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]'
                  : 'brightness-100 hover:opacity-85'
              }`}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('textmark.png')) {
                  target.src = '/logos/textmark.png';
                }
              }}
            />
          </picture>
        </a>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Clerk & Dev Authentication State */}
          {user ? (
            <div className="flex items-center space-x-2 bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] px-2 sm:px-2.5 py-1 rounded-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-black/10 dark:border-white/20"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#e8702a] text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium hidden sm:inline max-w-[110px] truncate text-[#171717] dark:text-[#EDEDED]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              {user.isDev && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  DEV
                </span>
              )}
              <button
                type="button"
                onClick={requestSignOut}
                title="Sign Out"
                aria-label="Sign out"
                className="p-1 rounded text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {onToggleTheme && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={onToggleTheme}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
                isDark
                  ? 'text-white/70 hover:text-white bg-white/10 hover:bg-white/15'
                  : 'text-[#4D4D4D] hover:text-[#171717] bg-black/[0.04] hover:bg-black/[0.08] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4D4D4D]" />}
            </motion.button>
          )}
        </div>
      </nav>

      {/* 3. Central Heading (z-50) */}
      <div className="absolute top-[12%] sm:top-[13%] left-0 right-0 flex flex-col items-center text-center px-4 sm:px-5 pointer-events-none z-50">
        {/* Floating Brand Badge */}
        <div
          className={`mb-4 sm:mb-5 inline-flex items-center space-x-2.5 px-3 sm:px-3.5 py-1.5 rounded-full backdrop-blur-xl pointer-events-auto transition-colors duration-200 ${
            isDark
              ? 'bg-black/80 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] text-white/90'
              : 'bg-white/90 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] text-[#171717]'
          }`}
        >
          <picture>
            <source srcSet="/logos/app-icon.png" type="image/png" />
            <img
              src="/logos/app-icon.svg"
              alt="CodeSage"
              className="w-4 h-4 object-contain rounded"
            />
          </picture>
          <span className="text-[11px] font-mono tracking-wider uppercase font-medium">
            CodeSage Stratigraphy
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#45A557] animate-pulse" />
        </div>

        <h1 className={`leading-[0.95] tracking-tight sm:tracking-[-2.28px] transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#171717]'}`}>
          <span className="sr-only">CodeSage (TheCodeSage / Code Sage) — Intelligent Codebase Stratigraphy Engine. </span>
          <span
            className={`block font-playfair italic font-normal text-4xl xs:text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal ${
              isDark ? 'drop-shadow-md' : 'drop-shadow-none'
            }`}
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Layers hold
          </span>
          <span
            className={`block font-normal text-4xl xs:text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal ${
              isDark ? 'drop-shadow-md' : 'drop-shadow-none'
            }`}
            style={{ letterSpacing: '-0.06em', animationDelay: '0.42s' }}
          >
            tales of time
          </span>
        </h1>

        {/* Centered Primary Action Button (21st.dev Liquid Glass Button) */}
        <div className="mt-8 sm:mt-10 pointer-events-auto hero-anim hero-fade" style={{ animationDelay: '0.65s' }}>
          <LiquidGlassButton onClick={onStartDigging} isDark={isDark} />
        </div>
      </div>

      {/* 4. Bottom-Left Paragraph (z-50) */}
      <div
        className="hidden sm:block absolute bottom-12 left-10 md:left-14 max-w-[280px] z-50 hero-anim hero-fade pointer-events-auto"
        style={{ animationDelay: '0.7s' }}
      >
        <p
          className={`text-xs sm:text-[13px] leading-relaxed font-light transition-colors duration-200 ${
            isDark ? 'text-white/75 drop-shadow-sm' : 'text-[#555555]'
          }`}
        >
          Every architectural commit records a chapter of software evolution, from core primitives to distributed services, decomposed through recursive AST stratigraphy.
        </p>
      </div>

      {/* 5. Bottom-Right Paragraph (z-50) */}
      <div
        className="hidden sm:block absolute bottom-12 right-10 md:right-14 max-w-[290px] z-50 hero-anim hero-fade pointer-events-auto text-left"
        style={{ animationDelay: '0.85s' }}
      >
        <p
          className={`text-xs sm:text-[13px] leading-relaxed font-light transition-colors duration-200 ${
            isDark ? 'text-white/75 drop-shadow-sm' : 'text-[#555555]'
          }`}
        >
          Interactive codebase coring lets you excavate dependencies, identify architectural boundaries, and query system topology with grounded Gemini RAG.
        </p>
      </div>

      {/* 6. Smooth Bottom Gradient Blend to Studio */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-40 transition-colors duration-200 ${
          isDark
            ? 'bg-gradient-to-t from-black via-black/70 to-transparent'
            : 'bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent'
        }`}
      />
    </section>
  );
};
