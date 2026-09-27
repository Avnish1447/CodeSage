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
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';
import compression from 'compression';
import { RESOURCE_LIMITS } from './server/config/limits.js';
import { generalLimiter } from './server/middleware/rateLimiter.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { uptimeTracker } from './server/middleware/uptimeTracker.js';
import { ErrorLoggingService } from './server/services/errorLoggingService.js';

// Centralized fatal exception logging
process.on('uncaughtException', (err) => {
  ErrorLoggingService.logError(err, undefined, { fatal: true, type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason: any) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  ErrorLoggingService.logError(err, undefined, { fatal: false, type: 'unhandledRejection' });
});

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Serve logos and static assets explicitly with fresh cache headers
  app.use('/logos', express.static(path.join(process.cwd(), 'public/logos'), {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    },
  }));

  app.use("/SVG's", express.static(path.join(process.cwd(), "SVG's"), {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    },
  }));

  // Serve storage directory statically for inspection if needed
  app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            '**/storage/**',
            '**/storage/repos/**',
            '**/.git/**',
            '**/node_modules/**',
          ],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodeSage] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
