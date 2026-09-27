import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Request } from 'express';

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface ErrorLogEntry {
  id: number;
  timestamp: number;
  level: LogLevel;
  error_name: string;
  code: string;
  message: string;
  status_code?: number | null;
  method?: string | null;
  path?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  stack?: string | null;
  metadata?: Record<string, any>;
}

export interface ErrorLogQueryOptions {
  level?: LogLevel;
  code?: string;
  search?: string;
  page?: number;
  limit?: number;
  since?: number;
}

export interface ErrorLogStats {
  total: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  last24Hours: number;
  topCodes: Array<{ code: string; count: number }>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Enterprise Structured Error Logging Service for CodeSage.
 * Persists application logs and system errors to:
 * 1. High-speed indexed SQLite table (`error_logs`) with covering indexes
 * 2. Rotating JSON Lines append-only disk log file (`storage/logs/codesage_error.log`)
 * 3. Colorized console output for live debugging
 */
export class ErrorLoggingService {
  private static db: any = null;
  private static DB_PATH = path.join('storage', 'codesage_cache.db');
  private static LOG_DIR = path.join('storage', 'logs');
  private static LOG_FILE = path.join('storage', 'logs', 'codesage_error.log');

  private static stmtInsert: any = null;
  private static isInitialized = false;

  private static get isAvailable(): boolean {
    return typeof DatabaseSync === 'function';
  }

