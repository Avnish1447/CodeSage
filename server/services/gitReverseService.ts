import { generateGitReverseFallbackPrompt } from './geminiService.js';

export interface GitReverseResult {
  prompt: string;
  source: 'gitreverse' | 'gemini_fallback';
  url: string;
  headline?: string;
  created_at: number;
}

export class GitReverseService {
  private static GITREVERSE_API = 'https://www.gitreverse.com/api/reverse-prompt';

  /**
   * Fetches reverse-engineered prompt from gitreverse.com with automatic Gemini fallback.
   */
  static async fetchReversePrompt(
    repoUrl: string,
    owner?: string,
    repo?: string,
    repoData?: any
  ): Promise<GitReverseResult> {
    const gitReverseUrl = owner && repo 
      ? `https://gitreverse.com/${owner}/${repo}` 
      : 'https://gitreverse.com';

    // 1. Attempt live query to gitreverse.com
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(this.GITREVERSE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        if (data && typeof data.prompt === 'string' && data.prompt.trim().length > 20) {
          return {
            prompt: data.prompt.trim(),
            source: 'gitreverse',
            url: gitReverseUrl,
            created_at: Date.now(),
          };
        }
      }
    } catch {
      // GitReverse network error, timeout, or rate-limit
    }

    // 2. Seamless fallback to Gemini Flash reverse-engineering prompt
    try {
      const fallbackPrompt = await generateGitReverseFallbackPrompt(repoData || {
        overview: { owner, repo },
        facts: { languages: [], frameworks: [], important_files: [] },
      });

      return {
        prompt: fallbackPrompt,
        source: 'gemini_fallback',
        url: gitReverseUrl,
        created_at: Date.now(),
      };
    } catch {
      return {
        prompt: `Build a modern, production-grade application replicating the architecture, functionality, and module boundaries of ${owner || 'this'}/${repo || 'project'}. Ensure clean directory structures, comprehensive tests, and clear documentation.`,
        source: 'gemini_fallback',
        url: gitReverseUrl,
        created_at: Date.now(),
      };
    }
  }
}
