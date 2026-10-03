import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { RepoCloneService } from '../services/repoCloneService.js';
import { RepoValidationService } from '../services/repoValidationService.js';
import { RepoAnalysisService } from '../services/repoAnalysisService.js';
import { SqliteCacheService } from '../services/sqliteCacheService.js';
import { SpendingService } from '../services/spendingService.js';
import { GitReverseService } from '../services/gitReverseService.js';
import { generateRepositoryInsights, answerRepositoryQuery, streamRepositoryQuery, checkGeminiHealth } from '../services/geminiService.js';
import { PaymentService } from '../services/paymentService.js';
import { CompressionService } from '../services/compressionService.js';
import { idempotency } from '../middleware/idempotency.js';
import { cacheRepeatRequests } from '../middleware/cacheMiddleware.js';
import { RepeatRequestCacheService } from '../services/repeatRequestCache.js';
import { UptimeMonitoringService } from '../services/uptimeService.js';
import { ErrorLoggingService } from '../services/errorLoggingService.js';
import { BackupService } from '../services/backupService.js';
import { RATE_LIMIT_CONFIG, RESOURCE_LIMITS, SPENDING_CAP_CONFIG, TIMEOUT_CONFIG } from '../config/limits.js';
import {
  cloneLimiter,
  chatLimiter,
  reversePromptLimiter,
  healthLimiter,
} from '../middleware/rateLimiter.js';
import { requestTimeout } from '../middleware/requestTimeout.js';
import { REPOS_DIR, STORAGE_ROOT } from '../config/paths.js';

export const apiRouter = Router();

// Inflight request coalescing registry (Single-Flight pattern) to prevent duplicate simultaneous executions
const inflightExcavations = new Map<string, Promise<any>>();
const inflightPrompts = new Map<string, Promise<any>>();
const inflightBranches = new Map<string, Promise<any>>();

const PROJECT_NAME = 'CodeSage';
const VERSION = '0.1.0';

/**
 * Strict repository ID validation to prevent path traversal (CWE-22)
 */
export function isValidRepoId(repoId: string): boolean {
  if (!repoId || typeof repoId !== 'string') return false;
  if (!/^[a-zA-Z0-9_.-]+$/.test(repoId) || repoId.includes('..')) return false;
  const resolved = path.resolve(REPOS_DIR, repoId);
  return resolved.startsWith(REPOS_DIR + path.sep) || resolved === REPOS_DIR;
}

/**
 * Helper to verify whether a loopback request originates from trusted local development tooling (CWE-352, CWE-863).
 * Restricts development access strictly to verified loopback sockets, trusted host authorities, and allowed local ports.
 */
export function isAuthorizedLocalDevPeer(req: Request): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  const socketIp = req.socket?.remoteAddress || '';
  const isLoopback =
    socketIp === '127.0.0.1' ||
    socketIp === '::1' ||
    socketIp === '::ffff:127.0.0.1';

  if (!isLoopback) return false;

  // Validate Host header to prevent DNS rebinding (CWE-863)
  const rawHost = (req.headers.host || req.hostname || '').toLowerCase();
  const hostWithoutPort = rawHost.split(':')[0];
  const isTrustedHost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1' || hostWithoutPort === '';
  if (!isTrustedHost) return false;

  // Check allowed dev ports: default application ports 3000 (backend API) and 5173/5174 (Vite frontend)
  const allowedDevPorts = new Set(['3000', '5173', '5174', String(process.env.PORT || '3000')]);
  if (process.env.ALLOWED_DEV_PORTS) {
    process.env.ALLOWED_DEV_PORTS.split(',').forEach((p) => allowedDevPorts.add(p.trim()));
  }

  // Reject cross-origin requests targeting loopback from third-party websites or unrelated local ports (CWE-352)
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    try {
      const parsed = new URL(origin);
      const isLocalHostname = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
      if (!isLocalHostname || !allowedDevPorts.has(port)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return false;
  }

  return true;
}

/**
 * Administrator authorization guard for privileged system operations (CWE-862, CWE-807, CWE-345, CWE-352, CWE-863)
 */
export function adminGuard(req: Request, res: Response, next: () => void) {
  const adminKey = process.env.ADMIN_KEY;
  const provided = req.headers['x-admin-key'] || (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '');

  // If a valid administrator credential is provided, allow access in any mode
  if (adminKey && provided === adminKey) {
    return next();
  }

  // In non-production mode, confine unauthenticated development access strictly to verified loopback socket peers
  // with exact trusted hostnames and allowed local development ports (CWE-352, CWE-863).
  if (process.env.NODE_ENV !== 'production') {
    const socketIp = req.socket?.remoteAddress || '';
    const isLoopback =
      socketIp === '127.0.0.1' ||
      socketIp === '::1' ||
      socketIp === '::ffff:127.0.0.1';

    if (isLoopback) {
      // Validate Host header against explicit loopback hostnames (prevent DNS rebinding CWE-863)
      const rawHost = (req.headers.host || req.hostname || '').toLowerCase();
      const hostWithoutPort = rawHost.split(':')[0];
      const isTrustedHost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1' || hostWithoutPort === '';
      if (!isTrustedHost) {
        return res.status(403).json({
          error: 'Forbidden',
          detail: 'Untrusted host authority rejected for loopback administrator access.',
          code: 'UNTRUSTED_HOST_FORBIDDEN',
        });
      }

      // Check allowed dev ports: default application ports 3000 (backend API) and 5173/5174 (Vite frontend)
      const allowedDevPorts = new Set(['3000', '5173', '5174', String(process.env.PORT || '3000')]);
      if (process.env.ALLOWED_DEV_PORTS) {
        process.env.ALLOWED_DEV_PORTS.split(',').forEach((p) => allowedDevPorts.add(p.trim()));
      }

      // Reject cross-origin requests targeting loopback admin operations from third-party websites or unrelated ports (CWE-352)
      const origin = req.headers.origin as string | undefined;
      if (origin) {
        try {
          const parsed = new URL(origin);
          const isLocalHostname = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
          const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
          const isAllowedPort = allowedDevPorts.has(port);

          if (!isLocalHostname || !isAllowedPort) {
            return res.status(403).json({
              error: 'Forbidden',
              detail: 'Untrusted cross-origin or port rejected for loopback administrator access.',
              code: 'CROSS_ORIGIN_ADMIN_FORBIDDEN',
            });
          }
        } catch {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Invalid origin header on administrator request.',
            code: 'INVALID_ORIGIN',
          });
        }
      }

      if (req.headers['sec-fetch-site'] === 'cross-site') {
        return res.status(403).json({
          error: 'Forbidden',
          detail: 'Cross-site request rejected for loopback administrator access.',
          code: 'CROSS_SITE_ADMIN_FORBIDDEN',
        });
      }

      return next();
    }
  }

  return res.status(403).json({
    error: 'Forbidden',
    detail: 'Administrator authorization required for this operation.',
    code: 'ADMIN_REQUIRED',
  });
}

const serverSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serverSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const serverSupabase = (serverSupabaseUrl && serverSupabaseKey)
  ? createClient(serverSupabaseUrl, serverSupabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/**
 * Workbench session verification guard (CWE-602 mitigation).
 * Enforces that caller possesses a verified user session or administrator authority
 * before accessing repository analysis, chat generation, or insight mutations.
 */
export async function workbenchAuthGuard(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  // 1. Admin authority bypass (if valid ADMIN_KEY is supplied)
  const adminKey = process.env.ADMIN_KEY;
  const providedAdminKey = req.headers['x-admin-key'] || token;
  if (adminKey && providedAdminKey === adminKey) {
    return next();
  }

  // 2. Validate session token against authentication provider (Supabase)
  if (token) {
    if (serverSupabase) {
      try {
        const { data, error } = await serverSupabase.auth.getUser(token);
        if (!error && data?.user) {
          (req as any).user = data.user;
          return next();
        }
      } catch {
        // failed validation
      }
    } else if (process.env.NODE_ENV !== 'production' && token === 'dev_authenticated_session') {
      return next();
    }
  }

  // 3. In non-production development mode, allow loopback peer if explicitly running locally without external access
  // and no auth provider is configured
  if (process.env.NODE_ENV !== 'production' && !serverSupabase && isAuthorizedLocalDevPeer(req)) {
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized',
    detail: 'Authentication session required to access the CodeSage workbench.',
    code: 'AUTHENTICATION_REQUIRED',
  });
}

let isBackupInProgress = false;

// Health check endpoint enriched with uptime and subsystem telemetry
apiRouter.get('/health', healthLimiter, async (req: Request, res: Response) => {
  const gemini = await checkGeminiHealth(false);
  const uptimeReport = await UptimeMonitoringService.getReport();
  const errorStats = ErrorLoggingService.getStats();
  res.json({
    project: PROJECT_NAME,
    version: VERSION,
    status: uptimeReport.status,
    uptime_seconds: uptimeReport.uptime_seconds,
    uptime_formatted: uptimeReport.uptime_formatted,
    uptime_sla_percentage: uptimeReport.uptime_sla_percentage,
    gemini,
    subsystems: uptimeReport.subsystems,
    cache_stats: uptimeReport.cache_performance,
    error_stats: errorStats,
  });
});

// Comprehensive Uptime and System Telemetry endpoint
apiRouter.get('/uptime', healthLimiter, async (_req: Request, res: Response) => {
  const report = await UptimeMonitoringService.getReport();
  return res.json(report);
});

// Container Liveness Probe (RFC standard)
apiRouter.get('/health/liveness', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: Date.now(),
  });
});

// Container Readiness Probe (Verifies DB, Disk, and Memory before accepting traffic)
apiRouter.get('/health/readiness', async (_req: Request, res: Response) => {
  const report = await UptimeMonitoringService.getReport();
  const isReady = report.status !== 'outage';
  return res.status(isReady ? 200 : 503).json({
    ready: isReady,
    status: report.status,
    subsystems: report.subsystems,
  });
});

// Dedicated Gemini API Health check endpoint
apiRouter.get('/gemini/health', healthLimiter, async (req: Request, res: Response) => {
  const probe = req.query.probe === 'true';
  const health = await checkGeminiHealth(probe);
  return res.json(health);
});