  static init(): void {
    if (this.isInitialized && this.db) return;
    if (!this.isAvailable) return;

    try {
      const dbDir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      if (!fs.existsSync(this.LOG_DIR)) {
        fs.mkdirSync(this.LOG_DIR, { recursive: true });
      }

      this.db = new DatabaseSync(this.DB_PATH);

      // High-performance Pragmas and schema
      this.db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;

        CREATE TABLE IF NOT EXISTS error_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp INTEGER NOT NULL,
          level TEXT NOT NULL,
          error_name TEXT NOT NULL,
          code TEXT NOT NULL,
          message TEXT NOT NULL,
          status_code INTEGER,
          method TEXT,
          path TEXT,
          ip TEXT,
          user_agent TEXT,
          stack TEXT,
          metadata_json TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_error_logs_level_ts 
          ON error_logs(level, timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_error_logs_code_ts 
          ON error_logs(code, timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_error_logs_ts 
          ON error_logs(timestamp DESC);
      `);

      this.stmtInsert = this.db.prepare(`
        INSERT INTO error_logs (
          timestamp, level, error_name, code, message, status_code,
          method, path, ip, user_agent, stack, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      this.isInitialized = true;
    } catch (err: any) {
      console.warn('[ErrorLoggingService] Initialization error:', err?.message || err);
      this.db = null;
      this.stmtInsert = null;
      this.isInitialized = false;
    }
  }

  /**
   * Closes active database connection (used during backup/restore).
   */
  static close(): void {
    if (this.db) {
      try {
        this.stmtInsert = null;
        this.db.close();
      } catch {
        // Ignore close errors
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
  }

  /**
   * Log a caught or uncaught error with optional HTTP Request context.
   */
  static logError(
    err: any,
    req?: Request,
    metadata: Record<string, any> = {}
  ): ErrorLogEntry {
    this.init();

    const timestamp = Date.now();
    const statusCode = err?.statusCode || err?.status || (err?.code === 'GATEWAY_TIMEOUT' ? 504 : 500);
    const level: LogLevel = statusCode >= 500 ? 'ERROR' : 'WARN';
    const errorName = err?.name || 'Error';
    const code = err?.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'APP_ERROR');
    const message = err?.message || err?.detail || String(err || 'Unknown error');
    const stack = err?.stack || undefined;

    let method: string | null = null;
    let reqPath: string | null = null;
    let ip: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      method = req.method || null;
      reqPath = req.originalUrl || req.url || null;
      ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || null;
      userAgent = (req.headers['user-agent'] as string) || null;
    }

    const mergedMetadata = {
      ...metadata,
      ...(err?.detail ? { detail: err.detail } : {}),
      ...(req?.query && Object.keys(req.query).length ? { query: req.query } : {}),
      ...(req?.headers?.['idempotency-key'] ? { idempotencyKey: req.headers['idempotency-key'] } : {}),
    };

    const metadataJson = Object.keys(mergedMetadata).length ? JSON.stringify(mergedMetadata) : null;

    let insertedId = 0;
    if (this.db && this.stmtInsert) {
      try {
        const result = this.stmtInsert.run(
          timestamp,
          level,
          errorName,
          code,
          message,
          statusCode,
          method,
          reqPath,
          ip,
          userAgent,
          stack || null,
          metadataJson
        );
        insertedId = Number(result?.lastInsertRowid || 0);
      } catch (dbErr: any) {
        console.warn('[ErrorLoggingService] SQLite write failed:', dbErr?.message);
      }
    }

    const entry: ErrorLogEntry = {
      id: insertedId,
      timestamp,
      level,
      error_name: errorName,
      code,
      message,
      status_code: statusCode,
      method,
      path: reqPath,
      ip,
      user_agent: userAgent,
      stack,
      metadata: mergedMetadata,
    };

    // Append to file asynchronously
    this.appendToFile(entry);

    // Formatted console logging
    const timeStr = new Date(timestamp).toISOString();
    const tag = `[CodeSage ${level}]`;
    const loc = method && reqPath ? ` ${method} ${reqPath}` : '';
    if (level === 'ERROR') {
      console.error(`${tag} ${timeStr}${loc} - ${code} (${statusCode}): ${message}`);
      if (stack && process.env.NODE_ENV !== 'production') {
        console.error(stack);
      }
    } else {
      console.warn(`${tag} ${timeStr}${loc} - ${code} (${statusCode}): ${message}`);
    }

    return entry;
  }

  /**
   * Log a general message at a specific level.
   */
  static log(level: LogLevel, message: string, metadata: Record<string, any> = {}): ErrorLogEntry {
    this.init();

    const timestamp = Date.now();
    const code = metadata.code || (level === 'ERROR' ? 'SYSTEM_ERROR' : level === 'WARN' ? 'SYSTEM_WARN' : 'INFO');
    const metadataJson = Object.keys(metadata).length ? JSON.stringify(metadata) : null;

    let insertedId = 0;
    if (this.db && this.stmtInsert) {
      try {
        const result = this.stmtInsert.run(
          timestamp,
          level,
          'LogMessage',
          code,
          message,
          level === 'ERROR' ? 500 : 200,
          null,
          null,
          null,
          null,
          metadata.stack || null,
          metadataJson
        );
        insertedId = Number(result?.lastInsertRowid || 0);
      } catch (err: any) {
        console.warn('[ErrorLoggingService] SQLite write failed:', err?.message);
      }
    }

    const entry: ErrorLogEntry = {
      id: insertedId,
      timestamp,
      level,
      error_name: 'LogMessage',
      code,
      message,
      status_code: level === 'ERROR' ? 500 : 200,
      metadata,
    };

    this.appendToFile(entry);
    return entry;
  }

  static error(message: string, metadata?: Record<string, any>): ErrorLogEntry {
    return this.log('ERROR', message, metadata);
  }

  static warn(message: string, metadata?: Record<string, any>): ErrorLogEntry {
    return this.log('WARN', message, metadata);
  }

  static info(message: string, metadata?: Record<string, any>): ErrorLogEntry {
    return this.log('INFO', message, metadata);
  }

  static debug(message: string, metadata?: Record<string, any>): ErrorLogEntry {
    return this.log('DEBUG', message, metadata);
  }

  /**
   * Query filtered, paginated error logs from SQLite.
   */
  static getLogs(options: ErrorLogQueryOptions = {}): PaginatedResult<ErrorLogEntry> {
    this.init();

    const page = Math.max(1, Math.round(Number(options.page) || 1));
    const limit = Math.min(100, Math.max(1, Math.round(Number(options.limit) || 20)));
    const offset = (page - 1) * limit;

    if (!this.db) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }

    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (options.level) {
        conditions.push('level = ?');
        params.push(options.level.toUpperCase());
      }

      if (options.code) {
        conditions.push('code = ?');
        params.push(options.code);
      }

      if (options.since) {
        conditions.push('timestamp >= ?');
        params.push(options.since);
      }

      if (options.search) {
        const pattern = `%${options.search.trim().toLowerCase()}%`;
        conditions.push('(LOWER(message) LIKE ? OR LOWER(code) LIKE ? OR LOWER(path) LIKE ?)');
        params.push(pattern, pattern, pattern);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count query
      const countStmt = this.db.prepare(`SELECT COUNT(1) as total FROM error_logs ${whereClause}`);
      const countRow = countStmt.get(...params) as { total: number } | undefined;
      const total = Number(countRow?.total || 0);

      // Data query
      const queryStmt = this.db.prepare(`
        SELECT id, timestamp, level, error_name, code, message, status_code,
               method, path, ip, user_agent, stack, metadata_json
        FROM error_logs
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      const rows = (queryStmt.all(...params, limit, offset) as any[]) || [];
      const data: ErrorLogEntry[] = rows.map((r) => {
        let meta = undefined;
        if (r.metadata_json) {
          try {
            meta = JSON.parse(r.metadata_json);
          } catch {}
        }
        return {
          id: r.id,
          timestamp: r.timestamp,
          level: r.level,
          error_name: r.error_name,
          code: r.code,
          message: r.message,
          status_code: r.status_code,
          method: r.method,
          path: r.path,
          ip: r.ip,
          user_agent: r.user_agent,
          stack: r.stack,
          metadata: meta,
        };
      });

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (err: any) {
      console.warn('[ErrorLoggingService] Query failed:', err?.message);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
  }

  /**
   * Aggregate statistics of system errors.
   */
  static getStats(): ErrorLogStats {
    this.init();

    if (!this.db) {
      return { total: 0, errorCount: 0, warnCount: 0, infoCount: 0, last24Hours: 0, topCodes: [] };
    }

    try {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const totalRow = this.db.prepare('SELECT COUNT(1) as total FROM error_logs').get() as any;
      const errorRow = this.db.prepare("SELECT COUNT(1) as count FROM error_logs WHERE level = 'ERROR'").get() as any;
      const warnRow = this.db.prepare("SELECT COUNT(1) as count FROM error_logs WHERE level = 'WARN'").get() as any;
      const infoRow = this.db.prepare("SELECT COUNT(1) as count FROM error_logs WHERE level = 'INFO'").get() as any;
      const dayRow = this.db.prepare('SELECT COUNT(1) as count FROM error_logs WHERE timestamp >= ?').get(oneDayAgo) as any;

      const topCodesRows = (
        this.db.prepare(`
          SELECT code, COUNT(1) as count
          FROM error_logs
          GROUP BY code
          ORDER BY count DESC
          LIMIT 5
        `).all() as any[]
      ) || [];

      return {
        total: Number(totalRow?.total || 0),
        errorCount: Number(errorRow?.count || 0),
        warnCount: Number(warnRow?.count || 0),
        infoCount: Number(infoRow?.count || 0),
        last24Hours: Number(dayRow?.count || 0),
        topCodes: topCodesRows.map((r) => ({ code: r.code, count: Number(r.count) })),
      };
    } catch (err: any) {
      console.warn('[ErrorLoggingService] getStats failed:', err?.message);
      return { total: 0, errorCount: 0, warnCount: 0, infoCount: 0, last24Hours: 0, topCodes: [] };
    }
  }

  /**
   * Prune logs to enforce retention policy (retentionDays or max entries limit).
   */
  static prune(retentionDays = 14, maxEntries = 5000): number {
    this.init();
    if (!this.db) return 0;

    try {
      const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      this.db.prepare('DELETE FROM error_logs WHERE timestamp < ?').run(cutoffTime);

      const countRow = this.db.prepare('SELECT COUNT(1) as count FROM error_logs').get() as any;
      const currentCount = Number(countRow?.count || 0);

      let deleted = 0;
      if (currentCount > maxEntries) {
        const excess = currentCount - maxEntries;
        this.db.prepare(`
          DELETE FROM error_logs WHERE id IN (
            SELECT id FROM error_logs ORDER BY timestamp ASC LIMIT ?
          )
        `).run(excess);
        deleted = excess;
      }

      return deleted;
    } catch (err: any) {
      console.warn('[ErrorLoggingService] Prune failed:', err?.message);
      return 0;
    }
  }

  /**
   * Clear all error logs and vacuum SQLite storage.
   */
  static clear(): void {
    this.init();
    if (!this.db) return;

    try {
      this.db.exec('DELETE FROM error_logs;');
      if (fs.existsSync(this.LOG_FILE)) {
        fs.writeFileSync(this.LOG_FILE, '');
      }
    } catch (err: any) {
      console.warn('[ErrorLoggingService] Clear failed:', err?.message);
    }
  }

  /**
   * Safely append log entry JSON to rotating log file on disk.
   */
  private static appendToFile(entry: ErrorLogEntry): void {
    try {
      if (!fs.existsSync(this.LOG_DIR)) {
        fs.mkdirSync(this.LOG_DIR, { recursive: true });
      }

      // Check file size for rotation (rotate at 10MB)
      if (fs.existsSync(this.LOG_FILE)) {
        const stats = fs.statSync(this.LOG_FILE);
        if (stats.size > 10 * 1024 * 1024) {
          const rotatedPath = `${this.LOG_FILE}.${Date.now()}.bak`;
          fs.renameSync(this.LOG_FILE, rotatedPath);
        }
      }

      const line = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.LOG_FILE, line, 'utf-8');
    } catch {
      // Disk write failure should never crash the process
    }
  }
}
