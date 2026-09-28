import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TreeNode } from '../types';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FileCode,
  X,
  Copy,
  Check,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  FolderX,
  FileSearch,
  RefreshCw,
  Layers,
  List,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

function extractAllFiles(nodes: TreeNode[]): TreeNode[] {
  const files: TreeNode[] = [];
  function traverse(list: TreeNode[]) {
    for (const node of list) {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return files;
}

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

function filterTreeNodes(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase().trim();
  const result: TreeNode[] = [];

  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q)) {
        result.push(node);
      }
    } else if (node.type === 'directory') {
      const filteredChildren = node.children ? filterTreeNodes(node.children, query) : [];
      if (node.name.toLowerCase().includes(q) || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    }
  }

  return result;
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
        <FileCode className="w-3.5 h-3.5 text-[#8F8F8F] dark:text-[#888888] shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
      <div className="flex items-center space-x-1.5 shrink-0 pl-2">
        {node.important && (
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
            key
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
  const { showSuccess } = useToast();
  const [selectedFile, setSelectedFile] = useState<FileContentResponse | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'paginated'>('tree');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const allFlatFiles = useMemo(() => {
    return extractAllFiles(tree || []);
  }, [tree]);

  const filteredFlatFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFlatFiles;
    const q = searchQuery.toLowerCase().trim();
    return allFlatFiles.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }, [allFlatFiles, searchQuery]);

  const totalPages = Math.ceil(filteredFlatFiles.length / pageSize) || 1;
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFlatFiles.slice(start, start + pageSize);
  }, [filteredFlatFiles, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTree = useMemo(() => {
    return filterTreeNodes(tree || [], searchQuery);
  }, [tree, searchQuery]);

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
      showSuccess(`Copied ${activePath || 'file'} to clipboard!`, 'Code Copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white dark:bg-[#111113] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.09)] rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
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

        {/* View Switcher & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-[#FAFAFA] dark:bg-[#161618] rounded-md shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-[11px] font-mono">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-white font-medium shadow-sm'
                  : 'text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED]'
              }`}
              title="Nested Directory Tree View"
            >
              <Layers className="w-3 h-3" />
              <span>Tree</span>
            </button>
            <button
              onClick={() => setViewMode('paginated')}
              className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
                viewMode === 'paginated'
                  ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-white font-medium shadow-sm'
                  : 'text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED]'
              }`}
              title="Paginated Flat File Index"
            >
              <List className="w-3 h-3" />
              <span>Index ({allFlatFiles.length})</span>
            </button>
          </div>

          {/* Tree Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#8F8F8F] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter files..."
              aria-label="Filter files in repository"
              className="pl-8 pr-7 py-1 text-xs bg-[#FAFAFA] dark:bg-[#161618] text-[#171717] dark:text-[#EDEDED] placeholder-[#8F8F8F] dark:placeholder-[#666666] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] focus:shadow-[0_0_0_2px_#0072F5] outline-none rounded-md w-full sm:w-44 font-mono transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Paginated vs Nested Tree */}
      {viewMode === 'paginated' ? (
        <div className="space-y-2">
          <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg max-h-80 overflow-y-auto font-mono">
            {filteredFlatFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <FileSearch className="w-5 h-5 text-[#8F8F8F]" />
                <p className="text-xs font-medium text-[#171717] dark:text-[#EDEDED]">No matching files</p>
                <p className="text-[11px] text-[#8F8F8F]">No files matched "{searchQuery}".</p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {paginatedFiles.map((file) => {
                  const isSelected = activePath === file.path;
                  return (
                    <div
                      key={file.path}
                      onClick={() => handleSelectFile(file.path)}
                      className={`flex items-center justify-between p-2.5 text-xs transition-colors cursor-pointer group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] ${
                        isSelected
                          ? 'bg-[#e8702a]/10 text-[#e8702a] font-medium shadow-[0_0_0_1px_rgba(232,112,42,0.3)]'
                          : 'text-[#4D4D4D] dark:text-[#A1A1A1]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <FileCode className="w-3.5 h-3.5 text-[#8F8F8F] shrink-0" />
                        <span className="font-medium text-[#171717] dark:text-[#EDEDED] shrink-0">{file.name}</span>
                        <span className="text-[11px] text-[#8F8F8F] dark:text-[#666666] truncate">{file.path}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {file.important && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                            key
                          </span>
                        )}
                        <span className="text-[10px] text-[#8F8F8F] opacity-0 group-hover:opacity-100 hover:text-[#171717] dark:hover:text-white transition-opacity">
                          View
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredFlatFiles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono text-[#8F8F8F]">
              <div className="flex items-center space-x-2">
                <span className="text-[11px]">
                  Showing {Math.min(filteredFlatFiles.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredFlatFiles.length, currentPage * pageSize)} of {filteredFlatFiles.length} files
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-[10px] bg-transparent border border-black/10 dark:border-white/10 rounded px-1 py-0.5 text-[#171717] dark:text-[#EDEDED]"
                >
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="First Page"
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-0.5 text-[11px] bg-black/[0.04] dark:bg-white/[0.06] rounded font-semibold text-[#171717] dark:text-[#EDEDED]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Last Page"
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Recessed Tree Canvas */
        <div className="bg-[#FAFAFA] dark:bg-[#161618] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg p-3 max-h-80 overflow-y-auto space-y-0.5 font-mono">
          {!tree || tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="p-2.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-[#8F8F8F]">
                <FolderX className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[#171717] dark:text-[#EDEDED]">Empty Repository</p>
              <p className="text-[11px] text-[#8F8F8F]">No files or directories were found in this codebase.</p>
            </div>
          ) : filteredTree.length > 0 ? (
            filteredTree.map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                onFileClick={handleSelectFile}
                selectedPath={activePath}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="p-2.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-[#8F8F8F]">
                <FileSearch className="w-5 h-5 text-[#8F8F8F]" />
              </div>
              <p className="text-xs font-medium text-[#171717] dark:text-[#EDEDED]">No matching files</p>
              <p className="text-[11px] text-[#8F8F8F]">No files or directories matched "{searchQuery}".</p>
            </div>
          )}
        </div>
      )}

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
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                    title="Copy code"
                    aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError(null);
                    setActivePath(null);
                  }}
                  className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                  title="Close preview"
                  aria-label="Close file preview"
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

              {/* Failed Request handling with direct retry button */}
              {fileError && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{fileError}</span>
                  </div>
                  {activePath && (
                    <button
                      type="button"
                      onClick={() => handleSelectFile(activePath)}
                      className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-sans font-medium flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
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
                  <pre className="text-[#171717] dark:text-[#EDEDED] overflow-x-auto whitespace-pre selection:bg-[#e8702a]/20 max-w-full">
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
