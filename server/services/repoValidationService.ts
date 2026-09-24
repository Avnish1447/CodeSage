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
}
