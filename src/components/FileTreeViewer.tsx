import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TreeNode } from '../types';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  X,
  Copy,
  Check,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface FileContentResponse {
  path: string;
  name: string;
  extension: string;
  language: string;
  size_bytes: number;
  line_count?: number;
  is_binary: boolean;
  is_truncated?: boolean;
  content: string | null;
  message?: string;
}

interface FileTreeViewerProps {
  tree: TreeNode[];
  repositoryId?: string;
}

interface TreeItemProps {
  node: TreeNode;
  depth?: number;
  onFileClick?: (path: string) => void;
  selectedPath?: string | null;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  depth = 0,
  onFileClick,
  selectedPath,
}) => {
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
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                onFileClick={onFileClick}
                selectedPath={selectedPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={() => onFileClick?.(node.path)}
      style={{ paddingLeft: `${depth * 14 + 26}px` }}
      className={`w-full text-left py-1 px-2 rounded-md flex items-center justify-between text-[12px] font-mono transition-all cursor-pointer group ${
        isSelected
          ? 'bg-[#e8702a]/10 text-[#e8702a] font-medium shadow-[0_0_0_1px_rgba(232,112,42,0.3)]'
          : 'hover:bg-[#EBEBEB] dark:hover:bg-[#1f1f23] text-[#4D4D4D] dark:text-[#A1A1A1] hover:text-[#171717] dark:hover:text-[#EDEDED]'
      }`}
    >
      <div className="flex items-center space-x-2 truncate">
        <FileCode
          className={`w-3.5 h-3.5 shrink-0 ${
            node.important || isSelected
              ? 'text-[#e8702a]'
              : 'text-[#8F8F8F] dark:text-[#888888] group-hover:text-[#171717] dark:group-hover:text-[#EDEDED]'
          }`}
        />
        <span className={`truncate ${node.important || isSelected ? 'font-medium text-[#171717] dark:text-[#EDEDED]' : ''}`}>
          {node.name}
        </span>
      </div>
      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
        {node.important && (
          <span className="text-[10px] px-1.5 py-0.5 bg-[#FAFAFA] dark:bg-[#1d1d21] text-[#e8702a] shadow-[0_0_0_1px_rgba(232,112,42,0.3)] font-mono font-medium rounded">
            Key
          </span>
        )}
        <span className="text-[10px] text-[#8F8F8F] dark:text-[#888888] opacity-0 group-hover:opacity-100 transition-opacity">
          View
        </span>
      </div>
    </motion.button>
  );
};

export const FileTreeViewer: React.FC<FileTreeViewerProps> = ({
  tree,
  repositoryId,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileContentResponse | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectFile = async (path: string) => {
    setActivePath(path);
    if (!repositoryId) return;

    setLoadingFile(true);
    setFileError(null);

    try {
      const res = await fetch(`/api/v1/repositories/${repositoryId}/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to load file contents.');
      }

      setSelectedFile(data);
    } catch (err: any) {
      setFileError(err.message || 'Error reading file content.');
      setSelectedFile(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
          Click file to inspect
        </span>
      </div>

      {/* Recessed Tree Canvas */}
      <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg p-3 max-h-80 overflow-y-auto space-y-0.5 font-mono">
        {tree && tree.length > 0 ? (
          tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              onFileClick={handleSelectFile}
              selectedPath={activePath}
            />
          ))
        ) : (
          <p className="text-xs text-[#8F8F8F] dark:text-[#888888] italic p-2">No tree items found.</p>
        )}
      </div>

      {/* Inline Code Snippet Preview Drawer / Modal */}
      <AnimatePresence>
        {(selectedFile || loadingFile || fileError) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            {/* Modal/Drawer Top Bar */}
            <div className="px-4 py-2.5 bg-white dark:bg-[#111113] shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)] flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-[#e8702a] shrink-0" />
                <span className="text-xs font-mono font-medium text-[#171717] dark:text-[#EDEDED] truncate">
                  {activePath}
                </span>
                {selectedFile && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#4D4D4D] dark:text-[#A1A1A1] shrink-0">
                    {selectedFile.language} • {formatBytes(selectedFile.size_bytes)}
                    {selectedFile.line_count ? ` • ${selectedFile.line_count} lines` : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {selectedFile?.content && (
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError(null);
                    setActivePath(null);
                  }}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="p-4 max-h-96 overflow-auto font-mono text-xs leading-relaxed">
              {loadingFile && (
                <div className="flex items-center justify-center py-8 space-x-2 text-[#8F8F8F]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#e8702a]" />
                  <span>Loading source content...</span>
                </div>
              )}

              {fileError && (
                <div className="flex items-center space-x-2 text-rose-500 py-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {selectedFile && selectedFile.is_binary && (
                <div className="flex flex-col items-center justify-center py-8 space-y-2 text-[#8F8F8F]">
                  <FileCode className="w-8 h-8 text-[#8F8F8F]" />
                  <p className="text-xs font-mono">{selectedFile.message || 'Binary file preview not supported.'}</p>
                  <span className="text-[11px] text-[#4D4D4D] dark:text-[#A1A1A1]">
                    Size: {formatBytes(selectedFile.size_bytes)}
                  </span>
                </div>
              )}

              {selectedFile && !selectedFile.is_binary && selectedFile.content && (
                <div className="relative">
                  {selectedFile.is_truncated && (
                    <div className="mb-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px]">
                      Showing first 512 KB of file.
                    </div>
                  )}
                  <pre className="text-[#171717] dark:text-[#EDEDED] overflow-x-auto whitespace-pre selection:bg-[#e8702a]/20">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
