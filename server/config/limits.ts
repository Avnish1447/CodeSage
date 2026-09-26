/**
 * Centralized API & Rate Limiting Configuration
 * Supports environment variable overrides for custom production deployment thresholds.
 */

// Rate Limiting Time Windows
export const RATE_LIMIT_CONFIG = {
  // 15-minute window for standard endpoints (in milliseconds)
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),

  // General API requests per IP per window (default: 120 per 15 min)
  GENERAL_MAX: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '120', 10),

  // Repository cloning / fresh digs per IP per window (default: 15 per 15 min)
  CLONE_MAX: parseInt(process.env.RATE_LIMIT_CLONE_MAX || '15', 10),

  // Interactive RAG AI chat queries per IP per window (default: 40 per 15 min)
  CHAT_MAX: parseInt(process.env.RATE_LIMIT_CHAT_MAX || '40', 10),

  // GitReverse prompt generation per IP per window (default: 20 per 15 min)
  REVERSE_PROMPT_MAX: parseInt(process.env.RATE_LIMIT_REVERSE_MAX || '20', 10),

  // Lightweight health / polling checks per minute (default: 120 per min)
  HEALTH_MAX: parseInt(process.env.RATE_LIMIT_HEALTH_MAX || '120', 10),
};

// API Resource & Payload Limits
export const RESOURCE_LIMITS = {
  // Maximum request JSON / urlencoded payload size
  MAX_BODY_SIZE: process.env.API_MAX_BODY_SIZE || '1mb',

  // Maximum files allowed in a single repository clone
  MAX_REPO_FILES: parseInt(process.env.API_MAX_REPO_FILES || '1200', 10),

  // Maximum repository disk size allowed in megabytes
  MAX_REPO_SIZE_MB: parseInt(process.env.API_MAX_REPO_SIZE_MB || '50', 10),

  // Maximum file preview payload in bytes (512 KB)
  MAX_PREVIEW_BYTES: parseInt(process.env.API_MAX_PREVIEW_BYTES || `${512 * 1024}`, 10),

  // Maximum user chat prompt length in characters
  MAX_CHAT_MESSAGE_LENGTH: parseInt(process.env.API_MAX_CHAT_MESSAGE_LENGTH || '4000', 10),

  // Maximum repository URL character length
  MAX_URL_LENGTH: parseInt(process.env.API_MAX_URL_LENGTH || '500', 10),

  // Maximum branch name character length
  MAX_BRANCH_NAME_LENGTH: parseInt(process.env.API_MAX_BRANCH_NAME_LENGTH || '100', 10),
};

// Spending Caps & Budget Controls
export const SPENDING_CAP_CONFIG = {
  // Daily spending limit in USD (default: $5.00/day)
  DAILY_SPEND_CAP_USD: parseFloat(process.env.SPENDING_CAP_DAILY_USD || '5.00'),

  // Monthly spending limit in USD (default: $50.00/month)
  MONTHLY_SPEND_CAP_USD: parseFloat(process.env.SPENDING_CAP_MONTHLY_USD || '50.00'),

  // Daily token consumption ceiling across all AI calls (default: 1,000,000 tokens)
  DAILY_TOKEN_CAP: parseInt(process.env.SPENDING_CAP_DAILY_TOKENS || '1000000', 10),

  // Maximum output tokens allowed per Gemini generation
  MAX_OUTPUT_TOKENS: parseInt(process.env.SPENDING_MAX_OUTPUT_TOKENS || '2048', 10),

  // Cost estimates for Gemini Flash tiers ($ per 1,000 tokens)
  COST_PER_1K_INPUT_TOKENS: 0.0001,  // $0.10 per 1M tokens
  COST_PER_1K_OUTPUT_TOKENS: 0.0004, // $0.40 per 1M tokens
};
