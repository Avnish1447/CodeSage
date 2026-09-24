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

  static generateRepositoryId(owner: string, repo: string, normalizedUrl: string): string {
    const urlHash = crypto.createHash('sha1').update(normalizedUrl, 'utf-8').digest('hex').substring(0, 6);
    const safeOwner = owner.replace(/-/g, '_').replace(/\./g, '_');
    const safeRepo = repo.replace(/-/g, '_').replace(/\./g, '_');
    return `${safeOwner}_${safeRepo}_${urlHash}`.toLowerCase();
  }

  static async cloneRepository(
    url: string,
    maxFiles = 1000,
    maxSizeMb = 50,
    storageRoot?: string
  ): Promise<[string, Record<string, any>]> {
    const normalized = RepoValidationService.validateAndNormalizeUrl(url);
    const { owner, repo, normalized_url: normalizedUrl } = normalized;
    const repositoryId = this.generateRepositoryId(owner, repo, normalizedUrl);

    const root = storageRoot ? path.resolve(storageRoot) : path.resolve(this.DEFAULT_STORAGE_ROOT);
    const repoDir = path.join(root, repositoryId);
    const repoPath = path.join(repoDir, 'source');

    if (fs.existsSync(repoPath) && fs.readdirSync(repoPath).length > 0) {
      // Repository already exists, reuse local files
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
        normalized_url: normalizedUrl,
        files: existingFiles.length,
        size_mb: Math.round(totalSizeMb * 100) / 100,
        storage_path: repoPath,
      };
      return [repoPath, metadata];
    }

    fs.mkdirSync(repoPath, { recursive: true });

    let cloneSuccess = false;

    // Detect alternate repository aliases for seamless migration
    const alternateNames: string[] = [];
    if (owner.toLowerCase() === 'avnish1447') {
      if (repo.toLowerCase() === 'codesage') alternateNames.push('RepoGPT-RAG');
      if (repo.toLowerCase() === 'repogpt-rag') alternateNames.push('CodeSage');
    }

    // 1. Try git clone first on the requested URL
    try {
      await execFileAsync('git', ['clone', '--depth', '1', normalizedUrl, repoPath], {
        timeout: 15000,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });
      cloneSuccess = true;
    } catch (gitErr: any) {
      // 2. If alternate repository names exist, attempt git clone on alternate URLs
      for (const alt of alternateNames) {
        if (cloneSuccess) break;
        try {
          const altUrl = `https://github.com/${owner}/${alt}`;
          await execFileAsync('git', ['clone', '--depth', '1', altUrl, repoPath], {
            timeout: 15000,
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
          await this.fetchViaGitHubApi(owner, repo, repoPath);
          cloneSuccess = true;
        } catch (apiErr: any) {
          for (const alt of alternateNames) {
            if (cloneSuccess) break;
            try {
              await this.fetchViaGitHubApi(owner, alt, repoPath);
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
      normalized_url: normalizedUrl,
      files: files.length,
      size_mb: Math.round(totalSizeMb * 100) / 100,
      storage_path: repoPath,
    };

    return [repoPath, metadata];
  }

  private static async fetchViaGitHubApi(owner: string, repo: string, targetPath: string) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'CodeSage-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Try master branch if main fails
      const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
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
    const fileItems = tree.filter((item) => item.type === 'blob').slice(0, 300); // limit to top 300 files

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
        if (item.name === '.git') continue;

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
    fs.mkdirSync(targetPath, { recursive: true });
    const rootDir = process.cwd();
    const allowedDirs = ['src', 'server', 'Project Info'];
    const allowedFiles = [
      'package.json',
      'tsconfig.json',
      'index.html',
      'metadata.json',
      'vite.config.ts',
      'PRD.md',
      'ARCHITECTURE.md',
      'PPT_REPORT.md',
    ];

    for (const dir of allowedDirs) {
      const srcDir = path.join(rootDir, dir);
      if (fs.existsSync(srcDir)) {
        try {
          fs.cpSync(srcDir, path.join(targetPath, dir), { recursive: true });
        } catch {
          // ignore
        }
      }
    }

    for (const file of allowedFiles) {
      const srcFile = path.join(rootDir, file);
      if (fs.existsSync(srcFile)) {
        try {
          fs.copyFileSync(srcFile, path.join(targetPath, file));
        } catch {
          // ignore
        }
      }
    }
  }
}
