/**
 * CodeSage Studio - Pitch Deck PowerPoint (.pptx) Exporter
 * Generates an editable 7-slide native 16:9 widescreen presentation matching CodeSage design tokens.
 */

export async function exportPitchDeckPPTX(): Promise<void> {
  const pptxgenModule = await import('pptxgenjs');
  const PptxGen = (pptxgenModule as any).default || pptxgenModule;
  const pres = new PptxGen();

  // Modern 16:9 widescreen layout (13.333" x 7.5")
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'CodeSage Studio Pitch Deck';
  pres.author = 'CodeSage Core Team';
  pres.subject = 'Automated Codebase Geology & Grounded RAG Engine';

  const C = {
    bg: 'FFFFFF',
    dark: '0F172A',
    orange: 'E8702A',
    gray: '64748B',
    mutedText: '475569',
    cardBg: 'F8FAFC',
    cardBorder: 'E2E8F0',
    redBg: 'FEF2F2',
    redBorder: 'FECACA',
    redText: '991B1B',
    greenBg: 'F0FDF4',
    greenBorder: 'BBF7D0',
    greenText: '166534',
    blueBg: 'EFF6FF',
    blueBorder: 'BFDBFE',
    blueText: '1E40AF',
  };

  const FONT_PRIMARY = 'Helvetica Neue';
  const FONT_MONO = 'Menlo';

  const getBadgeWidth = (category: string) => {
    return Math.max(1.8, Math.min(3.8, category.length * 0.105 + 0.45));
  };

  const addHeaderAndFooter = (
    slide: any,
    category: string,
    title: string,
    subtitle: string,
    slideNum: number
  ) => {
    const badgeW = getBadgeWidth(category);

    // Top category badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 0.48,
      w: badgeW,
      h: 0.32,
      fill: { color: 'FFF7ED' },
      line: { color: 'FDBA74', width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(category, {
      x: 0.8,
      y: 0.48,
      w: badgeW,
      h: 0.32,
      fontSize: 9,
      fontFace: FONT_PRIMARY,
      color: C.orange,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Main Title
    slide.addText(title, {
      x: 0.8,
      y: 0.90,
      w: 11.73,
      h: 0.50,
      fontSize: 22,
      fontFace: FONT_PRIMARY,
      color: C.dark,
      bold: true,
      valign: 'middle',
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.45,
      w: 11.73,
      h: 0.32,
      fontSize: 11.5,
      fontFace: FONT_PRIMARY,
      color: C.gray,
      valign: 'top',
    });

    // Header divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.85,
      w: 11.73,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    });

    // Footer divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 6.75,
      w: 11.73,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    });

    // Footer text
    slide.addText('CodeSage Studio • Automated Codebase Geology & Grounded RAG Engine', {
      x: 0.8,
      y: 6.85,
      w: 9.0,
      h: 0.35,
      fontSize: 9,
      fontFace: FONT_PRIMARY,
      color: C.gray,
      valign: 'middle',
    });

    slide.addText(`Slide ${slideNum} of 7`, {
      x: 9.73,
      y: 6.85,
      w: 2.8,
      h: 0.35,
      fontSize: 9,
      fontFace: FONT_PRIMARY,
      color: C.orange,
      bold: true,
      align: 'right',
      valign: 'middle',
    });
  };

  // ==========================================
  // SLIDE 1: TOPIC OF THE PROJECT
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '1. TOPIC OF THE PROJECT',
      'CodeSage Studio',
      'Automated Codebase Geology & Grounded Retrieval-Augmented Generation Engine',
      1
    );

    const cards = [
      {
        pill: 'PILLAR 01',
        title: 'Codebase Stratigraphy',
        desc: 'Peels back repository file tree strata to calculate language distributions, identify framework signatures, and isolate entry points with complete hierarchy depth.',
        highlight: 'Deep Tree & AST Inspection',
      },
      {
        pill: 'PILLAR 02',
        title: 'Grounded Gemini RAG',
        desc: 'Zero-hallucination AI Q&A powered by Google Gemini 2.5 Flash, anchored strictly in real ingested repo metadata and validated file paths.',
        highlight: 'Real-Time SSE Streaming',
      },
      {
        pill: 'PILLAR 03',
        title: 'Anti-Slop UI Craft',
        desc: 'Engineered with crisp typographic hierarchy, responsive spring physics transitions, high-contrast dark/light modes, and zero marketing clutter.',
        highlight: 'Vercel Minimalist Tokens',
      },
    ];

    const cardW = 3.71;
    const gap = 0.30;
    cards.forEach((card, idx) => {
      const cardX = 0.80 + idx * (cardW + gap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 2.15,
        w: cardW,
        h: 4.30,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12,
      });

      // Accent pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.30,
        y: 2.45,
        w: 1.20,
        h: 0.28,
        fill: { color: 'FFF7ED' },
        line: { color: 'FDBA74', width: 1 },
        rectRadius: 0.06,
      });
      slide.addText(card.pill, {
        x: cardX + 0.30,
        y: 2.45,
        w: 1.20,
        h: 0.28,
        fontSize: 8.5,
        fontFace: FONT_PRIMARY,
        color: C.orange,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      // Title
      slide.addText(card.title, {
        x: cardX + 0.30,
        y: 2.90,
        w: 3.11,
        h: 0.50,
        fontSize: 16,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
      });

      // Description
      slide.addText(card.desc, {
        x: cardX + 0.30,
        y: 3.55,
        w: 3.11,
        h: 1.80,
        fontSize: 11.5,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        lineSpacing: 17,
        valign: 'top',
      });

      // Bottom highlight badge
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.30,
        y: 5.75,
        w: 3.11,
        h: 0.40,
        fill: { color: 'FFFFFF' },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(`✦  ${card.highlight}`, {
        x: cardX + 0.40,
        y: 5.75,
        w: 2.91,
        h: 0.40,
        fontSize: 9.5,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
        valign: 'middle',
      });
    });
  }

  // ==========================================
  // SLIDE 2: PROBLEM, OBJECTIVE & SCOPE
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '2. PROBLEM, OBJECTIVE & SCOPE',
      'Solving Codebase Onboarding Friction',
      'Eliminating Cognitive Overload & AI Hallucinations in Software Inspection',
      2
    );

    const sections = [
      {
        tag: 'CHALLENGES',
        title: 'PROBLEM STATEMENT',
        bg: C.redBg,
        border: C.redBorder,
        titleColor: C.redText,
        dotColor: 'DC2626',
        items: [
          'Developers waste up to 70% of onboarding time navigating 10,000+ line codebases manually.',
          'Core entry points and API routes are hidden in complex nested folder hierarchies.',
          'Generic AI assistants hallucinate non-existent files and invalid package imports.',
        ],
      },
      {
        tag: 'TARGETS',
        title: 'CORE OBJECTIVES',
        bg: C.greenBg,
        border: C.greenBorder,
        titleColor: C.greenText,
        dotColor: '16A34A',
        items: [
          'Compress initial codebase comprehension from hours to under 3 minutes.',
          'Deliver grounded, zero-hallucination Q&A using Gemini 2.5 Flash RAG prompts.',
          'Provide Technical Architecture vs. Simplified explanation style toggles.',
        ],
      },
      {
        tag: 'BOUNDARIES',
        title: 'PROJECT SCOPE',
        bg: C.blueBg,
        border: C.blueBorder,
        titleColor: C.blueText,
        dotColor: '2563EB',
        items: [
          'Public GitHub repository URL ingestion & real-time static file parsing.',
          'Language distribution ratio progress bars & framework signature matrix.',
          'Collapsible stratigraphy file tree & interactive AI learning roadmaps.',
        ],
      },
    ];

    const cardW = 3.71;
    const gap = 0.30;
    sections.forEach((sec, idx) => {
      const cardX = 0.80 + idx * (cardW + gap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 2.15,
        w: cardW,
        h: 4.30,
        fill: { color: sec.bg },
        line: { color: sec.border, width: 1 },
        rectRadius: 0.12,
      });

      slide.addText(sec.title, {
        x: cardX + 0.30,
        y: 2.45,
        w: 3.11,
        h: 0.40,
        fontSize: 13,
        fontFace: FONT_PRIMARY,
        color: sec.titleColor,
        bold: true,
      });

      sec.items.forEach((itemText, iIdx) => {
        const itemY = 3.05 + iIdx * 1.05;
        slide.addShape(pres.ShapeType.ellipse, {
          x: cardX + 0.30,
          y: itemY + 0.08,
          w: 0.10,
          h: 0.10,
          fill: { color: sec.dotColor },
        });

        slide.addText(itemText, {
          x: cardX + 0.52,
          y: itemY,
          w: 2.89,
          h: 0.90,
          fontSize: 10.8,
          fontFace: FONT_PRIMARY,
          color: C.dark,
          valign: 'top',
          lineSpacing: 16,
        });
      });
    });
  }

  // ==========================================
  // SLIDE 3: HARDWARE & SOFTWARE REQUIREMENTS
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '3. HARDWARE & SOFTWARE REQUIREMENTS',
      'Production Infrastructure & Stack',
      'Node.js 22 Runtime, React 18 SPA, and Google Gemini 2.5 Flash SDK',
      3
    );

    const cardW = 5.71;
    const gap = 0.31;

    // Backend Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.80,
      y: 2.15,
      w: cardW,
      h: 4.30,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.12,
    });
    slide.addText('BACKEND SERVER & AI ENGINE • PORT 3000', {
      x: 1.10,
      y: 2.45,
      w: 5.11,
      h: 0.35,
      fontSize: 12.5,
      fontFace: FONT_PRIMARY,
      color: C.orange,
      bold: true,
    });

    const backendSpecs = [
      { label: 'Runtime', val: 'Node.js v22 LTS (ES Modules & native fetch)' },
      { label: 'Server API', val: 'Express.js 4.21 with CORS & route validation' },
      { label: 'AI SDK', val: '@google/genai v0.2.0 (Gemini 2.5 Flash SSE)' },
      { label: 'Bundler', val: 'esbuild (optimized CJS target: dist/server.cjs)' },
      { label: 'Endpoints', val: '/api/v1/repositories, /chat, /file, /cache' },
      { label: 'Security', val: 'Strict traversal containment & binary null-byte checks' },
    ];

    backendSpecs.forEach((spec, idx) => {
      const rowY = 2.95 + idx * 0.55;
      slide.addShape(pres.ShapeType.ellipse, {
        x: 1.10,
        y: rowY + 0.08,
        w: 0.10,
        h: 0.10,
        fill: { color: C.orange },
      });
      slide.addText(
        [
          { text: `${spec.label}: `, options: { bold: true, color: C.dark } },
          { text: spec.val, options: { bold: false, color: C.mutedText } },
        ],
        {
          x: 1.30,
          y: rowY,
          w: 4.90,
          h: 0.45,
          fontSize: 10.8,
          fontFace: FONT_PRIMARY,
          valign: 'top',
        }
      );
    });

    // Frontend Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.80 + cardW + gap,
      y: 2.15,
      w: cardW,
      h: 4.30,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.12,
    });
    slide.addText('FRONTEND CLIENT SPA • VITE 6 & REACT 18', {
      x: 0.80 + cardW + gap + 0.30,
      y: 2.45,
      w: 5.11,
      h: 0.35,
      fontSize: 12.5,
      fontFace: FONT_PRIMARY,
      color: '0284C7',
      bold: true,
    });

    const frontendSpecs = [
      { label: 'UI Library', val: 'React 18.3 + TypeScript 5.7 Strict Mode' },
      { label: 'Styling', val: 'Tailwind CSS v3.4 + Vercel Geist design tokens' },
      { label: 'Motion', val: 'motion/react v12.4 spring physics transitions' },
      { label: 'Cache', val: 'IndexedDB client cache + sub-2ms SQLite sync' },
      { label: 'Bundle', val: 'Code-split vendor chunks (< 70kB initial entry)' },
      { label: 'Highlights', val: 'Liquid Glass CTA, code viewer drawer, SSE markdown' },
    ];

    frontendSpecs.forEach((spec, idx) => {
      const rowY = 2.95 + idx * 0.55;
      slide.addShape(pres.ShapeType.ellipse, {
        x: 0.80 + cardW + gap + 0.30,
        y: rowY + 0.08,
        w: 0.10,
        h: 0.10,
        fill: { color: '0284C7' },
      });
      slide.addText(
        [
          { text: `${spec.label}: `, options: { bold: true, color: C.dark } },
          { text: spec.val, options: { bold: false, color: C.mutedText } },
        ],
        {
          x: 0.80 + cardW + gap + 0.50,
          y: rowY,
          w: 4.90,
          h: 0.45,
          fontSize: 10.8,
          fontFace: FONT_PRIMARY,
          valign: 'top',
        }
      );
    });
  }

  // ==========================================
  // SLIDE 4: ARCHITECTURE & TIMELINE
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '4. ARCHITECTURE & TIMELINE',
      'System Topology & Process Flow',
      'End-to-End Execution Sequence from GitHub Submission to Grounded RAG Ingestion',
      4
    );

    const steps = [
      { step: '1', title: 'Repo Submission', desc: 'Validates GitHub URL & branch selector on client.' },
      { step: '2', title: 'Ingestion & Clone', desc: 'Fetches Git trees via REST API or local fallback.' },
      { step: '3', title: 'Static Parsing', desc: 'Calculates language stats & scans manifest files.' },
      { step: '4', title: 'Gemini Synthesis', desc: 'Gemini 2.5 Flash synthesizes architecture & roadmap.' },
      { step: '5', title: 'Grounded Chat', desc: 'Streams SSE chat tokens with verified file paths.' },
    ];

    const stepW = 2.15;
    const gap = 0.245;
    steps.forEach((st, idx) => {
      const stepX = 0.80 + idx * (stepW + gap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: stepX,
        y: 2.15,
        w: stepW,
        h: 2.70,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.10,
      });

      // Step indicator circle
      slide.addShape(pres.ShapeType.ellipse, {
        x: stepX + (stepW - 0.50) / 2,
        y: 2.35,
        w: 0.50,
        h: 0.50,
        fill: { color: C.orange },
      });
      slide.addText(st.step, {
        x: stepX + (stepW - 0.50) / 2,
        y: 2.35,
        w: 0.50,
        h: 0.50,
        fontSize: 12,
        fontFace: FONT_PRIMARY,
        color: 'FFFFFF',
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      // Vector right arrow between step cards
      if (idx < steps.length - 1) {
        slide.addShape(pres.ShapeType.rightArrow, {
          x: stepX + stepW + 0.05,
          y: 3.42,
          w: 0.145,
          h: 0.12,
          fill: { color: 'CBD5E1' },
          line: { color: '94A3B8', width: 0.5 },
        });
      }

      slide.addText(st.title, {
        x: stepX + 0.12,
        y: 2.95,
        w: stepW - 0.24,
        h: 0.40,
        fontSize: 11.5,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
        align: 'center',
      });

      slide.addText(st.desc, {
        x: stepX + 0.12,
        y: 3.45,
        w: stepW - 0.24,
        h: 1.25,
        fontSize: 10,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        align: 'center',
        lineSpacing: 15,
      });
    });

    // Dark execution pipeline container
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.80,
      y: 5.05,
      w: 11.73,
      h: 1.45,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 },
      rectRadius: 0.10,
    });

    slide.addText('EXECUTION TIMELINE & DATA PIPELINE SEQUENCE', {
      x: 1.10,
      y: 5.20,
      w: 11.13,
      h: 0.30,
      fontSize: 10,
      fontFace: FONT_PRIMARY,
      color: C.orange,
      bold: true,
    });

    slide.addText(
      'Ingest & Parse : POST /api/v1/repositories  →  RepoCloneService  →  RepoAnalysisService\nAI & Streaming : geminiService.generateSummary()  →  GET /chat (SSE Stream)',
      {
        x: 1.10,
        y: 5.60,
        w: 11.13,
        h: 0.65,
        fontSize: 10,
        fontFace: FONT_MONO,
        color: 'E2E8F0',
        valign: 'middle',
        lineSpacing: 18,
      }
    );
  }

  // ==========================================
  // SLIDE 5: USABILITY & APPLICATIONS
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '5. USABILITY & APPLICATIONS',
      'Real-World Impact & Value',
      'Enterprise Developer Onboarding, Open-Source Triage, and Security Audits',
      5
    );

    const apps = [
      {
        tag: 'ENTERPRISE',
        title: 'Developer Onboarding Acceleration',
        desc: 'Cuts initial engineer onboarding from 2–3 days to under 10 minutes, allowing new engineers to understand architectural flow and push PRs on Day 1.',
        badge: 'Time Saved: ~95%',
      },
      {
        tag: 'OPEN SOURCE',
        title: 'Community Contribution & Triage',
        desc: 'Enables external contributors to instantly pinpoint core entry points, routing tables, and conventions without getting lost in nested folder structures.',
        badge: 'Zero Ramp-Up Delay',
      },
      {
        tag: 'GOVERNANCE',
        title: 'Code Quality & Security Auditing',
        desc: 'Provides security leads and reviewers with instantaneous dependency matrices, tech stack breakdowns, and configuration manifest audits.',
        badge: 'Automated Manifest Audit',
      },
      {
        tag: 'EDUCATION',
        title: 'Higher Education & System Study',
        desc: 'Enables students and educators to inspect modern production repos with dual Technical Architecture vs. Simplified explanation mode toggles.',
        badge: 'Dual Explanation Modes',
      },
    ];

    const cardW = 5.71;
    const cardH = 2.00;
    const gapX = 0.31;
    const gapY = 0.30;

    apps.forEach((app, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.80 + col * (cardW + gapX);
      const cardY = 2.15 + row * (cardH + gapY);

      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardH,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12,
      });

      // Tag
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.30,
        y: cardY + 0.22,
        w: 1.30,
        h: 0.24,
        fill: { color: 'FFF7ED' },
        line: { color: 'FDBA74', width: 1 },
        rectRadius: 0.06,
      });
      slide.addText(app.tag, {
        x: cardX + 0.30,
        y: 2.15 + row * (cardH + gapY) + 0.22,
        w: 1.30,
        h: 0.24,
        fontSize: 7.5,
        fontFace: FONT_PRIMARY,
        color: C.orange,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      // Right metric badge
      slide.addText(app.badge, {
        x: cardX + cardW - 2.50,
        y: cardY + 0.22,
        w: 2.20,
        h: 0.24,
        fontSize: 8.5,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        align: 'right',
        valign: 'middle',
      });

      // Title
      slide.addText(app.title, {
        x: cardX + 0.30,
        y: cardY + 0.55,
        w: cardW - 0.60,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
      });

      // Description
      slide.addText(app.desc, {
        x: cardX + 0.30,
        y: cardY + 0.95,
        w: cardW - 0.60,
        h: 0.85,
        fontSize: 10.8,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        lineSpacing: 16,
        valign: 'top',
      });
    });
  }

  // ==========================================
  // SLIDE 6: TEAM CONTRIBUTIONS
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '6. TEAM CONTRIBUTIONS',
      'Member Responsibilities & Roles',
      'Modular Division of Architectural, AI, UI, and Data Ingestion Workstreams',
      6
    );

    const members = [
      {
        tag: 'FULL-STACK LEAD',
        role: 'Member 1 — Lead Full-Stack Architect',
        desc: 'Architected the Express + Vite unified server structure, REST API router endpoints, esbuild CommonJS bundling pipeline, and Cloud Run port 3000 execution setup.',
        deliverable: 'Core API & Bundle Architecture',
      },
      {
        tag: 'AI ENGINEER',
        role: 'Member 2 — AI & RAG Systems Engineer',
        desc: 'Integrated Google GenAI SDK (@google/genai), engineered grounded system prompts, implemented technical vs simple explanation style toggles, and streaming RAG handlers.',
        deliverable: 'SSE Streaming & Gemini Integration',
      },
      {
        tag: 'FRONTEND LEAD',
        role: 'Member 3 — Frontend & Motion UI Developer',
        desc: 'Built React 18 SPA components (App.tsx, RagChatSection.tsx), integrated Motion spring physics transitions, and built the Lithos geological spotlight hero canvas.',
        deliverable: 'UI Design System & Motion Physics',
      },
      {
        tag: 'DATA SPECIALIST',
        role: 'Member 4 — Data Parsing Specialist',
        desc: 'Developed repoCloneService.ts and repoAnalysisService.ts, created language regex parsing algorithms, framework signature detectors, and JSON storage schema.',
        deliverable: 'Stratigraphy AST & Parsing Engine',
      },
    ];

    const cardW = 5.71;
    const cardH = 2.00;
    const gapX = 0.31;
    const gapY = 0.30;

    members.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.80 + col * (cardW + gapX);
      const cardY = 2.15 + row * (cardH + gapY);

      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardH,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12,
      });

      // Role Tag
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.30,
        y: cardY + 0.22,
        w: 1.50,
        h: 0.24,
        fill: { color: 'FFF7ED' },
        line: { color: 'FDBA74', width: 1 },
        rectRadius: 0.06,
      });
      slide.addText(m.tag, {
        x: cardX + 0.30,
        y: cardY + 0.22,
        w: 1.50,
        h: 0.24,
        fontSize: 7.5,
        fontFace: FONT_PRIMARY,
        color: C.orange,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      // Right deliverable text
      slide.addText(m.deliverable, {
        x: cardX + cardW - 3.20,
        y: cardY + 0.22,
        w: 2.90,
        h: 0.24,
        fontSize: 8.5,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        align: 'right',
        valign: 'middle',
      });

      // Member Role
      slide.addText(m.role, {
        x: cardX + 0.30,
        y: cardY + 0.55,
        w: cardW - 0.60,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
      });

      // Description
      slide.addText(m.desc, {
        x: cardX + 0.30,
        y: cardY + 0.95,
        w: cardW - 0.60,
        h: 0.85,
        fontSize: 10.8,
        fontFace: FONT_PRIMARY,
        color: C.gray,
        lineSpacing: 16,
        valign: 'top',
      });
    });
  }

  // ==========================================
  // SLIDE 7: REFERENCES & STANDARDS
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeaderAndFooter(
      slide,
      '7. REFERENCES',
      'References & Industry Standards',
      'Core SDK Specifications, API Frameworks, and RAG Research Papers',
      7
    );

    const refs = [
      {
        id: '[1]',
        title: 'Google GenAI SDK & Gemini API Guidelines',
        desc: 'Google DeepMind (2025-2026). @google/genai TypeScript SDK Specification & Gemini 2.5 Flash Reference.',
      },
      {
        id: '[2]',
        title: 'GitHub REST API v3 Specification',
        desc: 'GitHub Developer Network. Repositories, Git Trees, and Content Endpoints.',
      },
      {
        id: '[3]',
        title: 'React 18 & Vite Web Architecture',
        desc: 'React Core Team & Evan You. React 18 Concurrent Rendering and Vite 6 Build System.',
      },
      {
        id: '[4]',
        title: 'Express.js & ESM Server Standards',
        desc: 'Express Committee. Express 4.x API Reference & Container Integration.',
      },
      {
        id: '[5]',
        title: 'Retrieval-Augmented Generation (RAG) Research',
        desc: 'Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020.',
      },
    ];

    const rowH = 0.74;
    const gapY = 0.14;
    refs.forEach((ref, idx) => {
      const rowY = 2.15 + idx * (rowH + gapY);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.80,
        y: rowY,
        w: 11.73,
        h: rowH,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.08,
      });

      // ID pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.05,
        y: rowY + 0.15,
        w: 0.45,
        h: 0.44,
        fill: { color: 'FFF7ED' },
        line: { color: 'FDBA74', width: 1 },
        rectRadius: 0.06,
      });
      slide.addText(ref.id, {
        x: 1.05,
        y: rowY + 0.15,
        w: 0.45,
        h: 0.44,
        fontSize: 10,
        fontFace: FONT_PRIMARY,
        color: C.orange,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(ref.title, {
        x: 1.70,
        y: rowY + 0.12,
        w: 10.55,
        h: 0.25,
        fontSize: 11.8,
        fontFace: FONT_PRIMARY,
        color: C.dark,
        bold: true,
      });

      slide.addText(ref.desc, {
        x: 1.70,
        y: rowY + 0.38,
        w: 10.55,
        h: 0.26,
        fontSize: 10,
        fontFace: FONT_PRIMARY,
        color: C.gray,
      });
    });
  }

  // Trigger browser download
  await pres.writeFile({ fileName: 'CodeSage-Pitch-Deck.pptx' });
}
