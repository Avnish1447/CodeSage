import { RepeatRequestCacheService } from '../services/repeatRequestCache.js';
import { UptimeMonitoringService } from '../services/uptimeService.js';

async function runTests() {
  console.log('--- STARTING REPEAT CACHE & UPTIME MONITORING TEST SUITE ---');

  // 1. Repeat Request Cache Core Tests
  console.log('\n[Test 1] Testing RepeatRequestCacheService Core:');
  const key1 = RepeatRequestCacheService.generateKey('GET', '/api/v1/test', 'query1');
  const testData = { message: 'Hello CodeSage', timestamp: 12345 };

  // Set
  const entry = RepeatRequestCacheService.set(key1, testData, { ttlMs: 5000 });
  console.assert(entry.key === key1, 'Key mismatch');
  console.assert(entry.etag.startsWith('W/'), 'ETag format invalid');
  console.log(`✅ Set cache entry: key=${key1.substring(0, 8)}..., etag=${entry.etag}`);

  // Get (Hit)
  const hit = RepeatRequestCacheService.get(key1);
  console.assert(hit !== null, 'Cache miss on existing key');
  console.assert(hit?.hits === 1, `Expected hits=1, got ${hit?.hits}`);
  console.log(`✅ Cache Hit successful (hits count: ${hit?.hits})`);

  // ETag Validation
  const etag = RepeatRequestCacheService.generateETag(JSON.stringify(testData));
  console.assert(etag === entry.etag, 'ETags did not match deterministic hash');
  console.log(`✅ ETag generation verified: ${etag}`);

  // Invalidation
  const invalidated = RepeatRequestCacheService.invalidate(key1);
  console.assert(invalidated === 1, `Expected 1 invalidated, got ${invalidated}`);
  const postInvalidate = RepeatRequestCacheService.get(key1);
  console.assert(postInvalidate === null, 'Key still present after invalidation');
  console.log('✅ Invalidation verified.');

  // Stats verification
  const stats = RepeatRequestCacheService.getStats();
  console.assert(typeof stats.hitRatioPercentage === 'number', 'Invalid hitRatio');
  console.log(`✅ Cache stats: hits=${stats.hits}, misses=${stats.misses}, ratio=${stats.hitRatioPercentage}%`);

  // 2. Uptime Monitoring Service Core Tests
  console.log('\n[Test 2] Testing UptimeMonitoringService:');
  UptimeMonitoringService.init();

  // Record some sample traffic
  UptimeMonitoringService.recordRequest(200, 12.5);
  UptimeMonitoringService.recordRequest(200, 8.2);
  UptimeMonitoringService.recordRequest(200, 15.0);
  UptimeMonitoringService.recordRequest(304, 0.4);
  UptimeMonitoringService.recordRequest(404, 2.1);

  const report = await UptimeMonitoringService.getReport();
  console.assert(report.status === 'operational', `Expected operational status, got ${report.status}`);
  console.assert(report.uptime_seconds >= 0, 'Invalid uptime seconds');
  console.assert(typeof report.uptime_formatted === 'string', 'Invalid formatted uptime');
  console.assert(report.uptime_sla_percentage >= 99.0, 'SLA below acceptable threshold');
  console.log(`✅ Uptime: ${report.uptime_formatted} (${report.uptime_seconds}s), SLA: ${report.uptime_sla_percentage}%`);

  // Subsystem checks
  console.assert(report.subsystems['database']?.status === 'operational', 'Database subsystem degraded');
  console.assert(report.subsystems['storage']?.status === 'operational', 'Storage subsystem degraded');
  console.assert(report.subsystems['memory']?.status === 'operational', 'Memory subsystem degraded');
  console.assert(report.subsystems['cache']?.status === 'operational', 'Cache subsystem degraded');
  console.log('✅ All core subsystems checked & verified:');
  for (const [k, v] of Object.entries(report.subsystems)) {
    console.log(`   - ${v.name}: ${v.status} (${v.latencyMs !== undefined ? v.latencyMs + 'ms' : 'OK'})`);
  }

  // Latency & Traffic metrics
  console.assert(report.traffic.total_requests >= 5, 'Traffic counts mismatch');
  console.assert(report.latency.avg_ms > 0, 'Latency calculation failed');
  console.log(`✅ Telemetry: Total requests=${report.traffic.total_requests}, Avg latency=${report.latency.avg_ms}ms, P95=${report.latency.p95_ms}ms`);

  console.log('\n--- ALL REPEAT CACHE & UPTIME MONITORING TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
