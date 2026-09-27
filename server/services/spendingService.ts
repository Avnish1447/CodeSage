import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SPENDING_CAP_CONFIG } from '../config/limits.js';

export interface UsageRecordParams {
  service: 'gemini_insights' | 'gemini_chat' | 'gitreverse' | string;
  model?: string;
  promptTokens: number;
  completionTokens: number;
  repositoryId?: string;
  idempotencyKey?: string;
}

export interface PaymentTransactionParams {
  idempotencyKey: string;
  amountUsd: number;
  paymentMethod?: string;
  description?: string;
}

export interface SpendingPaginationOptions {
  page?: number;
  limit?: number;
  service?: string;
  repositoryId?: string;
}

export interface PaymentPaginationOptions {
  page?: number;
  limit?: number;
  status?: string;
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

export interface SpendingSummary {
  daily: {
    spent_usd: number;
    cap_usd: number;
    remaining_usd: number;
    percent_used: number;
    tokens_used: number;
    tokens_cap: number;
    calls_count: number;
  };
  monthly: {
    spent_usd: number;
    cap_usd: number;
    remaining_usd: number;
    percent_used: number;
    calls_count: number;
  };
  cap_status: {
    daily_cap_exceeded: boolean;
    monthly_cap_exceeded: boolean;
    tokens_cap_exceeded: boolean;
    is_spending_capped: boolean;
    reason?: string;
  };
  recent_records: Array<{
    id: number;
    timestamp: number;
    service: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd: number;
    repository_id: string;
    idempotency_key?: string | null;
  }>;
}

export class SpendingService {
  private static db: any = null;
  private static DB_PATH = path.join('storage', 'codesage_cache.db');

  // Precompiled reusable prepared statements for 0ms overhead
  private static stmtInsertUsage: any = null;
  private static stmtFindByIdempotency: any = null;
  private static stmtDailySpending: any = null;
  private static stmtMonthlySpending: any = null;
  private static stmtRecentRecords: any = null;
  private static stmtDeleteDaily: any = null;
  private static stmtInsertPayment: any = null;
  private static stmtFindPaymentByIdempotency: any = null;
  private static stmtRecentPayments: any = null;

