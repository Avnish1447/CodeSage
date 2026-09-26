/**
 * Centralized Application Error Classes
 * Provides structured errors with HTTP status codes and machine-readable error codes.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly detail: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', detail?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.detail = detail || message;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when spending caps (daily or monthly USD limits / token caps) are exceeded.
 */
export class SpendingCapError extends AppError {
  constructor(message: string, detail?: string) {
    super(message, 402, 'SPENDING_CAP_EXCEEDED', detail || message);
  }
}

/**
 * Thrown when user inputs fail validation.
 */
export class ValidationError extends AppError {
  constructor(message: string, detail?: string) {
    super(message, 400, 'VALIDATION_ERROR', detail || message);
  }
}

/**
 * Thrown when a requested resource (e.g. repository, file, branch) cannot be found.
 */
export class NotFoundError extends AppError {
  constructor(message: string, detail?: string) {
    super(message, 404, 'NOT_FOUND', detail || message);
  }
}

/**
 * Thrown when rate limits are exceeded.
 */
export class RateLimitError extends AppError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number, detail?: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', detail || message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Thrown when repository exceeds file count or size constraints.
 */
export class RepositoryLimitError extends AppError {
  constructor(message: string, detail?: string) {
    super(message, 413, 'REPOSITORY_LIMIT_EXCEEDED', detail || message);
  }
}

/**
 * Thrown when repository clone or git operations fail.
 */
export class RepoCloneError extends AppError {
  constructor(message: string, detail?: string) {
    super(message, 400, 'REPO_CLONE_FAILED', detail || message);
  }
}
