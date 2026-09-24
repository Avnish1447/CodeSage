import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { RepoCloneService } from '../services/repoCloneService.js';
import { RepoAnalysisService } from '../services/repoAnalysisService.js';
import { generateRepositoryInsights, answerRepositoryQuery } from '../services/geminiService.js';

export const apiRouter = Router();

const PROJECT_NAME = 'CodeSage';
const VERSION = '0.1.0';

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    project: PROJECT_NAME,
    version: VERSION,
    status: 'healthy',
  });
});

// Submit repository endpoint
apiRouter.post('/repositories', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ detail: 'Field "url" is required in request body.' });
    }

    const [repoPath, metadata] = await RepoCloneService.cloneRepository(url);
    const analysis = RepoAnalysisService.analyzeRepository(repoPath);

    const initialData = {
      repository_id: metadata.repository_id,
      status: 'ready',
      overview: {
        repository_id: metadata.repository_id,
        owner: metadata.owner,
        repo: metadata.repo,
        files: metadata.files,
        size_mb: metadata.size_mb,
        normalized_url: metadata.normalized_url,
      },
      facts: {
        repository_id: metadata.repository_id,
        url: metadata.normalized_url,
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

// Interactive RAG chat query for repository
apiRouter.post('/repositories/:repo_id/chat', async (req: Request, res: Response) => {
  try {
    const repoId = req.params.repo_id;
    const { message, style } = req.body;

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
    const answer = await answerRepositoryQuery(repoData, message, style || 'technical');

    return res.json({ answer });
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
