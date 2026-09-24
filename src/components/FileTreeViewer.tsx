import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TreeNode } from '../types';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileCode } from 'lucide-react';

interface FileTreeViewerProps {
  tree: TreeNode[];
}

const TreeItem: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className="w-full text-left py-1 px-2 hover:bg-[#EBEBEB] dark:hover:bg-[#1f1f23] rounded-md flex items-center space-x-2 text-[12px] font-mono text-[#171717] dark:text-[#EDEDED] transition-colors cursor-pointer group"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8F8F] dark:text-[#888888]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#8F8F8F] dark:text-[#888888]" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#e8702a]" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-[#e8702a]/80" />
          )}
          <span className="font-medium">{node.name}/</span>
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
      style={{ paddingLeft: `${depth * 14 + 26}px` }}
      className="py-1 px-2 hover:bg-[#EBEBEB] dark:hover:bg-[#1f1f23] rounded-md flex items-center justify-between text-[12px] font-mono text-[#4D4D4D] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors"
    >
      <div className="flex items-center space-x-2 truncate">
        <FileCode className={`w-3.5 h-3.5 ${node.important ? 'text-[#e8702a]' : 'text-[#8F8F8F] dark:text-[#888888]'}`} />
        <span className={node.important ? 'font-medium text-[#171717] dark:text-[#EDEDED]' : ''}>
          {node.name}
        </span>
      </div>
      {node.important && (
        <span className="text-[10px] px-1.5 py-0.5 bg-[#FAFAFA] dark:bg-[#1d1d21] text-[#e8702a] shadow-[0_0_0_1px_rgba(232,112,42,0.3)] font-mono font-medium rounded ml-2 shrink-0">
          Key
        </span>
      )}
    </div>
  );
};

export const FileTreeViewer: React.FC<FileTreeViewerProps> = ({ tree }) => {
  return (
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 rounded-md bg-[#FAFAFA] dark:bg-[#1a1a1e] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <Folder className="w-4 h-4 text-[#e8702a]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-[-0.28px] text-[#171717] dark:text-[#EDEDED]">
              Repository Stratigraphy
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-[#8F8F8F] dark:text-[#888888]">
          File Tree Summary
        </span>
      </div>

      {/* Recessed Tree Canvas */}
      <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg p-3 max-h-80 overflow-y-auto space-y-0.5 font-mono">
        {tree && tree.length > 0 ? (
          tree.map((node) => <TreeItem key={node.path} node={node} />)
        ) : (
          <p className="text-xs text-[#8F8F8F] dark:text-[#888888] italic p-2">No tree items found.</p>
        )}
      </div>
    </div>
  );
};

