import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Copy,
  Check,
  Film,
  Sparkles,
  Clock,
  Layers,
  MonitorPlay,
  ExternalLink,
  Code2,
  Sliders
} from 'lucide-react';

interface LaunchVideoShowcaseProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LaunchVideoShowcase: React.FC<LaunchVideoShowcaseProps> = ({
  onClose,
  isModal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<'extended' | 'teaser'>('extended');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeShareTab, setActiveShareTab] = useState<'x' | 'linkedin' | 'discord'>('x');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const videoConfig = {
    extended: {
      src: '/brag-extended.mp4',
      poster: '/brag-extended.jpg',
      label: 'Cinematic 3D Launch Film (38s)',
      duration: 38,
      durationStr: '00:38',
      scenes: [
        { time: 0, label: '00:00', title: 'The Geological Anomaly', desc: '3D camera drift, rotating clay core & premise' },
        { time: 4.5, label: '00:04.5', title: 'The Core Injection', desc: '3D tilted console, 41 files coring in 840ms' },
        { time: 11.0, label: '00:11.0', title: 'Extruded Strata Slabs', desc: 'Tactile sediment bars & zero circular deps' },
        { time: 18.5, label: '00:18.5', title: 'Live Technical RAG', desc: 'Conversational 3D bubbles & verified code citations' },
        { time: 27.5, label: '00:27.5', title: 'Dual Monoliths', desc: 'Junior onboarding vs Senior principal architect lens' },
        { time: 33.0, label: '00:33.0', title: 'Monumental Outro Slam', desc: 'Sub-bass beat drop, impact flash & CTA monument' },
      ],
    },
    teaser: {
      src: '/brag.mp4',
      poster: '/brag.jpg',
      label: 'Social Teaser (18s)',
      duration: 18,
      durationStr: '00:18',
      scenes: [
        { time: 0, label: '00:00', title: 'The Hook', desc: 'Codebase secret geology intro' },
        { time: 3.5, label: '00:03.5', title: 'The Core Sample', desc: 'Real ingestion & 41 files mapped' },
        { time: 8.0, label: '00:08.0', title: 'Stratigraphy', desc: 'Multi-layer language composition' },
        { time: 13.0, label: '00:13.0', title: 'Outro Slam', desc: 'CodeSage branding & call-to-action' },
      ],
    },
  };

  const currentConfig = videoConfig[selectedVersion];

  const shareTexts = {
    x: `Built CodeSage — an AI codebase geology engine that excavates any GitHub repository into architectural strata, dependency maps, and instant RAG technical answers with file citations.\n\nStop guessing legacy code. Start excavating. ⚡`,
    linkedin: `Excited to launch CodeSage: an AI Codebase Intelligence and Geological Knowledge-Mining Engine.\n\nInstead of combing through thousands of files or untangling messy legacy architecture manually, CodeSage cores any GitHub repository like geological strata — generating instant language stratigraphy, dependency graphs, and conversational RAG answers with Gemini.\n\nKey capabilities:\n- Instant ingestion & file stratigraphy (41 files mapped in < 1s)\n- Architectural synthesis with beginner and senior engineer explanation tiers\n- Conversational RAG with direct code file citations (server.ts, types.ts, rag.ts)\n\nOpen source and ready to explore.`,
    discord: `**CodeSage // AI Codebase Geology Engine** is live!\nDrop any GitHub repository URL to excavate its internal architecture, map its language stratigraphy, and query its codebase with real-time Gemini RAG.`,
  };

  const handleCopy = (tab: 'x' | 'linkedin' | 'discord') => {
    navigator.clipboard.writeText(shareTexts[tab]);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const switchVersion = (ver: 'extended' | 'teaser') => {
    setSelectedVersion(ver);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const jumpToTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-5xl mx-auto' : ''} space-y-6 text-slate-100`}>
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Claymorphic Launch Film
            </span>

            {/* Version Toggle Pill Buttons */}
            <div className="inline-flex rounded-full bg-slate-950 p-0.5 border border-slate-800">
              <button
                onClick={() => switchVersion('extended')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedVersion === 'extended'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pro 3D Launch Film (38s)
              </button>
              <button
                onClick={() => switchVersion('teaser')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedVersion === 'teaser'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Social Teaser (18s)
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-950 border border-purple-500/40 shadow-[0_0_12px_rgba(147,51,234,0.35)] flex-shrink-0">
              <picture>
                <source srcSet="/logos/app-icon.png" type="image/png" />
                <img src="/logos/app-icon.svg" alt="CodeSage" className="w-6 h-6 object-contain rounded" />
              </picture>
            </div>
            <span>CodeSage: Stop Guessing. Start Excavating.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {selectedVersion === 'extended'
              ? 'Pro-grade cinematic 3D launch film — dynamic 3D camera rig, volumetric claymorphism, speed-ramped AST coring, live RAG code citations & multi-track sound design.'
              : 'Punchy 18s social teaser designed for high-impact launch announcements.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <a
            href={currentConfig.src}
            download={`codesage-${selectedVersion}.mp4`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:text-white"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download MP4 ({currentConfig.duration}s)</span>
          </a>
          <a
            href={currentConfig.poster}
            download={`codesage-${selectedVersion}-poster.jpg`}
            className="hidden sm:inline-flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all hover:text-white"
          >
            <span>Poster JPG</span>
          </a>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl shadow-black/80 aspect-video group">
        <video
          key={currentConfig.src}
          ref={videoRef}
          src={currentConfig.src}
          poster={currentConfig.poster}
          playsInline
          className="w-full h-full object-contain bg-slate-950"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
        />

        {/* Custom Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-xs font-mono text-emerald-400 font-semibold border border-white/10">
                ⚡ CodeSage · {currentConfig.label}
              </span>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={restartVideo}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300">
                {formatTime(currentTime)} / {currentConfig.durationStr}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5">
              {currentConfig.scenes.slice(0, 4).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToTime(s.time)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-black/50 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 hover:scale-105 transition-all cursor-pointer z-20"
            title="Play Video"
          >
            <Play className="w-9 h-9 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* Interactive Scene Beat Jumps */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Storyboard Markers ({currentConfig.scenes.length} Scenes)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Click to jump directly to any feature</span>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${selectedVersion === 'extended' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-2.5`}>
          {currentConfig.scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpToTime(s.time)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all hover:border-emerald-500/40 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-emerald-400 font-bold">{s.label}</span>
                <Play className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                {s.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Share & Social Copy Deck */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Launch Announcement Kit</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ready-to-post launch copy for Twitter/X, LinkedIn, and Discord communities.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['x', 'linkedin', 'discord'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveShareTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeShareTab === tab
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'x' ? 'Twitter / X' : tab === 'linkedin' ? 'LinkedIn' : 'Discord'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800/80">
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {shareTexts[activeShareTab]}
          </pre>

          <button
            onClick={() => handleCopy(activeShareTab)}
            className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
          >
            {copiedTab === activeShareTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
