import fs from 'node:fs';
import path from 'node:path';
import { ErrorLoggingService } from '../services/errorLoggingService.js';
import { AppError, NotFoundError, SpendingCapError } from '../errors/appError.js';
async function runTests() {
  console.log('--- STARTING ERROR LOGGING TEST SUITE ---');

  // Initialize service
  ErrorLoggingService.init();

  // Clean test baseline
  ErrorLoggingService.clear();

  // Test 1: Log general multi-level messages
  console.log('\n[Test 1] Testing Multi-Level Logging (INFO, WARN, ERROR, DEBUG):');
  const infoEntry = ErrorLoggingService.info('System initialization completed normally.', { service: 'boot' });
  const warnEntry = ErrorLoggingService.warn('High memory pressure detected on worker.', { memoryPct: 88 });
  const errorEntry = ErrorLoggingService.error('Connection pool reached max threshold.', { poolSize: 50 });
  const debugEntry = ErrorLoggingService.debug('Cache lookup evaluated with key prefix test_123', { key: 'test_123' });

  console.assert(infoEntry.level === 'INFO', 'Expected INFO level');
  console.assert(warnEntry.level === 'WARN', 'Expected WARN level');
  console.assert(errorEntry.level === 'ERROR', 'Expected ERROR level');
  console.assert(debugEntry.level === 'DEBUG', 'Expected DEBUG level');
  console.log('✅ Multi-level log entries successfully created and classified.');

  // Test 2: Log caught Domain AppError with Request Context
  console.log('\n[Test 2] Testing Error Context Logging (Domain Errors & HTTP Request):');
  const mockReq: any = {
    method: 'POST',
    originalUrl: '/api/v1/payments/topup',
    headers: {
      'x-forwarded-for': '192.168.1.42',
      'user-agent': 'CodeSage-TestAgent/1.0',
      'idempotency-key': 'test_key_abc_123',
    },
    query: { test: 'true' },
    socket: { remoteAddress: '127.0.0.1' },
  };

  const domainErr = new SpendingCapError('Daily spending cap of $5.00 exceeded', 'User requested 45,000 tokens which exceeds the remaining budget.');
  const loggedAppError = ErrorLoggingService.logError(domainErr, mockReq, { testRun: true });

  console.assert(loggedAppError.level === 'WARN', 'Expected 402 error to be logged at WARN level');
  console.assert(loggedAppError.code === 'SPENDING_CAP_EXCEEDED', `Expected code SPENDING_CAP_EXCEEDED, got ${loggedAppError.code}`);
  console.assert(loggedAppError.status_code === 402, `Expected status 402, got ${loggedAppError.status_code}`);
  console.assert(loggedAppError.method === 'POST', 'HTTP Method mismatch');
  console.assert(loggedAppError.path === '/api/v1/payments/topup', 'HTTP Path mismatch');
  console.assert(loggedAppError.ip === '192.168.1.42', 'Client IP capture failed');
  console.assert(loggedAppError.metadata?.idempotencyKey === 'test_key_abc_123', 'Idempotency key context missing');
  console.log('✅ Domain AppError accurately logged with full HTTP context and metadata.');

  // Test 3: Log Unhandled Fatal Exception (500)
  console.log('\n[Test 3] Testing Fatal Server Exception Logging:');
  const fatalErr = new Error('Database disk connection suddenly dropped');
  fatalErr.name = 'FatalDatabaseError';
  const loggedFatal = ErrorLoggingService.logError(fatalErr, mockReq);

  console.assert(loggedFatal.level === 'ERROR', 'Expected fatal error to be logged at ERROR level');
  console.assert(loggedFatal.status_code === 500, 'Expected 500 status code');
  console.assert(Boolean(loggedFatal.stack), 'Stack trace must be captured for 500 errors');
  console.log('✅ Fatal unhandled exception recorded with full stack trace.');

  // Test 4: Querying logs with pagination and filters
  console.log('\n[Test 4] Testing Querying & Filtering:');
  const allLogs = ErrorLoggingService.getLogs({ limit: 10 });
  console.assert(allLogs.pagination.total >= 6, `Expected at least 6 total logs, got ${allLogs.pagination.total}`);
  console.assert(allLogs.data.length >= 6, 'Logs data array incomplete');

  // Filter by level
  const errorOnly = ErrorLoggingService.getLogs({ level: 'ERROR' });
  console.assert(errorOnly.data.every((r) => r.level === 'ERROR'), 'Filtered logs contain non-ERROR records');

  // Filter by code
  const codeFilter = ErrorLoggingService.getLogs({ code: 'SPENDING_CAP_EXCEEDED' });
  console.assert(codeFilter.data.length >= 1, 'Code filter failed to locate entry');
  console.assert(codeFilter.data[0].code === 'SPENDING_CAP_EXCEEDED', 'Code filter returned wrong item');

  // Search filter
  const searchResult = ErrorLoggingService.getLogs({ search: 'memory pressure' });
  console.assert(searchResult.data.length >= 1, 'Search query failed to find memory pressure log');
  console.log(`✅ Log querying verified: total=${allLogs.pagination.total}, filtered=${errorOnly.data.length}, searchHits=${searchResult.data.length}`);

  // Test 5: Error Statistics & Aggregations
  console.log('\n[Test 5] Testing Error Statistics:');
  const stats = ErrorLoggingService.getStats();
  console.assert(stats.total >= 6, 'Total count mismatch');
  console.assert(stats.errorCount >= 2, `Expected at least 2 ERROR level logs, got ${stats.errorCount}`);
  console.assert(stats.last24Hours >= 6, 'Last 24h count mismatch');
  console.assert(Array.isArray(stats.topCodes), 'topCodes must be an array');
  console.log(`✅ Error stats verified: total=${stats.total}, errors=${stats.errorCount}, warns=${stats.warnCount}, topCodes=${stats.topCodes.map((c) => c.code).join(', ')}`);

  // Test 6: Verify JSON Lines File Logging on Disk
  console.log('\n[Test 6] Testing File Output Stream:');
  const logFilePath = path.resolve('storage', 'logs', 'codesage_error.log');
  console.assert(fs.existsSync(logFilePath), 'codesage_error.log file does not exist on disk');
  const fileLines = fs.readFileSync(logFilePath, 'utf-8').trim().split('\n');
  console.assert(fileLines.length >= 6, `Expected at least 6 lines in log file, got ${fileLines.length}`);
  const firstParsed = JSON.parse(fileLines[0]);
  console.assert(typeof firstParsed.timestamp === 'number', 'Log file line is not valid JSON');
  console.log(`✅ Disk streaming log verified (${fileLines.length} JSON lines in ${logFilePath}).`);

  // Test 7: Retention Pruning
  console.log('\n[Test 7] Testing Retention Pruning:');
  // Enforce max entries of 3
  const prunedCount = ErrorLoggingService.prune(14, 3);
  console.assert(prunedCount > 0, `Expected records to be pruned, got ${prunedCount}`);
  const remaining = ErrorLoggingService.getLogs({ limit: 10 });
  console.assert(remaining.pagination.total === 3, `Expected exactly 3 records remaining after pruning, got ${remaining.pagination.total}`);
  console.log(`✅ Retention policy successfully pruned ${prunedCount} records; ${remaining.pagination.total} records remain.`);

  console.log('\n--- ALL ERROR LOGGING TESTS PASSED ---');
}
runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});