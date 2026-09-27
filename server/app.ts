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
import { STORAGE_ROOT } from './config/paths.js';

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

  // Dynamic storage serving
  app.use('/storage', express.static(STORAGE_ROOT));

  return app;
}

export const app = createApp();
export default app;
