import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { RATE_LIMIT_CONFIG } from '../config/limits.js';
import { RepoValidationService } from '../services/repoValidationService.js';
import { RepoCloneService } from '../services/repoCloneService.js';
import { SqliteCacheService } from '../services/sqliteCacheService.js';

/**
 * Helper to construct standardized 429 Rate Limit responses.
 */
function createRateLimitHandler(title: string, message: string, code: string) {
  return (req: Request, res: Response, _next: any, options: any) => {
    const retryAfter = res.getHeader('Retry-After') || Math.ceil(RATE_LIMIT_CONFIG.WINDOW_MS / 1000);
    return res.status(options.statusCode).json({
      error: title,
      detail: message,
      code,
      retry_after_seconds: Number(retryAfter) || Math.ceil(RATE_LIMIT_CONFIG.WINDOW_MS / 1000),
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * 1. General Rate Limiter: Applied to all /api/v1 routes
 * Protects server from indiscriminate scraping and high-frequency flood.
 */
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  limit: RATE_LIMIT_CONFIG.GENERAL_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    detail: `Global API rate limit exceeded. Maximum ${RATE_LIMIT_CONFIG.GENERAL_MAX} requests per 15 minutes.`,
  },
  handler: createRateLimitHandler(
    'Too Many Requests',
    `You have exceeded the standard API rate limit (${RATE_LIMIT_CONFIG.GENERAL_MAX} requests per 15 minutes). Please wait before making more requests.`,
    'RATE_LIMIT_EXCEEDED'
  ),
});

/**
 * 2. Clone / Dig Rate Limiter: Applied to POST /api/v1/repositories
 * Heavy operation involving disk I/O, git clone, and Gemini initial insights.
 * Smart Skip: Does NOT consume quota if the repository is already cached and force_refresh is false.
 */
export const cloneLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  limit: RATE_LIMIT_CONFIG.CLONE_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req: Request) => {
    try {
      const { url, branch, force_refresh } = req.body || {};
      if (!url || force_refresh === true) {
        return false;
      }

      // Check if already in SQLite cache or metadata.json on disk
      const normalized = RepoValidationService.validateAndNormalizeUrl(url);
      const targetBranch = branch || 'main';
      const expectedRepoId = RepoCloneService.generateRepositoryId(
        normalized.owner,
        normalized.repo,
        normalized.normalized_url,
        targetBranch
      );

      const cached = SqliteCacheService.get(expectedRepoId);
      if (cached) {
        return true;
      }

      const metadataFile = path.join('storage', 'repos', expectedRepoId, 'metadata.json');
      return fs.existsSync(metadataFile);
    } catch {
      return false;
    }
  },
  handler: createRateLimitHandler(
    'Clone Rate Limit Exceeded',
    `Repository cloning / fresh dig limit reached (${RATE_LIMIT_CONFIG.CLONE_MAX} fresh analyses per 15 minutes). Cached repositories can still be viewed without restriction.`,
    'CLONE_RATE_LIMIT_EXCEEDED'
  ),
});

/**
 * 3. Chat Rate Limiter: Applied to POST /api/v1/repositories/:repo_id/chat
 * Protects Gemini LLM token and API quotas from spam or looped queries.
 */
export const chatLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  limit: RATE_LIMIT_CONFIG.CHAT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Chat Rate Limit Exceeded',
    `AI Chat rate limit reached (${RATE_LIMIT_CONFIG.CHAT_MAX} messages per 15 minutes). Please wait before asking more questions.`,
    'CHAT_RATE_LIMIT_EXCEEDED'
  ),
});

/**
 * 4. GitReverse Prompt Rate Limiter: Applied to GET /api/v1/repositories/:repo_id/reverse-prompt
 * Heavy reverse-engineering prompt synthesis endpoint.
 * Smart Skip: Does NOT consume quota if the prompt is already generated and cached.
 */
export const reversePromptLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  limit: RATE_LIMIT_CONFIG.REVERSE_PROMPT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req: Request) => {
    try {
      if (req.query?.force === 'true') {
        return false;
      }
      const repoId = req.params?.repo_id;
      if (!repoId) return false;

      const cached = SqliteCacheService.get(repoId);
      if (cached?.gitreverse_prompt?.prompt) {
        return true;
      }

      const metadataFile = path.join('storage', 'repos', repoId, 'metadata.json');
      if (fs.existsSync(metadataFile)) {
        const repoData = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        if (repoData?.gitreverse_prompt?.prompt) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },
  handler: createRateLimitHandler(
    'Prompt Generation Limit Exceeded',
    `GitReverse prompt generation limit reached (${RATE_LIMIT_CONFIG.REVERSE_PROMPT_MAX} per 15 minutes). Please wait before generating fresh prompts.`,
    'PROMPT_RATE_LIMIT_EXCEEDED'
  ),
});

/**
 * 5. Health Rate Limiter: Applied to GET /health and GET /gemini/health
 * Allows reasonable polling (120 reqs/min) while preventing abusive probes.
 */
export const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: RATE_LIMIT_CONFIG.HEALTH_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Health Check Rate Limit Exceeded',
    'Too many health check requests. Maximum 120 per minute.',
    'HEALTH_RATE_LIMIT_EXCEEDED'
  ),
});
