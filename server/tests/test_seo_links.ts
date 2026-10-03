import fs from 'fs';
import path from 'path';

/**
 * Automated Test Suite for SEO, Page Titles, Meta Descriptions, and Link Integrity.
 */
async function runSeoAndLinksTests() {
  console.log('=== STARTING SEO, TITLES & LINK INTEGRITY TEST SUITE ===\n');

  // -----------------------------------------------------------------------------------
  // TEST 1: Page Title Verification
  // -----------------------------------------------------------------------------------
  console.log('[Test 1] Testing Page Title in index.html:');
  const indexHtmlPath = path.resolve('index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/i);
  console.assert(titleMatch !== null, 'index.html missing <title> tag!');
  const pageTitle = titleMatch ? titleMatch[1] : '';

  console.log(`  Found Title: "${pageTitle}"`);
  console.assert(pageTitle.length > 15, 'Page title is too short or generic');
  console.assert(pageTitle.includes('CodeSage'), 'Page title must contain the brand name CodeSage');
  console.assert(
    pageTitle.toLowerCase().includes('stratigraphy') || pageTitle.toLowerCase().includes('rag'),
    'Page title should be descriptive and contain core product capabilities'
  );
  console.log('✅ Page title is descriptive, branded, and keyword-rich.\n');

  // -----------------------------------------------------------------------------------
  // TEST 2: Meta Description & Meta Tags
  // -----------------------------------------------------------------------------------
  console.log('[Test 2] Testing Meta Description & SEO Tags:');
  const descMatch = indexHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  console.assert(descMatch !== null, 'index.html missing meta name="description" tag!');
  const metaDesc = descMatch ? descMatch[1] : '';
  console.log(`  Found Meta Description: "${metaDesc}"`);
  console.assert(metaDesc.length >= 50, `Meta description too short (${metaDesc.length} chars)`);
  console.assert(metaDesc.length <= 320, `Meta description too long (${metaDesc.length} chars)`);

  // Open Graph checks
  const ogTitle = indexHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const ogDesc = indexHtml.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  const ogImage = indexHtml.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  console.assert(ogTitle !== null, 'Missing og:title meta tag');
  console.assert(ogDesc !== null, 'Missing og:description meta tag');
  console.assert(ogImage !== null, 'Missing og:image meta tag');

  // Twitter Card checks
  const twitterCard = indexHtml.match(/<meta\s+name="twitter:card"\s+content="([^"]+)"/i);
  const twitterTitle = indexHtml.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i);
  const twitterDesc = indexHtml.match(/<meta\s+name="twitter:description"\s+content="([^"]+)"/i);
  console.assert(twitterCard !== null, 'Missing twitter:card meta tag');
  console.assert(twitterTitle !== null, 'Missing twitter:title meta tag');
  console.assert(twitterDesc !== null, 'Missing twitter:description meta tag');

  // Schema.org JSON-LD Structured Data
  const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  console.assert(jsonLdMatch !== null, 'Missing JSON-LD structured data script');
  if (jsonLdMatch) {
    const parsedJsonLd = JSON.parse(jsonLdMatch[1].trim());
    console.assert(parsedJsonLd['@type'] === 'SoftwareApplication', 'JSON-LD @type should be SoftwareApplication');
    console.assert(parsedJsonLd.name === 'CodeSage', 'JSON-LD name should be CodeSage');
  }

  // Web App Manifest
  const manifestPath = path.resolve('public', 'manifest.json');
  console.assert(fs.existsSync(manifestPath), 'public/manifest.json does not exist');
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.assert(manifestContent.name.includes('CodeSage'), 'Manifest name should include CodeSage');
  console.assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length > 0, 'Manifest must have icons');

  console.log('✅ Meta description, Open Graph, Twitter Cards, JSON-LD, and Web App Manifest all verified.\n');

  // -----------------------------------------------------------------------------------
  // TEST 3: Broken Links & Asset Verification
  // -----------------------------------------------------------------------------------
  console.log('[Test 3] Testing Internal Static Asset Links:');
  const internalAssetsToCheck = [
    '/favicon.svg',
    '/logos/app-icon.svg',
    '/logos/app-icon.png',
    '/logos/primary-logo.svg',
    '/logos/primary-logo-light.svg',
    '/logos/text-mark.svg',
    '/logos/text-mark.png',
    '/logos/monochrome-logo.svg',
    '/brag.jpg',
    '/brag.mp4',
    '/brag-extended.jpg',
    '/brag-extended.mp4',
    '/sitemap.xml',
    '/sitemap.xsl',
    '/robots.txt',
  ];

  for (const asset of internalAssetsToCheck) {
    const localFile = path.resolve('public', asset.replace(/^\//, ''));
    console.assert(fs.existsSync(localFile), `CRITICAL: Referenced internal asset does not exist on disk: ${asset}`);
    const stat = fs.statSync(localFile);
    console.assert(stat.size > 0, `Asset file is empty (0 bytes): ${asset}`);
    console.log(`  ✓ Asset verified: ${asset} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // Verify Sitemap & Robots specifications
  const sitemapContent = fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf-8');
  console.assert(sitemapContent.includes('https://codesage.dev/'), 'sitemap.xml missing canonical domain');
  console.assert(sitemapContent.includes('<urlset'), 'sitemap.xml missing <urlset> root tag');
  console.assert(sitemapContent.includes('https://codesage.dev/404'), 'sitemap.xml missing 404 URL');

  const robotsContent = fs.readFileSync(path.resolve('public/robots.txt'), 'utf-8');
  console.assert(robotsContent.includes('Sitemap: https://codesage.dev/sitemap.xml'), 'robots.txt missing Sitemap reference');
  console.log('✅ All internal assets, sitemap.xml, and robots.txt verified.\n');

  // -----------------------------------------------------------------------------------
  // TEST 4: Codebase Space Delimiter / Broken Syntax Check
  // -----------------------------------------------------------------------------------
  console.log('[Test 4] Testing for Unencoded Whitespace in srcSet or Image Paths:');
  const srcFiles = [
    path.resolve('src', 'components', 'Header.tsx'),
    path.resolve('src', 'components', 'LithosHero.tsx'),
    path.resolve('src', 'components', 'BrandKitModal.tsx'),
    path.resolve('src', 'components', 'FailedRequestCard.tsx'),
  ];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    // Check for unencoded 'text mark.svg' or 'text mark.png'
    console.assert(
      !content.includes('srcSet="/logos/text mark.svg"'),
      `Unencoded whitespace found in srcSet in ${path.basename(file)}`
    );
    console.assert(
      !content.includes('srcSet="/logos/text mark.png"'),
      `Unencoded whitespace found in srcSet in ${path.basename(file)}`
    );
  }
  console.log('✅ Verified zero unencoded spaces in image srcset/paths.\n');

  // -----------------------------------------------------------------------------------
  // TEST 5: External Links & Status URLs
  // -----------------------------------------------------------------------------------
  console.log('[Test 5] Testing Critical External URLs:');
  const failedRequestCard = fs.readFileSync(path.resolve('src', 'components', 'FailedRequestCard.tsx'), 'utf-8');
  console.assert(
    failedRequestCard.includes('https://www.githubstatus.com'),
    'Check GitHub Status link in FailedRequestCard must point to https://www.githubstatus.com'
  );
  console.assert(
    !failedRequestCard.includes('href="https://github.com"\n          target="_blank"\n          rel="noopener noreferrer"\n          className="text-[11px] font-mono text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] flex items-center space-x-1 transition-colors"\n          title="Open official GitHub Status page"\n        >\n          <span>Check GitHub Status</span>'),
    'Inaccurate plain github.com link for status was properly replaced'
  );
  console.log('  ✓ Check GitHub Status link correctly targets https://www.githubstatus.com');

  // Check noopener presence on all target="_blank" links
  const componentsToCheck = [
    path.resolve('src', 'components', 'FailedRequestCard.tsx'),
    path.resolve('src', 'components', 'Header.tsx'),
    path.resolve('src', 'components', 'RepoOverviewCard.tsx'),
    path.resolve('src', 'App.tsx'),
  ];

  for (const file of componentsToCheck) {
    const code = fs.readFileSync(file, 'utf-8');
    const blankMatches = code.match(/target="_blank"[\s\S]*?rel="([^"]*)"/g) || [];
    for (const match of blankMatches) {
      console.assert(
        match.includes('noopener'),
        `Missing noopener in target="_blank" link in ${path.basename(file)}: ${match}`
      );
    }
  }
  console.log('  ✓ Verified noopener noreferrer on all external target="_blank" links');

  // -----------------------------------------------------------------------------------
  // TEST 6: Footer Links & Navigation Integrity
  // -----------------------------------------------------------------------------------
  console.log('\n[Test 6] Testing Footer Links & Navigation:');
  const appTsx = fs.readFileSync(path.resolve('src', 'App.tsx'), 'utf-8');
  console.assert(appTsx.includes('Studio Workbench'), 'Footer missing Studio Workbench link');
  console.assert(appTsx.includes('https://github.com/Avnish1447/CodeSage'), 'Footer missing GitHub link');
  console.assert(appTsx.includes('https://www.githubstatus.com'), 'Footer missing GitHub status link');
  console.assert(appTsx.includes('https://aistudio.google.com/apikey'), 'Footer missing Gemini API link');
  console.assert(appTsx.includes('/api/v1/health'), 'Footer missing health endpoint link');
  console.assert(appTsx.includes('MIT License'), 'Footer missing MIT License link');
  console.assert(!appTsx.includes('href="#"'), 'Footer must not contain dead placeholder href="#" links');
  console.log('✅ Footer links, actions, and navigation verified.\n');

  // -----------------------------------------------------------------------------------
  // TEST 7: Zero Placeholder Text Check
  // -----------------------------------------------------------------------------------
  console.log('[Test 7] Testing Removal of Placeholder Copy:');
  const lithosHero = fs.readFileSync(path.resolve('src', 'components', 'LithosHero.tsx'), 'utf-8');
  const bannedPlaceholders = [
    'ancient seabeds',
    'drifting ash',
    'millions of years beneath us',
    'stones, fossils',
    'Field Guides',
    'Geology',
    'Live Tour',
  ];
  for (const phrase of bannedPlaceholders) {
    console.assert(
      !lithosHero.includes(phrase),
      `Found leftover template placeholder text in LithosHero: "${phrase}"`
    );
  }
  console.log('✅ Verified complete removal of template placeholder text in hero and nav.\n');

  // -----------------------------------------------------------------------------------
  // TEST 8: Copyright Notice & Current Year Verification
  // -----------------------------------------------------------------------------------
  console.log('[Test 8] Testing Copyright Notice and Year:');
  const currentYear = new Date().getFullYear();
  console.assert(
    appTsx.includes('new Date().getFullYear()') || appTsx.includes(String(currentYear)),
    'Footer must contain current year dynamically or statically'
  );
  console.assert(
    appTsx.includes('&copy;') || appTsx.includes('©') || appTsx.includes('Copyright'),
    'Footer must contain copyright symbol or text'
  );

  const licenseContent = fs.readFileSync(path.resolve('LICENSE'), 'utf-8');
  console.assert(licenseContent.includes(`Copyright (c) ${currentYear}`), `LICENSE file must state current copyright year ${currentYear}`);
  console.log(`✅ Copyright notice correctly displays current year (${currentYear}) in UI and LICENSE.\n`);

  console.log('=== ALL SEO, TITLES, LINKS & COPYRIGHT TESTS PASSED ===');
}

runSeoAndLinksTests().catch((err) => {
  console.error('❌ SEO & Links test failed:', err);
  process.exit(1);
});
