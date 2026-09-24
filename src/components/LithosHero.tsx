import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Compass, Search, Play } from 'lucide-react';

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
  onWatchLaunchVideo?: () => void;
}

export const LithosHero: React.FC<LithosHeroProps> = ({ onStartDigging, onWatchLaunchVideo }) => {
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
      {/* 1. Base Image Layer */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
      />

      {/* 2. Spotlight Reveal Layer */}
      <RevealLayer ref={revealRef} image={BG_IMAGE_2} />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 backdrop-blur-md bg-slate-950/70 border-b border-white/10 shadow-2xl">
        {/* Left Brand - Official Text Mark */}
        <div className="flex items-center cursor-pointer group" onClick={onStartDigging} title="CodeSage - Unearth Architecture">
          <picture>
            <source srcSet="/logos/text mark.svg" type="image/svg+xml" />
            <source srcSet="/logos/text mark.png" type="image/png" />
            <img
              src="/logos/text mark.svg"
              alt="CodeSage"
              className="h-8 sm:h-9 md:h-10 w-auto max-w-[190px] sm:max-w-[240px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] brightness-125 hover:brightness-150 transition-all duration-200"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('textmark.png')) {
                  target.src = '/logos/textmark.png';
                }
              }}
            />
          </picture>
        </div>

        {/* Right CTA / Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStartDigging}
            className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-[#e8702a] to-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-orange-950/40"
          >
            <Compass className="w-4 h-4" />
            <span>Open CodeSage Studio</span>
          </motion.button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden text-white p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-xl flex flex-col justify-center px-8 space-y-6 md:hidden">
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
            className="w-full bg-[#e8702a] text-white py-3 rounded-full font-semibold text-center"
          >
            Explore Repo Workbench
          </button>
        </div>
      )}

      {/* 3. Central Heading (z-50) */}
      <div className="absolute top-[12%] sm:top-[13%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        {/* Floating Brand Badge */}
        <div className="mb-4 sm:mb-5 inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-xl border border-[#e8702a]/30 shadow-[0_0_20px_rgba(232,112,42,0.2)] pointer-events-auto">
          <picture>
            <source srcSet="/logos/app-icon.png" type="image/png" />
            <img
              src="/logos/app-icon.svg"
              alt="CodeSage"
              className="w-5 h-5 object-contain rounded drop-shadow-[0_0_8px_rgba(232,112,42,0.5)]"
            />
          </picture>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200">
            Official CodeSage Platform
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal drop-shadow-md"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Layers hold
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal drop-shadow-md"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            tales of time
          </span>
        </h1>
      </div>

      {/* 4. Bottom-Left Paragraph (z-50) */}
      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade pointer-events-auto"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm text-white/80 leading-relaxed font-light drop-shadow-sm">
          Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
        </p>
      </div>

      {/* 5. Bottom-Right Paragraph & Button Block (z-50) */}
      <div
        className="absolute bottom-10 sm:bottom-20 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[320px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade pointer-events-auto"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light drop-shadow-sm">
          Our interactive maps let you peel back the crust to trace how stones, fossils, and deep code time combine to shape the ground beneath your feet.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStartDigging}
            className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-[#e8702a]/30 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Start Digging</span>
            <Compass className="w-4 h-4 ml-1" />
          </motion.button>

          {onWatchLaunchVideo && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onWatchLaunchVideo}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 text-sm font-medium px-5 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Launch Film</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 6. Smooth Bottom Gradient Blend to Studio */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-40 pointer-events-none" />
    </section>
  );
};
