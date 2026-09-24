import React from 'react';
import { RepoOverview, RepoStats } from '../types';
import { FolderGit2, HardDrive, FileText, Check, X, ExternalLink, Hash } from 'lucide-react';

interface RepoOverviewCardProps {
  overview: RepoOverview;
  stats: RepoStats;
}

export const RepoOverviewCard: React.FC<RepoOverviewCardProps> = ({ overview, stats }) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50 space-y-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e8702a]/10 text-[#e8702a] border border-[#e8702a]/30 rounded-xl shadow-sm">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{overview.owner} / {overview.repo}</h3>
              <a
                href={overview.normalized_url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-[#e8702a] dark:text-slate-400 transition-colors"
                title="Open on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">ID: {overview.repository_id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>Status: Stratified & Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[#e8702a]" />
            Total Files
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{stats.file_count}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <HardDrive className="w-3.5 h-3.5 mr-1.5 text-[#e8702a]" />
            Repository Size
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{overview.size_mb} MB</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <FolderGit2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Directories
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{stats.directory_count}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            Docker & Config
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              stats.docker_detected ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {stats.docker_detected ? <Check className="w-3 h-3 mr-1 text-sky-600 dark:text-sky-400" /> : <X className="w-3 h-3 mr-1" />}
              Docker
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
              stats.tests_detected ? 'bg-[#e8702a]/15 text-[#e8702a] border border-[#e8702a]/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {stats.tests_detected ? <Check className="w-3 h-3 mr-1 text-[#e8702a]" /> : <X className="w-3 h-3 mr-1" />}
              Tests
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

