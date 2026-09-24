import React from 'react';
import { Compass, BookOpen, Layers } from 'lucide-react';

interface LearningPathCardProps {
  learningPath: string[];
  architectureSummary: string;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({
  learningPath,
  architectureSummary,
}) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50 space-y-6 backdrop-blur-xl">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <Compass className="w-5 h-5 text-[#e8702a]" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Architecture & Learning Stratigraphy</h3>
      </div>

      {/* Architecture Summary */}
      {architectureSummary && (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-[#e8702a] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#e8702a]" />
            <span>Architecture Overview</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
            {architectureSummary}
          </p>
        </div>
      )}

      {/* Learning Path */}
      <div>
        <div className="flex items-center space-x-2 text-[#e8702a] text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Recommended Learning Path</span>
        </div>

        {learningPath && learningPath.length > 0 ? (
          <div className="space-y-2.5">
            {learningPath.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="w-6 h-6 rounded-lg bg-[#e8702a] text-white flex items-center justify-center font-mono font-bold flex-shrink-0 text-xs shadow-md shadow-[#e8702a]/20">
                  {idx + 1}
                </div>
                <div className="pt-0.5 leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                  {step}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No learning steps generated yet.</p>
        )}
      </div>
    </div>
  );
};

