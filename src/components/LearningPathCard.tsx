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
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-[#FAFAFA] dark:bg-[#1a1a1e] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Compass className="w-4 h-4 text-[#e8702a]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-[-0.28px] text-[#171717] dark:text-[#EDEDED]">
              Architecture & Stratigraphy Guide
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-[#8F8F8F] dark:text-[#888888]">
          Curated Steps
        </span>
      </div>

      {/* Architecture Summary */}
      {architectureSummary && (
        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-medium uppercase tracking-wider text-[#4D4D4D] dark:text-[#A1A1A1]">
            <Layers className="w-3.5 h-3.5 text-[#e8702a]" />
            <span>Architecture Overview</span>
          </div>
          <p className="text-[13px] text-[#4D4D4D] dark:text-[#A1A1A1] leading-relaxed whitespace-pre-line">
            {architectureSummary}
          </p>
        </div>
      )}

      {/* Learning Path Steps */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-[11px] font-medium uppercase tracking-wider text-[#4D4D4D] dark:text-[#A1A1A1]">
          <BookOpen className="w-3.5 h-3.5 text-[#e8702a]" />
          <span>Recommended Reading Order</span>
        </div>

        {learningPath && learningPath.length > 0 ? (
          <div className="space-y-2">
            {learningPath.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-[#FAFAFA] dark:bg-[#161618] hover:bg-[#F2F2F2] dark:hover:bg-[#1c1c1f] shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07)] rounded-lg text-xs transition-colors"
              >
                <div className="w-5 h-5 rounded bg-[#F2F2F2] dark:bg-[#222226] text-[#171717] dark:text-[#EDEDED] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] flex items-center justify-center font-mono text-[11px] font-medium shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="leading-relaxed text-[13px] text-[#171717] dark:text-[#EDEDED]">
                  {step}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8F8F8F] dark:text-[#888888] italic">No learning steps generated yet.</p>
        )}
      </div>
    </div>
  );
};

