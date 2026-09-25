/**
 * CodeSage Studio - Pitch Deck PowerPoint (.pptx) Exporter
 * Generates an editable 7-slide native presentation matching CodeSage design tokens.
 */

export async function exportPitchDeckPPTX(): Promise<void> {
  const pptxgenModule = await import('pptxgenjs');
  const PptxGen = pptxgenModule.default;
  const pres = new PptxGen();

  pres.layout = 'LAYOUT_16x9';
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

  const addHeaderAndFooter = (
    slide: any,
    category: string,
    title: string,
    subtitle: string,
    slideNum: number
  ) => {
    // Top category badge
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 0.5,
      w: 3.4,
      h: 0.35,
      fill: { color: 'FFF7ED' },
      line: { color: 'FDBA74', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText(category, {
      x: 0.8,
      y: 0.5,
      w: 3.4,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.orange,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Main Title
    slide.addText(title, {
      x: 0.8,
      y: 0.95,
      w: 11.7,
      h: 0.55,
      fontSize: 24,
      fontFace: 'Arial',
      color: C.dark,
      bold: true,
      valign: 'middle',
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.5,
      w: 11.7,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: C.gray,
      italic: true,
      valign: 'top',
    });

    // Header divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.9,
      w: 11.7,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    });

    // Footer divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 6.75,
      w: 11.7,
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
      fontFace: 'Arial',
      color: C.gray,
      valign: 'middle',
    });

    slide.addText(`Slide ${slideNum} of 7`, {
      x: 10.5,
      y: 6.85,
      w: 2.0,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
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
        title: 'Codebase Stratigraphy',
        desc: 'Peels back repository file tree strata to calculate language distributions, identify framework signatures, and isolate entry points with complete hierarchy depth.',
      },
      {
        title: 'Grounded Gemini RAG',
        desc: 'Zero-hallucination AI Q&A powered by Google Gemini 2.5 Flash, anchored strictly in real ingested repo metadata and validated file paths.',
      },
      {
        title: 'Anti-Slop UI Craft',
        desc: 'Engineered with crisp typographic hierarchy, responsive spring physics transitions, high-contrast dark/light modes, and zero marketing clutter.',
      },
    ];

    cards.forEach((card, idx) => {
      const cardX = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 2.25,
        w: 3.7,
        h: 4.2,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      // Accent pill
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX + 0.3,
        y: 2.55,
        w: 1.2,
        h: 0.28,
        fill: { color: 'FFF7ED' },
        line: { color: 'FDBA74', width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(`PILLAR 0${idx + 1}`, {
        x: cardX + 0.3,
        y: 2.55,
        w: 1.2,
        h: 0.28,
        fontSize: 8,
        fontFace: 'Arial',
        color: C.orange,
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(card.title, {
        x: cardX + 0.3,
        y: 3.0,
        w: 3.1,
        h: 0.5,
        fontSize: 16,
        fontFace: 'Arial',
        color: C.dark,
        bold: true,
      });

      slide.addText(card.desc, {
        x: cardX + 0.3,
        y: 3.65,
        w: 3.1,
        h: 2.5,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.gray,
        lineSpacing: 18,
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
        title: 'PROBLEM STATEMENT',
        bg: C.redBg,
        border: C.redBorder,
        titleColor: C.redText,
        items: [
          'Developers waste up to 70% of onboarding time navigating 10,000+ line codebases manually.',
          'Core entry points and API routes are hidden in complex nested folder hierarchies.',
          'Generic AI assistants hallucinate non-existent files and invalid package imports.',
        ],
      },
      {
        title: 'CORE OBJECTIVES',
        bg: C.greenBg,
        border: C.greenBorder,
        titleColor: C.greenText,
        items: [
          'Compress initial codebase comprehension from hours to under 3 minutes.',
          'Deliver grounded, zero-hallucination Q&A using Gemini 2.5 Flash RAG prompts.',
          'Provide Technical Architecture vs. Simplified explanation style toggles.',
        ],
      },
      {
        title: 'PROJECT SCOPE',
        bg: C.blueBg,
        border: C.blueBorder,
        titleColor: C.blueText,
        items: [
          'Public GitHub repository URL ingestion & real-time static file parsing.',
          'Language distribution ratio progress bars & framework signature matrix.',
          'Collapsible stratigraphy file tree & interactive AI learning roadmaps.',
        ],
      },
    ];

    sections.forEach((sec, idx) => {
      const cardX = 0.8 + idx * 4.0;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 2.25,
        w: 3.7,
        h: 4.2,
        fill: { color: sec.bg },
        line: { color: sec.border, width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(sec.title, {
        x: cardX + 0.3,
        y: 2.55,
        w: 3.1,
        h: 0.4,
        fontSize: 13,
        fontFace: 'Arial',
        color: sec.titleColor,
        bold: true,
      });

      const bullets = sec.items.map((it) => ({
        text: it,
        options: {
          bullet: true,
          fontSize: 11,
          fontFace: 'Arial',
          color: C.dark,
          breakLine: true,
        },
      }));

      slide.addText(bullets, {
        x: cardX + 0.3,
        y: 3.1,
        w: 3.1,
        h: 3.1,
        lineSpacing: 18,
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

    // Backend Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 2.25,
      w: 5.7,
      h: 4.2,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.15,
    });
    slide.addText('BACKEND SERVER & AI ENGINE (Port 3000)', {
      x: 1.1,
      y: 2.55,
      w: 5.1,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.orange,
      bold: true,
    });

    const backendSpecs = [
      'Runtime: Node.js v22 LTS (ES Modules)',
      'Server Framework: Express.js 4.21 + CORS Middleware',
      'AI SDK: @google/genai v0.2.0 (Gemini 2.5 Flash)',
      'Production Bundler: esbuild (dist/server.cjs)',
      'API Endpoints: /api/v1/repositories, /chat, /file',
      'Security: Path traversal containment & binary null-byte inspection',
    ];
    slide.addText(
      backendSpecs.map((s) => ({
        text: s,
        options: { bullet: true, fontSize: 11, fontFace: 'Arial', color: C.dark, breakLine: true },
      })),
      {
        x: 1.1,
        y: 3.1,
        w: 5.1,
        h: 3.1,
        lineSpacing: 17,
      }
    );

    // Frontend Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 2.25,
      w: 5.7,
      h: 4.2,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.15,
    });
    slide.addText('FRONTEND CLIENT SPA (Vite 6 SPA)', {
      x: 7.1,
      y: 2.55,
      w: 5.1,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: '0284C7',
      bold: true,
    });

    const frontendSpecs = [
      'UI Library: React 18.3 + TypeScript 5.7',
      'Styling Framework: Tailwind CSS v3.4',
      'Design Language: Geist Sans & Geist Mono, 4-stop grayscale tokens',
      'Motion Engine: motion/react v12.4 spring physics',
      'Performance: Lazy loaded PresentationMode (< 70kB initial bundle)',
      'Interactive Features: Liquid Glass CTA, file code inspection drawer',
    ];
    slide.addText(
      frontendSpecs.map((s) => ({
        text: s,
        options: { bullet: true, fontSize: 11, fontFace: 'Arial', color: C.dark, breakLine: true },
      })),
      {
        x: 7.1,
        y: 3.1,
        w: 5.1,
        h: 3.1,
        lineSpacing: 17,
      }
    );
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
      { step: '1', title: 'Repo Submission', desc: 'User enters GitHub URL; frontend validates input.' },
      { step: '2', title: 'Ingestion & Clone', desc: 'Express API fetches repository trees via GitHub REST API.' },
      { step: '3', title: 'Static Parsing', desc: 'Computes language ratios & detects config manifests.' },
      { step: '4', title: 'Gemini Synthesis', desc: 'Gemini 2.5 Flash generates roadmap & summary.' },
      { step: '5', title: 'Grounded Chat', desc: 'Serves zero-hallucination RAG answers with citations.' },
    ];

    steps.forEach((st, idx) => {
      const stepX = 0.8 + idx * 2.4;
      slide.addShape(pres.ShapeType.roundRect, {
        x: stepX,
        y: 2.25,
        w: 2.2,
        h: 2.6,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1,
      });

      slide.addShape(pres.ShapeType.ellipse, {
        x: stepX + 0.85,
        y: 2.45,
        w: 0.5,
        h: 0.5,
        fill: { color: C.orange },
      });
      slide.addText(st.step, {
        x: stepX + 0.85,
        y: 2.45,
        w: 0.5,
        h: 0.5,
        fontSize: 12,
        fontFace: 'Arial',
        color: 'FFFFFF',
        bold: true,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(st.title, {
        x: stepX + 0.1,
        y: 3.1,
        w: 2.0,
        h: 0.4,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.dark,
        bold: true,
        align: 'center',
      });

      slide.addText(st.desc, {
        x: stepX + 0.15,
        y: 3.55,
        w: 1.9,
        h: 1.1,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.gray,
        align: 'center',
      });
    });

    // Command flow box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 5.15,
      w: 11.7,
      h: 1.35,
      fill: { color: '0F172A' },
      line: { color: '1E293B', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('EXECUTION TIMELINE & DATA PIPELINE SEQUENCE', {
      x: 1.1,
      y: 5.3,
      w: 11.1,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.orange,
      bold: true,
    });
    slide.addText(
      'POST /api/v1/repositories ➔ RepoCloneService.cloneOrFetch() ➔ RepoAnalysisService.analyze() ➔ geminiService.generateSummary() ➔ POST /chat RAG Streaming',
      {
        x: 1.1,
        y: 5.7,
        w: 11.1,
        h: 0.5,
        fontSize: 11,
        fontFace: 'Courier New',
        color: 'E2E8F0',
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
        title: 'Enterprise Developer Onboarding',
        desc: 'Cuts initial developer orientation time from 2–3 days to under 10 minutes, enabling new software engineers to submit their first PR on Day 1.',
      },
      {
        title: 'Open Source Triage & Contributions',
        desc: 'Empowers open-source contributors to locate primary entry points, active frameworks, and architectural boundaries in seconds.',
      },
      {
        title: 'Code Quality & Security Auditing',
        desc: 'Enables security auditors to instantly inspect tech stack composition, verify config manifests (package.json, Dockerfile), and analyze dependency risks.',
      },
      {
        title: 'Higher Education & Architecture Study',
        desc: 'Allows students and computer science educators to dissect production-grade software architectures interactively with technical and simplified explanation modes.',
      },
    ];

    apps.forEach((app, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.8 + col * 6.0;
      const cardY = 2.25 + row * 2.2;

      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cardY,
        w: 5.7,
        h: 1.95,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(app.title, {
        x: cardX + 0.3,
        y: cardY + 0.25,
        w: 5.1,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.dark,
        bold: true,
      });

      slide.addText(app.desc, {
        x: cardX + 0.3,
        y: cardY + 0.65,
        w: 5.1,
        h: 1.1,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.gray,
        lineSpacing: 16,
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
        role: 'Member 1 — Lead Full-Stack Architect',
        desc: 'Architected the Express + Vite unified server structure, REST API router endpoints, esbuild CommonJS bundling pipeline, and Cloud Run port 3000 execution setup.',
      },
      {
        role: 'Member 2 — AI & RAG Systems Engineer',
        desc: 'Integrated Google GenAI SDK (@google/genai), engineered grounded system prompts, implemented technical vs simple explanation style toggles, and streaming RAG handlers.',
      },
      {
        role: 'Member 3 — Frontend & Motion UI Developer',
        desc: 'Built React 18 SPA components (App.tsx, RagChatSection.tsx), integrated Motion spring physics transitions, and built the Lithos geological spotlight hero canvas.',
      },
      {
        role: 'Member 4 — Data Parsing Specialist',
        desc: 'Developed repoCloneService.ts and repoAnalysisService.ts, created language regex parsing algorithms, framework signature detectors, and JSON storage schema.',
      },
    ];

    members.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.8 + col * 6.0;
      const cardY = 2.25 + row * 2.2;

      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: cardY,
        w: 5.7,
        h: 1.95,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(m.role, {
        x: cardX + 0.3,
        y: cardY + 0.25,
        w: 5.1,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.orange,
        bold: true,
      });

      slide.addText(m.desc, {
        x: cardX + 0.3,
        y: cardY + 0.65,
        w: 5.1,
        h: 1.1,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.gray,
        lineSpacing: 16,
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

    refs.forEach((ref, idx) => {
      const cardY = 2.25 + idx * 0.88;
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: cardY,
        w: 11.7,
        h: 0.76,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(ref.id, {
        x: 1.0,
        y: cardY + 0.15,
        w: 0.5,
        h: 0.45,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.orange,
        bold: true,
      });

      slide.addText(ref.title, {
        x: 1.6,
        y: cardY + 0.1,
        w: 10.7,
        h: 0.28,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.dark,
        bold: true,
      });

      slide.addText(ref.desc, {
        x: 1.6,
        y: cardY + 0.38,
        w: 10.7,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.gray,
      });
    });
  }

  // Trigger browser download
  await pres.writeFile({ fileName: 'CodeSage-Pitch-Deck.pptx' });
}
