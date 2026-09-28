// Load environment variables from .env file if available
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // .env file not present or unreadable, ignore
  }
}

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { apiRouter } from './routes/api.js';
import compression from 'compression';
import { RESOURCE_LIMITS } from './config/limits.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { uptimeTracker } from './middleware/uptimeTracker.js';
import { ErrorLoggingService } from './services/errorLoggingService.js';

// Centralized fatal exception logging
process.on('uncaughtException', (err) => {
  ErrorLoggingService.logError(err, undefined, { fatal: true, type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason: any) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  ErrorLoggingService.logError(err, undefined, { fatal: false, type: 'unhandledRejection' });
});

export function createApp() {
  const app = express();

  // Trust reverse proxy hops only when behind verified proxies (e.g. Vercel edge CDN) or explicit configuration;
  // defaults to 'loopback' to prevent direct clients from spoofing client IPs via X-Forwarded-For (CWE-345)
  const trustProxyConfig = process.env.TRUST_PROXY
    ? (process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY === 'false' ? false : !isNaN(Number(process.env.TRUST_PROXY)) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY)
    : (process.env.VERCEL ? 1 : 'loopback');
  app.set('trust proxy', trustProxyConfig);

  // Real-time request telemetry and uptime monitoring
  app.use(uptimeTracker());

  // High-performance response compression (Gzip / Deflate) with SSE streaming bypass
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers.accept === 'text/event-stream') {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  app.use(cors());
  app.use(express.json({ limit: RESOURCE_LIMITS.MAX_BODY_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: RESOURCE_LIMITS.MAX_BODY_SIZE }));

  // General rate limiting across API routes
  app.use('/api', generalLimiter);

  // Clerk Frontend API proxy for production vercel.app domains (e.g. thecodesage.vercel.app/__clerk)
  app.all('/__clerk*', async (req, res) => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'thecodesage.vercel.app';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const proxyUrl = process.env.CLERK_PROXY_URL || `${proto}://${host}/__clerk`;

    const subPath = req.url.replace(/^\/__clerk/, '') || '/';
    const targetUrl = `https://frontend-api.clerk.services${subPath}`;

    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && !['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      headers.set('Clerk-Proxy-Url', proxyUrl);
      if (clerkSecretKey) {
        headers.set('Clerk-Secret-Key', clerkSecretKey);
      }
      const rawIp = req.socket?.remoteAddress || (req.headers['x-forwarded-for'] as string) || '';
      if (rawIp) {
        headers.set('X-Forwarded-For', Array.isArray(rawIp) ? rawIp.join(', ') : rawIp);
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        redirect: 'manual',
      };

      if (!['GET', 'HEAD'].includes(req.method) && req.body) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const clerkRes = await fetch(targetUrl, fetchOptions);

      res.status(clerkRes.status);
      clerkRes.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, val);
        }
      });

      const buffer = await clerkRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error('[Clerk Proxy Error]:', err.message);
      return res.status(502).json({ error: 'Bad Gateway', message: 'Failed to proxy request to Clerk Frontend API.' });
    }
  });

  // Mount API router
  app.use('/api/v1', apiRouter);

  // Centralized API error handling
  app.use('/api', errorHandler);

  // Serve static assets with fresh cache headers
  const logosDir = path.join(process.cwd(), 'public/logos');
  app.use('/logos', express.static(logosDir, {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    },
  }));

  const svgsDir = path.join(process.cwd(), "SVG's");
  app.use("/SVG's", express.static(svgsDir, {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    },
  }));

  return app;
}

export const app = createApp();
export default app;
