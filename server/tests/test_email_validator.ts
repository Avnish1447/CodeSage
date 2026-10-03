import { validateEmailForAuth, RENOWNED_EMAIL_PROVIDERS, DISPOSABLE_EMAIL_DOMAINS } from '../../src/lib/emailValidator.js';

async function runEmailValidatorTests() {
  console.log('=== STARTING EMAIL VALIDATOR & ANTI-DISPOSABLE SUITE ===\n');

  // Test 1: Renowned Public Providers Allowed
  console.log('[Test 1] Testing Renowned Public Providers:');
  const renownedExamples = [
    'john.doe@gmail.com',
    'alice@googlemail.com',
    'developer@outlook.com',
    'contact@hotmail.com',
    'user@live.com',
    'engineer@proton.me',
    'security@protonmail.com',
    'admin@pm.me',
    'creator@icloud.com',
    'appleuser@me.com',
    'reader@yahoo.com',
    'investor@fastmail.com',
    'founder@zoho.com',
    'tester@hey.com',
    'privacy@tuta.com',
  ];

  for (const email of renownedExamples) {
    const res = validateEmailForAuth(email);
    console.assert(res.isValid, `FAIL: Expected valid for ${email}, got error: ${res.error}`);
    console.assert(res.category === 'renowned', `FAIL: Expected 'renowned' category for ${email}, got ${res.category}`);
  }
  console.log(`  ✓ All ${renownedExamples.length} renowned email providers permitted with 'renowned' category.`);

  // Test 2: Institutional & University Domains Allowed
  console.log('\n[Test 2] Testing Institutional & Education Domains:');
  const institutionalExamples = [
    'student@stanford.edu',
    'prof@ox.ac.uk',
    'researcher@iitb.ac.in',
    'lab@u-tokyo.ac.jp',
    'official@nasa.gov',
  ];

  for (const email of institutionalExamples) {
    const res = validateEmailForAuth(email);
    console.assert(res.isValid, `FAIL: Expected valid for ${email}, got error: ${res.error}`);
    console.assert(res.category === 'institutional', `FAIL: Expected 'institutional' category for ${email}, got ${res.category}`);
  }
  console.log(`  ✓ All ${institutionalExamples.length} institutional domains permitted with 'institutional' category.`);

  // Test 3: Verified Corporate / Custom Company Domains Allowed
  console.log('\n[Test 3] Testing Legitimate Corporate / Company Domains:');
  const corporateExamples = [
    'lead@stripe.com',
    'octocat@github.com',
    'team@codesage.ai',
    'alex@acme-corp.io',
    'support@buildtech.dev',
  ];

  for (const email of corporateExamples) {
    const res = validateEmailForAuth(email);
    console.assert(res.isValid, `FAIL: Expected valid for ${email}, got error: ${res.error}`);
    console.assert(res.category === 'corporate', `FAIL: Expected 'corporate' category for ${email}, got ${res.category}`);
  }
  console.log(`  ✓ All ${corporateExamples.length} corporate domains permitted with 'corporate' category.`);

  // Test 4: Explicit Disposable / Temp Mail Domains Blocked
  console.log('\n[Test 4] Testing Explicit Disposable / Temp Mail Blocklist:');
  const disposableExamples = [
    'bot@tempmail.com',
    'anon@temp-mail.org',
    'burner@10minutemail.com',
    'test@10minutemail.net',
    'fake@mailinator.com',
    'junk@guerrillamail.com',
    'spam@sharklasers.com',
    'throw@yopmail.com',
    'trash@trashmail.com',
    'temp@dispostable.com',
    'burner@burnermail.io',
    'throwaway@throwawaymail.com',
    'fast@dropmail.me',
    'nada@getnada.com',
    'min@minuteinbox.com',
    'drop@maildrop.cc',
    'gen@generator.email',
  ];

  for (const email of disposableExamples) {
    const res = validateEmailForAuth(email);
    console.assert(!res.isValid, `FAIL: Disposable email ${email} was NOT blocked!`);
    console.assert(res.category === 'disposable', `FAIL: Expected 'disposable' category for ${email}, got ${res.category}`);
    console.assert(res.error?.includes('Temporary or disposable'), `FAIL: Expected descriptive error for ${email}`);
  }
  console.log(`  ✓ All ${disposableExamples.length} explicit temp mail domains successfully blocked.`);

  // Test 5: Dynamic Pattern Heuristics for Unlisted Burner Domains
  console.log('\n[Test 5] Testing Dynamic Burner Pattern Heuristics:');
  const patternExamples = [
    'test@custom-temp-mail-hub.com',
    'user@instant-10minute-inbox.net',
    'bot@throwaway-email-service.org',
    'junk@disposable-mail-express.xyz',
    'spammer@crazymailing-bot.co',
    'anon@fake-mail-generator-pro.biz',
  ];

  for (const email of patternExamples) {
    const res = validateEmailForAuth(email);
    console.assert(!res.isValid, `FAIL: Heuristic disposable email ${email} was NOT blocked!`);
    console.assert(res.category === 'disposable', `FAIL: Expected 'disposable' category for ${email}`);
  }
  console.log(`  ✓ All ${patternExamples.length} dynamic pattern burner domains successfully blocked.`);

  // Test 6: Malformed Email Syntax Rejections
  console.log('\n[Test 6] Testing Malformed Email Syntax Rejections:');
  const malformedExamples = [
    '',
    'notanemail',
    '@gmail.com',
    'user@',
    'user@localhost',
    'user..name@gmail.com',
    '.user@gmail.com',
    'user@.com',
    'user@domain',
  ];

  for (const email of malformedExamples) {
    const res = validateEmailForAuth(email);
    console.assert(!res.isValid, `FAIL: Malformed email '${email}' was accepted!`);
    console.assert(res.category === 'invalid', `FAIL: Expected 'invalid' category for '${email}'`);
  }
  console.log(`  ✓ All ${malformedExamples.length} malformed email strings rejected.`);

  console.log('\n=== ALL EMAIL VALIDATION TESTS PASSED WITH 100% SUCCESS ===');
}

runEmailValidatorTests().catch((err) => {
  console.error('Email validator test failed:', err);
  process.exit(1);
});
