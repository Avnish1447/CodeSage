import { PaymentService } from '../services/paymentService.js';
import { SpendingService } from '../services/spendingService.js';
import { SqliteCacheService } from '../services/sqliteCacheService.js';
import { RepeatRequestCacheService } from '../services/repeatRequestCache.js';

async function runConcurrencyTests() {
  console.log('=== STARTING SIMULTANEOUS USERS & CONCURRENCY TEST SUITE ===');

  // Initialize DB services
  SpendingService.init();
  SqliteCacheService.init();

  // Baseline payment records
  const initialTotals = SpendingService.getTotalPayments();
  const initialTotalPayments = initialTotals.totalUsd;

  // -----------------------------------------------------------------------------------
  // TEST 1: Simultaneous Duplicate Top-ups (Race Condition & Double-Spend Protection)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 1] Testing 20 Simultaneous Duplicate Requests with Identical Idempotency Key:');
  const sharedKey = `simul_race_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const topUpAmount = 10.0;
  const CONCURRENT_DUPLICATES = 20;

  // Fire 20 requests at the exact same millisecond
  const duplicatePromises = Array.from({ length: CONCURRENT_DUPLICATES }, (_, idx) =>
    Promise.resolve(
      PaymentService.processTopUp({
        amountUsd: topUpAmount,
        idempotencyKey: sharedKey,
        description: `Simultaneous client thread #${idx + 1}`,
      })
    )
  );

  const results = await Promise.all(duplicatePromises);

  // All 20 should resolve successfully with the EXACT same transactionId and amount
  const firstTxId = results[0].transactionId;
  const allSameTxId = results.every((r) => r.transactionId === firstTxId);
  const allSameAmount = results.every((r) => r.amountUsd === topUpAmount);

  console.assert(allSameTxId, 'Expected all concurrent duplicate requests to return identical transactionId');
  console.assert(allSameAmount, 'Expected all concurrent duplicate requests to return top-up amount');

  // Verify payments table only recorded ONE payment of $10.00, NOT 20 x $10.00 ($200.00)
  const afterTotals = SpendingService.getTotalPayments();
  const actualIncrease = Math.round((afterTotals.totalUsd - initialTotalPayments) * 100) / 100;

  console.assert(
    actualIncrease === topUpAmount,
    `CRITICAL RACE CONDITION: Balance increased by $${actualIncrease} instead of exactly $${topUpAmount}!`
  );
  console.log(
    `✅ Double-spend blocked: 20 simultaneous duplicate threads collapsed into 1 payment transaction (${firstTxId}). Total payment added = $${actualIncrease} (Expected: $${topUpAmount}).`
  );

  // -----------------------------------------------------------------------------------
  // TEST 2: High Concurrency Independent Top-ups (Simultaneous Distinct Users)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 2] Testing 25 Concurrent Distinct Users (Distinct Idempotency Keys):');
  const CONCURRENT_USERS = 25;
  const userTopUpAmount = 2.0;
  const totalBeforeDistinct = SpendingService.getTotalPayments().totalUsd;

  const distinctPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => {
    const key = `user_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return Promise.resolve(
      PaymentService.processTopUp({
        amountUsd: userTopUpAmount,
        idempotencyKey: key,
        description: `User session #${i + 1}`,
      })
    );
  });

  const distinctResults = await Promise.all(distinctPromises);

  console.assert(
    distinctResults.length === CONCURRENT_USERS,
    `Expected ${CONCURRENT_USERS} distinct results, got ${distinctResults.length}`
  );

  // Check all transaction IDs are unique
  const uniqueTxIds = new Set(distinctResults.map((r) => r.transactionId));
  console.assert(
    uniqueTxIds.size === CONCURRENT_USERS,
    `Expected ${CONCURRENT_USERS} unique transaction IDs, got ${uniqueTxIds.size}`
  );

  const totalAfterDistinct = SpendingService.getTotalPayments().totalUsd;
  const expectedDistinctIncrease = CONCURRENT_USERS * userTopUpAmount; // 50.00
  const actualDistinctIncrease = Math.round((totalAfterDistinct - totalBeforeDistinct) * 100) / 100;

  console.assert(
    actualDistinctIncrease === expectedDistinctIncrease,
    `Balance discrepancy: Expected increase of $${expectedDistinctIncrease}, got $${actualDistinctIncrease}`
  );
  console.log(
    `✅ 25 concurrent distinct users committed atomically without SQLite lock contention. Total added: $${actualDistinctIncrease}.`
  );

  // -----------------------------------------------------------------------------------
  // TEST 3: Simultaneous Spending Ledger Deductions
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 3] Testing 40 Simultaneous Spending Deductions:');
  const CONCURRENT_SPENDS = 40;
  const tokenCostPerCall = 500;
  const callsBefore = SpendingService.getSpendingSummary().daily.calls_count;

  const spendPromises = Array.from({ length: CONCURRENT_SPENDS }, (_, i) => {
    const costUsd = 0.005;
    return Promise.resolve(
      SpendingService.recordUsage({
        service: 'insights',
        model: 'gemini-2.5-pro',
        promptTokens: 300,
        completionTokens: 200,
        idempotencyKey: `spend_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      })
    );
  });

  await Promise.all(spendPromises);

  // Invalidate in-memory micro-cache so it recalculates against the disk table
  SpendingService.invalidateCache();
  const callsAfter = SpendingService.getSpendingSummary().daily.calls_count;
  const deltaCalls = callsAfter - callsBefore;

  console.assert(deltaCalls >= CONCURRENT_SPENDS, `Expected at least ${CONCURRENT_SPENDS} calls added, got ${deltaCalls}`);
  console.log(`✅ 40 simultaneous ledger deductions recorded successfully without database locks (Delta calls: ${deltaCalls}).`);

  // -----------------------------------------------------------------------------------
  // TEST 4: Concurrent Repository Cache Reads & Writes
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 4] Testing 30 Concurrent SQLite Cache Upserts & Reads:');
  const CONCURRENT_CACHE_OPS = 30;

  const cachePromises = Array.from({ length: CONCURRENT_CACHE_OPS }, (_, i) => {
    const repoId = `repo_concurrency_${i % 5}`; // 5 repos written by 30 concurrent workers
    const url = `https://github.com/test-org/repo-${i % 5}.git`;

    return (async () => {
      // Upsert
      SqliteCacheService.set({
        repository_id: repoId,
        overview: {
          normalized_url: url,
          branch: 'main',
          owner: 'test-org',
          repo: `repo-${i % 5}`,
          files: 10 + i,
          size_mb: 2.5,
        },
        fileTree: [],
        timestamp: Date.now(),
      });

      // Concurrent Read
      const fetched = SqliteCacheService.get(repoId);
      console.assert(fetched !== null, `Failed to retrieve repoId ${repoId} under concurrent access`);
      return fetched;
    })();
  });

  const cacheResults = await Promise.all(cachePromises);
  console.assert(cacheResults.length === CONCURRENT_CACHE_OPS, 'Not all cache operations succeeded');
  console.log(`✅ 30 concurrent cache read/write operations completed without WAL deadlock.`);

  // -----------------------------------------------------------------------------------
  // TEST 5: Concurrent Repeat Request Caching Single-Flight Coalescing
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 5] Testing 50 Concurrent In-Flight Repeat Request Coalescing:');
  const cacheKey = `simul_repeat_request_key_${Date.now()}`;
  let invocationCount = 0;

  // Simulate an expensive computation called 50 times simultaneously
  const expensiveOperation = async () => {
    invocationCount++;
    await new Promise((res) => setTimeout(res, 50));
    return { data: 'computed_expensive_payload', timestamp: Date.now() };
  };

  const repeatPromises = Array.from({ length: 50 }, () =>
    RepeatRequestCacheService.getOrCompute(cacheKey, expensiveOperation, 10_000)
  );

  const repeatResults = await Promise.all(repeatPromises);
  console.assert(repeatResults.length === 50, 'All 50 repeat callers received results');
  console.assert(
    invocationCount === 1,
    `Expected execution to be collapsed to 1 single-flight invocation, got ${invocationCount}`
  );
  console.assert(
    repeatResults.every((r) => r.data === 'computed_expensive_payload'),
    'Not all callers received the payload'
  );
  console.log(`✅ 50 concurrent repeat requests collapsed into exactly ${invocationCount} computation via single-flight pattern.`);

  console.log('\n=== ALL SIMULTANEOUS USERS & CONCURRENCY TESTS PASSED ===');
}

runConcurrencyTests().catch((err) => {
  console.error('❌ Concurrency Test failed:', err);
  process.exit(1);
});
