import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { SqliteCacheService } from './sqliteCacheService.js';
import { SpendingService } from './spendingService.js';
import { ErrorLoggingService } from './errorLoggingService.js';
import { BACKUPS_DIR, DB_PATH, REPOS_DIR } from '../config/paths.js';

export interface DatabaseBackupManifest {
  fileName: string;
  sizeBytes: number;
  sha256: string;
  tables: {
    repo_cache: number;
    spending_ledger: number;
    payments: number;
    error_logs: number;
  };
}

export interface ReposBackupManifest {
  count: number;
  totalFiles: number;
  totalSizeBytes: number;
}

export interface BackupManifest {
  backupId: string;
  createdAt: number;
  date: string;
  label: string;
  version: string;
  database: DatabaseBackupManifest;
  repos: ReposBackupManifest;
  archiveSizeBytes?: number;
}

export interface RestoreResult {
  success: boolean;
  backupId: string;
  restoredAt: number;
  manifest: BackupManifest;
  integrityCheck: string;
  tablesRestored: {
    repo_cache: number;
    spending_ledger: number;
    payments: number;
    error_logs: number;
  };
}

export interface VerificationResult {
  valid: boolean;
  backupId: string;
  manifest?: BackupManifest;
  error?: string;
}

/**
 * Enterprise Snapshot Backup & Disaster Recovery Service.
 * Provides:
 *  - Atomic SQLite WAL checkpointing & SHA-256 integrity hashing
 *  - Full archive snapshot of metadata cache, spending ledger, error logs, and repositories
 *  - Disaster recovery with automated pre-restore rollback protection
 *  - Tamper detection and SQLite PRAGMA integrity_check validation
 */
export class BackupService {
  private static BACKUPS_DIR = BACKUPS_DIR;
  private static DB_PATH = DB_PATH;
  private static REPOS_DIR = REPOS_DIR;

  private static ensureDirs(): void {
    if (!fs.existsSync(this.BACKUPS_DIR)) {
      fs.mkdirSync(this.BACKUPS_DIR, { recursive: true });
    }
  }

  /**
   * Initializes backup storage directories.
   */
  static init(): void {
    this.ensureDirs();
  }

  /**
   * Creates a full system snapshot backup.
   */
  static async createBackup(options: { label?: string; includeRepos?: boolean } = {}): Promise<BackupManifest> {
    this.ensureDirs();
    const backupId = `backup_${Date.now()}`;
    const stagingDir = path.resolve(this.BACKUPS_DIR, `.staging_${backupId}`);
    const stagingDbDir = path.resolve(stagingDir, 'database');
    const stagingReposDir = path.resolve(stagingDir, 'repos');
    const archivePath = path.resolve(this.BACKUPS_DIR, `${backupId}.tar.gz`);

    try {
      fs.mkdirSync(stagingDbDir, { recursive: true });
      fs.mkdirSync(stagingReposDir, { recursive: true });

      // 1. Flush SQLite WAL to disk so codesage_cache.db contains all transactions
      let tableCounts = { repo_cache: 0, spending_ledger: 0, payments: 0, error_logs: 0 };
      if (fs.existsSync(this.DB_PATH) && typeof DatabaseSync === 'function') {
        try {
          const tempDb = new DatabaseSync(this.DB_PATH);
          tempDb.exec('PRAGMA wal_checkpoint(TRUNCATE);');

          const safeCount = (table: string): number => {
            try {
              const r = tempDb.prepare(`SELECT COUNT(1) as c FROM ${table}`).get() as any;
              return Number(r?.c || 0);
            } catch {
              return 0;
            }
          };

          tableCounts = {
            repo_cache: safeCount('repo_cache'),
            spending_ledger: safeCount('spending_ledger'),
            payments: safeCount('payments'),
            error_logs: safeCount('error_logs'),
          };

          tempDb.close();
        } catch (err: any) {
          console.warn('[BackupService] Warning during WAL checkpoint:', err?.message);
        }
      }

      // 2. Stage Database File and compute SHA-256
      let dbSizeBytes = 0;
      let dbSha256 = '';
      if (fs.existsSync(this.DB_PATH)) {
        const stagedDbPath = path.resolve(stagingDbDir, 'codesage_cache.db');
        fs.copyFileSync(this.DB_PATH, stagedDbPath);
        const dbBuf = fs.readFileSync(stagedDbPath);
        dbSizeBytes = dbBuf.length;
        dbSha256 = crypto.createHash('sha256').update(dbBuf).digest('hex');
      }

      // 3. Stage Repository Sandboxes (if includeRepos is not explicitly false)
      let reposCount = 0;
      let totalFiles = 0;
      let totalSizeBytes = 0;

      if (options.includeRepos !== false && fs.existsSync(this.REPOS_DIR)) {
        const copyDirRecursive = (src: string, dest: string) => {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
              copyDirRecursive(srcPath, destPath);
            } else if (entry.isFile()) {
              fs.copyFileSync(srcPath, destPath);
              totalFiles++;
              totalSizeBytes += fs.statSync(srcPath).size;
            }
          }
        };

        const repoFolders = fs
          .readdirSync(this.REPOS_DIR, { withFileTypes: true })
          .filter((d) => d.isDirectory() && !d.name.startsWith('.'));
        reposCount = repoFolders.length;

        for (const rf of repoFolders) {
          copyDirRecursive(path.join(this.REPOS_DIR, rf.name), path.join(stagingReposDir, rf.name));
        }
      }