  // In-memory micro-cache to eliminate redundant disk scans on high-concurrency requests
  private static cachedDaily: { totalUsd: number; totalTokens: number; callsCount: number; timestamp: number } | null = null;
  private static cachedMonthly: { totalUsd: number; totalTokens: number; callsCount: number; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 2500; // 2.5s TTL

  private static get isAvailable(): boolean {
    return typeof DatabaseSync === 'function';
  }

  static reset(): void {
    if (this.db) {
      try {
        this.stmtInsertUsage = null;
        this.stmtFindByIdempotency = null;
        this.stmtDailySpending = null;
        this.stmtMonthlySpending = null;
        this.stmtRecentRecords = null;
        this.stmtDeleteDaily = null;
        this.stmtInsertPayment = null;
        this.stmtFindPaymentByIdempotency = null;
        this.stmtRecentPayments = null;
        this.cachedDaily = null;
        this.cachedMonthly = null;
        this.db.close();
      } catch {}
      this.db = null;
    }
  }

  static init(): void {
    if (!this.isAvailable || this.db) return;

    try {
      const dir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new DatabaseSync(this.DB_PATH);

      // 1. High-Performance SQLite Pragmas & Schema
      this.db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA temp_store = MEMORY;

        CREATE TABLE IF NOT EXISTS spending_ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp INTEGER NOT NULL,
          service TEXT NOT NULL,
          model TEXT,
          prompt_tokens INTEGER NOT NULL,
          completion_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          estimated_cost_usd REAL NOT NULL,
          repository_id TEXT,
          idempotency_key TEXT
        );

        -- Covering index to compute SUM and COUNT straight from B-Tree index in memory
        CREATE INDEX IF NOT EXISTS idx_spending_covering 
          ON spending_ledger(timestamp, estimated_cost_usd, total_tokens);

        CREATE INDEX IF NOT EXISTS idx_spending_timestamp_desc 
          ON spending_ledger(timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_spending_service_timestamp 
          ON spending_ledger(service, timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_spending_repo_timestamp 
          ON spending_ledger(repository_id, timestamp DESC);

        -- Payments & Budget Credits Table
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idempotency_key TEXT UNIQUE NOT NULL,
          timestamp INTEGER NOT NULL,
          amount_usd REAL NOT NULL,
          status TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          description TEXT,
          created_at INTEGER NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_idempotency 
          ON payment_transactions(idempotency_key);

        CREATE INDEX IF NOT EXISTS idx_payment_timestamp_desc 
          ON payment_transactions(timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_payment_status_timestamp 
          ON payment_transactions(status, timestamp DESC);
      `);

      // Safe migration: Add idempotency_key column if upgrading from earlier table version
      try {
        this.db.exec(`ALTER TABLE spending_ledger ADD COLUMN idempotency_key TEXT;`);
      } catch {
        // Column already exists
      }

      // Unique partial index for strict duplicate payment / usage charge prevention
      try {
        this.db.exec(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_spending_idempotency 
            ON spending_ledger(idempotency_key) 
            WHERE idempotency_key IS NOT NULL;
        `);
      } catch {
        // Index exists
      }

      // 2. Precompile all prepared statements
      this.stmtInsertUsage = this.db.prepare(`
        INSERT INTO spending_ledger (
          timestamp, service, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, repository_id, idempotency_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      this.stmtFindByIdempotency = this.db.prepare(`
        SELECT estimated_cost_usd, total_tokens, id 
        FROM spending_ledger 
        WHERE idempotency_key = ? 
        LIMIT 1
      `);

      this.stmtDailySpending = this.db.prepare(`
        SELECT
          COALESCE(SUM(estimated_cost_usd), 0) AS total_usd,
          COALESCE(SUM(total_tokens), 0) AS total_tokens,
          COUNT(*) AS calls_count
        FROM spending_ledger
        WHERE timestamp >= ?
      `);

      this.stmtMonthlySpending = this.db.prepare(`
        SELECT
          COALESCE(SUM(estimated_cost_usd), 0) AS total_usd,
          COALESCE(SUM(total_tokens), 0) AS total_tokens,
          COUNT(*) AS calls_count
        FROM spending_ledger
        WHERE timestamp >= ?
      `);

      this.stmtRecentRecords = this.db.prepare(`
        SELECT id, timestamp, service, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, repository_id, idempotency_key
        FROM spending_ledger
        ORDER BY timestamp DESC
        LIMIT 15
      `);

      this.stmtDeleteDaily = this.db.prepare('DELETE FROM spending_ledger WHERE timestamp >= ?');

      this.stmtInsertPayment = this.db.prepare(`
        INSERT INTO payment_transactions (
          idempotency_key, timestamp, amount_usd, status, payment_method, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      this.stmtFindPaymentByIdempotency = this.db.prepare(`
        SELECT id, idempotency_key, timestamp, amount_usd, status, payment_method, description, created_at
        FROM payment_transactions
        WHERE idempotency_key = ?
        LIMIT 1
      `);

      this.stmtRecentPayments = this.db.prepare(`
        SELECT id, idempotency_key, timestamp, amount_usd, status, payment_method, description, created_at
        FROM payment_transactions
        ORDER BY timestamp DESC
        LIMIT 20
      `);
    } catch (err: any) {
      console.warn('[SpendingService] Failed to initialize spending database:', err.message);
      this.db = null;
    }
  }

  /**
   * Invalidate in-memory micro-cache on write operations
   */
  /**
   * Invalidates memory caches when new entries are committed.
   */
  static invalidateCache(): void {
    this.cachedDaily = null;
    this.cachedMonthly = null;
  }

  /**
   * Records token usage with strict Idempotency Key protection to prevent duplicate charges.
   */
  static recordUsage(params: UsageRecordParams): { estimatedCostUsd: number; totalTokens: number; isDuplicate?: boolean } {
    this.init();
    const promptTokens = Math.max(0, Math.round(params.promptTokens || 0));
    const completionTokens = Math.max(0, Math.round(params.completionTokens || 0));
    const totalTokens = promptTokens + completionTokens;

    // Calculate cost in USD using configured rates
    const promptCost = (promptTokens / 1000) * SPENDING_CAP_CONFIG.COST_PER_1K_INPUT_TOKENS;
    const completionCost = (completionTokens / 1000) * SPENDING_CAP_CONFIG.COST_PER_1K_OUTPUT_TOKENS;
    const estimatedCostUsd = Math.round((promptCost + completionCost) * 1000000) / 1000000;

    if (this.db) {
      // 1. Idempotency Check: Prevent duplicate payment / token deductions for identical calls
      if (params.idempotencyKey && this.stmtFindByIdempotency) {
        try {
          const existing = this.stmtFindByIdempotency.get(params.idempotencyKey) as any;
          if (existing) {
            console.log(`[SpendingService] Duplicate payment/usage deduction prevented for key: ${params.idempotencyKey}`);
            return {
              estimatedCostUsd: Number(existing.estimated_cost_usd),
              totalTokens: Number(existing.total_tokens),
              isDuplicate: true,
            };
          }
        } catch (err: any) {
          console.warn('[SpendingService] Idempotency lookup error:', err.message);
        }
      }

      // 2. Insert new usage record
      try {
        if (this.stmtInsertUsage) {
          this.stmtInsertUsage.run(
            Date.now(),
            (params as any).callType || params.service || 'gemini',
            params.model || 'gemini-flash',
            promptTokens,
            completionTokens,
            totalTokens,
            estimatedCostUsd,
            params.repositoryId || '',
            params.idempotencyKey || null
          );
          this.invalidateCache();
        }
      } catch (err: any) {
        // If unique constraint triggers on race condition, catch and return existing
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          console.log(`[SpendingService] Concurrent duplicate payment caught by unique index: ${params.idempotencyKey}`);
          return { estimatedCostUsd, totalTokens, isDuplicate: true };
        }
        console.warn('[SpendingService] Failed to insert usage record:', err.message);
      }
    }

    return { estimatedCostUsd, totalTokens, isDuplicate: false };
  }

  /**
   * Process a top-up or credit payment with 100% duplicate payment prevention via Idempotency Keys.
   */
  static recordPayment(params: PaymentTransactionParams): {
    success: boolean;
    transaction: any;
    isDuplicate: boolean;
  } {
    this.init();
    if (!this.db || !params.idempotencyKey) {
      throw new Error('Database unavailable or idempotencyKey missing for payment operation.');
    }

    // 1. Check if payment with this idempotency key has already succeeded
    if (this.stmtFindPaymentByIdempotency) {
      try {
        const existing = this.stmtFindPaymentByIdempotency.get(params.idempotencyKey);
        if (existing) {
          console.log(`[SpendingService] Duplicate payment attempt prevented for key: ${params.idempotencyKey}`);
          return {
            success: true,
            transaction: existing,
            isDuplicate: true,
          };
        }
      } catch (err: any) {
        console.warn('[SpendingService] Payment idempotency check error:', err.message);
      }
    }

    // 2. Record new payment transaction atomically
    const now = Date.now();
    const transaction = {
      idempotency_key: params.idempotencyKey,
      timestamp: now,
      amount_usd: Math.max(0, params.amountUsd),
      status: 'succeeded',
      payment_method: params.paymentMethod || 'card',
      description: params.description || 'CodeSage AI Credit Top-Up',
      created_at: now,
    };

    try {
      if (this.stmtInsertPayment) {
        const insertRes = this.stmtInsertPayment.run(
          transaction.idempotency_key,
          transaction.timestamp,
          transaction.amount_usd,
          transaction.status,
          transaction.payment_method,
          transaction.description,
          transaction.created_at
        );
        if (insertRes && insertRes.lastInsertRowid) {
          (transaction as any).id = Number(insertRes.lastInsertRowid);
        }
        this.invalidateCache();
      }
      return {
        success: true,
        transaction,
        isDuplicate: false,
      };
    } catch (err: any) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        console.log(`[SpendingService] Concurrent duplicate payment caught by unique index for key: ${params.idempotencyKey}`);
        const existing = this.stmtFindPaymentByIdempotency?.get(params.idempotencyKey);
        return {
          success: true,
          transaction: existing || transaction,
          isDuplicate: true,
        };
      }
      throw err;
    }
  }

