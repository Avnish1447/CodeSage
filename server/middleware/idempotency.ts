import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

interface CachedIdempotencyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
  payloadHash: string;
  principal: string;
}

/**
 * In-memory idempotency cache and in-flight lock registry.
 * Conforms to IETF Idempotency-Key HTTP specification and mitigates CWE-863.
 */
const completedResponses = new Map<string, CachedIdempotencyResponse>();
const activeInflightKeys = new Set<string>();

/**
 * Resets the in-memory idempotency cache (useful for testing).
 */
export function resetIdempotencyCache(): void {
  completedResponses.clear();
  activeInflightKeys.clear();
}

// Auto-purge entries older than 10 minutes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of completedResponses.entries()) {
    if (now - val.timestamp > 10 * 60 * 1000) {
      completedResponses.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface IdempotencyOptions {
  requireKey?: boolean;
  windowMs?: number;
}

/**
 * Resolves caller principal for cache isolation (CWE-863 mitigation).
 */
function getCallerPrincipal(req: Request): string {
  const adminKey = (req.headers['x-admin-key'] as string) || '';
  if (adminKey) {
    return `admin:${crypto.createHash('sha256').update(adminKey).digest('hex').substring(0, 16)}`;
  }
  const authHeader = (req.headers.authorization as string) || '';
  if (authHeader) {
    return `auth:${crypto.createHash('sha256').update(authHeader).digest('hex').substring(0, 16)}`;
  }
  const clientIp = req.socket?.remoteAddress || req.ip || '127.0.0.1';
  return `peer:${clientIp}`;
}

/**
 * Computes deterministic SHA-256 hash of the request payload to detect conflicting payload reuses.
 */
function computePayloadHash(req: Request): string {
  try {
    const raw = typeof req.body === 'object' ? JSON.stringify(req.body || {}) : String(req.body || '');
    return crypto.createHash('sha256').update(raw).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Idempotency Middleware.
 * Prevents duplicate payments, charges, and state mutations from network retries or rapid double-submits.
 * Mitigates CWE-863 by scoping entries to authorized principal and refusing to cache authorization denials.
 */
export function idempotency(options: IdempotencyOptions = {}) {
  const { requireKey = false, windowMs = 5 * 60 * 1000 } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to state-mutating requests (POST, PUT, PATCH, DELETE)
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const idempotencyKey = (
      (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined
    )?.trim();

    if (!idempotencyKey) {
      if (requireKey) {
        return res.status(400).json({
          error: 'Bad Request',
          detail: 'Idempotency-Key header is required for payment and credit operations to prevent duplicate charges.',
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          status: 400,
        });
      }
      return next();
    }

    const principal = getCallerPrincipal(req);
    const payloadHash = computePayloadHash(req);
    // Scope cache key to the authorized principal, operation, and idempotency key (CWE-863 mitigation)
    const scopedKey = `${principal}:${req.method}:${req.path}:${idempotencyKey}`;

    // 1. Check if a response is already cached for this idempotency key and principal
    const cached = completedResponses.get(scopedKey);
    if (cached && Date.now() - cached.timestamp < windowMs) {
      // Reject reuse with conflicting payload
      if (cached.payloadHash && payloadHash && cached.payloadHash !== payloadHash) {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          detail: 'Idempotency key was previously used with a different request payload.',
          code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
          status: 422,
        });
      }

      console.log(`[Idempotency] Replaying cached response for key: ${idempotencyKey} (principal: ${principal})`);
      res.setHeader('X-Cache', 'IDEMPOTENT-REPLAY');
      res.setHeader('X-Idempotency-Key', idempotencyKey);
      return res.status(cached.statusCode).json(cached.body);
    }

    // 2. Prevent concurrent duplicate submissions with the same key for this principal
    if (activeInflightKeys.has(scopedKey)) {
      console.warn(`[Idempotency] Concurrent duplicate request detected for key: ${idempotencyKey} (principal: ${principal})`);
      return res.status(409).json({
        error: 'Conflict',
        detail: `A payment or transaction with Idempotency-Key "${idempotencyKey}" is currently being processed. Please do not submit duplicate requests.`,
        code: 'CONCURRENT_IDEMPOTENT_REQUEST',
        status: 409,
      });
    }

    // Mark as in-flight
    activeInflightKeys.add(scopedKey);

    // Intercept res.json to cache response upon completion
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      activeInflightKeys.delete(scopedKey);

      // Do NOT cache authorization failures (401, 403) or rate limits (429) (CWE-863 mitigation).
      // Only cache successful transaction results (2xx/3xx).
      if (res.statusCode >= 200 && res.statusCode < 400) {
        completedResponses.set(scopedKey, {
          statusCode: res.statusCode,
          headers: {},
          body,
          timestamp: Date.now(),
          payloadHash,
          principal,
        });
      }

      res.setHeader('X-Idempotency-Key', idempotencyKey);
      return originalJson(body);
    };

    // Clean up in-flight on connection abort
    res.on('close', () => {
      activeInflightKeys.delete(scopedKey);
    });

    next();
  };
}
