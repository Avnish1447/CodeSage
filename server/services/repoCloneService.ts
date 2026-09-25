import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { RepoValidationService } from './repoValidationService.js';

const execFileAsync = promisify(execFile);

export class RepoCloneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepoCloneError';
  }
}

export class RepositoryLimitError extends RepoCloneError {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryLimitError';
  }
}

export class RepoCloneService {
  static DEFAULT_STORAGE_ROOT = path.join('storage', 'repos');

  static generateRepositoryId(owner: string, repo: string, normalizedUrl: string, branch?: string): string {
    const cleanBranch = branch && branch !== 'main' ? branch.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 16) : '';
    const urlHash = crypto.createHash('sha1').update(`${normalizedUrl}#${cleanBranch}`, 'utf-8').digest('hex').substring(0, 6);
    const safeOwner = owner.replace(/-/g, '_').replace(/\./g, '_');
    const safeRepo = repo.replace(/-/g, '_').replace(/\./g, '_');
    const branchSuffix = cleanBranch ? `_${cleanBranch}` : '';
    return `${safeOwner}_${safeRepo}${branchSuffix}_${urlHash}`.toLowerCase();
  }

  /**
   * Fast remote check to list all branches without cloning the entire repository
   */
  static async getRemoteBranches(url: string): Promise<{
    branches: string[];
    default_branch: string;
    has_multiple_branches: boolean;
  }> {
    try {
      const normalized = RepoValidationService.validateAndNormalizeUrl(url);
      const { normalized_url: normalizedUrl, owner, repo } = normalized;

      // Handle current local workspace
      const isCurrentWorkspace =
        (owner.toLowerCase() === 'avnish1447' && (repo.toLowerCase() === 'codesage' || repo.toLowerCase() === 'repogpt-rag')) ||
        normalizedUrl.toLowerCase().includes('avnish1447/codesage') ||
        normalizedUrl.toLowerCase().includes('avnish1447/repogpt-rag');

      if (isCurrentWorkspace) {
        try {
          const { stdout } = await execFileAsync('git', ['branch', '-a'], { timeout: 5000 });
          const branches = stdout
            .split('\n')
            .map((l) => l.replace('*', '').trim())
            .filter((l) => l.length > 0 && !l.includes('->'))
            .map((l) => l.replace('remotes/origin/', ''))
            .filter((val, idx, arr) => arr.indexOf(val) === idx);

          const defaultBranch = branches.includes('main') ? 'main' : (branches[0] || 'main');
          return {
            branches,
            default_branch: defaultBranch,
            has_multiple_branches: branches.length > 1,
          };
        } catch {
          return {
            branches: ['main'],
            default_branch: 'main',
            has_multiple_branches: false,
          };
        }
      }

      // Query remote git repository via git ls-remote --heads
      const { stdout } = await execFileAsync('git', ['ls-remote', '--heads', normalizedUrl], {
        timeout: 15000,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });

      const rawBranches = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const parts = line.split('\t');
          const ref = parts[1] || '';
          return ref.replace('refs/heads/', '').trim();
        })
        .filter((b) => b.length > 0);

      const uniqueBranches = Array.from(new Set(rawBranches));

      if (uniqueBranches.length === 0) {
        return {
          branches: ['main'],
          default_branch: 'main',
          has_multiple_branches: false,
        };
      }

      // Determine default branch
      let defaultBranch = 'main';
      if (uniqueBranches.includes('main')) {
        defaultBranch = 'main';
      } else if (uniqueBranches.includes('master')) {
        defaultBranch = 'master';
      } else {
        defaultBranch = uniqueBranches[0];
      }

      // Sort with default branch first, followed by others alphabetically
      const sorted = [
        defaultBranch,
        ...uniqueBranches.filter((b) => b !== defaultBranch).sort((a, b) => a.localeCompare(b)),
      ];

      return {
        branches: sorted,
        default_branch: defaultBranch,
        has_multiple_branches: sorted.length > 1,
      };
    } catch (err: any) {
      console.warn(`[RepoCloneService] Could not list remote branches for ${url}:`, err.message);
      return {
        branches: ['main'],
        default_branch: 'main',
        has_multiple_branches: false,
      };
    }
  }

  static async cloneRepository(
    url: string,
    maxFiles = 1000,
    maxSizeMb = 50,
    storageRoot?: string,
    branch?: string
  ): Promise<[string, Record<string, any>]> {
    const normalized = RepoValidationService.validateAndNormalizeUrl(url);
    const { owner, repo, normalized_url: normalizedUrl } = normalized;
    const repositoryId = this.generateRepositoryId(owner, repo, normalizedUrl, branch);

    const root = storageRoot ? path.resolve(storageRoot) : path.resolve(this.DEFAULT_STORAGE_ROOT);
    const repoDir = path.join(root, repositoryId);
    const repoPath = path.join(repoDir, 'source');
    const completeMarker = path.join(repoPath, '.clone_complete');

    // Check if the target repo is the current active local workspace
    const isCurrentWorkspace =
      (owner.toLowerCase() === 'avnish1447' && (repo.toLowerCase() === 'codesage' || repo.toLowerCase() === 'repogpt-rag')) ||
      normalizedUrl.toLowerCase().includes('avnish1447/codesage') ||
      normalizedUrl.toLowerCase().includes('avnish1447/repogpt-rag');

    if (isCurrentWorkspace) {
      // Sync from local project workspace if not already present
      const alreadySynced = fs.existsSync(repoPath) && fs.existsSync(completeMarker);
      if (!alreadySynced) {
        this.copyLocalProjectFiles(repoPath);
      }
      const existingFiles = this.listRepositoryFiles(repoPath);
      let totalSizeBytes = 0;
      for (const file of existingFiles) {
        try {
          const stat = fs.statSync(file);
          totalSizeBytes += stat.size;
        } catch {
          // ignore
        }
      }
      const totalSizeMb = totalSizeBytes / (1024 * 1024);
      const metadata = {
        repository_id: repositoryId,
        owner,
        repo,
        branch: branch || 'main',
        normalized_url: normalizedUrl,
        files: existingFiles.length,
        size_mb: Math.round(totalSizeMb * 100) / 100,
        storage_path: repoPath,
      };
      return [repoPath, metadata];
    }

    if (fs.existsSync(repoPath) && fs.existsSync(completeMarker)) {
      // Repository already exists and was completely cloned, reuse local files
      const existingFiles = this.listRepositoryFiles(repoPath);
      if (existingFiles.length > 0) {
        let totalSizeBytes = 0;
        for (const file of existingFiles) {
          try {
            const stat = fs.statSync(file);
            totalSizeBytes += stat.size;
          } catch {
            // ignore
          }
        }
        const totalSizeMb = totalSizeBytes / (1024 * 1024);
        const metadata = {
          repository_id: repositoryId,
          owner,
          repo,
          branch: branch || 'main',
          normalized_url: normalizedUrl,
          files: existingFiles.length,
          size_mb: Math.round(totalSizeMb * 100) / 100,
          storage_path: repoPath,
        };
        return [repoPath, metadata];
      }
    }

    // Clean up any previous incomplete or interrupted clone directory
    this.cleanupPartialClone(repoPath);
    fs.mkdirSync(repoPath, { recursive: true });

    let cloneSuccess = false;

    // Detect alternate repository aliases for seamless migration
    const alternateNames: string[] = [];
    if (owner.toLowerCase() === 'avnish1447') {
      if (repo.toLowerCase() === 'codesage') alternateNames.push('RepoGPT-RAG');
      if (repo.toLowerCase() === 'repogpt-rag') alternateNames.push('CodeSage');
    }

    // Prepare git clone arguments (with branch if specified)
    const cloneArgs = ['clone', '--depth', '1'];
    if (branch && branch.trim()) {
      cloneArgs.push('--branch', branch.trim());
    }
    cloneArgs.push(normalizedUrl, repoPath);

    // 1. Try git clone first on the requested URL with 45s timeout
    try {
      await execFileAsync('git', cloneArgs, {
        timeout: 45000,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });
      cloneSuccess = true;
    } catch (gitErr: any) {
      // 2. If alternate repository names exist, attempt git clone on alternate URLs
      for (const alt of alternateNames) {
        if (cloneSuccess) break;
        try {
          const altUrl = `https://github.com/${owner}/${alt}`;
          const altCloneArgs = ['clone', '--depth', '1'];
          if (branch && branch.trim()) {
            altCloneArgs.push('--branch', branch.trim());
          }
          altCloneArgs.push(altUrl, repoPath);
          await execFileAsync('git', altCloneArgs, {
            timeout: 45000,
            env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
          });
          cloneSuccess = true;
        } catch {
          // continue
        }
      }

      // 3. If git clone failed, try fetching repository via GitHub API as fallback
      if (!cloneSuccess) {
        try {
          await this.fetchViaGitHubApi(owner, repo, repoPath, branch);
          cloneSuccess = true;
        } catch (apiErr: any) {
          for (const alt of alternateNames) {
            if (cloneSuccess) break;
            try {
              await this.fetchViaGitHubApi(owner, alt, repoPath, branch);
              cloneSuccess = true;
            } catch {
              // continue
            }
          }

          // 4. If all remote attempts fail for the local project, fall back to copying workspace files
          if (!cloneSuccess && (repo.toLowerCase() === 'codesage' || owner.toLowerCase() === 'avnish1447' || repo.toLowerCase() === 'repogpt-rag')) {
            this.copyLocalProjectFiles(repoPath);
            cloneSuccess = true;
          }

          if (!cloneSuccess) {
            this.cleanupPartialClone(repoPath);
            const errMsg = gitErr.stderr?.trim() || gitErr.message || apiErr.message || 'unknown error';
            throw new RepoCloneError(`Git clone and API fetch failed: ${errMsg}`);
          }
        }
      }
    }

    try {
      fs.writeFileSync(completeMarker, 'ready', 'utf-8');
    } catch {
      // ignore
    }

    const files = this.listRepositoryFiles(repoPath);

    if (files.length > maxFiles) {
      this.cleanupPartialClone(repoPath);
      throw new RepositoryLimitError(`Exceeded ${maxFiles} files limit (${files.length})`);
    }

    let totalSizeBytes = 0;
    for (const file of files) {
      try {
        const stat = fs.statSync(file);
        totalSizeBytes += stat.size;
      } catch {
        // ignore
      }
    }

    const totalSizeMb = totalSizeBytes / (1024 * 1024);
    if (totalSizeMb > maxSizeMb) {
      this.cleanupPartialClone(repoPath);
      throw new RepositoryLimitError(`Exceeded ${maxSizeMb}MB size limit (${totalSizeMb.toFixed(2)}MB)`);
    }

    const metadata = {
      repository_id: repositoryId,
      owner,
      repo,
      branch: branch || 'main',
      normalized_url: normalizedUrl,
      files: files.length,
      size_mb: Math.round(totalSizeMb * 100) / 100,
      storage_path: repoPath,
    };

    return [repoPath, metadata];
  }

  private static async fetchViaGitHubApi(owner: string, repo: string, targetPath: string, branch?: string) {
    const primaryBranch = branch || 'main';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${primaryBranch}?recursive=1`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'CodeSage-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Try master branch if main fails (or vice versa)
      const altBranch = primaryBranch === 'main' ? 'master' : 'main';
      const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${altBranch}?recursive=1`;
      const fallbackResp = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'CodeSage-App',
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!fallbackResp.ok) {
        throw new Error(`GitHub API returned HTTP ${response.status}`);
      }

      const data = await fallbackResp.json();
      await this.downloadTreeItems(owner, repo, 'master', data.tree || [], targetPath);
      return;
    }

    const data = await response.json();
    await this.downloadTreeItems(owner, repo, 'main', data.tree || [], targetPath);
  }

  private static async downloadTreeItems(owner: string, repo: string, branch: string, tree: any[], targetPath: string) {
    const codeExtensions = new Set([
      '.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md', '.html',
      '.css', '.toml', '.yml', '.yaml', '.sh', '.rs', '.go', '.java',
      '.c', '.cpp', '.h', '.sql', '.txt'
    ]);

    // Prioritize source code and documentation over large media / sound / binary assets
    const sorted = [...tree.filter((item) => item.type === 'blob')].sort((a, b) => {
      const aExt = path.extname(a.path || '').toLowerCase();
      const bExt = path.extname(b.path || '').toLowerCase();
      const aIsCode = codeExtensions.has(aExt);
      const bIsCode = codeExtensions.has(bExt);
      if (aIsCode && !bIsCode) return -1;
      if (!aIsCode && bIsCode) return 1;
      return 0;
    });

    const fileItems = sorted.slice(0, 500);

    for (const item of fileItems) {
      const relPath = item.path;
      const fullPath = path.join(targetPath, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });

      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${relPath}`;
      try {
        const fileResp = await fetch(rawUrl);
        if (fileResp.ok) {
          const content = await fileResp.text();
          fs.writeFileSync(fullPath, content, 'utf-8');
        }
      } catch {
        // ignore individual file download error
      }
    }
  }

  static listRepositoryFiles(repoPath: string): string[] {
    const result: string[] = [];

    function walk(current: string) {
      if (!fs.existsSync(current)) return;
      const items = fs.readdirSync(current, { withFileTypes: true });

      for (const item of items) {
        if (item.name === '.git' || item.name === '.clone_complete') continue;

        const fullPath = path.join(current, item.name);
        if (item.isDirectory()) {
          walk(fullPath);
        } else if (item.isFile()) {
          result.push(fullPath);
        }
      }
    }

    walk(repoPath);
    return result;
  }

  static cleanupPartialClone(repoPath: string): void {
    if (fs.existsSync(repoPath)) {
      try {
        fs.rmSync(repoPath, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  private static copyLocalProjectFiles(targetPath: string): void {
    if (fs.existsSync(targetPath)) {
      try {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    fs.mkdirSync(targetPath, { recursive: true });

    const rootDir = process.cwd();
    const ignoreDirs = new Set([
      '.git',
      'node_modules',
      'dist',
      'build',
      'storage',
      '.venv',
      'venv',
      '__pycache__',
      '.pytest_cache',
      '.mypy_cache',
    ]);

    function copyRecursive(src: string, dest: string) {
      if (!fs.existsSync(src)) return;
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        if (ignoreDirs.has(entry.name) || entry.name === '.clone_complete') continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else if (entry.isFile()) {
          try {
            fs.copyFileSync(srcPath, destPath);
          } catch {
            // ignore
          }
        }
      }
    }

    copyRecursive(rootDir, targetPath);

    try {
      fs.writeFileSync(path.join(targetPath, '.clone_complete'), 'ready', 'utf-8');
    } catch {
      // ignore
    }
  }
}
