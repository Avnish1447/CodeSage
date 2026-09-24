import React from 'react';
import { RepoFacts } from '../types';
import { Code2, Layers, FileCode2 } from 'lucide-react';

interface TechStackCardProps {
  facts: RepoFacts;
}

export const TechStackCard: React.FC<TechStackCardProps> = ({ facts }) => {
  const totalFiles = Object.values(facts.languages).reduce((a, b) => a + b, 0) || 1;

  const sortedLanguages = Object.entries(facts.languages)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-[#FAFAFA] dark:bg-[#1a1a1e] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Code2 className="w-4 h-4 text-[#e8702a]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-[-0.28px] text-[#171717] dark:text-[#EDEDED]">
              Languages & Tech Stack
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-[#8F8F8F] dark:text-[#888888]">
          {facts.frameworks.length} Frameworks
        </span>
      </div>

      {/* Languages Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#4D4D4D] dark:text-[#A1A1A1] uppercase tracking-wider text-[11px]">
            Distribution
          </span>
          <span className="font-mono text-[#8F8F8F] dark:text-[#888888] text-[11px]">
            {Object.keys(facts.languages).length} languages detected
          </span>
        </div>

        {/* Slim Vercel-style Progress Bar */}
        <div className="w-full h-2 bg-[#F2F2F2] dark:bg-[#1a1a1e] rounded-full overflow-hidden flex shadow-inner">
          {sortedLanguages.map(([lang, count], idx) => {
            const pct = Math.round((count / totalFiles) * 100);
            const colors = [
              'bg-[#e8702a]',
              'bg-[#0072F5]',
              'bg-[#45A557]',
              'bg-[#7820BC]',
              'bg-[#FF990A]',
              'bg-[#EA3E83]',
            ];
            return (
              <div
                key={lang}
                style={{ width: `${Math.max(pct, 1)}%` }}
                className={`${colors[idx % colors.length]} h-full transition-all`}
                title={`${lang}: ${count} files (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Language Grid Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {sortedLanguages.map(([lang, count], idx) => {
            const pct = Math.round((count / totalFiles) * 100);
            const dotColors = [
              'bg-[#e8702a]',
              'bg-[#0072F5]',
              'bg-[#45A557]',
              'bg-[#7820BC]',
              'bg-[#FF990A]',
              'bg-[#EA3E83]',
            ];
            return (
              <div
                key={lang}
                className="flex items-center justify-between text-xs bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] px-3 py-2 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]} shrink-0`} />
                  <span className="font-medium text-[#171717] dark:text-[#EDEDED] truncate">{lang}</span>
                </div>
                <span className="font-mono text-[11px] text-[#8F8F8F] dark:text-[#888888] ml-2 shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frameworks & Tooling */}
      <div className="space-y-2.5">
        <h4 className="font-medium text-[#4D4D4D] dark:text-[#A1A1A1] uppercase tracking-wider text-[11px]">
          Detected Frameworks & Libraries
        </h4>
        {facts.frameworks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {facts.frameworks.map((fw) => (
              <span
                key={fw}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] text-[#171717] dark:text-[#EDEDED] text-xs font-mono font-medium hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] transition-colors"
              >
                <Layers className="w-3 h-3 text-[#e8702a]" />
                <span>{fw}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8F8F8F] dark:text-[#888888] italic">No frameworks detected.</p>
        )}
      </div>

      {/* Key Entry Files */}
      <div className="space-y-2.5">
        <h4 className="font-medium text-[#4D4D4D] dark:text-[#A1A1A1] uppercase tracking-wider text-[11px]">
          Key Configuration & Entry Points
        </h4>
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {facts.important_files.map((file) => (
            <div
              key={file}
              className="flex items-center space-x-2 text-xs font-mono bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] px-3 py-1.5 rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07)] text-[#4D4D4D] dark:text-[#A1A1A1] transition-colors"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#e8702a] flex-shrink-0" />
              <span className="truncate">{file}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

