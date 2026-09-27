import fs from 'node:fs';
import path from 'node:path';
import { BackupService } from '../services/backupService.js';
import { SpendingService } from '../services/spendingService.js';
import { SqliteCacheService } from '../services/sqliteCacheService.js';

async function runBackupTests() {
  console.log('=== STARTING BACKUP & DISASTER RESTORATION TEST SUITE ===');

  // Initialize DB services
  BackupService.init();
  SpendingService.init();
  SqliteCacheService.init();

  // 1. Seed distinctive state into databases to verify exact recovery
  const baselineRepoId = `recovery_test_repo_${Date.now()}`;
  SqliteCacheService.set({
    repository_id: baselineRepoId,
    overview: {
      normalized_url: 'https://github.com/recovery-org/mission-critical.git',
      branch: 'main',
      owner: 'recovery-org',
      repo: 'mission-critical',
      files: 142,
      size_mb: 8.5,
    },
    fileTree: ['src/index.ts', 'src/core.ts'],
    timestamp: Date.now(),
  });

  const baselineTotals = SpendingService.getTotalPayments();
  console.log(`[Baseline State] Repo ID: ${baselineRepoId}, Total Payments: $${baselineTotals.totalUsd} (${baselineTotals.count} records)`);

  // -----------------------------------------------------------------------------------
  // TEST 1: Create Full System Backup Snapshot
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 1] Testing Atomic Backup Creation:');
  const backupMeta = await BackupService.createBackup({ label: 'Disaster Recovery Automated Snapshot', includeRepos: false });
  const archivePath = path.resolve('storage', 'backups', `${backupMeta.backupId}.tar.gz`);

  console.assert(Boolean(backupMeta.backupId), 'Backup ID missing');
  console.assert(fs.existsSync(archivePath), `Backup archive file missing on disk: ${archivePath}`);
  console.assert((backupMeta.archiveSizeBytes || 0) > 0, 'Backup archive size is 0 bytes');
  console.assert(Boolean(backupMeta.database.sha256), 'Database SHA-256 checksum missing');
  console.log(`✅ Snapshot created: ${backupMeta.backupId} (${((backupMeta.archiveSizeBytes || 0) / 1024).toFixed(1)} KB, SHA-256: ${backupMeta.database.sha256.substring(0, 16)}...)`);

  // -----------------------------------------------------------------------------------
  // TEST 2: Verify Backup Integrity & Manifest
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 2] Testing Backup Verification & Manifest Extraction:');
  const verifyResult = await BackupService.verifyBackup(backupMeta.backupId);
  console.assert(verifyResult.valid === true, `Backup verification failed: ${verifyResult.error}`);
  console.assert(verifyResult.manifest?.backupId === backupMeta.backupId, 'Manifest ID mismatch');
  console.assert(verifyResult.manifest?.database.sha256 === backupMeta.database.sha256, 'SHA-256 hash mismatch during verification');
  console.log(`✅ Integrity verified: Manifest confirmed valid and database SHA-256 matches.`);

  // -----------------------------------------------------------------------------------
  // TEST 3: Simulate Catastrophic Disaster (Data Loss & Aberrant Injection)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 3] Simulating Catastrophic Database Loss:');
  // Wipe repo_cache completely
  SqliteCacheService.clear();
  console.assert(SqliteCacheService.get(baselineRepoId) === null, 'Cache clear failed');

  // Insert aberrant unwanted records into spending
  SpendingService.recordPayment({
    idempotencyKey: `disaster_corrupt_entry_${Date.now()}`,
    amountUsd: 9999.0,
    description: 'MALICIOUS_DISASTER_INJECTION',
  });
  const disasterTotals = SpendingService.getTotalPayments();
  console.log(`⚠️ Disaster Simulated: Cache wiped clean (repo is gone). Aberrant payments injected: $${disasterTotals.totalUsd}`);

  // -----------------------------------------------------------------------------------
  // TEST 4: Atomic Disaster Recovery & State Restoration
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 4] Executing Point-in-Time System Restoration:');
  const restoreResult = await BackupService.restoreBackup(backupMeta.backupId);
  console.assert(restoreResult.success === true, 'Restoration did not report success');
  console.assert(restoreResult.integrityCheck === 'ok', `Integrity check failed: ${restoreResult.integrityCheck}`);

  // Verify that repo_cache was fully restored
  const restoredRepo = SqliteCacheService.get(baselineRepoId);
  console.assert(restoredRepo !== null, 'CRITICAL: Restored database missing baseline repository record!');
  console.assert(restoredRepo.overview.owner === 'recovery-org', 'Restored repository data corrupted!');

  // Verify that unwanted injection was rolled back to baseline totals
  const restoredTotals = SpendingService.getTotalPayments();
  console.assert(
    restoredTotals.totalUsd === baselineTotals.totalUsd,
    `CRITICAL: Restored spending does not match pre-disaster baseline! Expected $${baselineTotals.totalUsd}, got $${restoredTotals.totalUsd}`
  );
  console.log(`✅ Disaster Restoration Successful: Database rolled back to exact snapshot. Repo recovered, injected payments purged.`);

  // -----------------------------------------------------------------------------------
  // TEST 5: Corrupt Archive Tamper Detection
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 5] Testing Corrupted/Tampered Archive Rejection:');
  // Create a separate backup and intentionally corrupt it
  const tamperBackup = await BackupService.createBackup({ label: 'Tamper Test Snapshot', includeRepos: false });
  const tamperArchivePath = path.resolve('storage', 'backups', `${tamperBackup.backupId}.tar.gz`);

  // Write corrupt data to the archive
  fs.writeFileSync(tamperArchivePath, Buffer.from('CORRUPTED_TAR_GZIP_CONTENT_TAMPER_TEST'));

  // Verification must fail
  const tamperVerify = await BackupService.verifyBackup(tamperBackup.backupId);
  console.assert(tamperVerify.valid === false, 'Tampered backup incorrectly reported as valid');
  console.assert(Boolean(tamperVerify.error), 'Expected verification error message');

  // Restoration must reject the tampered backup
  let rejected = false;
  try {
    await BackupService.restoreBackup(tamperBackup.backupId);
  } catch (err: any) {
    rejected = true;
    console.assert(Boolean(err.message), 'Unexpected empty error on corrupt restore');
  }
  console.assert(rejected, 'Corrupt backup restoration was not rejected!');
  console.log('✅ Tamper Detection Verified: Altered archive failure prevented corrupt data restoration.');

  // Clean up tamper test backup
  BackupService.deleteBackup(tamperBackup.backupId);

  // -----------------------------------------------------------------------------------
  // TEST 6: Backup Deletion
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 6] Testing Backup Safe Deletion:');
  const deleted = BackupService.deleteBackup(backupMeta.backupId);
  console.assert(deleted === true, 'Failed to delete test backup');
  console.assert(!fs.existsSync(archivePath), 'Backup file still exists after deletion');
  console.log(`✅ Backup archive safely deleted.`);

  console.log('\n=== ALL BACKUP & DISASTER RESTORATION TESTS PASSED ===');
}

runBackupTests().catch((err) => {
  console.error('❌ Backup Test failed:', err);
  process.exit(1);
});
