import fs from 'node:fs';
import path from 'node:path';
import { REPOS_DIR } from '../config/paths.js';

export class InvalidRepositoryURLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRepositoryURLError';
  }
}

export class RepoValidationService {
  static validateAndNormalizeUrl(url: string): { owner: string; repo: string; normalized_url: string } {
    if (!url || typeof url !== 'string') {
      throw new InvalidRepositoryURLError('URL cannot be empty');
    }

    const trimmedUrl = url.trim();

    let parsed: URL;
    try {
      parsed = new URL(trimmedUrl);
    } catch {
      throw new InvalidRepositoryURLError('Invalid URL format');
    }

    if (parsed.protocol !== 'https:') {
      throw new InvalidRepositoryURLError('Only HTTPS URLs are supported');
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      throw new InvalidRepositoryURLError('Only GitHub repositories are supported');
    }

    let pathname = parsed.pathname;
    // Reject double slashes in path
    if (pathname.includes('//')) {
      throw new InvalidRepositoryURLError('URL must be a GitHub repository');
    }

    pathname = pathname.replace(/^\/+|\/+$/g, '');
    if (!pathname) {
      throw new InvalidRepositoryURLError('Invalid GitHub repository URL');
    }

    const parts = pathname.split('/');
    if (parts.length !== 2) {
      throw new InvalidRepositoryURLError('URL must be a GitHub repository (owner/repo)');
    }

    const owner = parts[0];
    let repo = parts[1];

    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    const nameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!nameRegex.test(owner) || !nameRegex.test(repo)) {
      throw new InvalidRepositoryURLError('Invalid characters in owner or repository name');
    }

    return {
      owner,
      repo,
      normalized_url: `https://github.com/${owner}/${repo}`,
    };
  }

  /**
   * Strict repository ID validation to prevent path traversal (CWE-22)
   */
  static isValidRepoId(repoId: string): boolean {
    if (!repoId || typeof repoId !== 'string') return false;
    if (!/^[a-zA-Z0-9_.-]+$/.test(repoId) || repoId.includes('..')) return false;
    const resolved = path.resolve(REPOS_DIR, repoId);
    return resolved.startsWith(REPOS_DIR + path.sep) || resolved === REPOS_DIR;
  }

  /**
   * Safely reads and parses a JSON metadata file without following symbolic links (CWE-22, CWE-59).
   * Enforces O_NOFOLLOW and a maximum byte budget to protect against endless streams (e.g. /dev/zero).
   */
  static readSafeMetadataJson(filePath: string, maxBytes: number = 2 * 1024 * 1024): any {
    let fd: number | null = null;
    try {
      const stat = fs.lstatSync(filePath);
      if (stat.isSymbolicLink() || !stat.isFile()) {
        return null;
      }
      if (stat.size > maxBytes) {
        return null;
      }

      const noFollowFlag = (fs.constants as any).O_NOFOLLOW || 0;
      fd = fs.openSync(filePath, fs.constants.O_RDONLY | noFollowFlag);
      const buffer = Buffer.alloc(Math.min(stat.size, maxBytes));
      const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
      const content = buffer.toString('utf-8', 0, bytesRead);
      return JSON.parse(content);
    } catch {
      return null;
    } finally {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore
        }
      }
    }
  }
}
