import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Check, Sparkles, ExternalLink, Sun, Moon } from 'lucide-react';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BrandAsset {
  id: string;
  name: string;
  filename: string;
  path: string;
  dimensions: string;
  description: string;
  usage: string;
  bgPreference: 'dark' | 'light' | 'both';
  isMonochrome?: boolean;
}

const BRAND_ASSETS: BrandAsset[] = [
  {
    id: 'primary',
    name: 'Primary Brand Logo',
    filename: 'primary-logo.svg',
    path: '/logos/primary-logo.svg',
    dimensions: '1024 × 1024 (Tight ViewBox)',
    description: 'The master brand mark featuring the layered geological gemstone strata in signature ember amber.',
    usage: 'Header navigation, hero branding, pitch presentations, and main UI emblems.',
    bgPreference: 'dark',
  },
  {
    id: 'app-icon',
    name: 'App Icon',
    filename: 'app-icon.svg',
    path: '/logos/app-icon.svg',
    dimensions: '1024 × 1024 (Full Canvas)',
    description: 'Rounded container app icon optimized for mobile home screens, desktop docks, and app store listings.',
    usage: 'Apple touch icon, progressive web apps, dock icon, and software launcher badges.',
    bgPreference: 'both',
  },
  {
    id: 'textmark',
    name: 'Official Text Mark / Wordmark',
    filename: 'text mark.svg',
    path: '/logos/text mark.svg',
    dimensions: '1464 × 544 (Cropped Vector)',
    description: 'Official typographic wordmark used at the top left corner of the platform navigation and horizontal banners.',
    usage: 'Top-left navigation, header branding, sponsor strips, docs headers, and press kit titles.',
    bgPreference: 'both',
  },
  {
    id: 'primary-light',
    name: 'Primary Logo Mark (Light Edition)',
    filename: 'Primary Logo Mark light.svg',
    path: '/logos/Primary Logo Mark light.svg',
    dimensions: '2048 × 2048 (High-Res Vector)',
    description: 'Light-tinted edition of the primary mark crafted specifically for dark backgrounds and high contrast overlays.',
    usage: 'Dark navigation bars, high-contrast modal headers, dark mode app icons, and luminous hero elements.',
    bgPreference: 'dark',
  },
  {
    id: 'fav',
    name: 'Browser Favicon',
    filename: 'favicon.svg',
    path: '/favicon.svg',
    dimensions: '2048 × 2048 (High-DPI Vector)',
    description: 'Vector favicon crafted for browser tabs, bookmark bars, and address bar branding.',
    usage: 'HTML <link rel="icon">, browser tabs, bookmarks, and PWA manifest icon.',
    bgPreference: 'dark',
  },
  {
    id: 'monochrome',
    name: 'Monochrome Silhouette Logo',
    filename: 'monochrome-logo.svg',
    path: '/logos/monochrome-logo.svg',
    dimensions: '1024 × 1024 (Single Color)',
    description: 'High-contrast single-tone silhouette for watermarks, print media, monochrome stamping, and documentation.',
    usage: 'Single-color print, laser engraving, GitHub markdown badges, and footer credits.',
    bgPreference: 'light',
    isMonochrome: true,
  },
];

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'dark' | 'light'>('dark');

  const copyPath = (asset: BrandAsset) => {
    navigator.clipboard.writeText(window.location.origin + asset.path);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="brand-kit-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#e8702a] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Brand Assets & Logos</span>
              </div>
              <h2 id="brand-kit-title" className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <img src="/logos/primary-logo.svg" alt="" className="w-7 h-7 object-contain" />
                CodeSage Identity Kit
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                All uploaded SVGs have been integrated across the website navigation, hero banner, favicon, and RAG studio.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewBg(previewBg === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle preview background"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                title="Toggle preview background"
              >
                {previewBg === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span className="hidden sm:inline">{previewBg === 'dark' ? 'Light Grid' : 'Dark Grid'}</span>
              </button>
              <button
                onClick={onClose}
                aria-label="Close brand kit modal"
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
            {BRAND_ASSETS.map((asset) => (
              <div
                key={asset.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Canvas Preview Container */}
                  <div
                    className={`h-40 rounded-xl mb-4 flex items-center justify-center p-6 border transition-colors relative overflow-hidden ${
                      previewBg === 'dark'
                        ? 'bg-slate-950 border-slate-800/80'
                        : 'bg-white border-slate-200 shadow-inner'
                    }`}
                    style={{
                      backgroundImage:
                        previewBg === 'dark'
                          ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
                          : 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    <img
                      src={asset.path}
                      alt={asset.name}
                      className={`max-h-full max-w-full object-contain drop-shadow-md transition-transform group-hover:scale-105 duration-300 ${
                        asset.isMonochrome && previewBg === 'dark' ? 'invert brightness-200' : ''
                      }`}
                    />
                    {asset.isMonochrome && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-white/10">
                        {previewBg === 'dark' ? 'inverted for dark UI' : 'raw black'}
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">{asset.name}</h3>
                      <span className="text-[10px] font-mono text-[#e8702a] bg-[#e8702a]/10 px-2 py-0.5 rounded-full border border-[#e8702a]/20">
                        {asset.filename}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{asset.description}</p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      <span className="text-slate-400 font-medium">Used for:</span> {asset.usage}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800/80">
                  <a
                    href={asset.path}
                    download={asset.filename}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </a>
                  <button
                    onClick={() => copyPath(asset)}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Copy URL path"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Brand Audit & Additional Formats Checklist */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Brand Assets Audit & Compatibility Report
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="space-y-1">
                <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Active in HTML & React SPA
                </p>
                <p className="text-[11px] leading-relaxed">
                  Browser tab favicon, Apple touch icons, navigation headers, presentation mode, chat assistant avatars, and footer branding are all active.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" /> Optional Future Assets
                </p>
                <p className="text-[11px] leading-relaxed">
                  For future external marketing, consider adding a 1200×630px OpenGraph social banner card and pure bezier vector paths for tiny sub-10KB file sizes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
