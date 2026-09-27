import { Request, Response, NextFunction } from 'express';
import { UptimeMonitoringService } from '../services/uptimeService.js';

/**
 * Uptime & Request Telemetry Middleware.
 * Measures response latency, records HTTP status codes, and feeds live metrics to UptimeMonitoringService.
 */
export function uptimeTracker() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();

    res.on('finish', () => {
      const durationMs = parseFloat((performance.now() - startTime).toFixed(2));
      UptimeMonitoringService.recordRequest(res.statusCode, durationMs);
    });

    next();
  };
}