  /**
   * Retrieves payment transaction history (most recent).
   */
  static getPaymentHistory(): any[] {
    this.init();
    if (!this.db || !this.stmtRecentPayments) return [];
    try {
      return this.stmtRecentPayments.all() || [];
    } catch {
      return [];
    }
  }

  /**
   * Retrieves all-time aggregate payment metrics.
   */
  static getTotalPayments(): { totalUsd: number; count: number } {
    this.init();
    if (!this.db) return { totalUsd: 0, count: 0 };
    try {
      const row = this.db.prepare('SELECT COUNT(1) as count, COALESCE(SUM(amount_usd), 0) as total FROM payment_transactions').get() as any;
      return {
        totalUsd: Number(row?.total || 0),
        count: Number(row?.count || 0),
      };
    } catch {
      return { totalUsd: 0, count: 0 };
    }
  }

  /**
   * Retrieves paginated spending & token usage ledger records with optional service/repo filters.
   * Utilizes idx_spending_timestamp_desc / idx_spending_service_timestamp for 0ms indexed retrieval.
   */
  static getPaginatedUsage(options: SpendingPaginationOptions = {}): PaginatedResult<any> {
    this.init();
    const page = Math.max(1, Math.round(Number(options.page) || 1));
    const limit = Math.min(100, Math.max(1, Math.round(Number(options.limit) || 15)));
    const offset = (page - 1) * limit;
    const service = options.service?.trim();
    const repositoryId = options.repositoryId?.trim();

    if (!this.db) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }

    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (service) {
        conditions.push('service = ?');
        params.push(service);
      }
      if (repositoryId) {
        conditions.push('repository_id = ?');
        params.push(repositoryId);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countStmt = this.db.prepare(`SELECT COUNT(1) as total FROM spending_ledger ${whereClause}`);
      const total = Number((countStmt.get(...params) as any)?.total || 0);

      const queryStmt = this.db.prepare(`
        SELECT id, timestamp, service, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, repository_id, idempotency_key
        FROM spending_ledger
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      const rows = (queryStmt.all(...params, limit, offset) as any[]) || [];
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: rows,
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
      console.warn('[SpendingService] getPaginatedUsage error:', err.message);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
  }

  /**
   * Retrieves paginated payment transactions with optional status filter.
   * Utilizes idx_payment_timestamp_desc for 0ms indexed retrieval.
   */
  static getPaginatedPayments(options: PaymentPaginationOptions = {}): PaginatedResult<any> {
    this.init();
    const page = Math.max(1, Math.round(Number(options.page) || 1));
    const limit = Math.min(50, Math.max(1, Math.round(Number(options.limit) || 10)));
    const offset = (page - 1) * limit;
    const status = options.status?.trim();

    if (!this.db) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }

    try {
      let whereClause = '';
      const params: any[] = [];

      if (status) {
        whereClause = 'WHERE status = ?';
        params.push(status);
      }

      const countStmt = this.db.prepare(`SELECT COUNT(1) as total FROM payment_transactions ${whereClause}`);
      const total = Number((countStmt.get(...params) as any)?.total || 0);

      const queryStmt = this.db.prepare(`
        SELECT id, idempotency_key, timestamp, amount_usd, status, payment_method, description, created_at
        FROM payment_transactions
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      const rows = (queryStmt.all(...params, limit, offset) as any[]) || [];
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: rows,
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
      console.warn('[SpendingService] getPaginatedPayments error:', err.message);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
  }

  /**
   * Retrieves spending totals since beginning of today (local time midnight).
   * Employs 2.5s in-memory caching to eliminate redundant disk scans.
   */
  static getDailySpending(targetDate = new Date()): { totalUsd: number; totalTokens: number; callsCount: number } {
    this.init();
    if (!this.db || !this.stmtDailySpending) return { totalUsd: 0, totalTokens: 0, callsCount: 0 };

    const now = Date.now();
    if (this.cachedDaily && now - this.cachedDaily.timestamp < this.CACHE_TTL_MS) {
      return {
        totalUsd: this.cachedDaily.totalUsd,
        totalTokens: this.cachedDaily.totalTokens,
        callsCount: this.cachedDaily.callsCount,
      };
    }

    try {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const startTs = startOfDay.getTime();

      const row = this.stmtDailySpending.get(startTs) as any;
      const result = {
        totalUsd: Math.round((row?.total_usd || 0) * 10000) / 10000,
        totalTokens: Number(row?.total_tokens || 0),
        callsCount: Number(row?.calls_count || 0),
      };

      this.cachedDaily = { ...result, timestamp: now };
      return result;
    } catch (err: any) {
      console.warn('[SpendingService] getDailySpending query error:', err.message);
      return { totalUsd: 0, totalTokens: 0, callsCount: 0 };
    }
  }

  /**
   * Retrieves spending totals since start of current calendar month.
   * Employs 2.5s in-memory caching to eliminate redundant disk scans.
   */
  static getMonthlySpending(targetDate = new Date()): { totalUsd: number; totalTokens: number; callsCount: number } {
    this.init();
    if (!this.db || !this.stmtMonthlySpending) return { totalUsd: 0, totalTokens: 0, callsCount: 0 };

    const now = Date.now();
    if (this.cachedMonthly && now - this.cachedMonthly.timestamp < this.CACHE_TTL_MS) {
      return {
        totalUsd: this.cachedMonthly.totalUsd,
        totalTokens: this.cachedMonthly.totalTokens,
        callsCount: this.cachedMonthly.callsCount,
      };
    }

    try {
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0);
      const startTs = startOfMonth.getTime();

      const row = this.stmtMonthlySpending.get(startTs) as any;
      const result = {
        totalUsd: Math.round((row?.total_usd || 0) * 10000) / 10000,
        totalTokens: Number(row?.total_tokens || 0),
        callsCount: Number(row?.calls_count || 0),
      };

      this.cachedMonthly = { ...result, timestamp: now };
      return result;
    } catch (err: any) {
      console.warn('[SpendingService] getMonthlySpending query error:', err.message);
      return { totalUsd: 0, totalTokens: 0, callsCount: 0 };
    }
  }

