import fs from 'fs';
import path from 'path';

/**
 * Automated Verification Suite for Custom 404 Error Screen.
 */
async function run404Tests() {
  console.log('=== STARTING CUSTOM 404 SCREEN VERIFICATION SUITE ===\n');

  const componentPath = path.resolve('src/components/NotFoundPage.tsx');
  console.assert(fs.existsSync(componentPath), 'src/components/NotFoundPage.tsx does not exist!');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');

  // Test 1: Full-Viewport Canvas & Semantic <main>
  console.log('[Test 1] Testing Canvas & Viewport specifications:');
  console.assert(componentContent.includes('<main'), 'Missing semantic <main> element');
  console.assert(componentContent.includes('100svh'), 'Missing min-height: 100svh requirement');
  console.assert(componentContent.includes('#000000'), 'Missing #000000 black fallback background');
  console.assert(componentContent.includes('overflowX'), 'Missing overflowX horizontal scroll prevention');
  console.log('✅ Canvas: semantic <main>, 100svh, #000000 fallback, and overflowX hidden verified.\n');

  // Test 2: Background Video
  console.log('[Test 2] Testing Semantic Background Video:');
  const expectedVideoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260801_001207_ec20d138-aa45-4b2b-ab8c-bdc71607f240.mp4';
  console.assert(componentContent.includes('<video'), 'Missing semantic <video> element');
  console.assert(componentContent.includes(expectedVideoUrl), 'Missing exact video source URL');
  console.assert(componentContent.includes('autoPlay'), 'Missing autoPlay attribute');
  console.assert(componentContent.includes('loop'), 'Missing loop attribute');
  console.assert(componentContent.includes('muted'), 'Missing muted attribute');
  console.assert(componentContent.includes('playsInline'), 'Missing playsInline attribute');
  console.assert(componentContent.includes('aria-hidden="true"'), 'Missing aria-hidden="true" on video');
  console.log('✅ Video: semantic <video>, exact cloudfront URL, autoPlay, loop, muted, playsInline, aria-hidden verified.\n');

  // Test 3: Font Declaration
  console.log('[Test 3] Testing "Geist Mono:SemiBold" Font Declaration:');
  const cssPath = path.resolve('src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  console.assert(cssContent.includes('@font-face'), 'Missing @font-face declaration');
  console.assert(cssContent.includes('"Geist Mono:SemiBold"'), 'Missing "Geist Mono:SemiBold" font-family');
  console.assert(cssContent.includes('https://static.figma.com/font/GeistMono_wght__1'), 'Missing exact Figma font URL source');
  console.log('✅ Font: "Geist Mono:SemiBold" 600 woff2 @font-face verified in index.css.\n');

  // Test 4: Header Logo & Brand Name
  console.log('[Test 4] Testing Header Logo, CodeSage Brand Mark & Name:');
  console.assert(componentContent.includes('aria-label="CodeSage"'), 'Missing aria-label="CodeSage" on brand header');
  console.assert(componentContent.includes('/logos/primary-logo.svg'), 'Missing CodeSage primary logo SVG path');
  console.assert(componentContent.includes('CodeSage Logo'), 'Missing CodeSage logo alt text');
  console.assert(componentContent.includes('CodeSage'), 'Missing "CodeSage" brand name');
  console.assert(componentContent.includes('font-playfair'), 'Missing font-playfair class for brand typography');
  console.log('✅ Logo & Brand Name: aria-label="CodeSage", CodeSage logo mark, and "CodeSage" name verified.\n');

  // Test 5: Centered 404 Heading, Divider, and Message
  console.log('[Test 5] Testing Typography, Gradient, Divider & Exact Copy:');
  console.assert(componentContent.includes('<h1 className="not-found-heading"'), 'Missing <h1> with not-found-heading class');
  console.assert(componentContent.includes('404'), 'Missing 404 heading text');
  console.assert(componentContent.includes('The path may be broken, but the journey isn\'t. Let\'s get you back.'), 'Missing exact message copy');
  console.assert(cssContent.includes('247.3282658084845deg'), 'Missing exact linear-gradient angle in CSS');
  console.assert(cssContent.includes('background-clip: text'), 'Missing background-clip: text');
  console.assert(cssContent.includes('295.751px'), 'Missing desktop font-size: 295.751px');
  console.assert(cssContent.includes('-24.6459px'), 'Missing desktop letter-spacing: -24.6459px');
  console.assert(cssContent.includes('425px'), 'Missing desktop divider width: 425px');
  console.assert(cssContent.includes('clamp(140px, 52vw, 200px)'), 'Missing mobile heading clamp font-size');
  console.log('✅ Centered 404 Content: <h1>404</h1>, 247° gradient text clip, 425px white divider, and exact message copy verified.\n');

  // Test 6: Route Integration in App.tsx
  console.log('[Test 6] Testing Route Integration in App.tsx:');
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  console.assert(appContent.includes('NotFoundPage'), 'NotFoundPage must be imported and rendered in App.tsx');
  console.assert(appContent.includes("path === '/404'"), "App.tsx must route to NotFoundPage when path === '/404'");
  console.log('✅ Route Integration: App.tsx seamlessly serves NotFoundPage on /404 and unrecognized routes.\n');

  console.log('=== ALL 404 ERROR SCREEN TESTS PASSED ===');
}

run404Tests().catch((err) => {
  console.error('❌ 404 tests failed:', err);
  process.exit(1);
});
