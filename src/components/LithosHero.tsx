import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { LiquidGlassButton } from './ui/LiquidGlassButton';

const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

const SPOTLIGHT_R = 260;

interface RevealLayerProps {
  image: string;
}

const RevealLayer = React.forwardRef<HTMLDivElement, RevealLayerProps>(({ image }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `url("${image}")`,
        WebkitMaskImage: 'none',
        maskImage: 'none',
      }}
    />
  );
});

interface LithosHeroProps {
  onStartDigging?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const LithosHero: React.FC<LithosHeroProps> = ({ onStartDigging, isDark = true, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Course');

  const revealRef = useRef<HTMLDivElement | null>(null);
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
      if (revealRef.current) {
        if (userInteracted.current) {
          // Direct user tracking
          if (mouseRef.current.x !== -999) {
            const dx = mouseRef.current.x - smoothRef.current.x;
            const dy = mouseRef.current.y - smoothRef.current.y;

            if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
              smoothRef.current.x += dx * 0.15;
              smoothRef.current.y += dy * 0.15;
              const maskStyle = `radial-gradient(circle ${SPOTLIGHT_R}px at ${smoothRef.current.x}px ${smoothRef.current.y}px, black 0%, black 40%, rgba(0, 0, 0, 0.75) 60%, rgba(0, 0, 0, 0.4) 75%, rgba(0, 0, 0, 0.12) 88%, transparent 100%)`;
              revealRef.current.style.webkitMaskImage = maskStyle;
              revealRef.current.style.maskImage = maskStyle;
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

            const maskStyle = `radial-gradient(circle ${SPOTLIGHT_R}px at ${smoothRef.current.x}px ${smoothRef.current.y}px, black 0%, black 40%, rgba(0, 0, 0, 0.75) 60%, rgba(0, 0, 0, 0.4) 75%, rgba(0, 0, 0, 0.12) 88%, transparent 100%)`;
            revealRef.current.style.webkitMaskImage = maskStyle;
            revealRef.current.style.maskImage = maskStyle;
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

  const navItems = ['Course', 'Field Guides', 'Geology', 'Plans', 'Live Tour', 'Repo RAG'];

  return (
    <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
      {/* 1. Base Dimmed Silhouette Layer */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom opacity-20 grayscale brightness-75 contrast-125 pointer-events-none"
        style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
      />

      {/* 1b. Subtle Architectural Blueprint Grid */}
      <div
        className="absolute inset-0 z-20 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 1c. Radial vignette to blend into dark canvas */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />

      {/* 2. Spotlight Reveal Layer (Cuts through with vivid color and strata illumination) */}
      <RevealLayer ref={revealRef} image={BG_IMAGE_2} />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-6 backdrop-blur-md bg-black/60 shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
        {/* Left Brand - Official Text Mark */}
        <div className="flex items-center cursor-pointer group" onClick={onStartDigging} title="CodeSage - Unearth Architecture">
          <picture>
            <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
            <source srcSet="/logos/text mark.png" type="image/png" />
            <img
              src="/logos/text mark.svg"
              alt="CodeSage"
              className="h-8 sm:h-9 w-auto max-w-[190px] sm:max-w-[240px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] brightness-125 hover:brightness-150 transition-all duration-200"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('textmark.png')) {
                  target.src = '/logos/textmark.png';
                }
              }}
            />
          </picture>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-3">
          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md text-white/70 hover:text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-white/80" />}
            </motion.button>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden text-white p-2 rounded-md bg-white/10 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.12)] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex flex-col justify-center px-8 space-y-6 md:hidden">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setMobileMenuOpen(false);
                if ((item === 'Repo RAG' || item === 'Course') && onStartDigging) {
                  onStartDigging();
                }
              }}
              className="text-left text-2xl text-white font-playfair italic hover:text-[#e8702a] transition-colors"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onStartDigging) onStartDigging();
            }}
            className="w-full bg-[#e8702a] hover:bg-[#d66320] text-white py-2.5 rounded-md font-medium text-center text-sm"
          >
            Explore Repo Workbench
          </button>
        </div>
      )}

      {/* 3. Central Heading (z-50) */}
      <div className="absolute top-[12%] sm:top-[13%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        {/* Floating Brand Badge */}
        <div className="mb-4 sm:mb-5 inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.12)] pointer-events-auto">
          <picture>
            <source srcSet="/logos/app-icon.png" type="image/png" />
            <img
              src="/logos/app-icon.svg"
              alt="CodeSage"
              className="w-4 h-4 object-contain rounded"
            />
          </picture>
          <span className="text-[11px] font-mono tracking-wider uppercase text-white/90 font-medium">
            CodeSage Stratigraphy
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#45A557] animate-pulse" />
        </div>

        <h1 className="text-white leading-[0.95] tracking-[-2.28px]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal drop-shadow-md"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Layers hold
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal drop-shadow-md"
            style={{ letterSpacing: '-0.06em', animationDelay: '0.42s' }}
          >
            tales of time
          </span>
        </h1>

        {/* Centered Primary Action Button (21st.dev Liquid Glass Button) */}
        <div className="mt-8 sm:mt-10 pointer-events-auto hero-anim hero-fade" style={{ animationDelay: '0.65s' }}>
          <LiquidGlassButton onClick={onStartDigging} />
        </div>
      </div>

      {/* 4. Bottom-Left Paragraph (z-50) */}
      <div
        className="hidden sm:block absolute bottom-12 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade pointer-events-auto"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed font-light drop-shadow-sm">
          Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
        </p>
      </div>

      {/* 5. Bottom-Right Paragraph (z-50) */}
      <div
        className="hidden sm:block absolute bottom-12 right-10 md:right-14 max-w-[280px] z-50 hero-anim hero-fade pointer-events-auto text-left"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed font-light drop-shadow-sm">
          Our interactive maps let you peel back the crust to trace how stones, fossils, and deep code time combine to shape the ground beneath your feet.
        </p>
      </div>

      {/* 6. Smooth Bottom Gradient Blend to Studio */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-40 pointer-events-none" />
    </section>
  );
};