  /**
   * Pre-flight guard: evaluates whether current spending complies with configured caps.
   */
  static checkSpendingCap(): {
    allowed: boolean;
    reason?: string;
    dailySpendUsd: number;
    dailyCapUsd: number;
    monthlySpendUsd: number;
    monthlyCapUsd: number;
    dailyTokensUsed: number;
    dailyTokensCap: number;
    percentDailyUsed: number;
    percentMonthlyUsed: number;
  } {
    const daily = this.getDailySpending();
    const monthly = this.getMonthlySpending();

    const dailyCapUsd = SPENDING_CAP_CONFIG.DAILY_SPEND_CAP_USD;
    const monthlyCapUsd = SPENDING_CAP_CONFIG.MONTHLY_SPEND_CAP_USD;
    const dailyTokensCap = SPENDING_CAP_CONFIG.DAILY_TOKEN_CAP;

    const percentDailyUsed = dailyCapUsd > 0 ? Math.min(100, Math.round((daily.totalUsd / dailyCapUsd) * 1000) / 10) : 0;
    const percentMonthlyUsed = monthlyCapUsd > 0 ? Math.min(100, Math.round((monthly.totalUsd / monthlyCapUsd) * 1000) / 10) : 0;

    if (daily.totalUsd >= dailyCapUsd) {
      return {
        allowed: false,
        reason: `Daily AI spending cap of $${dailyCapUsd.toFixed(2)} reached (Current spend: $${daily.totalUsd.toFixed(2)}).`,
        dailySpendUsd: daily.totalUsd,
        dailyCapUsd,
        monthlySpendUsd: monthly.totalUsd,
        monthlyCapUsd,
        dailyTokensUsed: daily.totalTokens,
        dailyTokensCap,
        percentDailyUsed,
        percentMonthlyUsed,
      };
    }

    if (monthly.totalUsd >= monthlyCapUsd) {
      return {
        allowed: false,
        reason: `Monthly AI spending cap of $${monthlyCapUsd.toFixed(2)} reached (Current spend: $${monthly.totalUsd.toFixed(2)}).`,
        dailySpendUsd: daily.totalUsd,
        dailyCapUsd,
        monthlySpendUsd: monthly.totalUsd,
        monthlyCapUsd,
        dailyTokensUsed: daily.totalTokens,
        dailyTokensCap,
        percentDailyUsed,
        percentMonthlyUsed,
      };
    }

    if (daily.totalTokens >= dailyTokensCap) {
      return {
        allowed: false,
        reason: `Daily token consumption limit reached (${daily.totalTokens.toLocaleString()} / ${dailyTokensCap.toLocaleString()} tokens).`,
        dailySpendUsd: daily.totalUsd,
        dailyCapUsd,
        monthlySpendUsd: monthly.totalUsd,
        monthlyCapUsd,
        dailyTokensUsed: daily.totalTokens,
        dailyTokensCap,
        percentDailyUsed,
        percentMonthlyUsed,
      };
    }

    return {
      allowed: true,
      dailySpendUsd: daily.totalUsd,
      dailyCapUsd,
      monthlySpendUsd: monthly.totalUsd,
      monthlyCapUsd,
      dailyTokensUsed: daily.totalTokens,
      dailyTokensCap,
      percentDailyUsed,
      percentMonthlyUsed,
    };
  }

