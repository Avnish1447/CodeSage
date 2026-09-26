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
  }>;
}

export class SpendingService {
  private static db: any = null;
  private static DB_PATH = path.join('storage', 'codesage_cache.db');

  private static get isAvailable(): boolean {
    return typeof DatabaseSync === 'function';
  }

  static init(): void {
    if (!this.isAvailable || this.db) return;

    try {
      const dir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new DatabaseSync(this.DB_PATH);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS spending_ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp INTEGER NOT NULL,
          service TEXT NOT NULL,
          model TEXT,
          prompt_tokens INTEGER NOT NULL,
          completion_tokens INTEGER NOT NULL,
          total_tokens INTEGER NOT NULL,
          estimated_cost_usd REAL NOT NULL,
          repository_id TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_spending_ts ON spending_ledger(timestamp);
      `);
    } catch (err: any) {
      console.warn('[SpendingService] Failed to initialize spending database:', err.message);
      this.db = null;
    }
  }

  /**
   * Records token usage and calculates estimated cost based on tiered pricing.
   */
  static recordUsage(params: UsageRecordParams): { estimatedCostUsd: number; totalTokens: number } {
    this.init();
    const promptTokens = Math.max(0, Math.round(params.promptTokens || 0));
    const completionTokens = Math.max(0, Math.round(params.completionTokens || 0));
    const totalTokens = promptTokens + completionTokens;

    // Calculate cost in USD using configured rates
    const promptCost = (promptTokens / 1000) * SPENDING_CAP_CONFIG.COST_PER_1K_INPUT_TOKENS;
    const completionCost = (completionTokens / 1000) * SPENDING_CAP_CONFIG.COST_PER_1K_OUTPUT_TOKENS;
    const estimatedCostUsd = Math.round((promptCost + completionCost) * 1000000) / 1000000;

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO spending_ledger (
            timestamp, service, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, repository_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          Date.now(),
          params.service,
          params.model || 'gemini-flash',
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd,
          params.repositoryId || ''
        );
      } catch (err: any) {
        console.warn('[SpendingService] Failed to insert usage record:', err.message);
      }
    }

    return { estimatedCostUsd, totalTokens };
  }

  /**
   * Retrieves spending totals since beginning of today (local time midnight).
   */
  static getDailySpending(targetDate = new Date()): { totalUsd: number; totalTokens: number; callsCount: number } {
    this.init();
    if (!this.db) return { totalUsd: 0, totalTokens: 0, callsCount: 0 };

    try {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const startTs = startOfDay.getTime();

      const stmt = this.db.prepare(`
        SELECT
          COALESCE(SUM(estimated_cost_usd), 0) AS total_usd,
          COALESCE(SUM(total_tokens), 0) AS total_tokens,
          COUNT(*) AS calls_count
        FROM spending_ledger
        WHERE timestamp >= ?
      `);
      const row = stmt.get(startTs) as any;
      return {
        totalUsd: Math.round((row?.total_usd || 0) * 10000) / 10000,
        totalTokens: Number(row?.total_tokens || 0),
        callsCount: Number(row?.calls_count || 0),
      };
    } catch (err: any) {
      console.warn('[SpendingService] getDailySpending query error:', err.message);
      return { totalUsd: 0, totalTokens: 0, callsCount: 0 };
    }
  }

  /**
   * Retrieves spending totals since start of current calendar month.
   */
  static getMonthlySpending(targetDate = new Date()): { totalUsd: number; totalTokens: number; callsCount: number } {
    this.init();
    if (!this.db) return { totalUsd: 0, totalTokens: 0, callsCount: 0 };

    try {
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0);
      const startTs = startOfMonth.getTime();

      const stmt = this.db.prepare(`
        SELECT
          COALESCE(SUM(estimated_cost_usd), 0) AS total_usd,
          COALESCE(SUM(total_tokens), 0) AS total_tokens,
          COUNT(*) AS calls_count
        FROM spending_ledger
        WHERE timestamp >= ?
      `);
      const row = stmt.get(startTs) as any;
      return {
        totalUsd: Math.round((row?.total_usd || 0) * 10000) / 10000,
        totalTokens: Number(row?.total_tokens || 0),
        callsCount: Number(row?.calls_count || 0),
      };
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
    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM spending_ledger
          ORDER BY timestamp DESC
          LIMIT 10
        `);
        recentRecords = stmt.all() as any[];
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
    if (!this.db) return false;
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const stmt = this.db.prepare('DELETE FROM spending_ledger WHERE timestamp >= ?');
      stmt.run(startOfDay.getTime());
      return true;
    } catch {
      return false;
    }
  }
}
