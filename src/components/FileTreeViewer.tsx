import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TreeNode } from '../types';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, FileCode, Sparkles } from 'lucide-react';

interface FileTreeViewerProps {
  tree: TreeNode[];
}

const TreeItem: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className="w-full text-left py-1.5 px-2 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 rounded-lg flex items-center space-x-2 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-[#e8702a] dark:hover:text-[#e8702a] transition-colors cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-[#e8702a]" />
          ) : (
            <Folder className="w-4 h-4 text-[#e8702a]/80" />
          )}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{node.name}/</span>
        </motion.button>

        {isOpen && node.children && node.children.length > 0 && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <TreeItem key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      className="py-1 px-2 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 rounded-lg flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
    >
      <div className="flex items-center space-x-2 truncate">
        <FileCode className={`w-3.5 h-3.5 ${node.important ? 'text-[#e8702a]' : 'text-slate-400 dark:text-slate-500'}`} />
        <span className={node.important ? 'font-semibold text-slate-900 dark:text-white' : ''}>{node.name}</span>
      </div>
      {node.important && (
        <span className="text-[10px] px-1.5 py-0.2 bg-[#e8702a]/15 text-[#e8702a] border border-[#e8702a]/30 font-semibold rounded ml-2 flex-shrink-0">
          Key
        </span>
      )}
    </div>
  );
};

export const FileTreeViewer: React.FC<FileTreeViewerProps> = ({ tree }) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50 space-y-4 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Folder className="w-5 h-5 text-[#e8702a]" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Repository Stratigraphy</h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
          Top-Level Tree Summary
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 max-h-80 overflow-y-auto space-y-0.5 font-mono shadow-inner">
        {tree && tree.length > 0 ? (
          tree.map((node) => <TreeItem key={node.path} node={node} />)
        ) : (
          <p className="text-xs text-slate-500 italic p-2">No tree items found.</p>
        )}
      </div>
    </div>
  );
};

