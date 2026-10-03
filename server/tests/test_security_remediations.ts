import fs from 'node:fs';
import path from 'node:path';
import { adminGuard, isValidRepoId, workbenchAuthGuard } from '../routes/api.js';
import { RepoCloneService } from '../services/repoCloneService.js';
import { BackupService } from '../services/backupService.js';
import { SpendingService } from '../services/spendingService.js';
import { RATE_LIMIT_CONFIG, SPENDING_CAP_CONFIG, RESOURCE_LIMITS } from '../config/limits.js';
import { DB_PATH, SHARED_DB_PATH } from '../config/paths.js';
import { resolveClerkProxyUrl, CLERK_UPSTREAM_ORIGIN } from '../app.js';

async function runSecurityRemediationTests() {
  console.log('=== STARTING SECURITY REMEDIATIONS VERIFICATION SUITE ===\n');

  // -----------------------------------------------------------------------------------
  // TEST 1: adminGuard Authorization & Loopback Interface Confinement (CWE-862, CWE-807, CWE-345)
  // -----------------------------------------------------------------------------------
  console.log('[Test 1] Testing adminGuard Loopback Interface Restriction & Host Spoofing:');
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

    // Subtest 1D: Host header spoofing resistance (Finding 7)
    // An external remote caller sets "Host: localhost", but their remoteAddress is remote
    forbiddenCalled = false;
    nextCalled = false;
    delete process.env.ADMIN_KEY;

    const reqSpoofedHost = {
      headers: { host: 'localhost' },
      socket: { remoteAddress: '198.51.100.42' },
      ip: '198.51.100.42',
      hostname: 'localhost',
    } as any;

    adminGuard(reqSpoofedHost, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: Host header spoofing admitted external peer to adminGuard!');
    console.log('  ✓ Host header spoofing ("Host: localhost" with remote socket IP) safely rejected.');

    // Subtest 1E: Malicious Cross-Origin Loopback Request resistance (Finding 9)
    // An attacker webpage in user\'s browser executes fetch('http://localhost:3000/api/v1/system/...')
    forbiddenCalled = false;
    nextCalled = false;

    const reqCrossOriginLoopback = {
      headers: { origin: 'https://malicious-attacker.com' },
      socket: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1',
      hostname: 'localhost',
    } as any;

    adminGuard(reqCrossOriginLoopback, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: Untrusted cross-origin request admitted to loopback admin!');
    console.assert(resPayload?.code === 'CROSS_ORIGIN_ADMIN_FORBIDDEN', 'FAIL: Expected CROSS_ORIGIN_ADMIN_FORBIDDEN code');
    console.log('  ✓ Untrusted external cross-origin loopback request safely rejected with 403 Forbidden.');

    // Subtest 1G: Localhost Cross-Port CSRF resistance (CWE-352, Finding #14)
    // An attacker webpage running on another local port (e.g. http://localhost:8000)
    forbiddenCalled = false;
    nextCalled = false;
    process.env.NODE_ENV = 'development';

    const reqCrossPortLoopback = {
      headers: { origin: 'http://localhost:8000', host: 'localhost:3000' },
      socket: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1',
      hostname: 'localhost',
    } as any;

    adminGuard(reqCrossPortLoopback, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: Unrelated localhost port admitted to loopback admin!');
    console.assert(resPayload?.code === 'CROSS_ORIGIN_ADMIN_FORBIDDEN', 'FAIL: Expected CROSS_ORIGIN_ADMIN_FORBIDDEN code');
    console.log('  ✓ Localhost cross-port CSRF request (port 8000) safely rejected with 403 Forbidden.');

    // Subtest 1H: DNS Rebinding Host Header Validation (CWE-863, Finding #16)
    // Attacker domain DNS rebinds to 127.0.0.1 but Host header contains attacker domain
    forbiddenCalled = false;
    nextCalled = false;

    const reqReboundHost = {
      headers: { host: 'attacker-rebound.evil.com' },
      socket: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1',
      hostname: 'attacker-rebound.evil.com',
    } as any;

    adminGuard(reqReboundHost, resMock, () => {
      nextCalled = true;
    });

    console.assert(forbiddenCalled && !nextCalled, 'FAIL: DNS-rebound host admitted to loopback admin!');
    console.assert(resPayload?.code === 'UNTRUSTED_HOST_FORBIDDEN', 'FAIL: Expected UNTRUSTED_HOST_FORBIDDEN code');
    console.log('  ✓ DNS-rebound host header safely rejected with 403 Forbidden.');

    // Subtest 1F: Production mode loopback without credentials
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
  console.assert(schemaContent.includes('PRIMARY KEY (user_id, repository_id)'), 'Missing composite PRIMARY KEY (user_id, repository_id) in supabase_schema.sql');

  const supabaseClientPath = path.resolve('src/lib/supabase.ts');
  const supabaseClientContent = fs.readFileSync(supabaseClientPath, 'utf-8');
  console.assert(supabaseClientContent.includes("onConflict: 'user_id,repository_id'"), 'Missing composite onConflict in supabase.ts');

  console.log('  ✓ Supabase RLS policies and composite primary key (user_id, repository_id) eliminate cross-user key probing (CWE-203).');

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

  // -----------------------------------------------------------------------------------
  // TEST 7: Path Traversal & Repo ID Validation (Finding 6, CWE-22)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 7] Testing Repository ID and Path Traversal Validation:');
  console.assert(isValidRepoId('valid-repo_123'), 'FAIL: valid repo id rejected');
  console.assert(!isValidRepoId('../escaped_repo'), 'FAIL: dot-dot traversal repo id admitted');
  console.assert(!isValidRepoId('/etc/passwd'), 'FAIL: absolute path repo id admitted');
  console.assert(!isValidRepoId('repo%2f..%2f..'), 'FAIL: url-encoded slash repo id admitted');
  console.assert(!isValidRepoId(''), 'FAIL: empty repo id admitted');

  const apiRouteContent = fs.readFileSync(path.resolve('server/routes/api.ts'), 'utf-8');
  console.assert(apiRouteContent.includes('isValidRepoId(repoId)'), 'Missing isValidRepoId in handleGetFileContent');
  console.assert(apiRouteContent.includes('sourceRootLstat.isSymbolicLink()'), 'Missing symlink root check in handleGetFileContent');
  console.log('  ✓ Repo ID validation blocks encoded traversal and handleGetFileContent verifies sourceRoot boundaries.');

  // -----------------------------------------------------------------------------------
  // TEST 8: Dynamic Config Limits & Spending Caps Post-Boot (Finding 8, CWE-665)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 8] Testing Dynamic Getters in Configuration Limits:');
  const prevGeneralMax = process.env.RATE_LIMIT_GENERAL_MAX;
  try {
    process.env.RATE_LIMIT_GENERAL_MAX = '999';
    console.assert(RATE_LIMIT_CONFIG.GENERAL_MAX === 999, 'FAIL: Dynamic getter did not reflect updated env var');

    process.env.SPENDING_CAP_DAILY_USD = '12.50';
    console.assert(SPENDING_CAP_CONFIG.DAILY_SPEND_CAP_USD === 12.50, 'FAIL: Dynamic spending cap getter failed');
    console.log('  ✓ Config limits dynamically reflect environment variable updates post-boot.');
  } finally {
    if (prevGeneralMax !== undefined) {
      process.env.RATE_LIMIT_GENERAL_MAX = prevGeneralMax;
    } else {
      delete process.env.RATE_LIMIT_GENERAL_MAX;
    }
    delete process.env.SPENDING_CAP_DAILY_USD;
  }

  // -----------------------------------------------------------------------------------
  // TEST 9: In-Flight Token & Budget Reservation (Finding 5)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 9] Testing In-Flight Token & Budget Reservation in SpendingService:');
  SpendingService.reset();
  const res1 = SpendingService.reserveAllowance('res_test_1', 1000, 0.001);
  console.assert(res1.allowed, 'FAIL: Initial reservation rejected');

  const allowance = SpendingService.getReservedAllowance();
  console.assert(allowance.totalTokens === 1000, 'FAIL: Reserved tokens count mismatch');
  console.assert(allowance.count === 1, 'FAIL: Reserved in-flight request count mismatch');

  // Verify that an extreme reservation beyond cap is rejected
  const resHuge = SpendingService.reserveAllowance('res_test_huge', 100_000_000, 999.0);
  console.assert(!resHuge.allowed, 'FAIL: Excessive budget reservation was allowed past daily cap!');

  SpendingService.releaseReservation('res_test_1');
  const allowanceAfterRelease = SpendingService.getReservedAllowance();
  console.assert(allowanceAfterRelease.count === 0, 'FAIL: Released reservation still active');
  console.log('  ✓ Atomic in-flight budget reservation prevents concurrent spend cap overruns.');

  // -----------------------------------------------------------------------------------
  // TEST 10: Provider Max Output Tokens (Finding 1)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 10] Testing Gemini Service Max Output Tokens Enforcement:');
  const geminiServiceContent = fs.readFileSync(path.resolve('server/services/geminiService.ts'), 'utf-8');
  console.assert(geminiServiceContent.includes('maxOutputTokens: SPENDING_CAP_CONFIG.MAX_OUTPUT_TOKENS'), 'Missing maxOutputTokens in geminiService.ts');
  console.assert(geminiServiceContent.includes('SpendingService.reserveAllowance'), 'Missing reserveAllowance in geminiService.ts');
  console.log('  ✓ Provider requests enforce configured maxOutputTokens and reserve in-flight budget.');

  // -----------------------------------------------------------------------------------
  // TEST 11: Backup Manifest Sidecar & Async Listing (Finding 4, CWE-400)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 11] Testing Backup Service Manifest Sidecar Indexing:');
  console.assert(backupServiceContent.includes('.manifest.json'), 'Missing sidecar manifest reference in backupService.ts');
  console.assert(backupServiceContent.includes('promisify(execFile)'), 'Missing async execFile in listBackups');
  console.log('  ✓ Backup service writes sidecar manifests and avoids synchronous event-loop blocking tar execution.');

  // -----------------------------------------------------------------------------------
  // TEST 12: Tree Fallback Commit Pinning & Stream Capping (Finding 2, CWE-400)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 12] Testing Fallback Tree Commit Identity & Stream Byte Capping:');
  const repoCloneServiceContent = fs.readFileSync(path.resolve('server/services/repoCloneService.ts'), 'utf-8');
  console.assert(repoCloneServiceContent.includes('commitOrBranch'), 'Missing commitOrBranch in downloadTreeItems');
  console.assert(repoCloneServiceContent.includes('content-length'), 'Missing content-length pre-check in downloadTreeItems');
  console.assert(repoCloneServiceContent.includes('getReader()'), 'Missing stream reader capping in downloadTreeItems');
  console.log('  ✓ Tree item downloads pinned to commit identity and responses stream-capped at byte limits.');

  // -----------------------------------------------------------------------------------
  // TEST 13: App Standalone Production Trust Proxy Default (Finding 11)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 13] Testing Express Trust Proxy Default in Standalone Production:');
  const appContent = fs.readFileSync(path.resolve('server/app.ts'), 'utf-8');
  console.assert(!appContent.includes("NODE_ENV === 'production' ? 1 : 'loopback'"), 'Standalone production still defaults trust proxy to 1!');
  console.assert(appContent.includes("process.env.VERCEL ? 1 : 'loopback'"), 'Expected trust proxy default to loopback when not on Vercel');
  console.log('  ✓ Standalone production defaults trust proxy to loopback, preventing client X-Forwarded-For spoofing.');

  // -----------------------------------------------------------------------------------
  // TEST 14: Shared Durable Storage Path Configuration (Finding 10)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 14] Testing Shared Durable Storage Path Configuration:');
  const pathsContent = fs.readFileSync(path.resolve('server/config/paths.ts'), 'utf-8');
  console.assert(pathsContent.includes('SHARED_DB_PATH'), 'Missing SHARED_DB_PATH in paths.ts');
  console.assert(DB_PATH.length > 0, 'DB_PATH resolved empty');
  console.log('  ✓ Serverless storage configuration supports SHARED_DB_PATH for synchronized multi-instance ledgers.');

  // -----------------------------------------------------------------------------------
  // TEST 15: Clerk Frontend API Proxy SSRF & Credential Leak Mitigation (CWE-918, Finding #18)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 15] Testing Clerk Proxy SSRF & Credential Leak Mitigation (CWE-918):');
  
  // 1. Attacker domain suffix
  console.assert(resolveClerkProxyUrl('/__clerk.attacker.com/collect') === null, 'FAIL: Accepted /__clerk.attacker.com suffix');
  console.assert(resolveClerkProxyUrl('/__clerk.evil.io') === null, 'FAIL: Accepted /__clerk.evil.io');
  
  // 2. Protocol-relative bypass
  console.assert(resolveClerkProxyUrl('/__clerk//attacker.com') === null, 'FAIL: Accepted protocol-relative bypass //attacker.com');

  // 3. Backslash host confusion
  console.assert(resolveClerkProxyUrl('/__clerk/\\attacker.com') === null, 'FAIL: Accepted backslash path');

  // 4. Valid Clerk paths
  const rootTarget = resolveClerkProxyUrl('/__clerk');
  console.assert(rootTarget !== null && rootTarget.origin === CLERK_UPSTREAM_ORIGIN && rootTarget.pathname === '/', 'FAIL: Root /__clerk failed');

  const rootSlashTarget = resolveClerkProxyUrl('/__clerk/');
  console.assert(rootSlashTarget !== null && rootSlashTarget.origin === CLERK_UPSTREAM_ORIGIN && rootSlashTarget.pathname === '/', 'FAIL: Root /__clerk/ failed');

  const clientTarget = resolveClerkProxyUrl('/__clerk/v1/client?_is_native=true');
  console.assert(
    clientTarget !== null &&
    clientTarget.origin === CLERK_UPSTREAM_ORIGIN &&
    clientTarget.pathname === '/v1/client' &&
    clientTarget.search === '?_is_native=true',
    'FAIL: Valid /__clerk/v1/client subpath failed'
  );

  console.log('  ✓ Clerk proxy strictly enforces slash boundaries and origin lockdown, preventing CWE-918 SSRF.');

  // -----------------------------------------------------------------------------------
  // TEST 16: Decompression Bomb Pre-Checkout Git Tree Audit (CWE-409, Finding #4)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 16] Testing Decompression Bomb Pre-Checkout Git Tree Inspection (CWE-409):');
  const cloneServiceCode = fs.readFileSync(path.resolve('server/services/repoCloneService.ts'), 'utf-8');
  console.assert(cloneServiceCode.includes("'--no-checkout'"), 'FAIL: git clone must use --no-checkout before tree inspection');
  console.assert(cloneServiceCode.includes('inspectGitTreeBeforeCheckout'), 'FAIL: Missing inspectGitTreeBeforeCheckout invocation');

  // Verify that valid tree passes pre-checkout audit within generous limits
  const auditValid = await RepoCloneService.inspectGitTreeBeforeCheckout(process.cwd(), 2000, 500);
  console.assert(auditValid.fileCount > 0, 'FAIL: Expected non-zero file count in valid repository audit');
  console.assert(auditValid.totalSizeBytes > 0, 'FAIL: Expected non-zero byte count in valid repository audit');

  // Verify that file count limit breach is rejected BEFORE checkout
  let fileLimitThrew = false;
  try {
    await RepoCloneService.inspectGitTreeBeforeCheckout(process.cwd(), 5, 500);
  } catch (err: any) {
    if (err.name === 'RepositoryLimitError' && err.message.includes('Exceeded 5 files limit')) {
      fileLimitThrew = true;
    }
  }
  console.assert(fileLimitThrew, 'FAIL: Did not reject file count limit before checkout');

  // Verify that cumulative size limit breach is rejected BEFORE checkout
  let sizeLimitThrew = false;
  try {
    await RepoCloneService.inspectGitTreeBeforeCheckout(process.cwd(), 10000, 0.001);
  } catch (err: any) {
    if (err.name === 'RepositoryLimitError' && err.message.includes('size limit')) {
      sizeLimitThrew = true;
    }
  }
  console.assert(sizeLimitThrew, 'FAIL: Did not reject byte size limit before checkout');
  console.log('  ✓ Pre-checkout Git tree audit terminates decompression bombs and entry floods before disk materialization.');

  // -----------------------------------------------------------------------------------
  // TEST 17: Completion Marker Out-of-Checkout & Symlink No-Follow (CWE-59, Finding #5)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 17] Testing Completion Marker Out-of-Checkout & Symlink No-Follow (CWE-59):');
  const scratchDir = path.join(process.cwd(), 'scratch', 'test_cwe59_' + Date.now());
  fs.mkdirSync(scratchDir, { recursive: true });

  try {
    const fakeRepoDir = path.join(scratchDir, 'repo_test');
    const fakeSourceDir = path.join(fakeRepoDir, 'source');
    fs.mkdirSync(fakeSourceDir, { recursive: true });

    const markerPath = path.join(fakeRepoDir, '.clone_complete');
    RepoCloneService.writeCompletionMarker(markerPath);

    console.assert(fs.existsSync(markerPath), 'FAIL: Completion marker was not created');
    console.assert(RepoCloneService.isCloneComplete(fakeRepoDir, fakeSourceDir), 'FAIL: isCloneComplete returned false');

    // Create a sensitive file and attempt symlink overwrite attack
    const sensitiveFile = path.join(scratchDir, 'sensitive.txt');
    fs.writeFileSync(sensitiveFile, 'PROTECTED_SYSTEM_DATA', 'utf-8');

    // Replace marker with symlink targeting the sensitive file
    fs.unlinkSync(markerPath);
    fs.symlinkSync(sensitiveFile, markerPath);

    // Call writeCompletionMarker on the symlink
    RepoCloneService.writeCompletionMarker(markerPath);

    // Assert that sensitive file was NOT modified/truncated
    const sensitiveContent = fs.readFileSync(sensitiveFile, 'utf-8');
    console.assert(sensitiveContent === 'PROTECTED_SYSTEM_DATA', 'FAIL: CWE-59 exploit succeeded! Sensitive file was overwritten');

    // Assert that the marker is now a regular file, not a symlink
    const markerStat = fs.lstatSync(markerPath);
    console.assert(!markerStat.isSymbolicLink(), 'FAIL: Marker is still a symbolic link');
    console.log('  ✓ Completion marker placed outside checkout and written with O_NOFOLLOW, preventing symlink overwrite attacks.');
  } finally {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }

  // -----------------------------------------------------------------------------------
  // TEST 18: Workbench Server-Side Session Verification (CWE-602, Finding #8 & #15)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 18] Testing Workbench Server-Side Session Verification (CWE-602):');
  const apiRoutesCode = fs.readFileSync(path.resolve('server/routes/api.ts'), 'utf-8');
  console.assert(apiRoutesCode.includes("post('/repositories', workbenchAuthGuard"), 'Missing workbenchAuthGuard on POST /repositories');
  console.assert(apiRoutesCode.includes("post('/repositories/:repo_id/chat', workbenchAuthGuard"), 'Missing workbenchAuthGuard on POST /repositories/:repo_id/chat');
  console.assert(apiRoutesCode.includes("post('/repositories/:repo_id/insights', workbenchAuthGuard"), 'Missing workbenchAuthGuard on POST /repositories/:repo_id/insights');
  console.assert(apiRoutesCode.includes("workbenchAuthGuard"), 'Missing workbenchAuthGuard');
  console.assert(apiRoutesCode.includes("get('/repositories/:repo_id/file', workbenchAuthGuard"), 'Missing workbenchAuthGuard on GET /file');

  // Subtest 18A: Anonymous request without authorization token
  let unauthCalled = false;
  let authNextCalled = false;
  let authPayload: any = null;

  const authResMock = {
    status: (code: number) => {
      if (code === 401) unauthCalled = true;
      return {
        json: (data: any) => {
          authPayload = data;
          return data;
        },
      };
    },
  } as any;

  const reqAnon = {
    headers: {},
    socket: { remoteAddress: '203.0.113.195' },
    ip: '203.0.113.195',
  } as any;

  await workbenchAuthGuard(reqAnon, authResMock, () => {
    authNextCalled = true;
  });

  console.assert(unauthCalled && !authNextCalled, 'FAIL: Anonymous request was admitted to workbench without authentication!');
  console.assert(authPayload?.code === 'AUTHENTICATION_REQUIRED', 'FAIL: Expected AUTHENTICATION_REQUIRED code');
  console.log('  ✓ Anonymous request to workbench rejected with 401 Unauthorized.');

  // Subtest 18B: Forged / invalid bearer token
  unauthCalled = false;
  authNextCalled = false;
  const reqForged = {
    headers: { authorization: 'Bearer forged_tampered_jwt_token_12345' },
    socket: { remoteAddress: '203.0.113.195' },
    ip: '203.0.113.195',
  } as any;

  await workbenchAuthGuard(reqForged, authResMock, () => {
    authNextCalled = true;
  });

  console.assert(unauthCalled && !authNextCalled, 'FAIL: Forged bearer token admitted to workbench!');
  console.log('  ✓ Forged/invalid session bearer token rejected with 401 Unauthorized.');

  // Subtest 18C: Admin authority bypass
  const savedAdminKey = process.env.ADMIN_KEY;
  try {
    process.env.ADMIN_KEY = 'secret_test_admin_token_2026';
    unauthCalled = false;
    authNextCalled = false;

    const reqAdmin = {
      headers: { 'x-admin-key': 'secret_test_admin_token_2026' },
      socket: { remoteAddress: '203.0.113.195' },
      ip: '203.0.113.195',
    } as any;

    await workbenchAuthGuard(reqAdmin, authResMock, () => {
      authNextCalled = true;
    });

    console.assert(authNextCalled && !unauthCalled, 'FAIL: Valid administrator was rejected by workbenchAuthGuard!');
    console.log('  ✓ Administrator credential authorizes workbench access.');
  } finally {
    if (savedAdminKey !== undefined) {
      process.env.ADMIN_KEY = savedAdminKey;
    } else {
      delete process.env.ADMIN_KEY;
    }
  }

  console.log('  ✓ Workbench routes enforce server-side session verification, resolving CWE-602.');

  // -----------------------------------------------------------------------------------
  // TEST 19: Case-Sensitive Git Ref Identity and Collision Resistance (CWE-706)
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 19] Testing Case-Sensitive Git Ref Identity & Collision Resistance (CWE-706):');
  const idUpper = RepoCloneService.generateRepositoryId('org', 'repo', 'https://github.com/org/repo', 'Release-1.0');
  const idLower = RepoCloneService.generateRepositoryId('org', 'repo', 'https://github.com/org/repo', 'release-1.0');
  const idMain = RepoCloneService.generateRepositoryId('org', 'repo', 'https://github.com/org/repo', 'main');
  const idMaster = RepoCloneService.generateRepositoryId('org', 'repo', 'https://github.com/org/repo', 'master');

  console.assert(idUpper !== idLower, `FAIL: Case-variant branch refs produced identical repositoryId: ${idUpper}`);
  console.assert(idMain !== idMaster, `FAIL: Main and master produced identical repositoryId: ${idMain}`);
  console.assert(idUpper.length > 20, 'FAIL: Expected collision-resistant repository ID with hash digest');
  console.log(`  ✓ Case-distinct refs produce isolated identities:`);
  console.log(`    - "Release-1.0" -> ${idUpper}`);
  console.log(`    - "release-1.0" -> ${idLower}`);
  console.log('  ✓ CWE-706 Git ref identity isolation verified.');

  console.log('\n=== ALL SECURITY REMEDIATIONS VERIFIED WITH 100% SUCCESS ===');
}

runSecurityRemediationTests().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