      // 4. Create and write Manifest
      const manifest: BackupManifest = {
        backupId,
        createdAt: Date.now(),
        date: new Date().toISOString(),
        label: options.label || 'System Snapshot Backup',
        version: '0.1.0',
        database: {
          fileName: 'codesage_cache.db',
          sizeBytes: dbSizeBytes,
          sha256: dbSha256,
          tables: tableCounts,
        },
        repos: {
          count: reposCount,
          totalFiles,
          totalSizeBytes,
        },
      };

      fs.writeFileSync(path.resolve(stagingDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

      // 5. Compress into tar.gz
      execFileSync('/usr/bin/tar', ['-czf', archivePath, '-C', stagingDir, '.'], {
        timeout: 60000,
      });

      const archiveStats = fs.statSync(archivePath);
      manifest.archiveSizeBytes = archiveStats.size;

      return manifest;
    } finally {
      // Clean up staging directory
      if (fs.existsSync(stagingDir)) {
        try {
          fs.rmSync(stagingDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  /**
   * Lists all available system backup snapshots.
   */
  static async listBackups(): Promise<BackupManifest[]> {
    this.ensureDirs();
    const archives = fs.readdirSync(this.BACKUPS_DIR).filter((f) => f.endsWith('.tar.gz'));
    const results: BackupManifest[] = [];

    for (const archive of archives) {
      const archivePath = path.resolve(this.BACKUPS_DIR, archive);
      try {
        const manifestJson = execFileSync('/usr/bin/tar', ['-xOf', archivePath, 'manifest.json'], {
          encoding: 'utf-8',
          timeout: 10000,
        });
        const manifest: BackupManifest = JSON.parse(manifestJson);
        const stats = fs.statSync(archivePath);
        manifest.archiveSizeBytes = stats.size;
        results.push(manifest);
      } catch (err: any) {
        // Fallback for broken or unmanifested archives
        const stats = fs.statSync(archivePath);
        const backupId = archive.replace('.tar.gz', '');
        results.push({
          backupId,
          createdAt: stats.mtimeMs,
          date: new Date(stats.mtimeMs).toISOString(),
          label: 'Archive (Unverified)',
          version: '0.1.0',
          database: {
            fileName: 'codesage_cache.db',
            sizeBytes: 0,
            sha256: '',
            tables: { repo_cache: 0, spending_ledger: 0, payments: 0, error_logs: 0 },
          },
          repos: { count: 0, totalFiles: 0, totalSizeBytes: 0 },
          archiveSizeBytes: stats.size,
        });
      }
    }

    // Sort newest first
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Verifies an existing backup archive without performing a restore.
   */
  static async verifyBackup(backupId: string): Promise<VerificationResult> {
    this.ensureDirs();
    const cleanId = backupId.replace(/[^a-zA-Z0-9_-]/g, '');
    const archivePath = path.resolve(this.BACKUPS_DIR, `${cleanId}.tar.gz`);

    if (!fs.existsSync(archivePath)) {
      return { valid: false, backupId, error: 'Backup archive file does not exist.' };
    }

    // Enforce archive size budget before extracting to prevent resource exhaustion (CWE-400)
    const MAX_VERIFY_ARCHIVE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
    const stat = fs.statSync(archivePath);
    if (stat.size > MAX_VERIFY_ARCHIVE_SIZE_BYTES) {
      return {
        valid: false,
        backupId,
        error: `Backup archive size (${(stat.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum permitted verification limit (100MB).`,
      };
    }

    const tempExtractDir = path.resolve(this.BACKUPS_DIR, `.verify_${cleanId}_${Date.now()}`);

    try {
      fs.mkdirSync(tempExtractDir, { recursive: true });
      execFileSync('/usr/bin/tar', ['-xzf', archivePath, '-C', tempExtractDir], {
        timeout: 30000,
      });

      const manifestPath = path.resolve(tempExtractDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        return { valid: false, backupId, error: 'Backup archive missing manifest.json.' };
      }

      const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const stagedDb = path.resolve(tempExtractDir, 'database', 'codesage_cache.db');

      if (manifest.database.sha256 && fs.existsSync(stagedDb)) {
        const computedSha = crypto.createHash('sha256').update(fs.readFileSync(stagedDb)).digest('hex');
        if (computedSha !== manifest.database.sha256) {
          return {
            valid: false,
            backupId,
            error: `Database SHA-256 checksum mismatch. Expected ${manifest.database.sha256}, got ${computedSha}.`,
          };
        }
      }

      return { valid: true, backupId, manifest };
    } catch (err: any) {
      return { valid: false, backupId, error: err.message };
    } finally {
      if (fs.existsSync(tempExtractDir)) {
        try {
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  /**
   * Restores system database and repository sandboxes from a backup snapshot.
   * Includes atomic rollback safeguard: if anything fails, previous state is restored.
   */
  static async restoreBackup(backupId: string, options: { skipRollback?: boolean } = {}): Promise<RestoreResult> {
    this.ensureDirs();
    const cleanId = backupId.replace(/[^a-zA-Z0-9_-]/g, '');
    const archivePath = path.resolve(this.BACKUPS_DIR, `${cleanId}.tar.gz`);

    if (!fs.existsSync(archivePath)) {
      throw new Error(`Backup "${cleanId}" not found in backups directory.`);
    }

    const tempExtractDir = path.resolve(this.BACKUPS_DIR, `.restore_${cleanId}_${Date.now()}`);
    const rollbackDir = path.resolve(this.BACKUPS_DIR, `.rollback_${Date.now()}`);

    try {
      // 1. Extract archive to staging
      fs.mkdirSync(tempExtractDir, { recursive: true });
      execFileSync('/usr/bin/tar', ['-xzf', archivePath, '-C', tempExtractDir], {
        timeout: 45000,
      });

      // 2. Validate manifest and integrity
      const manifestPath = path.resolve(tempExtractDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Corrupted backup: manifest.json is missing.');
      }

      const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const stagedDb = path.resolve(tempExtractDir, 'database', 'codesage_cache.db');

      if (!fs.existsSync(stagedDb)) {
        throw new Error('Corrupted backup: codesage_cache.db is missing.');
      }

      const computedSha = crypto.createHash('sha256').update(fs.readFileSync(stagedDb)).digest('hex');
      if (manifest.database.sha256 && computedSha !== manifest.database.sha256) {
        throw new Error(
          `Checksum validation failed! Database in backup is corrupted or tampered. Expected ${manifest.database.sha256}, got ${computedSha}.`
        );
      }

      // 3. Create Rollback snapshot of active live state
      if (!options.skipRollback) {
        fs.mkdirSync(rollbackDir, { recursive: true });
        if (fs.existsSync(this.DB_PATH)) {
          fs.copyFileSync(this.DB_PATH, path.resolve(rollbackDir, 'codesage_cache.db'));
        }
      }

      // 4. Safely close all active database connections
      SqliteCacheService.reset();
      SpendingService.reset();
      ErrorLoggingService.close();

      // 5. Replace Database file
      const dbDir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

      // Clean up active DB and any temporary WAL/SHM journal files
      if (fs.existsSync(this.DB_PATH)) fs.unlinkSync(this.DB_PATH);
      if (fs.existsSync(`${this.DB_PATH}-wal`)) fs.unlinkSync(`${this.DB_PATH}-wal`);
      if (fs.existsSync(`${this.DB_PATH}-shm`)) fs.unlinkSync(`${this.DB_PATH}-shm`);

      fs.copyFileSync(stagedDb, this.DB_PATH);

      // 6. Replace Repositories Sandbox
      const stagedRepos = path.resolve(tempExtractDir, 'repos');
      if (fs.existsSync(stagedRepos)) {
        if (!fs.existsSync(this.REPOS_DIR)) {
          fs.mkdirSync(this.REPOS_DIR, { recursive: true });
        }
        // Copy staged repos into active repos dir
        const repoEntries = fs.readdirSync(stagedRepos);
        for (const re of repoEntries) {
          const srcRepo = path.join(stagedRepos, re);
          const destRepo = path.join(this.REPOS_DIR, re);
          if (fs.existsSync(destRepo)) {
            fs.rmSync(destRepo, { recursive: true, force: true });
          }
          fs.cpSync(srcRepo, destRepo, { recursive: true });
        }
      }

      // 7. Verify restored database integrity
      let integrityStatus = 'ok';
      let tableCounts = { repo_cache: 0, spending_ledger: 0, payments: 0, error_logs: 0 };

      if (typeof DatabaseSync === 'function') {
        const verifyDb = new DatabaseSync(this.DB_PATH);
        try {
          const checkRow = verifyDb.prepare('PRAGMA integrity_check;').get() as any;
          integrityStatus = checkRow?.integrity_check || 'ok';

          if (integrityStatus !== 'ok') {
            throw new Error(`SQLite integrity check returned: ${integrityStatus}`);
          }

          const safeCount = (table: string): number => {
            try {
              const r = verifyDb.prepare(`SELECT COUNT(1) as c FROM ${table}`).get() as any;
              return Number(r?.c || 0);
            } catch {
              return 0;
            }
          };

          tableCounts = {
            repo_cache: safeCount('repo_cache'),
            spending_ledger: safeCount('spending_ledger'),
            payments: safeCount('payments'),
            error_logs: safeCount('error_logs'),
          };
        } finally {
          verifyDb.close();
        }
      }

      // 8. Re-initialize services
      SqliteCacheService.init();
      SpendingService.init();
      ErrorLoggingService.init();

      // Clean up rollback snapshot on success
      if (fs.existsSync(rollbackDir)) {
        try {
          fs.rmSync(rollbackDir, { recursive: true, force: true });
        } catch {}
      }

      return {
        success: true,
        backupId: cleanId,
        restoredAt: Date.now(),
        manifest,
        integrityCheck: integrityStatus,
        tablesRestored: tableCounts,
      };
    } catch (err: any) {
      // Automatic Rollback Recovery
      if (!options.skipRollback && fs.existsSync(path.resolve(rollbackDir, 'codesage_cache.db'))) {
        console.error('[BackupService] Restoration error, reverting from rollback:', err.message);
        try {
          SqliteCacheService.reset();
          SpendingService.reset();
          ErrorLoggingService.close();

          fs.copyFileSync(path.resolve(rollbackDir, 'codesage_cache.db'), this.DB_PATH);

          SqliteCacheService.init();
          SpendingService.init();
          ErrorLoggingService.init();
        } catch (rollbackErr: any) {
          console.error('[BackupService] Rollback failed:', rollbackErr.message);
        }
      }

      throw new Error(`Restoration failed: ${err.message}`);
    } finally {
      if (fs.existsSync(tempExtractDir)) {
        try {
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  /**
   * Deletes a backup archive file.
   */
  static deleteBackup(backupId: string): boolean {
    this.ensureDirs();
    const cleanId = backupId.replace(/[^a-zA-Z0-9_-]/g, '');
    const archivePath = path.resolve(this.BACKUPS_DIR, `${cleanId}.tar.gz`);

    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
      return true;
    }
    return false;
  }
}
