import { Request, Response, NextFunction } from 'express';

/**
 * Express Request Timeout Middleware.
 * Guards routes against slow operations or hanging upstream calls.
 * If the request does not complete within `timeoutMs`, responds with HTTP 504 Gateway Timeout.
 */
export function requestTimeout(timeoutMs: number, operation = 'Request') {
  return (_req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(`[Timeout] ${operation} exceeded timeout limit of ${timeoutMs}ms`);
        res.status(504).json({
          error: 'Gateway Timeout',
          detail: `${operation} timed out after ${Math.round(timeoutMs / 1000)} seconds. Please retry.`,
          code: 'GATEWAY_TIMEOUT',
          status: 504,
          timeout: true,
          timestamp: new Date().toISOString(),
        });
      }
    }, timeoutMs);

    // Clean up timer on response completion or client disconnection
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
