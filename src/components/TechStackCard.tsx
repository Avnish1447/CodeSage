import React from 'react';
import { RepoFacts } from '../types';
import { Code2, Layers, FileCode2, CheckCircle, FileText } from 'lucide-react';

interface TechStackCardProps {
  facts: RepoFacts;
}

export const TechStackCard: React.FC<TechStackCardProps> = ({ facts }) => {
  const totalFiles = Object.values(facts.languages).reduce((a, b) => a + b, 0) || 1;

  const sortedLanguages = Object.entries(facts.languages)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 border-t-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 space-y-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-[#e8702a]" />
          <h3 className="text-lg font-bold text-white tracking-tight">Languages & Tech Stack</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono font-medium">
          {facts.frameworks.length} Frameworks Detected
        </span>
      </div>

      {/* Languages Distribution */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Programming Languages
        </h4>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex mb-3 border border-slate-800">
          {sortedLanguages.map(([lang, count], idx) => {
            const pct = Math.round((count / totalFiles) * 100);
            const colors = [
              'bg-[#e8702a]', 'bg-amber-500', 'bg-emerald-500',
              'bg-sky-500', 'bg-purple-500', 'bg-rose-500'
            ];
            return (
              <div
                key={lang}
                style={{ width: `${pct}%` }}
                className={`${colors[idx % colors.length]} h-full`}
                title={`${lang}: ${count} files (${pct}%)`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sortedLanguages.map(([lang, count], idx) => {
            const pct = Math.round((count / totalFiles) * 100);
            const dotColors = [
              'bg-[#e8702a]', 'bg-amber-500', 'bg-emerald-500',
              'bg-sky-500', 'bg-purple-500', 'bg-rose-500'
            ];
            return (
              <div key={lang} className="flex items-center justify-between text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                  <span className="font-semibold text-slate-200">{lang}</span>
                </div>
                <span className="font-mono text-slate-400">{count} files ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Detected Frameworks & Libraries
        </h4>
        {facts.frameworks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {facts.frameworks.map((fw) => (
              <span
                key={fw}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#e8702a]/10 border border-[#e8702a]/30 text-[#e8702a] text-xs font-semibold"
              >
                <Layers className="w-3 h-3 text-[#e8702a]" />
                <span>{fw}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific framework declaration files matched.</p>
        )}
      </div>

      {/* Important Files */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Key Entry Files & Configuration
        </h4>
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          {facts.important_files.map((file) => (
            <div key={file} className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <FileCode2 className="w-3.5 h-3.5 text-[#e8702a] flex-shrink-0" />
              <span className="truncate">{file}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

