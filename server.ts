import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.js';

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Restrict direct access to backend bundles, source maps, database storage, and sensitive server assets (CWE-200, CWE-552)
  app.use((req, res, next) => {
    let cleanPath = '';
    try {
      cleanPath = decodeURIComponent(req.path).toLowerCase();
    } catch {
      cleanPath = req.path.toLowerCase();
    }

    if (
      cleanPath === '/server.cjs' ||
      cleanPath === '/server.cjs.map' ||
      cleanPath.startsWith('/storage') ||
      cleanPath.startsWith('/.env') ||
      cleanPath.startsWith('/.git') ||
      cleanPath.startsWith('/server')
    ) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: 'Direct access to server-side bundles, runtime storage, and configuration files is restricted.',
        code: 'ACCESS_RESTRICTED',
      });
    }
    next();
  });

  // Vite integration in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        fs: {
          deny: ['**/storage/**', '**/.env*', '**/dist/server.cjs*', '**/server/**'],
        },
        watch: {
          ignored: [
            '**/storage/**',
            '**/storage/repos/**',
            '**/.git/**',
            '**/node_modules/**',
            '**/.vercel/**',
            '**/temp/**',
            '**/tmp/**',
            '**/coverage/**',
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
