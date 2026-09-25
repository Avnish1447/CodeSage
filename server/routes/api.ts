import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { RepoCloneService } from '../services/repoCloneService.js';
import { RepoAnalysisService } from '../services/repoAnalysisService.js';
import { generateRepositoryInsights, answerRepositoryQuery, streamRepositoryQuery, checkGeminiHealth } from '../services/geminiService.js';

export const apiRouter = Router();

const PROJECT_NAME = 'CodeSage';
const VERSION = '0.1.0';

// Health check endpoint
apiRouter.get('/health', async (req: Request, res: Response) => {
  const gemini = await checkGeminiHealth(false);
  res.json({
    project: PROJECT_NAME,
    version: VERSION,
    status: 'healthy',
    gemini,
  });
});

// Dedicated Gemini API Health check endpoint
apiRouter.get('/gemini/health', async (req: Request, res: Response) => {
  const probe = req.query.probe === 'true';
  const health = await checkGeminiHealth(probe);
  return res.json(health);
});

// List remote branches for a repository without full cloning
apiRouter.get('/repositories/branches', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url || !url.trim()) {
      return res.status(400).json({ detail: 'Query parameter "url" is required.' });
    }

    const branchesInfo = await RepoCloneService.getRemoteBranches(url.trim());
    return res.json(branchesInfo);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Submit repository endpoint
apiRouter.post('/repositories', async (req: Request, res: Response) => {
  try {
    const { url, branch } = req.body;
    if (!url) {
      return res.status(400).json({ detail: 'Field "url" is required in request body.' });
    }

    const [repoPath, metadata] = await RepoCloneService.cloneRepository(url, 1000, 50, undefined, branch);
    const analysis = RepoAnalysisService.analyzeRepository(repoPath);

    const initialData = {
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

    // Optionally generate insights via Gemini if key is available
    const insights = await generateRepositoryInsights(initialData);
    initialData.learning_path = insights.learning_path;
    initialData.architecture_summary = insights.architecture_summary;
    (initialData as any).gemini_available = insights.gemini_available;
    (initialData as any).gemini_status = insights.gemini_status;

    // Persist response metadata
    const metadataFile = path.join(path.dirname(repoPath), 'metadata.json');
    fs.mkdirSync(path.dirname(metadataFile), { recursive: true });
    fs.writeFileSync(metadataFile, JSON.stringify(initialData, null, 2), 'utf-8');

    return res.json(initialData);
  } catch (err: any) {
    return res.status(400).json({ detail: err.message || 'Error processing repository.' });
  }
});

// Get repository status / metadata
apiRouter.get('/repositories/:repo_id', async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    const metadataFile = path.join('storage', 'repos', repoId, 'metadata.json');

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
apiRouter.post('/repositories/:repo_id/chat', async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    const { message, style, stream = true } = req.body;
    const wantsStream = stream === true || req.headers.accept?.includes('text/event-stream');

    if (!message) {
      return res.status(400).json({ detail: 'Message is required.' });
    }

    const metadataFile = path.join('storage', 'repos', repoId, 'metadata.json');
    if (!fs.existsSync(metadataFile)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' not found.`,
      });
    }

    const repoData = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));

    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const sendEvent = (event: string, data: any) => {
        if (!res.writableEnded && res.writable) {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
      };

      try {
        const result = await streamRepositoryQuery(
          repoData,
          message,
          style || 'technical',
          (delta: string) => {
            sendEvent('chunk', { delta });
          },
          (status, model) => {
            sendEvent('status', { status, model });
          }
        );

        sendEvent('done', {
          answer: result.answer,
          gemini_status: result.gemini_status,
        });
        return res.end();
      } catch (err: any) {
        sendEvent('error', { detail: err.message || 'Streaming generation failed.' });
        return res.end();
      }
    }

    const result = await answerRepositoryQuery(repoData, message, style || 'technical');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

// Regenerate or generate insights
apiRouter.post('/repositories/:repo_id/insights', async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    const metadataFile = path.join('storage', 'repos', repoId, 'metadata.json');

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

// Maximum text preview limit (512 KB)
const MAX_PREVIEW_BYTES = 512 * 1024;

// Get file content endpoint supporting both query param (?path=...) and wildcard path (/files/*)
apiRouter.get('/repositories/:repo_id/file', handleGetFileContent);
apiRouter.get('/repositories/:repo_id/files/*', handleGetFileContent);

async function handleGetFileContent(req: Request, res: Response) {
  try {
    const repoId = req.params.repo_id;
    const rawPath = (req.query.path as string) || (req.params as any)[0] || '';
    const filePath = rawPath.trim();

    if (!filePath) {
      return res.status(400).json({ detail: 'File path parameter is required.' });
    }

    const repoDir = path.resolve('storage', 'repos', repoId);
    if (!fs.existsSync(repoDir)) {
      return res.status(404).json({
        detail: `Repository with ID '${repoId}' not found. Please submit it first.`,
      });
    }

    const sourceRoot = path.resolve(repoDir, 'source');
    if (!fs.existsSync(sourceRoot)) {
      return res.status(404).json({
        detail: `Source files for repository '${repoId}' not found.`,
      });
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
