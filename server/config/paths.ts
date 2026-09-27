import path from 'node:path';
import fs from 'node:fs';

/**
 * Centralized dynamic storage path management.
 * In serverless environments (e.g. Vercel), the root disk is strictly read-only,
 * so all dynamic databases, logs, uploads, and cloned repos are routed to /tmp.
 * Locally and in containerized hosting (Docker/Railway/Render), ./storage is used.
 */
export const IS_VERCEL = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION
);

export const STORAGE_ROOT = IS_VERCEL
  ? path.join('/tmp', 'codesage_storage')
  : path.resolve(process.cwd(), 'storage');

export const DB_PATH = path.join(STORAGE_ROOT, 'codesage_cache.db');
export const REPOS_DIR = path.join(STORAGE_ROOT, 'repos');
export const LOGS_DIR = path.join(STORAGE_ROOT, 'logs');
export const ERROR_LOG_PATH = path.join(LOGS_DIR, 'codesage_error.log');
export const BACKUPS_DIR = path.join(STORAGE_ROOT, 'backups');
export const TEMP_DIR = path.join(STORAGE_ROOT, 'temp');
export const UPLOAD_TEMP_DIR = path.join(STORAGE_ROOT, 'temp_uploads');
export const EXPORTS_DIR = path.join(STORAGE_ROOT, 'exports');

export function ensureDirExists(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Directory creation will fail gracefully if permissions are restricted
    }
  }
  return dirPath;
}

// Automatically guarantee essential directories exist at boot
ensureDirExists(STORAGE_ROOT);
ensureDirExists(REPOS_DIR);
ensureDirExists(LOGS_DIR);
ensureDirExists(TEMP_DIR);
ensureDirExists(UPLOAD_TEMP_DIR);
ensureDirExists(EXPORTS_DIR);
