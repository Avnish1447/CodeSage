import { Request, Response, NextFunction } from 'express';

interface CachedIdempotencyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
}

/**
 * In-memory idempotency cache and in-flight lock registry.
 * Conforms to IETF Idempotency-Key HTTP specification.
 */
const completedResponses = new Map<string, CachedIdempotencyResponse>();
const activeInflightKeys = new Set<string>();

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
 * Idempotency Middleware.
 * Prevents duplicate payments, charges, and state mutations from network retries or rapid double-submits.
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

    // 1. Check if a response is already cached for this idempotency key
    const cached = completedResponses.get(idempotencyKey);
    if (cached && Date.now() - cached.timestamp < windowMs) {
      console.log(`[Idempotency] Replaying cached response for key: ${idempotencyKey}`);
      res.setHeader('X-Cache', 'IDEMPOTENT-REPLAY');
      res.setHeader('X-Idempotency-Key', idempotencyKey);
      return res.status(cached.statusCode).json(cached.body);
    }

    // 2. Prevent concurrent duplicate submissions with the same key
    if (activeInflightKeys.has(idempotencyKey)) {
      console.warn(`[Idempotency] Concurrent duplicate payment detected for key: ${idempotencyKey}`);
      return res.status(409).json({
        error: 'Conflict',
        detail: `A payment or transaction with Idempotency-Key "${idempotencyKey}" is currently being processed. Please do not submit duplicate payments.`,
        code: 'CONCURRENT_IDEMPOTENT_REQUEST',
        status: 409,
      });
    }

    // Mark as in-flight
    activeInflightKeys.add(idempotencyKey);

    // Intercept res.json to cache response upon completion
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      activeInflightKeys.delete(idempotencyKey);

      // Only cache successful or intentional client responses (2xx, 4xx)
      if (res.statusCode >= 200 && res.statusCode < 500) {
        completedResponses.set(idempotencyKey, {
          statusCode: res.statusCode,
          headers: {},
          body,
          timestamp: Date.now(),
        });
      }

      res.setHeader('X-Idempotency-Key', idempotencyKey);
      return originalJson(body);
    };

    // Clean up in-flight on connection abort
    res.on('close', () => {
      activeInflightKeys.delete(idempotencyKey);
    });

    next();
  };
}
