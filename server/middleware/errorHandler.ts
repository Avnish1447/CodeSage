import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError.js';
import { RESOURCE_LIMITS } from '../config/limits.js';
import { ErrorLoggingService } from '../services/errorLoggingService.js';

/**
 * Higher-order async route wrapper to eliminate repetitive try-catch blocks
 * and guarantee all promise rejections are forwarded to the centralized error middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Centralized Express Error Handling Middleware.
 * Standardizes API error responses into predictable JSON payloads
 * and logs all operational and fatal errors to persistent indexed error logs.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  // If response headers were already sent (e.g. midway through SSE streaming), delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handled Domain AppError instances
  if (err instanceof AppError) {
    ErrorLoggingService.logError(err, req);
    return res.status(err.statusCode).json({
      error: err.name,
      detail: err.detail,
      code: err.code,
      status: err.statusCode,
      timestamp: new Date().toISOString(),
      ...(err.code === 'RATE_LIMIT_EXCEEDED' && (err as any).retryAfterSeconds
        ? { retry_after_seconds: (err as any).retryAfterSeconds }
        : {}),
    });
  }

  // 2. Express Body-Parser: Payload Too Large
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    const errorObj = {
      name: 'PayloadTooLargeError',
      code: 'PAYLOAD_TOO_LARGE',
      statusCode: 413,
      message: `Request body exceeds maximum permitted size of ${RESOURCE_LIMITS.MAX_BODY_SIZE}.`,
    };
    ErrorLoggingService.logError(errorObj, req);
    return res.status(413).json({
      error: 'Payload Too Large',
      detail: errorObj.message,
      code: errorObj.code,
      status: 413,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Express Body-Parser: Malformed JSON Syntax
  if (err instanceof SyntaxError && 'body' in err) {
    const errorObj = {
      name: 'InvalidJsonError',
      code: 'INVALID_JSON',
      statusCode: 400,
      message: 'Malformed JSON payload syntax.',
    };
    ErrorLoggingService.logError(errorObj, req);
    return res.status(400).json({
      error: 'Bad Request',
      detail: errorObj.message,
      code: errorObj.code,
      status: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Git / Repository specific error instances
  if (err?.name === 'RepoCloneError' || err?.name === 'RepositoryLimitError') {
    const statusCode = err?.name === 'RepositoryLimitError' ? 413 : 400;
    const code = err?.name === 'RepositoryLimitError' ? 'REPOSITORY_LIMIT_EXCEEDED' : 'REPO_CLONE_FAILED';
    ErrorLoggingService.logError({ ...err, statusCode, code }, req);
    return res.status(statusCode).json({
      error: err.name,
      detail: err.message,
      code,
      status: statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Timeout Errors (504 Gateway Timeout)
  if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError' || err?.status === 504) {
    const errorObj = {
      name: 'TimeoutError',
      code: 'GATEWAY_TIMEOUT',
      statusCode: 504,
      message: err.message || 'Operation timed out.',
    };
    ErrorLoggingService.logError(errorObj, req);
    return res.status(504).json({
      error: 'Gateway Timeout',
      detail: errorObj.message,
      code: errorObj.code,
      status: 504,
      timeout: true,
      timestamp: new Date().toISOString(),
    });
  }

  // 6. Unhandled Server Exceptions (Internal 500)
  ErrorLoggingService.logError(err, req);
  const isDev = process.env.NODE_ENV !== 'production';

  return res.status(500).json({
    error: 'Internal Server Error',
    detail: isDev ? err?.message || 'An unexpected internal error occurred.' : 'An internal server error occurred.',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    timestamp: new Date().toISOString(),
  });
}
