import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.js';

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite integration in development vs static serving in production
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
