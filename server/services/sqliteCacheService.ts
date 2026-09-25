import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface SQLiteCacheStats {
  count: number;
  sizeBytes: number;
  available: boolean;
}

export class SqliteCacheService {
  private static db: any = null;
  private static DB_PATH = path.join('storage', 'codesage_cache.db');

  static get isAvailable(): boolean {
    return typeof DatabaseSync === 'function';
  }

  static init(): void {
    if (!this.isAvailable) return;
    if (this.db) return;

    try {
      const dir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new DatabaseSync(this.DB_PATH);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS repo_cache (
          repository_id TEXT PRIMARY KEY,
          normalized_url TEXT NOT NULL,
          branch TEXT NOT NULL,
          owner TEXT NOT NULL,
          repo TEXT NOT NULL,
          files_count INTEGER NOT NULL,
          size_mb REAL NOT NULL,
          data_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_repo_url_branch ON repo_cache(normalized_url, branch);
      `);
    } catch (err: any) {
      console.warn('[SqliteCacheService] Failed to initialize SQLite cache:', err.message);
      this.db = null;
    }
  }

  static get(repositoryId: string): any | null {
    this.init();
    if (!this.db) return null;

    try {
      const stmt = this.db.prepare('SELECT data_json FROM repo_cache WHERE repository_id = ?');
      const row = stmt.get(repositoryId) as { data_json: string } | undefined;
      if (row && row.data_json) {
        return JSON.parse(row.data_json);
      }
      return null;
    } catch (err: any) {
      console.warn(`[SqliteCacheService] Cache lookup error for ${repositoryId}:`, err.message);
      return null;
    }
  }

  static findByUrlAndBranch(normalizedUrl: string, branch: string = 'main'): any | null {
    this.init();
    if (!this.db) return null;

    try {
      const stmt = this.db.prepare(
        'SELECT data_json FROM repo_cache WHERE normalized_url = ? AND branch = ? ORDER BY updated_at DESC LIMIT 1'
      );
      const row = stmt.get(normalizedUrl, branch) as { data_json: string } | undefined;
      if (row && row.data_json) {
        return JSON.parse(row.data_json);
      }
      return null;
    } catch (err: any) {
      console.warn(`[SqliteCacheService] Lookup error for ${normalizedUrl}#${branch}:`, err.message);
      return null;
    }
  }

  static set(repoData: any): void {
    this.init();
    if (!this.db || !repoData?.repository_id) return;

    try {
      const { repository_id: id, overview } = repoData;
      const normalizedUrl = overview?.normalized_url || '';
      const branch = overview?.branch || 'main';
      const owner = overview?.owner || '';
      const repo = overview?.repo || '';
      const filesCount = overview?.files || 0;
      const sizeMb = overview?.size_mb || 0;
      const now = Date.now();
      const json = JSON.stringify(repoData);

      const stmt = this.db.prepare(`
        INSERT INTO repo_cache (
          repository_id, normalized_url, branch, owner, repo, files_count, size_mb, data_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(repository_id) DO UPDATE SET
          data_json = excluded.data_json,
          files_count = excluded.files_count,
          size_mb = excluded.size_mb,
          updated_at = excluded.updated_at
      `);

      stmt.run(id, normalizedUrl, branch, owner, repo, filesCount, sizeMb, json, now, now);
    } catch (err: any) {
      console.warn(`[SqliteCacheService] Set error for ${repoData?.repository_id}:`, err.message);
    }
  }

  static delete(repositoryId: string): boolean {
    this.init();
    if (!this.db) return false;

    try {
      const stmt = this.db.prepare('DELETE FROM repo_cache WHERE repository_id = ?');
      stmt.run(repositoryId);
      return true;
    } catch {
      return false;
    }
  }

  static clear(): boolean {
    this.init();
    if (!this.db) return false;

    try {
      this.db.exec('DELETE FROM repo_cache; VACUUM;');
      return true;
    } catch {
      return false;
    }
  }

  static getStats(): SQLiteCacheStats {
    this.init();
    if (!this.db) {
      return { count: 0, sizeBytes: 0, available: false };
    }

    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM repo_cache');
      const row = stmt.get() as { count: number } | undefined;
      const count = row ? Number(row.count) : 0;

      let sizeBytes = 0;
      if (fs.existsSync(this.DB_PATH)) {
        sizeBytes = fs.statSync(this.DB_PATH).size;
      }

      return {
        count,
        sizeBytes,
        available: true,
      };
    } catch {
      return { count: 0, sizeBytes: 0, available: true };
    }
  }
}
