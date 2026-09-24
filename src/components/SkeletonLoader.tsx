import React from 'react';
import { Loader2, Sparkles, FolderGit2, Code2, Layers, BookOpen, MessageSquare } from 'lucide-react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner Indicator */}
      <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-950 border border-[#e8702a]/30 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(232,112,42,0.25)]">
            <picture>
              <source srcSet="/logos/app-icon.png" type="image/png" />
              <img src="/logos/app-icon.svg" alt="CodeSage" className="w-6 h-6 object-contain animate-pulse rounded" />
            </picture>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Excavating Repository Context...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cloning tree, parsing dependencies, analyzing stratigraphy & preparing RAG index.</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-[#e8702a]/30 rounded-full text-xs font-mono font-semibold text-[#e8702a]">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-[#e8702a] animate-pulse" />
          Lithos RAG
        </span>
      </div>

      {/* Repo Overview Card Skeleton */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-16 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Dual Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tech Stack Card Skeleton */}
          <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Code2 className="w-5 h-5 text-slate-400 dark:text-slate-600" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-950 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg" />
              ))}
            </div>
          </div>

          {/* File Tree Skeleton */}
          <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Layers className="w-5 h-5 text-slate-400 dark:text-slate-600" />
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className={`h-4 bg-slate-200 dark:bg-slate-800 rounded-md ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Chat Skeleton (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-black/40 h-[600px] flex flex-col justify-between">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="space-y-4 flex-1 pt-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="p-4 bg-[#e8702a]/10 border border-[#e8702a]/30 rounded-2xl space-y-2 ml-auto max-w-[80%]">
              <div className="h-4 w-full bg-[#e8702a]/30 rounded" />
            </div>
          </div>
          <div className="h-10 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
