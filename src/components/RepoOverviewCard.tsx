import React from 'react';
import { RepoOverview, RepoStats } from '../types';
import { FolderGit2, HardDrive, FileText, Check, X, ExternalLink, Hash } from 'lucide-react';

interface RepoOverviewCardProps {
  overview: RepoOverview;
  stats: RepoStats;
}

export const RepoOverviewCard: React.FC<RepoOverviewCardProps> = ({ overview, stats }) => {
  return (
    <div className="bg-white dark:bg-[#0f0f11] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] rounded-xl p-6 space-y-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#e8702a] rounded-lg">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-semibold text-[#171717] dark:text-[#EDEDED] tracking-tight">{overview.owner} / {overview.repo}</h3>
              <a
                href={overview.normalized_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors"
                title="Open on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <Hash className="w-3 h-3 text-[#8F8F8F]" />
              <span className="text-[11px] font-mono text-[#8F8F8F]">ID: {overview.repository_id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Stratified & Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 rounded-lg">
          <div className="flex items-center text-[#4D4D4D] dark:text-[#A1A1A1] text-xs font-normal mb-1">
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[#e8702a]" />
            Total Files
          </div>
          <p className="text-[28px] font-semibold text-[#171717] dark:text-[#EDEDED] tracking-[-1.28px] font-sans leading-tight">{stats.file_count}</p>
        </div>

        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 rounded-lg">
          <div className="flex items-center text-[#4D4D4D] dark:text-[#A1A1A1] text-xs font-normal mb-1">
            <HardDrive className="w-3.5 h-3.5 mr-1.5 text-[#e8702a]" />
            Repository Size
          </div>
          <p className="text-[28px] font-semibold text-[#171717] dark:text-[#EDEDED] tracking-[-1.28px] font-sans leading-tight">{overview.size_mb} MB</p>
        </div>

        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 rounded-lg">
          <div className="flex items-center text-[#4D4D4D] dark:text-[#A1A1A1] text-xs font-normal mb-1">
            <FolderGit2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Directories
          </div>
          <p className="text-[28px] font-semibold text-[#171717] dark:text-[#EDEDED] tracking-[-1.28px] font-sans leading-tight">{stats.directory_count}</p>
        </div>

        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 rounded-lg">
          <div className="flex items-center text-[#4D4D4D] dark:text-[#A1A1A1] text-xs font-normal mb-1">
            Docker & Config
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
              stats.docker_detected ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20' : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#8F8F8F]'
            }`}>
              {stats.docker_detected ? <Check className="w-3 h-3 mr-1 text-sky-600 dark:text-sky-400" /> : <X className="w-3 h-3 mr-1" />}
              Docker
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
              stats.tests_detected ? 'bg-[#e8702a]/10 text-[#e8702a] border border-[#e8702a]/20' : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#8F8F8F]'
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