  /**
   * Formats comprehensive spending & budget breakdown for API consumers.
   */
  static getSpendingSummary(): SpendingSummary {
    const daily = this.getDailySpending();
    const monthly = this.getMonthlySpending();
    const capCheck = this.checkSpendingCap();

    const dailyCapUsd = SPENDING_CAP_CONFIG.DAILY_SPEND_CAP_USD;
    const monthlyCapUsd = SPENDING_CAP_CONFIG.MONTHLY_SPEND_CAP_USD;
    const dailyTokensCap = SPENDING_CAP_CONFIG.DAILY_TOKEN_CAP;

    let recentRecords: any[] = [];
    if (this.db && this.stmtRecentRecords) {
      try {
        recentRecords = this.stmtRecentRecords.all() as any[];
      } catch {
        recentRecords = [];
      }
    }

    return {
      daily: {
        spent_usd: daily.totalUsd,
        cap_usd: dailyCapUsd,
        remaining_usd: Math.max(0, Math.round((dailyCapUsd - daily.totalUsd) * 10000) / 10000),
        percent_used: capCheck.percentDailyUsed,
        tokens_used: daily.totalTokens,
        tokens_cap: dailyTokensCap,
        calls_count: daily.callsCount,
      },
      monthly: {
        spent_usd: monthly.totalUsd,
        cap_usd: monthlyCapUsd,
        remaining_usd: Math.max(0, Math.round((monthlyCapUsd - monthly.totalUsd) * 10000) / 10000),
        percent_used: capCheck.percentMonthlyUsed,
        calls_count: monthly.callsCount,
      },
      cap_status: {
        daily_cap_exceeded: daily.totalUsd >= dailyCapUsd,
        monthly_cap_exceeded: monthly.totalUsd >= monthlyCapUsd,
        tokens_cap_exceeded: daily.totalTokens >= dailyTokensCap,
        is_spending_capped: !capCheck.allowed,
        reason: capCheck.reason,
      },
      recent_records: recentRecords,
    };
  }

  /**
   * Resets daily spending (useful for test suites or manual overrides).
   */
  static resetDailySpending(): boolean {
    this.init();
    if (!this.db || !this.stmtDeleteDaily) return false;
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      this.stmtDeleteDaily.run(startOfDay.getTime());
      this.invalidateCache();
      return true;
    } catch {
      return false;
    }
  }
}
