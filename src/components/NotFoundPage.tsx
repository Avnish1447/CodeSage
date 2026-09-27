import React, { useEffect } from 'react';

/**
 * Custom 404 Error Screen matching the exact Canvas & Figma specification.
 * - Full-viewport (min-height: 100svh), black fallback background.
 * - Semantic <video> as the first child at inset: 0, opacity 1, no overlays.
 * - Semantic <header> logo with geometric pixel mark (54x40) and logotype (164.311x100), aria-label="LGPSM".
 * - Centered 404 content with Geist Mono:SemiBold, gradient text fill, 1px divider, and message.
 * - Strictly zero extra cards, links, buttons, animations, or overlays.
 */
export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "404 – The path may be broken, but the journey isn't | CodeSage";
  }, []);

  return (
    <main
      className="not-found-main"
      style={{
        minHeight: '100svh',
        backgroundColor: '#000000',
        overflowX: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* BACKGROUND VIDEO: First child inside the page */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260801_001207_ec20d138-aa45-4b2b-ab8c-bdc71607f240.mp4"
        className="not-found-video"
      />

      {/* HEADER LOGO & BRAND NAME */}
      <header
        className="not-found-header"
        aria-label="CodeSage"
      >
        <a
          href="/"
          onClick={(e) => {
            if (window.location.pathname === '/404' || window.location.pathname === '/404.html') {
              window.location.href = '/';
            } else if (window.location.hash.includes('404')) {
              e.preventDefault();
              window.location.hash = '';
              window.location.href = '/';
            }
          }}
          className="flex items-center text-decoration-none group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5] rounded transition-opacity hover:opacity-90"
          title="CodeSage – Return to Studio"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          {/* Official CodeSage Primary Logo Emblem: 40px high */}
          <img
            src="/logos/primary-logo.svg"
            alt="CodeSage Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
            style={{ display: 'block', flexShrink: 0 }}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('primary-logo-light.svg')) {
                target.src = '/logos/primary-logo-light.svg';
              }
            }}
          />

          {/* Official CodeSage Brand Name */}
          <div style={{ marginLeft: '14px', display: 'flex', alignItems: 'center', height: '40px', flexShrink: 0 }}>
            <span
              className="font-playfair italic text-white text-[26px] font-bold tracking-tight select-none group-hover:text-amber-400 transition-colors duration-200"
              style={{ lineHeight: 1 }}
            >
              CodeSage
            </span>
          </div>
        </a>
      </header>

      {/* CENTERED 404 CONTENT */}
      <div className="not-found-content">
        {/* Large 404 Heading */}
        <h1 className="not-found-heading">
          404
        </h1>

        {/* Thin Horizontal Divider */}
        <div className="not-found-divider" role="separator" />

        {/* Message */}
        <p className="not-found-message">
          The path may be broken, but the journey isn't. Let's get you back.
        </p>
      </div>
    </main>
  );
};

export default NotFoundPage;
