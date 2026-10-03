<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>CodeSage – XML Sitemap</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500;600&amp;family=Playfair+Display:ital,wght@1,600;1,700&amp;display=swap" rel="stylesheet"/>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            min-height: 100svh;
            background-color: #000000;
            color: #EDEDED;
            font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-x: hidden;
            position: relative;
            width: 100%;
            -webkit-font-smoothing: antialiased;
          }

          /* BACKGROUND VIDEO: Identical to 404 page */
          .sitemap-video {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 1;
            z-index: 0;
            pointer-events: none;
          }

          /* Subtle dark overlay to ensure high readability of sitemap data */
          .sitemap-overlay {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at 50% 30%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.85) 100%);
            z-index: 1;
            pointer-events: none;
          }

          /* MAIN CONTAINER */
          .sitemap-main {
            position: relative;
            z-index: 10;
            min-height: 100svh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 60px 20px 80px;
            max-width: 1000px;
            margin: 0 auto;
          }

          /* HEADER LOGO & BRAND NAME */
          .sitemap-header {
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sitemap-brand-link {
            display: flex;
            align-items: center;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }

          .sitemap-brand-link:hover {
            opacity: 0.9;
            transform: scale(1.02);
          }

          .sitemap-logo {
            width: 40px;
            height: 40px;
            object-contain: contain;
            flex-shrink: 0;
            display: block;
          }

          .sitemap-brand-text {
            margin-left: 14px;
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-weight: 700;
            color: #ffffff;
            font-size: 26px;
            letter-spacing: -0.02em;
            line-height: 1;
            user-select: none;
          }

          /* HERO TITLE & DIVIDER: Identical typography & gradient */
          .sitemap-hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 20px;
            margin-bottom: 48px;
            width: 100%;
          }

          .sitemap-heading {
            font-family: 'Geist Mono', monospace;
            font-weight: 600;
            font-size: clamp(48px, 10vw, 92px);
            line-height: 1;
            letter-spacing: -0.07em;
            text-align: center;
            background: linear-gradient(
              247.3deg,
              rgb(255, 255, 255) 2.5%,
              rgba(255, 255, 255, 0.4) 93.6%
            );
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
          }

          .sitemap-divider {
            width: 380px;
            max-width: 80%;
            height: 1px;
            background-color: #ffffff;
            border: none;
            opacity: 0.9;
          }

          .sitemap-subtitle {
            font-family: 'Geist Mono', monospace;
            font-weight: 500;
            font-size: clamp(14px, 2.5vw, 18px);
            line-height: 1.3;
            letter-spacing: -0.04em;
            color: #EDEDED;
            text-align: center;
            max-width: 600px;
          }

          /* GLASS TABLE CONTAINER */
          .sitemap-card {
            width: 100%;
            background: rgba(18, 18, 18, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .sitemap-card-header {
            padding: 18px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #A3A3A3;
            font-family: 'Geist Mono', monospace;
          }

          .sitemap-count-badge {
            background: rgba(232, 112, 42, 0.15);
            color: #e8702a;
            border: 1px solid rgba(232, 112, 42, 0.3);
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
          }

          .sitemap-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          .sitemap-table th {
            padding: 14px 24px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #737373;
            font-family: 'Geist Mono', monospace;
            font-weight: 500;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.2);
          }

          .sitemap-table td {
            padding: 16px 24px;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: #EDEDED;
            vertical-align: middle;
          }

          .sitemap-table tr:last-child td {
            border-bottom: none;
          }

          .sitemap-table tr:hover td {
            background: rgba(255, 255, 255, 0.03);
          }

          .sitemap-link {
            color: #ffffff;
            text-decoration: none;
            font-family: 'Geist Mono', monospace;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: color 0.15s ease;
            word-break: break-all;
          }

          .sitemap-link:hover {
            color: #e8702a;
            text-decoration: underline;
          }

          .priority-pill {
            display: inline-flex;
            align-items: center;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-family: 'Geist Mono', monospace;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.06);
            color: #EDEDED;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .priority-high {
            background: rgba(232, 112, 42, 0.15);
            color: #f38a4a;
            border-color: rgba(232, 112, 42, 0.3);
          }

          .freq-tag {
            color: #A3A3A3;
            font-size: 12px;
            font-family: 'Geist Mono', monospace;
          }

          .date-tag {
            color: #737373;
            font-size: 12px;
            font-family: 'Geist Mono', monospace;
          }

          /* ACTIONS / FOOTER */
          .sitemap-footer {
            margin-top: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }

          .sitemap-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 12px;
            background: #e8702a;
            color: #ffffff;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(232, 112, 42, 0.3);
          }

          .sitemap-button:hover {
            background: #d6611e;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(232, 112, 42, 0.4);
          }

          @media (max-width: 640px) {
            .sitemap-main {
              padding: 40px 16px 60px;
            }

            .sitemap-table th:nth-child(2),
            .sitemap-table td:nth-child(2),
            .sitemap-table th:nth-child(3),
            .sitemap-table td:nth-child(3) {
              display: none;
            }

            .sitemap-table td {
              padding: 14px 16px;
            }

            .sitemap-divider {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <!-- BACKGROUND VIDEO: Identical to 404 page -->
        <video autoplay="autoplay" loop="loop" muted="muted" playsinline="playsinline" aria-hidden="true" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260801_001207_ec20d138-aa45-4b2b-ab8c-bdc71607f240.mp4" class="sitemap-video"></video>
        <div class="sitemap-overlay"></div>

        <main class="sitemap-main">
          <!-- HEADER LOGO & BRAND NAME -->
          <header class="sitemap-header">
            <a href="/" class="sitemap-brand-link" title="CodeSage – Return to Studio">
              <img src="/logos/primary-logo.svg" alt="CodeSage Logo" class="sitemap-logo"/>
              <div class="sitemap-brand-text">CodeSage</div>
            </a>
          </header>

          <!-- HERO SECTION -->
          <section class="sitemap-hero">
            <h1 class="sitemap-heading">SITEMAP</h1>
            <div class="sitemap-divider" role="separator"></div>
            <p class="sitemap-subtitle">
              Index of all discoverable pathways and codebase stratigraphy routes.
            </p>
          </section>

          <!-- SITEMAP TABLE CARD -->
          <div class="sitemap-card">
            <div class="sitemap-card-header">
              <span>EXPLORATION REGISTRY</span>
              <span class="sitemap-count-badge">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> routes indexed
              </span>
            </div>

            <table class="sitemap-table">
              <thead>
                <tr>
                  <th>Route / Location</th>
                  <th>Priority</th>
                  <th>Frequency</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a class="sitemap-link">
                        <xsl:attribute name="href">
                          <xsl:value-of select="sitemap:loc"/>
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:choose>
                            <xsl:when test="number(sitemap:priority) &gt;= 0.8">priority-pill priority-high</xsl:when>
                            <xsl:otherwise>priority-pill</xsl:otherwise>
                          </xsl:choose>
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                    <td>
                      <span class="freq-tag">
                        <xsl:value-of select="sitemap:changefreq"/>
                      </span>
                    </td>
                    <td>
                      <span class="date-tag">
                        <xsl:value-of select="sitemap:lastmod"/>
                      </span>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <!-- FOOTER ACTION -->
          <footer class="sitemap-footer">
            <a href="/" class="sitemap-button">
              Return to CodeSage Studio
            </a>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