// Expose configured API rate & resource limits and spending caps (Cached for 60s)
apiRouter.get('/limits', cacheRepeatRequests({ ttlMs: 60_000 }), (_req: Request, res: Response) => {
  res.json({
    rate_limits: {
      window_ms: RATE_LIMIT_CONFIG.WINDOW_MS,
      window_minutes: Math.round(RATE_LIMIT_CONFIG.WINDOW_MS / (60 * 1000)),
      general_max: RATE_LIMIT_CONFIG.GENERAL_MAX,
      clone_max: RATE_LIMIT_CONFIG.CLONE_MAX,
      chat_max: RATE_LIMIT_CONFIG.CHAT_MAX,
      reverse_prompt_max: RATE_LIMIT_CONFIG.REVERSE_PROMPT_MAX,
      health_max: RATE_LIMIT_CONFIG.HEALTH_MAX,
    },
    resource_limits: {
      max_body_size: RESOURCE_LIMITS.MAX_BODY_SIZE,
      max_repo_files: RESOURCE_LIMITS.MAX_REPO_FILES,
      max_repo_size_mb: RESOURCE_LIMITS.MAX_REPO_SIZE_MB,
      max_preview_bytes: RESOURCE_LIMITS.MAX_PREVIEW_BYTES,
      max_chat_message_length: RESOURCE_LIMITS.MAX_CHAT_MESSAGE_LENGTH,
      max_url_length: RESOURCE_LIMITS.MAX_URL_LENGTH,
      max_branch_name_length: RESOURCE_LIMITS.MAX_BRANCH_NAME_LENGTH,
      max_upload_size_mb: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB,
      max_upload_size_bytes: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES,
    },
    compression: {
      enabled: true,
      threshold_bytes: 1024,
      supported_archive_formats: ['tar.gz', 'zip'],
      max_upload_size_mb: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_MB,
      max_upload_size_bytes: RESOURCE_LIMITS.MAX_UPLOAD_SIZE_BYTES,
    },
    spending_caps: {
      daily_spend_cap_usd: SPENDING_CAP_CONFIG.DAILY_SPEND_CAP_USD,
      monthly_spend_cap_usd: SPENDING_CAP_CONFIG.MONTHLY_SPEND_CAP_USD,
      daily_token_cap: SPENDING_CAP_CONFIG.DAILY_TOKEN_CAP,
      max_output_tokens: SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS,
    },
    timeouts: {
      clone_timeout_ms: TIMEOUT_CONFIG.CLONE_TIMEOUT_MS,
      ls_remote_timeout_ms: TIMEOUT_CONFIG.LS_REMOTE_TIMEOUT_MS,
      github_api_timeout_ms: TIMEOUT_CONFIG.GITHUB_API_TIMEOUT_MS,
      gemini_insights_timeout_ms: TIMEOUT_CONFIG.GEMINI_INSIGHTS_TIMEOUT_MS,
      gemini_chat_timeout_ms: TIMEOUT_CONFIG.GEMINI_CHAT_TIMEOUT_MS,
      gemini_probe_timeout_ms: TIMEOUT_CONFIG.GEMINI_PROBE_TIMEOUT_MS,
      gitreverse_timeout_ms: TIMEOUT_CONFIG.GITREVERSE_TIMEOUT_MS,
      excavation_http_timeout_ms: TIMEOUT_CONFIG.EXCAVATION_HTTP_TIMEOUT_MS,
      general_request_timeout_ms: TIMEOUT_CONFIG.GENERAL_REQUEST_TIMEOUT_MS,
    },
    db_optimizations: {
      wal_mode: true,
      prepared_statements: true,
      covering_indexes: true,
      duplicate_payment_prevention: true,
      in_memory_micro_cache: true,
      cache_stats: SqliteCacheService.getStats(),
    },
    current_spending: SpendingService.getSpendingSummary(),
  });
});

// Dedicated spending and budget breakdown endpoint
apiRouter.get('/spending', (_req: Request, res: Response) => {
  return res.json(SpendingService.getSpendingSummary());
});

// Paginated spending & token usage history endpoint
apiRouter.get('/spending/records', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const service = req.query.service as string | undefined;
    const repositoryId = (req.query.repository_id || req.query.repositoryId) as string | undefined;

    const result = SpendingService.getPaginatedUsage({
      page,
      limit,
      service,
      repositoryId,
    });
    // Sanitize records by removing raw idempotency keys from public response
    const sanitizedData = result.data.map(({ idempotency_key, ...rest }: any) => rest);
    return res.json({ ...result, data: sanitizedData });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Top-up budget with duplicate payment prevention (strict Idempotency-Key header enforcement)
apiRouter.post('/payments/topup', idempotency({ requireKey: true }), async (req: Request, res: Response) => {
  try {
    const idempotencyKey = (
      (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string ||
      req.body?.idempotencyKey
    )?.trim();

    const amountUsd = parseFloat(req.body?.amountUsd ?? req.body?.amount);
    const paymentMethod = req.body?.paymentMethod || 'card';
    const description = req.body?.description || 'CodeSage Budget Top-Up';

    if (!idempotencyKey) {
      return res.status(400).json({
        error: 'Bad Request',
        detail: 'An Idempotency-Key header is required to process payments and prevent duplicate charges.',
        code: 'IDEMPOTENCY_KEY_REQUIRED',
      });
    }

    if (isNaN(amountUsd) || amountUsd <= 0 || amountUsd > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        detail: 'Invalid top-up amount. Must be a positive number up to $100.00 USD.',
        code: 'INVALID_AMOUNT',
      });
    }

    // Require administrator authorization for manual credits or local development loopback interface (CWE-345, CWE-352)
    const adminKey = process.env.ADMIN_KEY;
    const providedAdminKey = req.headers['x-admin-key'] || (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '');
    const isAdmin = Boolean(adminKey && providedAdminKey === adminKey);

    const isDevAuthorized = isAuthorizedLocalDevPeer(req);

    if (!isAdmin && !isDevAuthorized) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: 'Payment top-up requires administrator authorization or verified server-side payment confirmation.',
        code: 'PAYMENT_VERIFICATION_REQUIRED',
      });
    }

    const result = PaymentService.processTopUp({
      idempotencyKey,
      amountUsd,
      paymentMethod,
      description,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message || 'Payment processing error' });
  }
});

