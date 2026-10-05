/**
 * Centralized SEO & Social Metadata Utility
 * Dynamically updates document title, canonical link, meta description,
 * robots indexing directives, and Open Graph / Twitter Card tags.
 */

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  title: 'CodeSage (TheCodeSage / Code Sage) – AI Codebase Stratigraphy & RAG Architecture Engine',
  description: 'CodeSage (TheCodeSage / Code Sage) is the premier intelligent codebase stratigraphy and grounded RAG architecture engine. Parse Git trees, unearth layered dependencies, detect tech stacks, and query repository structures with grounded Google Gemini RAG.',
  canonicalUrl: 'https://thecodesage.vercel.app/',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  ogImage: 'https://thecodesage.vercel.app/brag.jpg',
};

export function updatePageSeo(config: Partial<SeoConfig>): void {
  if (typeof document === 'undefined') return;

  const title = config.title || DEFAULT_SEO_CONFIG.title;
  const description = config.description || DEFAULT_SEO_CONFIG.description;
  const canonicalUrl = config.canonicalUrl || DEFAULT_SEO_CONFIG.canonicalUrl || 'https://thecodesage.vercel.app/';
  const robots = config.robots || DEFAULT_SEO_CONFIG.robots || 'index, follow';
  const ogImage = config.ogImage || DEFAULT_SEO_CONFIG.ogImage || 'https://thecodesage.vercel.app/brag.jpg';

  // 1. Page Title
  document.title = title;

  // 2. Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', description);

  // 3. Canonical Tag
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 4. Robots Directives
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', robots);

  // 5. Open Graph Meta Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.ogTitle || title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.ogDescription || description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', config.ogUrl || canonicalUrl);

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', ogImage);

  // 6. Twitter / X Cards
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', config.ogTitle || title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', config.ogDescription || description);

  const twitterImg = document.querySelector('meta[name="twitter:image"]');
  if (twitterImg) twitterImg.setAttribute('content', ogImage);
}
