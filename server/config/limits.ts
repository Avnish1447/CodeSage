/**
 * Centralized API & Rate Limiting Configuration
 * Supports environment variable overrides for custom production deployment thresholds.
 */

// Bootstrap environment variables if not already loaded before module evaluation
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // .env file not present or unreadable, ignore
  }
}

// Rate Limiting Time Windows (Dynamic getters ensure post-boot .env overrides take effect)
export const RATE_LIMIT_CONFIG = {
  // 15-minute window for standard endpoints (in milliseconds)
  get WINDOW_MS(): number {
    return parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10);
  },

  // General API requests per IP per window (default: 120 per 15 min)
  get GENERAL_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '120', 10);
  },

  // Repository cloning / fresh digs per IP per window (default: 15 per 15 min)
  get CLONE_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_CLONE_MAX || '15', 10);
  },

  // Interactive RAG AI chat queries per IP per window (default: 40 per 15 min)
  get CHAT_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_CHAT_MAX || '40', 10);
  },

  // GitReverse prompt generation per IP per window (default: 20 per 15 min)
  get REVERSE_PROMPT_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_REVERSE_MAX || '20', 10);
  },

  // Lightweight health / polling checks per minute (default: 120 per min)
  get HEALTH_MAX(): number {
    return parseInt(process.env.RATE_LIMIT_HEALTH_MAX || '120', 10);
  },
};

// API Resource & Payload Limits
export const RESOURCE_LIMITS = {
  // Maximum request JSON / urlencoded payload size
  get MAX_BODY_SIZE(): string {
    return process.env.API_MAX_BODY_SIZE || '1mb';
  },

  // Maximum file upload size in megabytes (50 MB)
  get MAX_UPLOAD_SIZE_MB(): number {
    return parseInt(process.env.API_MAX_UPLOAD_SIZE_MB || '50', 10);
  },

  // Maximum file upload size in bytes (50 MB)
  get MAX_UPLOAD_SIZE_BYTES(): number {
    return parseInt(process.env.API_MAX_UPLOAD_SIZE_BYTES || `${50 * 1024 * 1024}`, 10);
  },

  // Maximum files allowed in a single repository clone
  get MAX_REPO_FILES(): number {
    return parseInt(process.env.API_MAX_REPO_FILES || '1200', 10);
  },

  // Maximum repository disk size allowed in megabytes
  get MAX_REPO_SIZE_MB(): number {
    return parseInt(process.env.API_MAX_REPO_SIZE_MB || '50', 10);
  },

  // Maximum file preview payload in bytes (512 KB)
  get MAX_PREVIEW_BYTES(): number {
    return parseInt(process.env.API_MAX_PREVIEW_BYTES || `${512 * 1024}`, 10);
  },

  // Maximum user chat prompt length in characters
  get MAX_CHAT_MESSAGE_LENGTH(): number {
    return parseInt(process.env.API_MAX_CHAT_MESSAGE_LENGTH || '4000', 10);
  },

  // Maximum repository URL character length
  get MAX_URL_LENGTH(): number {
    return parseInt(process.env.API_MAX_URL_LENGTH || '500', 10);
  },

  // Maximum branch name character length
  get MAX_BRANCH_NAME_LENGTH(): number {
    return parseInt(process.env.API_MAX_BRANCH_NAME_LENGTH || '100', 10);
  },
};

// Spending Caps & Budget Controls
export const SPENDING_CAP_CONFIG = {
  // Daily spending limit in USD (default: $5.00/day)
  get DAILY_SPEND_CAP_USD(): number {
    return parseFloat(process.env.SPENDING_CAP_DAILY_USD || '5.00');
  },

  // Monthly spending limit in USD (default: $50.00/month)
  get MONTHLY_SPEND_CAP_USD(): number {
    return parseFloat(process.env.SPENDING_CAP_MONTHLY_USD || '50.00');
  },

  // Daily token consumption ceiling across all AI calls (default: 1,000,000 tokens)
  get DAILY_TOKEN_CAP(): number {
    return parseInt(process.env.SPENDING_CAP_DAILY_TOKENS || '1000000', 10);
  },

  // Maximum output tokens allowed per Gemini generation
  get MAX_OUTPUT_TOKENS(): number {
    return parseInt(process.env.SPENDING_MAX_OUTPUT_TOKENS || '2048', 10);
  },

  // Cost estimates for Gemini Flash tiers ($ per 1,000 tokens)
  COST_PER_1K_INPUT_TOKENS: 0.0001,  // $0.10 per 1M tokens
  COST_PER_1K_OUTPUT_TOKENS: 0.0004, // $0.40 per 1M tokens
};

// API & External Service Timeouts (in milliseconds)
export const TIMEOUT_CONFIG = {
  // Git repository clone timeout (default: 45s)
  get CLONE_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_CLONE_MS || '45000', 10);
  },

  // Remote branch listing timeout via git ls-remote (default: 12s)
  get LS_REMOTE_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_LS_REMOTE_MS || '12000', 10);
  },

  // Fallback GitHub Tree API fetch timeout (default: 15s)
  get GITHUB_API_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GITHUB_API_MS || '15000', 10);
  },

  // Gemini insights generation timeout (default: 25s)
  get GEMINI_INSIGHTS_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GEMINI_INSIGHTS_MS || '25000', 10);
  },

  // Gemini chat query stream initial chunk timeout (default: 35s)
  get GEMINI_CHAT_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GEMINI_CHAT_MS || '35000', 10);
  },

  // Gemini health probe timeout (default: 8s)
  get GEMINI_PROBE_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GEMINI_PROBE_MS || '8000', 10);
  },

  // GitReverse API request timeout (default: 8s)
  get GITREVERSE_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GITREVERSE_MS || '8000', 10);
  },

  // Global repository excavation HTTP request timeout (default: 90s)
  get EXCAVATION_HTTP_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_EXCAVATION_HTTP_MS || '90000', 10);
  },

  // General HTTP request timeout for standard REST queries (default: 30s)
  get GENERAL_REQUEST_TIMEOUT_MS(): number {
    return parseInt(process.env.TIMEOUT_GENERAL_REQUEST_MS || '30000', 10);
  },
};