// Paginated payment transaction history endpoint for auditing
apiRouter.get('/payments/history', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const result = PaymentService.getPaginatedHistory({
      page,
      limit,
      status,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Server SQLite cache stats endpoint
apiRouter.get('/cache/stats', async (_req: Request, res: Response) => {
  try {
    const stats = SqliteCacheService.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Clear server cache endpoint (Clears both SQLite persistent cache and in-memory repeat request cache)
apiRouter.delete('/cache', adminGuard, async (_req: Request, res: Response) => {
  try {
    const cleared = SqliteCacheService.clear();
    const inMemCleared = RepeatRequestCacheService.invalidate();
    return res.json({ success: cleared, in_memory_entries_cleared: inMemCleared });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// ==========================================
// ERROR LOGGING TELEMETRY & MANAGEMENT
// ==========================================

// Paginated query for system error logs (protected by admin authorization to prevent sensitive data exposure)
apiRouter.get('/logs/errors', adminGuard, async (req: Request, res: Response) => {
  try {
    const { page, limit, level, code, search, since } = req.query;
    const result = ErrorLoggingService.getLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      level: level as any,
      code: code as string,
      search: search as string,
      since: since ? Number(since) : undefined,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

// Aggregate statistics and top error codes
apiRouter.get('/logs/stats', async (_req: Request, res: Response) => {
  try {
    const stats = ErrorLoggingService.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

// Clear or prune error logs
apiRouter.delete('/logs/errors', adminGuard, async (req: Request, res: Response) => {
  try {
    const retentionDays = req.query.retention_days ? Number(req.query.retention_days) : undefined;
    if (retentionDays !== undefined) {
      const pruned = ErrorLoggingService.prune(retentionDays);
      return res.json({ success: true, pruned_records: pruned });
    }
    ErrorLoggingService.clear();
    return res.json({ success: true, message: 'All error logs cleared.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

// ==========================================
// SYSTEM BACKUP & DISASTER RECOVERY
// ==========================================

// List all system backups
apiRouter.get('/system/backups', async (_req: Request, res: Response) => {
  try {
    const backups = await BackupService.listBackups();
    return res.json({ backups, count: backups.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Backup Error', detail: err.message });
  }
});

// Create a new full system snapshot backup
apiRouter.post('/system/backups', adminGuard, async (req: Request, res: Response) => {
  if (isBackupInProgress) {
    return res.status(429).json({
      error: 'Too Many Requests',
      detail: 'A backup snapshot is already in progress. Please wait for completion.',
      code: 'BACKUP_IN_PROGRESS',
    });
  }
  try {
    isBackupInProgress = true;
    const label = req.body?.label;
    const manifest = await BackupService.createBackup({ label });
    return res.status(201).json({ success: true, backup: manifest });
  } catch (err: any) {
    return res.status(500).json({ error: 'Backup Creation Failed', detail: err.message });
  } finally {
    isBackupInProgress = false;
  }
});

// Verify integrity of an existing backup archive (protected by admin authorization)
apiRouter.get('/system/backups/:backup_id/verify', adminGuard, async (req: Request, res: Response) => {
  try {
    const result = await BackupService.verifyBackup(req.params.backup_id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Backup Verification Failed', detail: err.message });
  }
});

// Restore system state from backup archive
apiRouter.post('/system/backups/:backup_id/restore', adminGuard, async (req: Request, res: Response) => {
  try {
    const skipRollback = req.body?.skip_rollback === true;
    const result = await BackupService.restoreBackup(req.params.backup_id, { skipRollback });
    return res.json({ message: 'System state successfully restored.', ...result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Restoration Failed', detail: err.message });
  }
});

// Delete a backup archive
apiRouter.delete('/system/backups/:backup_id', adminGuard, async (req: Request, res: Response) => {
  try {
    const deleted = BackupService.deleteBackup(req.params.backup_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', detail: 'Backup archive not found.' });
    }
    return res.json({ success: true, message: 'Backup archive deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Delete Backup Failed', detail: err.message });
  }
});

// List remote branches for a repository without full cloning (Cached for 3m with in-flight deduplication)
apiRouter.get(
  '/repositories/branches',
  cacheRepeatRequests({ ttlMs: 180_000 }),
  requestTimeout(TIMEOUT_CONFIG.GENERAL_REQUEST_TIMEOUT_MS, 'Branch check'),
  async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url || !url.trim()) {
      return res.status(400).json({ detail: 'Query parameter "url" is required.' });
    }

    const trimmedUrl = url.trim();

    // Check if an in-flight branch check is already running for this exact URL
    if (inflightBranches.has(trimmedUrl)) {
      const branchesInfo = await inflightBranches.get(trimmedUrl);
      return res.json(branchesInfo);
    }

    const branchPromise = RepoCloneService.getRemoteBranches(trimmedUrl);
    inflightBranches.set(trimmedUrl, branchPromise);

    try {
      const branchesInfo = await branchPromise;
      return res.json(branchesInfo);
    } finally {
      inflightBranches.delete(trimmedUrl);
    }
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Paginated repository list endpoint querying indexed SQLite metadata cache
apiRouter.get('/repositories', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as any;
    const order = req.query.order as any;

    const result = SqliteCacheService.listPaginated({
      page,
      limit,
      search,
      sortBy,
      order,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Submit repository endpoint with SQLite fast cache retrieval and Single-Flight coalescing
apiRouter.post('/repositories', workbenchAuthGuard, cloneLimiter, requestTimeout(TIMEOUT_CONFIG.EXCAVATION_HTTP_TIMEOUT_MS, 'Repository excavation'), async (req: Request, res: Response) => {
  try {
    const { url, branch, force_refresh } = req.body;
    const isForceRefresh = force_refresh === true || force_refresh === 'true' || force_refresh === 1 || force_refresh === '1';
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ detail: 'Field "url" is required in request body.' });
    }

    if (url.trim().length > RESOURCE_LIMITS.MAX_URL_LENGTH) {
      return res.status(400).json({
        detail: `Repository URL exceeds maximum permitted length of ${RESOURCE_LIMITS.MAX_URL_LENGTH} characters.`,
        code: 'URL_TOO_LONG',
      });
    }

    if (branch && typeof branch === 'string' && branch.trim().length > RESOURCE_LIMITS.MAX_BRANCH_NAME_LENGTH) {
      return res.status(400).json({
        detail: `Branch name exceeds maximum permitted length of ${RESOURCE_LIMITS.MAX_BRANCH_NAME_LENGTH} characters.`,
        code: 'BRANCH_NAME_TOO_LONG',
      });
    }

    const normalized = RepoValidationService.validateAndNormalizeUrl(url);
    const targetBranch = branch || 'main';
    const expectedRepoId = RepoCloneService.generateRepositoryId(
      normalized.owner,
      normalized.repo,
      normalized.normalized_url,
      targetBranch
    );

    // 1. Check SQLite fast cache first if fresh re-dig was not explicitly requested
    if (!isForceRefresh) {
      try {
        // Try SQLite cache
        const sqliteCached = SqliteCacheService.get(expectedRepoId);
        if (sqliteCached) {
          return res.json({
            ...sqliteCached,
            from_cache: true,
            cache_source: 'sqlite',
          });
        }

        // Try filesystem metadata.json fallback
        const metadataFile = path.join(REPOS_DIR, expectedRepoId, 'metadata.json');
        if (fs.existsSync(metadataFile)) {
          const content = fs.readFileSync(metadataFile, 'utf-8');
          const fileCached = JSON.parse(content);
          SqliteCacheService.set(fileCached);
          return res.json({
            ...fileCached,
            from_cache: true,
            cache_source: 'sqlite',
          });
        }
      } catch {
        // Proceed with full analysis
      }
    }

    // 2. Single-Flight Inflight Coalescing: Attach to existing active clone/analysis if running
    if (inflightExcavations.has(expectedRepoId)) {
      console.log(`[SingleFlight] Coalescing duplicate excavation request for: ${expectedRepoId}`);
      try {
        const sharedResult = await inflightExcavations.get(expectedRepoId);
        return res.json({
          ...sharedResult,
          from_cache: false,
          coalesced: true,
        });
      } catch (err: any) {
        return res.status(400).json({ detail: err.message || 'Error processing repository.' });
      }
    }

    // 3. Initiate single excavation execution
    const excavationTask = (async () => {
      const [repoPath, metadata] = await RepoCloneService.cloneRepository(
        url,
        RESOURCE_LIMITS.MAX_REPO_FILES,
        RESOURCE_LIMITS.MAX_REPO_SIZE_MB,
        undefined,
        branch
      );
      const analysis = RepoAnalysisService.analyzeRepository(repoPath);

      const initialData: any = {
        repository_id: metadata.repository_id,
        status: 'ready',
        overview: {
          repository_id: metadata.repository_id,
          owner: metadata.owner,
          repo: metadata.repo,
          branch: metadata.branch || 'main',
          files: metadata.files,
          size_mb: metadata.size_mb,
          normalized_url: metadata.normalized_url,
        },
        facts: {
          repository_id: metadata.repository_id,
          url: metadata.normalized_url,
          branch: metadata.branch || 'main',
          languages: analysis.languages,
          frameworks: analysis.frameworks,
          important_files: analysis.important_files,
          tree_summary: analysis.tree_summary,
          stats: analysis.stats,
        },
        learning_path: [] as string[],
        architecture_summary: '',
        storage_path: metadata.storage_path,
      };

      // Generate Gemini insights (GitReverse prompt is fetched on-demand to save requests)
      const insights = await generateRepositoryInsights(initialData);

      initialData.learning_path = insights.learning_path;
      initialData.architecture_summary = insights.architecture_summary;
      initialData.gemini_available = insights.gemini_available;
      initialData.gemini_status = insights.gemini_status;

      // Persist response metadata to disk
      const metadataFile = path.join(path.dirname(repoPath), 'metadata.json');
      fs.mkdirSync(path.dirname(metadataFile), { recursive: true });
      fs.writeFileSync(metadataFile, JSON.stringify(initialData, null, 2), 'utf-8');

      // Index into SQLite cache for sub-10ms instant subsequent retrieval
      SqliteCacheService.set(initialData);

      return {
        ...initialData,
        from_cache: false,
        cache_source: 'fresh',
      };
    })();

    inflightExcavations.set(expectedRepoId, excavationTask);

    try {
      const result = await excavationTask;
      return res.json(result);
    } finally {
      inflightExcavations.delete(expectedRepoId);
    }
  } catch (err: any) {
    return res.status(400).json({ detail: err.message || 'Error processing repository.' });
  }
});

// Deprecated: Local compressed archive upload has been retired in favor of remote GitHub URLs
apiRouter.post('/repositories/upload', (_req: Request, res: Response) => {
  return res.status(410).json({
    error: 'Gone',
    detail: 'Local compressed archive upload (.zip/.tar) has been retired. Please provide a public GitHub repository URL.',
    code: 'UPLOAD_RETIRED',
  });
});

// Export and download compressed repository archive (.tar.gz or .zip)
apiRouter.get(
  '/repositories/:repo_id/archive',
  requestTimeout(TIMEOUT_CONFIG.GENERAL_REQUEST_TIMEOUT_MS, 'Archive creation and export'),
  async (req: Request, res: Response) => {
    try {
      const repoId = req.params.repo_id;
      const format = (req.query.format as string) === 'zip' ? 'zip' : 'tar.gz';

      // Security check on repoId parameter
      if (!repoId || !/^[a-zA-Z0-9_-]+$/.test(repoId)) {
        return res.status(400).json({
          error: 'Bad Request',
          detail: 'Invalid repository identifier.',
          code: 'INVALID_REPO_ID',
        });
      }

      const exportResult = await CompressionService.createRepositoryArchive(repoId, format);

      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      res.setHeader('Content-Length', exportResult.sizeBytes);

      return res.download(exportResult.archivePath, exportResult.fileName, (err) => {
        if (err && !res.headersSent) {
          console.error(`[ArchiveExport] Download error for ${repoId}:`, err);
          res.status(500).json({ detail: `Error streaming archive: ${err.message}` });
        }
      });
    } catch (err: any) {
      return res.status(404).json({
        error: 'Archive Creation Failed',
        detail: err.message || 'Error creating repository archive.',
        code: 'ARCHIVE_EXPORT_FAILED',
      });
    }
  }
);

// Compress and optimize image (PNG, JPEG, WebP, SVG)
apiRouter.post(
  '/tools/compress-image',
  requestTimeout(TIMEOUT_CONFIG.GENERAL_REQUEST_TIMEOUT_MS, 'Image compression'),
  async (req: Request, res: Response) => {
    try {
      const { image, mimeType, maxWidth, quality, download } = req.body || {};
      if (!image) {
        return res.status(400).json({
          error: 'Bad Request',
          detail: 'No image provided. Please supply base64 string or data URL.',
          code: 'MISSING_IMAGE',
        });
      }

      let buffer: Buffer;
      let detectedMime = (mimeType as string) || 'image/png';

      if (typeof image === 'string' && image.startsWith('data:')) {
        const parts = image.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) detectedMime = mimeMatch[1];
        buffer = Buffer.from(parts[1], 'base64');
      } else if (typeof image === 'string') {
        buffer = Buffer.from(image, 'base64');
      } else if (Buffer.isBuffer(image)) {
        buffer = image;
      } else {
        return res.status(400).json({
          error: 'Bad Request',
          detail: 'Unsupported image format. Provide base64 or data URL.',
          code: 'INVALID_IMAGE_FORMAT',
        });
      }

      const result = await CompressionService.compressImageBuffer(buffer, detectedMime, {
        maxWidth: maxWidth ? Number(maxWidth) : undefined,
        quality: quality ? Number(quality) : undefined,
      });

      if (download === true || req.query.download === 'true') {
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="compressed.${result.format}"`);
        res.setHeader('Content-Length', result.compressedSizeBytes);
        return res.send(result.buffer);
      }

      return res.json({
        success: true,
        originalSizeBytes: result.originalSizeBytes,
        compressedSizeBytes: result.compressedSizeBytes,
        savingsBytes: result.savingsBytes,
        savingsPercentage: result.savingsPercentage,
        mimeType: result.mimeType,
        format: result.format,
        compressedBase64: `data:${result.mimeType};base64,${result.buffer.toString('base64')}`,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Compression Failed',
        detail: err.message || 'Error executing image compression.',
        code: 'IMAGE_COMPRESSION_ERROR',
      });
    }
  }
);

// Dedicated endpoint to fetch or regenerate GitReverse prompt for a repository (Cached for 10m with deduplication)
apiRouter.get(
  '/repositories/:repo_id/reverse-prompt',
  workbenchAuthGuard,
  cacheRepeatRequests({ ttlMs: 600_000 }),
  reversePromptLimiter,
  requestTimeout(TIMEOUT_CONFIG.GENERAL_REQUEST_TIMEOUT_MS, 'Reverse prompt generation'),
  async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.', code: 'INVALID_REPO_ID' });
    }
    const force = req.query.force === 'true';

    // 1. Check SQLite cache
    const sqliteCached = SqliteCacheService.get(repoId);
    if (!force && sqliteCached?.gitreverse_prompt?.prompt) {
      return res.json(sqliteCached.gitreverse_prompt);
    }

    // 2. Check metadata.json
    const metadataFile = path.join(REPOS_DIR, repoId, 'metadata.json');
    let repoData = sqliteCached;
    if (!repoData && fs.existsSync(metadataFile)) {
      repoData = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    }

    if (!repoData) {
      return res.status(404).json({ detail: `Repository '${repoId}' not found.` });
    }

    if (!force && repoData.gitreverse_prompt?.prompt) {
      return res.json(repoData.gitreverse_prompt);
    }

    // 3. Single-Flight Coalescing: Attach to active prompt generation if running
    if (inflightPrompts.has(repoId)) {
      const existingResult = await inflightPrompts.get(repoId);
      return res.json(existingResult);
    }

    const promptTask = (async () => {
      const result = await GitReverseService.fetchReversePrompt(
        repoData.facts?.url || repoData.overview?.normalized_url,
        repoData.overview?.owner,
        repoData.overview?.repo,
        repoData
      );

      // Update in memory and cache
      repoData.gitreverse_prompt = result;
      SqliteCacheService.set(repoData);
      if (fs.existsSync(metadataFile)) {
        fs.writeFileSync(metadataFile, JSON.stringify(repoData, null, 2), 'utf-8');
      }

      return result;
    })();

    inflightPrompts.set(repoId, promptTask);

    try {
      const result = await promptTask;
      return res.json(result);
    } finally {
      inflightPrompts.delete(repoId);
    }
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Get repository status / metadata
apiRouter.get('/repositories/:repo_id', async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.', code: 'INVALID_REPO_ID' });
    }
    const metadataFile = path.join(REPOS_DIR, repoId, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' not found. Please submit it first.`,
      });
    }

    const content = fs.readFileSync(metadataFile, 'utf-8');
    const data = JSON.parse(content);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      detail: `Error reading repository metadata: ${err.message}`,
    });
  }
});

// Interactive RAG chat query for repository (Supports real-time SSE streaming & JSON fallback)
apiRouter.post('/repositories/:repo_id/chat', workbenchAuthGuard, chatLimiter, async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.', code: 'INVALID_REPO_ID' });
    }
    const { message, style, stream = true } = req.body;
    const wantsStream = stream === true || req.headers.accept?.includes('text/event-stream');

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ detail: 'Message string is required in request body.' });
    }

    if (message.length > RESOURCE_LIMITS.MAX_CHAT_MESSAGE_LENGTH) {
      return res.status(400).json({
        detail: `Chat message exceeds maximum allowed limit of ${RESOURCE_LIMITS.MAX_CHAT_MESSAGE_LENGTH} characters (received ${message.length}).`,
        code: 'CHAT_MESSAGE_TOO_LONG',
      });
    }

    const metadataFile = path.join(REPOS_DIR, repoId, 'metadata.json');
    if (!fs.existsSync(metadataFile)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' not found.`,
      });
    }

    const repoData = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));

    // Repeat query caching: Return cached answers immediately for identical repeat queries (< 1ms)
    const normalizedMessage = message.trim().toLowerCase().replace(/[?!.,]+$/, '');
    const queryCacheKey = `chat:${repoId}:${style || 'technical'}:${normalizedMessage}`;
    const bypassCache = req.query.force_refresh === 'true' || req.headers['cache-control'] === 'no-cache';

    if (!bypassCache) {
      const cached = RepeatRequestCacheService.get<any>(queryCacheKey);
      if (cached) {
        if (wantsStream) {
          let isClientConnected = true;
          req.on('close', () => { isClientConnected = false; });

          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Cache', 'HIT');
          res.flushHeaders?.();

          const sendEvent = (event: string, data: any) => {
            if (isClientConnected && !res.writableEnded && res.writable) {
              res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
          };

          sendEvent('status', { status: 'cached', model: 'in-memory-cache' });
          sendEvent('chunk', { delta: cached.data.answer });
          sendEvent('done', {
            answer: cached.data.answer,
            gemini_status: cached.data.gemini_status,
            from_cache: true,
          });
          return res.end();
        } else {
          res.setHeader('X-Cache', 'HIT');
          return res.json({
            ...cached.data,
            from_cache: true,
          });
        }
      }
    }

    if (wantsStream) {
      let isClientConnected = true;
      req.on('close', () => {
        isClientConnected = false;
      });

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const sendEvent = (event: string, data: any) => {
        if (isClientConnected && !res.writableEnded && res.writable) {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
      };

      try {
        const result = await streamRepositoryQuery(
          repoData,
          message,
          style || 'technical',
          (delta: string) => {
            if (isClientConnected) {
              sendEvent('chunk', { delta });
            }
          },
          (status, model) => {
            if (isClientConnected) {
              sendEvent('status', { status, model });
            }
          }
        );

        // Cache completed query for 30 minutes to eliminate redundant Gemini API quota usage
        RepeatRequestCacheService.set(queryCacheKey, result, { ttlMs: 1800_000 });

        if (isClientConnected) {
          sendEvent('done', {
            answer: result.answer,
            gemini_status: result.gemini_status,
          });
        }
        return res.end();
      } catch (err: any) {
        if (isClientConnected && !res.writableEnded) {
          sendEvent('error', {
            detail: err.message || 'Streaming generation failed.',
            code: err.code || 'STREAM_ERROR',
          });
        }
        return res.end();
      }
    }

    const result = await answerRepositoryQuery(repoData, message, style || 'technical');
    // Cache non-streaming result for 30 minutes
    RepeatRequestCacheService.set(queryCacheKey, result, { ttlMs: 1800_000 });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Regenerate or generate insights
apiRouter.post('/repositories/:repo_id/insights', workbenchAuthGuard, async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.', code: 'INVALID_REPO_ID' });
    }
    const metadataFile = path.join(REPOS_DIR, repoId, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      return res.status(404).json({ detail: `Repository with ID '${repoId}' not found.` });
    }

    const repoData = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    const insights = await generateRepositoryInsights(repoData);

    repoData.learning_path = insights.learning_path;
    repoData.architecture_summary = insights.architecture_summary;

    fs.writeFileSync(metadataFile, JSON.stringify(repoData, null, 2), 'utf-8');

    return res.json({
      learning_path: repoData.learning_path,
      architecture_summary: repoData.architecture_summary,
      gemini_available: insights.gemini_available
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Known binary extensions to protect client rendering
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svgz',
  '.pdf', '.zip', '.tar', '.gz', '.tgz', '.rar', '.7z',
  '.ogg', '.mp3', '.wav', '.flac', '.aac',
  '.mp4', '.mov', '.avi', '.mkv', '.webm',
  '.wasm', '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pyc', '.class', '.o', '.obj'
]);

// Map extensions to programming language for frontend syntax highlighting
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.json': 'json',
  '.py': 'python',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.svg': 'svg',
  '.xml': 'xml',
  '.dockerfile': 'dockerfile',
};

// Maximum text preview limit
const MAX_PREVIEW_BYTES = RESOURCE_LIMITS.MAX_PREVIEW_BYTES;

// Paginated repository files list endpoint for large codebases (Cached for 2m)
apiRouter.get(
  '/repositories/:repo_id/files',
  cacheRepeatRequests({ ttlMs: 120_000 }),
  async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.', code: 'INVALID_REPO_ID' });
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const extension = ((req.query.extension as string) || '').trim().toLowerCase();

    const repoDir = path.resolve(REPOS_DIR, repoId, 'source');
    if (!fs.existsSync(repoDir)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' source files not found. Please submit it first.`,
      });
    }

    const allFiles: Array<{ path: string; name: string; extension: string; size_bytes: number; is_binary: boolean }> = [];

    const scanDir = (dir: string, base: string = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.git') || entry.name === 'node_modules') continue;
        const relPath = base ? `${base}/${entry.name}` : entry.name;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath, relPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          let size = 0;
          try {
            size = fs.statSync(fullPath).size;
          } catch {}
          allFiles.push({
            path: relPath,
            name: entry.name,
            extension: ext,
            size_bytes: size,
            is_binary: BINARY_EXTENSIONS.has(ext),
          });
        }
      }
    };
    scanDir(repoDir);

    let filtered = allFiles;
    if (search) {
      filtered = filtered.filter(f => f.path.toLowerCase().includes(search) || f.name.toLowerCase().includes(search));
    }
    if (extension) {
      const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
      filtered = filtered.filter(f => f.extension.toLowerCase() === cleanExt);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const pagedFiles = filtered.slice(offset, offset + limit);

    return res.json({
      repository_id: repoId,
      files: pagedFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ detail: `Error listing files: ${err.message}` });
  }
});

// Get file content endpoint supporting both query param (?path=...) and wildcard path (/files/*) (Cached for 5m)
apiRouter.get('/repositories/:repo_id/file', workbenchAuthGuard, cacheRepeatRequests({ ttlMs: 300_000 }), handleGetFileContent);
apiRouter.get('/repositories/:repo_id/files/*', workbenchAuthGuard, cacheRepeatRequests({ ttlMs: 300_000 }), handleGetFileContent);

async function handleGetFileContent(req: Request, res: Response) {
  try {
    const repoId = req.params.repo_id;
    const rawPath = (req.query.path as string) || (req.params as any)[0] || '';
    const filePath = rawPath.trim();

    if (!filePath) {
      return res.status(400).json({ detail: 'File path parameter is required.' });
    }

    // Validate repoId format strictly to prevent path traversal & symlink escape (CWE-22)
    if (!isValidRepoId(repoId)) {
      return res.status(400).json({ detail: 'Invalid repository ID format.' });
    }

    const realReposDir = fs.realpathSync(REPOS_DIR);
    const repoDir = path.resolve(REPOS_DIR, repoId);
    if (!fs.existsSync(repoDir)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' not found. Please submit it first.`,
      });
    }

    const realRepoDir = fs.realpathSync(repoDir);
    if (!realRepoDir.startsWith(realReposDir + path.sep) && realRepoDir !== realReposDir) {
      return res.status(403).json({ detail: 'Access denied: Repository directory resolves outside base storage.' });
    }

    const sourceRoot = path.resolve(repoDir, 'source');
    if (!fs.existsSync(sourceRoot)) {
      return res.status(404).json({
        detail: `Source files for repository '${repoId}' not found.`,
      });
    }

    // Verify source root is not a symbolic link pointing outside REPOS_DIR
    const sourceRootLstat = fs.lstatSync(sourceRoot);
    if (sourceRootLstat.isSymbolicLink()) {
      return res.status(403).json({ detail: 'Access denied: Repository source root cannot be a symbolic link.' });
    }

    const realSourceRoot = fs.realpathSync(sourceRoot);
    if (!realSourceRoot.startsWith(realReposDir + path.sep)) {
      return res.status(403).json({ detail: 'Access denied: Repository source root resolves outside base storage.' });
    }

    // Path Traversal Security: Clean leading slashes and resolve against source root
    const cleanPath = filePath.replace(/^(\/|\\)+/, '');
    const targetPath = path.resolve(sourceRoot, cleanPath);

    // Verify targetPath is strictly within sourceRoot
    if (!targetPath.startsWith(sourceRoot)) {
      return res.status(403).json({ detail: 'Access denied: Invalid file path.' });
    }

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ detail: `File '${cleanPath}' not found in repository.` });
    }

    // Verify file is not a symlink escaping source root
    const lstat = fs.lstatSync(targetPath);
    if (lstat.isSymbolicLink()) {
      return res.status(403).json({ detail: 'Access denied: Symbolic links cannot be previewed.' });
    }

    const realTargetPath = fs.realpathSync(targetPath);
    if (!realTargetPath.startsWith(realSourceRoot + path.sep) && realTargetPath !== realSourceRoot) {
      return res.status(403).json({ detail: 'Access denied: File resolves outside repository root.' });
    }

    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      return res.status(400).json({ detail: `Path '${cleanPath}' is a directory, not a file.` });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const isBinaryExt = BINARY_EXTENSIONS.has(ext);

    if (isBinaryExt) {
      return res.json({
        path: cleanPath,
        name: path.basename(targetPath),
        extension: ext,
        language: 'binary',
        size_bytes: stat.size,
        is_binary: true,
        is_truncated: false,
        content: null,
        message: 'Binary file preview is not supported.',
      });
    }

    // Read initial buffer to detect null bytes (binary content check)
    const readLimit = Math.min(stat.size, MAX_PREVIEW_BYTES);
    const fd = fs.openSync(targetPath, 'r');
    const buffer = Buffer.alloc(readLimit);
    fs.readSync(fd, buffer, 0, readLimit, 0);
    fs.closeSync(fd);

    let isBinary = false;
    for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
      if (buffer[i] === 0) {
        isBinary = true;
        break;
      }
    }

    if (isBinary) {
      return res.json({
        path: cleanPath,
        name: path.basename(targetPath),
        extension: ext,
        language: 'binary',
        size_bytes: stat.size,
        is_binary: true,
        is_truncated: false,
        content: null,
        message: 'Binary file preview is not supported.',
      });
    }

    const isTruncated = stat.size > MAX_PREVIEW_BYTES;
    const content = buffer.toString('utf-8');
    const lineCount = content.split('\n').length;
    const detectedLanguage = EXTENSION_LANGUAGE_MAP[ext] || 'plaintext';

    return res.json({
      path: cleanPath,
      name: path.basename(targetPath),
      extension: ext,
      language: detectedLanguage,
      size_bytes: stat.size,
      line_count: lineCount,
      is_binary: false,
      is_truncated: isTruncated,
      content,
    });
  } catch (err: any) {
    return res.status(500).json({
      detail: `Error reading file content: ${err.message}`,
    });
  }
}
