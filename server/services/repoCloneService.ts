import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { RepoValidationService } from './repoValidationService.js';
import { TIMEOUT_CONFIG, RESOURCE_LIMITS } from '../config/limits.js';
import { REPOS_DIR } from '../config/paths.js';

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
  static DEFAULT_STORAGE_ROOT = REPOS_DIR;

  /**
   * Generates a collision-resistant repository ID binding the exact canonical URL and case-sensitive branch ref (CWE-706 mitigation).
   */
  static generateRepositoryId(owner: string, repo: string, normalizedUrl: string, branch?: string): string {
    const rawBranch = (branch || 'main').trim();
    // Compute 12-char SHA-256 digest across canonical URL and exact, case-sensitive branch ref (CWE-706)
    const refHash = crypto.createHash('sha256').update(`${normalizedUrl}#${rawBranch}`, 'utf-8').digest('hex').substring(0, 12);
    const safeOwner = owner.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const safeRepo = repo.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const branchLabel = rawBranch !== 'main' ? `_${rawBranch.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 32)}` : '';
    return `${safeOwner}_${safeRepo}${branchLabel}_${refHash}`.toLowerCase();
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
      const { normalized_url: normalizedUrl } = normalized;

      // Query remote git repository via git ls-remote --heads with configurable timeout (CWE-200 mitigation)
      const { stdout } = await execFileAsync('git', ['ls-remote', '--heads', normalizedUrl], {
        timeout: TIMEOUT_CONFIG.LS_REMOTE_TIMEOUT_MS,
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
      const sanitizedUrl = String(url).replace(/[\r\n\t\x00-\x1f]/g, '_');
      console.warn(`[RepoCloneService] Could not list remote branches for ${sanitizedUrl}:`, err.message);
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
    const completeMarker = path.join(repoDir, '.clone_complete');

    // Check if repository was already cloned and indexed in isolated sandbox
    if (fs.existsSync(repoPath) && this.isCloneComplete(repoDir, repoPath)) {
      // Repository already exists and was completely cloned.
      // Verify stored ref metadata matches requested branch case-sensitively (CWE-706 mitigation).
      const metadataFile = path.join(repoDir, 'metadata.json');
      let isRefValid = true;
      if (fs.existsSync(metadataFile)) {
        try {
          const storedMeta = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
          const storedBranch = (storedMeta.overview?.branch || storedMeta.branch || 'main').trim();
          if (storedBranch !== (branch || 'main').trim()) {
            isRefValid = false;
          }
        } catch {
          // If metadata is corrupted, do not blindly reuse
          isRefValid = false;
        }
      }

      if (isRefValid) {
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
    }

    // Clean up any previous incomplete or interrupted clone directory
    this.cleanupPartialClone(repoPath, repoDir);
    fs.mkdirSync(repoPath, { recursive: true });

    let cloneSuccess = false;

    // Detect alternate repository aliases for seamless migration
    const alternateNames: string[] = [];
    if (owner.toLowerCase() === 'avnish1447') {
      if (repo.toLowerCase() === 'codesage') alternateNames.push('RepoGPT-RAG');
      if (repo.toLowerCase() === 'repogpt-rag') alternateNames.push('CodeSage');
    }

    // 1. Try git clone with pre-checkout tree inspection (CWE-409 mitigation)
    try {
      await this.cloneAndCheckoutSafely(normalizedUrl, repoPath, branch, maxFiles, maxSizeMb);
      cloneSuccess = true;
    } catch (gitErr: any) {
      if (gitErr instanceof RepositoryLimitError) {
        this.cleanupPartialClone(repoPath, repoDir);
        throw gitErr;
      }

      // 2. If alternate repository names exist, attempt git clone on alternate URLs
      for (const alt of alternateNames) {
        if (cloneSuccess) break;
        try {
          const altUrl = `https://github.com/${owner}/${alt}`;
          this.cleanupPartialClone(repoPath, repoDir);
          fs.mkdirSync(repoPath, { recursive: true });
          await this.cloneAndCheckoutSafely(altUrl, repoPath, branch, maxFiles, maxSizeMb);
          cloneSuccess = true;
        } catch (altErr: any) {
          if (altErr instanceof RepositoryLimitError) {
            this.cleanupPartialClone(repoPath, repoDir);
            throw altErr;
          }
          // continue to next alternate
        }
      }

      // 3. If git clone failed, try fetching repository via GitHub API as fallback
      if (!cloneSuccess) {
        try {
          this.cleanupPartialClone(repoPath, repoDir);
          fs.mkdirSync(repoPath, { recursive: true });
          await this.fetchViaGitHubApi(owner, repo, repoPath, branch);
          cloneSuccess = true;
        } catch (apiErr: any) {
          for (const alt of alternateNames) {
            if (cloneSuccess) break;
            try {
              this.cleanupPartialClone(repoPath, repoDir);
              fs.mkdirSync(repoPath, { recursive: true });
              await this.fetchViaGitHubApi(owner, alt, repoPath, branch);
              cloneSuccess = true;
            } catch {
              // continue
            }
          }

          if (!cloneSuccess) {
            this.cleanupPartialClone(repoPath, repoDir);
            const isTimeout = gitErr.killed || gitErr.signal === 'SIGTERM' || gitErr.code === 'ETIMEDOUT';
            const errMsg = isTimeout
              ? `Git clone timed out after ${Math.round(TIMEOUT_CONFIG.CLONE_TIMEOUT_MS / 1000)} seconds. The repository might be exceptionally large or the connection is slow.`
              : gitErr.stderr?.trim() || gitErr.message || apiErr?.message || 'unknown error';
            throw new RepoCloneError(`Git clone and API fetch failed: ${errMsg}`);
          }
        }
      }
    }

    try {
      this.writeCompletionMarker(completeMarker);
    } catch {
      // ignore
    }

    const files = this.listRepositoryFiles(repoPath);

    if (files.length > maxFiles) {
      this.cleanupPartialClone(repoPath, repoDir);
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
      this.cleanupPartialClone(repoPath, repoDir);
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
      signal: AbortSignal.timeout(TIMEOUT_CONFIG.GITHUB_API_TIMEOUT_MS),
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
        signal: AbortSignal.timeout(TIMEOUT_CONFIG.GITHUB_API_TIMEOUT_MS),
      });

      if (!fallbackResp.ok) {
        throw new Error(`GitHub API returned HTTP ${response.status}`);
      }

      const data = await fallbackResp.json();
      const fallbackCommitRef = data.sha || altBranch;
      await this.downloadTreeItems(owner, repo, fallbackCommitRef, data.tree || [], targetPath);
      return;
    }

    const data = await response.json();
    const commitRef = data.sha || primaryBranch;
    await this.downloadTreeItems(owner, repo, commitRef, data.tree || [], targetPath);
  }

  private static async downloadTreeItems(owner: string, repo: string, commitOrBranch: string, tree: any[], targetPath: string) {
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
    let cumulativeBytes = 0;
    const MAX_CUMULATIVE_BYTES = RESOURCE_LIMITS.MAX_REPO_SIZE_MB * 1024 * 1024;
    const MAX_SINGLE_FILE_BYTES = 5 * 1024 * 1024; // 5MB per file limit

    for (const item of fileItems) {
      if (cumulativeBytes >= MAX_CUMULATIVE_BYTES) break;
      if (item.size && item.size > MAX_SINGLE_FILE_BYTES) continue;

      const relPath = item.path;
      const fullPath = path.join(targetPath, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });

      // Fetch blob pinned to the exact commit identity returned by the tree endpoint (CWE-400)
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${commitOrBranch}/${encodeURI(relPath)}`;
      try {
        const fileResp = await fetch(rawUrl, {
          signal: AbortSignal.timeout(8000),
        });
        if (fileResp.ok) {
          // Pre-check Content-Length header before reading response payload
          const contentLength = parseInt(fileResp.headers.get('content-length') || '0', 10);
          if (contentLength > MAX_SINGLE_FILE_BYTES) continue;
          if (contentLength > 0 && cumulativeBytes + contentLength > MAX_CUMULATIVE_BYTES) break;

          // Stream and cap bytes incrementally to avoid memory exhaustion (CWE-400)
          const reader = fileResp.body?.getReader();
          if (!reader) continue;

          const chunks: Uint8Array[] = [];
          let fileBytes = 0;
          let exceeded = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              fileBytes += value.length;
              if (fileBytes > MAX_SINGLE_FILE_BYTES || cumulativeBytes + fileBytes > MAX_CUMULATIVE_BYTES) {
                exceeded = true;
                await reader.cancel();
                break;
              }
              chunks.push(value);
            }
          }

          if (exceeded) {
            if (cumulativeBytes + fileBytes > MAX_CUMULATIVE_BYTES) break;
            continue;
          }

          cumulativeBytes += fileBytes;
          fs.writeFileSync(fullPath, Buffer.concat(chunks));
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

  /**
   * Safely deletes partial or corrupted clones and removes the associated completion marker outside the checkout.
   */
  static cleanupPartialClone(repoPath: string, repoDir?: string): void {
    if (fs.existsSync(repoPath)) {
      try {
        fs.rmSync(repoPath, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    const dir = repoDir || path.dirname(repoPath);
    const primaryMarker = path.join(dir, '.clone_complete');
    if (fs.existsSync(primaryMarker)) {
      try {
        fs.rmSync(primaryMarker, { force: true });
      } catch {
        // ignore
      }
    }
    const legacyMarker = path.join(repoPath, '.clone_complete');
    if (fs.existsSync(legacyMarker)) {
      try {
        fs.rmSync(legacyMarker, { force: true });
      } catch {
        // ignore
      }
    }
  }

  /**
   * Writes the clone completion marker safely outside the repository checkout (CWE-59 mitigation).
   * Enforces O_NOFOLLOW semantics so symbolic links committed in a repository cannot overwrite application files.
   */
  static writeCompletionMarker(markerPath: string): void {
    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    try {
      const stat = fs.lstatSync(markerPath);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(markerPath);
      }
    } catch {
      // file does not exist
    }

    const noFollowFlag = (fs.constants as any).O_NOFOLLOW || 0;
    const flags = fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_TRUNC | noFollowFlag;
    const fd = fs.openSync(markerPath, flags, 0o600);
    try {
      fs.writeFileSync(fd, 'ready', 'utf-8');
    } finally {
      fs.closeSync(fd);
    }
  }

  /**
   * Checks whether repository clone and indexing has completed without following untrusted symlinks.
   */
  static isCloneComplete(repoDir: string, repoPath: string): boolean {
    const primaryMarker = path.join(repoDir, '.clone_complete');
    try {
      if (fs.existsSync(primaryMarker)) {
        const stat = fs.lstatSync(primaryMarker);
        if (!stat.isSymbolicLink()) return true;
      }
    } catch {
      // ignore
    }

    // Fallback: check legacy checkout marker only if it is a regular file
    const legacyMarker = path.join(repoPath, '.clone_complete');
    try {
      if (fs.existsSync(legacyMarker)) {
        const stat = fs.lstatSync(legacyMarker);
        if (!stat.isSymbolicLink() && stat.isFile()) return true;
      }
    } catch {
      // ignore
    }

    return false;
  }

  /**
   * Inspects Git tree object entries before working tree checkout (CWE-409 Decompression Bomb mitigation).
   * Parses output in a stream to prevent memory exhaustion and ensures entry counts and uncompressed byte totals
   * stay strictly within configured bounds before any disk materialization.
   */
  static async inspectGitTreeBeforeCheckout(
    repoPath: string,
    maxFiles: number,
    maxSizeMb: number
  ): Promise<{ fileCount: number; totalSizeBytes: number }> {
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    return new Promise((resolve, reject) => {
      const child = spawn('git', ['ls-tree', '-r', '-l', 'HEAD'], {
        cwd: repoPath,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });

      let count = 0;
      let totalBytes = 0;
      let buffer = '';
      let settled = false;

      const terminate = (err: Error) => {
        if (settled) return;
        settled = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
        reject(err);
      };

      child.stdout.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const tabIdx = line.indexOf('\t');
          if (tabIdx === -1) continue;
          const meta = line.slice(0, tabIdx).trim().split(/\s+/);
          const filePath = line.slice(tabIdx + 1);

          // Disallow symbolic links attempting to hijack completion markers (CWE-59)
          if (meta[0] === '120000' && (filePath === '.clone_complete' || filePath.endsWith('/.clone_complete'))) {
            return terminate(new RepositoryLimitError('Repository contains forbidden symbolic link for completion marker'));
          }

          count++;
          if (count > maxFiles) {
            return terminate(new RepositoryLimitError(`Exceeded ${maxFiles} files limit (${count})`));
          }

          const size = parseInt(meta[3], 10);
          if (!isNaN(size)) {
            totalBytes += size;
            if (totalBytes > maxSizeBytes) {
              const mb = (totalBytes / (1024 * 1024)).toFixed(2);
              return terminate(new RepositoryLimitError(`Exceeded ${maxSizeMb}MB size limit (${mb}MB)`));
            }
          }
        }
      });

      child.on('error', (err) => {
        terminate(err);
      });

      child.on('close', (code) => {
        if (settled) return;
        if (code !== 0) {
          return reject(new Error(`git ls-tree exited with code ${code}`));
        }
        if (buffer.trim()) {
          const tabIdx = buffer.indexOf('\t');
          if (tabIdx !== -1) {
            const meta = buffer.slice(0, tabIdx).trim().split(/\s+/);
            const filePath = buffer.slice(tabIdx + 1);
            if (meta[0] === '120000' && (filePath === '.clone_complete' || filePath.endsWith('/.clone_complete'))) {
              return reject(new RepositoryLimitError('Repository contains forbidden symbolic link for completion marker'));
            }
            count++;
            if (count > maxFiles) {
              return reject(new RepositoryLimitError(`Exceeded ${maxFiles} files limit (${count})`));
            }
            const size = parseInt(meta[3], 10);
            if (!isNaN(size)) {
              totalBytes += size;
              if (totalBytes > maxSizeBytes) {
                const mb = (totalBytes / (1024 * 1024)).toFixed(2);
                return reject(new RepositoryLimitError(`Exceeded ${maxSizeMb}MB size limit (${mb}MB)`));
              }
            }
          }
        }
        settled = true;
        resolve({ fileCount: count, totalSizeBytes: totalBytes });
      });
    });
  }

  /**
   * Clones Git object database with --no-checkout, verifies resource limits against Git tree,
   * and only materializes the working tree once confirmed safe (CWE-409 Decompression Bomb mitigation).
   */
  private static async cloneAndCheckoutSafely(
    url: string,
    repoPath: string,
    branch: string | undefined,
    maxFiles: number,
    maxSizeMb: number
  ): Promise<void> {
    const cloneArgs = ['clone', '--depth', '1', '--no-checkout'];
    if (branch && branch.trim()) {
      cloneArgs.push('--branch', branch.trim());
    }
    cloneArgs.push(url, repoPath);

    // 1. Shallow clone object database only; working directory remains empty (CWE-409)
    await execFileAsync('git', cloneArgs, {
      timeout: TIMEOUT_CONFIG.CLONE_TIMEOUT_MS,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });

    // 2. Pre-audit uncompressed object sizes & file counts directly from Git tree
    await this.inspectGitTreeBeforeCheckout(repoPath, maxFiles, maxSizeMb);

    // 3. Quota verified; safely check out working directory
    await execFileAsync('git', ['checkout', 'HEAD'], {
      cwd: repoPath,
      timeout: TIMEOUT_CONFIG.CLONE_TIMEOUT_MS,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
  }
}
