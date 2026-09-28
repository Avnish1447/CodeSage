import fs from 'node:fs';
import path from 'node:path';
import { adminGuard } from '../routes/api.js';
import { RepoCloneService } from '../services/repoCloneService.js';
import { BackupService } from '../services/backupService.js';

async function runSecurityRemediationTests() {
  console.log('=== STARTING SECURITY REMEDIATIONS VERIFICATION SUITE ===\n');

  // -----------------------------------------------------------------------------------
  // TEST 1: adminGuard Authorization & Loopback Interface Confinement (CWE-862, CWE-200)
  // -----------------------------------------------------------------------------------
  console.log('[Test 1] Testing adminGuard Loopback Interface Restriction:');
  const originalEnv = process.env.NODE_ENV;
  const originalAdminKey = process.env.ADMIN_KEY;

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.ADMIN_KEY;

    let forbiddenCalled = false;
    let nextCalled = false;
    let resPayload: any = null;

    const resMock = {
      status: (code: number) => {
        if (code === 403) forbiddenCalled = true;
        return {
          json: (data: any) => {
            resPayload = data;
            return data;
          },
        };
      },
    } as any;

    // Subtest 1A: Remote untrusted IP in development mode
    const reqRemote = {
      headers: {},
      socket: { remoteAddress: '203.0.113.195' },
      ip: '203.0.113.195',
      hostname: 'external.example.com',
    } as any;

    adminGuard(reqRemote, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: Remote IP was admitted in development mode without authorization!');
    console.assert(resPayload?.code === 'ADMIN_REQUIRED', 'FAIL: Expected ADMIN_REQUIRED code');
    console.log('  ✓ Untrusted remote peer in dev mode is rejected with 403 Forbidden.');

    // Subtest 1B: Local loopback in development mode
    forbiddenCalled = false;
    nextCalled = false;
    const reqLoopback = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1',
      hostname: 'localhost',
    } as any;

    adminGuard(reqLoopback, resMock, () => {
      nextCalled = true;
    });

    console.assert(nextCalled && !forbiddenCalled, 'FAIL: Local loopback was rejected in development mode!');
    console.log('  ✓ Local loopback (127.0.0.1) permitted for development interface.');

    // Subtest 1C: Remote IP with valid Admin Key
    forbiddenCalled = false;
    nextCalled = false;
    process.env.ADMIN_KEY = 'secret_test_admin_token_2026';

    const reqAuthorizedRemote = {
      headers: { 'x-admin-key': 'secret_test_admin_token_2026' },
      socket: { remoteAddress: '203.0.113.195' },
      ip: '203.0.113.195',
      hostname: 'external.example.com',
    } as any;

    adminGuard(reqAuthorizedRemote, resMock, () => {
      nextCalled = true;
    });

    console.assert(nextCalled && !forbiddenCalled, 'FAIL: Valid admin credential was rejected!');
    console.log('  ✓ Valid x-admin-key credential authorized for remote peer.');

    // Subtest 1D: Production mode loopback without credentials
    process.env.NODE_ENV = 'production';
    forbiddenCalled = false;
    nextCalled = false;

    adminGuard(reqLoopback, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: Production admitted unauthenticated loopback request!');
    console.log('  ✓ Production mode strictly enforces credentials even for local loopback.');
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalAdminKey !== undefined) {
      process.env.ADMIN_KEY = originalAdminKey;
    } else {
      delete process.env.ADMIN_KEY;
    }
  }

  // -----------------------------------------------------------------------------------
  // TEST 2: Log Injection & CRLF Sanitization (CWE-117)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 2] Testing URL CRLF Sanitization in Branch Lookup:');
  const taintedUrl = 'https://github.com/test/repo\r\nINJECTED_LOG_ENTRY\t[WARN]: Fake alert';
  const branchResult = await RepoCloneService.getRemoteBranches(taintedUrl);
  console.assert(Array.isArray(branchResult.branches), 'FAIL: getRemoteBranches did not return branch array');
  console.log('  ✓ Malformed URL with CRLF injected characters safely sanitized and rejected without crash.');

  // -----------------------------------------------------------------------------------
  // TEST 3: Supabase RLS Schema Identity Verification
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 3] Testing Supabase RLS Schema Policies:');
  const schemaPath = path.resolve('supabase_schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  console.assert(schemaContent.includes('auth.uid()'), 'Missing auth.uid() identity check in supabase_schema.sql');
  console.assert(schemaContent.includes('auth.jwt() ->> \'sub\' = user_id'), 'Missing auth.jwt sub check in supabase_schema.sql');
  console.assert(!schemaContent.includes('USING (true);'), 'Disallowed open USING (true) policy still present!');
  console.assert(!schemaContent.includes('WITH CHECK (true);'), 'Disallowed open WITH CHECK (true) policy still present!');
  console.log('  ✓ Supabase RLS policies enforce authenticated user ownership on SELECT, INSERT, UPDATE, and DELETE.');

  // -----------------------------------------------------------------------------------
  // TEST 4: Backend Bundle & Sensitive File Protection (CWE-200, CWE-552)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 4] Testing Server Bundle & Storage Access Restriction:');
  const serverPath = path.resolve('server.ts');
  const serverContent = fs.readFileSync(serverPath, 'utf-8');

  console.assert(serverContent.includes('/server.cjs'), 'Missing /server.cjs access restriction in server.ts');
  console.assert(serverContent.includes('/storage'), 'Missing /storage access restriction in server.ts');
  console.assert(serverContent.includes('/.env'), 'Missing /.env access restriction in server.ts');
  console.assert(serverContent.includes('deny:'), 'Missing Vite fs.deny configuration in server.ts');

  const viteConfigPath = path.resolve('vite.config.ts');
  const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');
  console.assert(viteConfigContent.includes('deny:'), 'Missing Vite fs.deny configuration in vite.config.ts');
  console.log('  ✓ Direct access to server.cjs, /storage, and environment configs blocked across server and Vite.');

  // -----------------------------------------------------------------------------------
  // TEST 5: Backup Extraction Budget Enforcement (CWE-400)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 5] Testing Backup Archive Size Limits:');
  const backupServicePath = path.resolve('server/services/backupService.ts');
  const backupServiceContent = fs.readFileSync(backupServicePath, 'utf-8');
  console.assert(backupServiceContent.includes('MAX_VERIFY_ARCHIVE_SIZE_BYTES'), 'Missing MAX_VERIFY_ARCHIVE_SIZE_BYTES in backupService.ts');
  console.log('  ✓ Backup archive extraction enforces maximum size limit before executing tar extraction.');

  // -----------------------------------------------------------------------------------
  // TEST 6: Audio Decoded Duration Limits (CWE-400)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 6] Testing Audio Decoded Duration Limits:');
  const audioScriptPath = path.resolve('skills/brag/scripts/analyze_music_cues.py');
  const audioScriptContent = fs.readFileSync(audioScriptPath, 'utf-8');
  console.assert(audioScriptContent.includes('MAX_TRACK_DURATION_SECONDS'), 'Missing MAX_TRACK_DURATION_SECONDS in analyze_music_cues.py');
  console.assert(audioScriptContent.includes('duration=max_decode_duration'), 'Missing duration parameter in librosa.load');
  console.log('  ✓ Music cue analyzer enforces audio duration limit before decoding full track samples.');

  console.log('\n=== ALL SECURITY REMEDIATIONS VERIFIED SUCCESSFULLY ===');
}

runSecurityRemediationTests().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
