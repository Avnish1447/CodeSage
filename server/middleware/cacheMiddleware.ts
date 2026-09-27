import { Request, Response, NextFunction } from 'express';
import { RepeatRequestCacheService } from '../services/repeatRequestCache.js';

export interface CacheMiddlewareOptions {
  ttlMs?: number;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

/**
 * Repeat Request Cache Middleware.
 * Caches idempotent GET requests in-memory to prevent redundant computation, disk I/O, or network calls.
 * Implements ETag conditional requests (HTTP 304 Not Modified).
 */
export function cacheRepeatRequests(options: CacheMiddlewareOptions = {}) {
  const {
    ttlMs = 120_000, // Default 2 minutes
    keyGenerator,
    skip,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Only cache GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // 2. Custom skip logic or client-requested cache bypass
    const clientBypass =
      req.headers['cache-control'] === 'no-cache' ||
      req.headers['pragma'] === 'no-cache' ||
      req.query.force_refresh === 'true' ||
      req.query.refresh === 'true';

    if (clientBypass || (skip && skip(req))) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // 3. Generate deterministic cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : RepeatRequestCacheService.generateKey(req.method, req.originalUrl || req.url);

    // 4. Check for cached response
    const cached = RepeatRequestCacheService.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', `public, max-age=${Math.round(ttlMs / 1000)}`);

      // Conditional GET: check If-None-Match for 304 Not Modified
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === cached.etag) {
        return res.status(304).end();
      }

      res.setHeader('Content-Type', cached.contentType);
      return res.status(cached.statusCode).send(cached.data);
    }

    // 5. Cache Miss: Intercept response to capture and store payload
    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entry = RepeatRequestCacheService.set(cacheKey, body, {
          ttlMs,
          contentType: 'application/json; charset=utf-8',
          statusCode: res.statusCode,
        });
        res.setHeader('ETag', entry.etag);
        res.setHeader('Cache-Control', `public, max-age=${Math.round(ttlMs / 1000)}`);
      }
      return originalJson(body);
    };

    res.send = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === 'string') {
        const contentType = (res.getHeader('content-type') as string) || 'text/plain; charset=utf-8';
        const entry = RepeatRequestCacheService.set(cacheKey, body, {
          ttlMs,
          contentType,
          statusCode: res.statusCode,
        });
        res.setHeader('ETag', entry.etag);
        res.setHeader('Cache-Control', `public, max-age=${Math.round(ttlMs / 1000)}`);
      }
      return originalSend(body);
    };

    next();
  };
}
