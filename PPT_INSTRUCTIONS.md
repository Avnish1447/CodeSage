# PPT INSTRUCTIONS & SLIDE-BY-SLIDE CONTENT GUIDE

**Project Title:** CodeSage Studio  
**Subtitle:** Codebase Stratigraphy & Grounded RAG Analysis Engine  
**Purpose:** Slide-by-slide master blueprint for creating the presentation deck (PowerPoint / Google Slides / Canva).

---

## SLIDE 1: Topic of the Project

### Slide Title
**CodeSage Studio**  
*Automated Codebase Geology & Grounded Retrieval-Augmented Generation Engine*

### Layout Recommendation
* **Layout:** Centered Hero Title with a 2-Column Split below.
* **Left Column:** Visual Product Identity & Tagline Card.
* **Right Column:** Key Architectural Pillars & High-Level System Concept.

### Exact On-Slide Content

#### Title & Subtitle Header
> **CodeSage Studio**  
> *Peeling Back the Crust of Any GitHub Repository with Grounded AI Intelligence*

#### Left Column (Product Identity Card)
* **Project Name:** CodeSage Studio
* **Domain:** Generative AI | Retrieval-Augmented Generation (RAG) | Full-Stack Web Engineering
* **Core Value Proposition:** Accelerate codebase comprehension from hours to under 3 minutes by combining automated static file tree stratigraphy with grounded Gemini 2.5 Flash RAG chat.

#### Right Column (Core Technical Pillars)
* 🔍 **Codebase Geology (Stratigraphy):** Automated parsing of repository file trees, language breakdown percentages, and active framework signatures.
* ⚡ **Grounded RAG Intelligence:** Zero-hallucination Q&A powered by Google Gemini 2.5 Flash anchored directly in the repository's ingested metadata.
* 🎨 **Liquid Workbench UI:** Responsive multi-view dashboard (Dual Workbench, Codebase Explorer, Full Chat) with `motion/react` spring physics transitions.

#### Visual Diagram Block (To render on Slide 1)
```
[ Public GitHub Repo URL ] ──► [ Static Analysis & Stratigraphy ] ──► [ Grounded Gemini 2.5 RAG ]
```

---

### Speaker Notes for Slide 1
> "Good morning everyone. Today we are presenting CodeSage Studio. Every software developer, open-source maintainer, and security auditor faces the exact same friction: opening a new repository with tens of thousands of lines of code and spending hours trying to figure out where the entry point is, what frameworks are used, and how modules connect. CodeSage Studio solves this by treating codebases like geological strata—parsing them automatically and pairing them with a grounded Google Gemini RAG engine to deliver instant, hallucination-free answers."

---

## SLIDE 2: Problem Statement / Objective / Scope of the Project

### Slide Title
**Problem Statement, Objective & Project Scope**

### Layout Recommendation
* **Layout:** 3-Column Visual Grid / Card Layout.
* **Column 1:** Problem Statement (Red/Orange Accent).
* **Column 2:** Objectives & Solution (Emerald/Green Accent).
* **Column 3:** Project Scope (Blue/Slate Accent).

### Exact On-Slide Content

#### Column 1: Problem Statement
* ❌ **Developer Cognitive Overload:** Reading 10,000+ LOC codebases requires hours of manual file navigation and context switching.
* ❌ **Lost Entry Points:** Difficulty pinpointing application initialization, API routing layers, and core data stores when joining projects.
* ❌ **AI Hallucination in Generic Tools:** Off-the-shelf AI assistants lack exact repository structure context, leading to non-existent imports and broken code advice.

#### Column 2: Core Objectives
* 🎯 **3-Minute Onboarding:** Reduce initial codebase comprehension time by up to 70%.
* 🎯 **Grounded Context Ingestion:** Anchor AI chat responses strictly inside real repository file trees and configuration manifests using Gemini 2.5 Flash.
* 🎯 **Dual Communication Modes:** Provide toggles for **Technical Architecture** vs. **In Simpler Language** explanations.

#### Column 3: Project Scope
* ✅ **In-Scope Features:**
  * Public GitHub repository URL ingestion & real-time parsing.
  * 15+ language distribution progress bars & framework matrix detection.
  * Collapsible stratigraphy file tree viewer with entry point badging.
  * AI-generated learning roadmap & architectural executive summary.
  * Interactive grounded chat with suggested queries.
* 🚫 **Out-of-Scope (Future Expansion):**
  * Private repository access requiring user OAuth tokens.
  * In-browser live code editor & direct Git commit pushing.

---

### Speaker Notes for Slide 2
> "Looking at Slide 2, we break down the fundamental problem, our core objective, and our project boundary. Traditional code comprehension is slow and generic AI tools often hallucinate non-existent files. Our objective was to engineer a system that parses real public GitHub repos in under 3 seconds, builds an exact context payload, and uses Gemini 2.5 Flash to answer questions with zero hallucination. Our scope covers ingestion, tech stack profiling, file tree stratigraphy, learning paths, and interactive grounded RAG chat."

---

## SLIDE 3: Hardware / Software Requirement

### Slide Title
**Hardware & Software Requirements**

### Layout Recommendation
* **Layout:** 2-Column Split Container.
* **Left Table:** Hardware Requirements (Server & Client).
* **Right Cards:** Software Stack Breakdown (Backend, Frontend, AI Services).

### Exact On-Slide Content

#### Left Side: Hardware Specifications Table

| Category | Minimum Server Spec | Recommended Production Spec | Client Machine Spec |
|---|---|---|---|
| **CPU** | 64-bit Dual-Core 2.0 GHz | 4-Core vCPU (Cloud Run) | Any Modern Processor |
| **RAM** | 4 GB System Memory | 8 GB RAM | 2 GB Available RAM |
| **Storage** | 500 MB Free SSD Space | 2 GB High-Speed NVMe | N/A (Web Browser Only) |
| **Network** | 10 Mbps Broadband | 100 Mbps Low-Latency Net | Standard Internet Access |

#### Right Side: Software Stack Matrix

* ⚙️ **Backend Runtime & API Server:**
  * **Runtime:** Node.js v22+ (ES Modules)
  * **Framework:** Express.js v4.21 with CORS middleware
  * **Bundling:** `esbuild` v0.25 (Production CommonJS Server Bundle `dist/server.cjs`), `tsx` (Dev Execution)
* 🎨 **Frontend UI & Motion Engine:**
  * **Framework:** React 18.3 & TypeScript 5.7 (Vite v6.1 SPA)
  * **Styling:** Tailwind CSS v3.4 (Custom dark slate & orange palette)
  * **Animation:** Motion (`motion/react` v12.4) layout physics & `AnimatePresence`
  * **Rendering:** Lucide React Icons & `react-markdown` v10.1
* 🤖 **AI Model & External APIs:**
  * **AI SDK:** Google GenAI SDK (`@google/genai` v0.2.0)
  * **LLM Engine:** Gemini 2.5 Flash / Gemini 1.5 Flash Model
  * **Ingestion:** GitHub REST API v3

---

### Speaker Notes for Slide 3
> "On Slide 3, we specify our exact software and hardware requirements. The entire system runs inside a lightweight, containerized Cloud Run environment using Node.js 22 and Express. On the client side, it is a single-page React application powered by Vite, Tailwind CSS, and Motion. The AI intelligence relies on Google's modern `@google/genai` SDK using the Gemini 2.5 Flash model, guaranteeing ultra-low latency server-side proxying without exposing API keys to the browser."

---

## SLIDE 4: Architecture Diagram / Process Flow / Timeline

### Slide Title
**System Architecture, Process Flow & Timeline**

### Layout Recommendation
* **Layout:** Full-Width Diagram Top Box + 2-Column Bottom Split (Process Flow & Timeline).

### Exact On-Slide Content

#### Top Component: Full System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER (Vite SPA)                          │
│   React 18 | Lithos Hero | Tech Stack Visualizer | File Tree | RAG Chat Assistant │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │ HTTP REST API (Port 3000)
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS.JS SERVER ENGINE (/api/v1)                       │
│  ┌─────────────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │ RepoCloneService & Analysis Parser  │   │  Gemini RAG Engine Service        │  │
│  └──────────────────┬──────────────────┘   └─────────────────┬─────────────────┘  │
└─────────────────────┼────────────────────────────────────────┼────────────────────┘
                      │ Local Persistence                      │ Remote API Call
                      ▼                                        ▼
┌────────────────────────────────────────┐   ┌──────────────────────────────────────┐
│  Storage: /storage/repos/{id}/meta.json │   │  Google Gemini API (Gemini 2.5 Flash) │
└────────────────────────────────────────┘   └──────────────────────────────────────┘
```

#### Bottom Left Column: Step-by-Step Process Flow
1. **Submit:** User submits public GitHub URL or selects a quick preset.
2. **Ingest & Parse:** Express backend calls GitHub API, calculates language ratios, extracts framework signatures, and builds file tree.
3. **Synthesize:** Gemini 2.5 Flash generates architectural roadmap & learning path.
4. **Cache & Render:** Server saves JSON metadata; frontend renders interactive Workbench.
5. **Grounded RAG Chat:** User asks questions; server constructs grounded system prompts and streams answers.

#### Bottom Right Column: Implementation Timeline (Gantt Overview)
* **Weeks 1–2 (Core Engine):** Express + Vite setup, GitHub parsing services, regex static code analysis.
* **Weeks 3–4 (AI & RAG):** Google GenAI SDK integration, grounded context prompt engineering, dual-style toggles.
* **Weeks 5–6 (Frontend UI/UX):** Motion spring transitions, Lithos hero canvas, responsive slate theme.
* **Weeks 7–8 (Production):** Single-file CJS server bundling with `esbuild`, Cloud Run container deployment.

---

### Speaker Notes for Slide 4
> "Slide 4 displays our end-to-end architecture, operational process flow, and project timeline. Security is built-in by design: the client browser communicates exclusively with our Express backend on port 3000. Secret Gemini API keys remain strictly server-side. When a user requests analysis, our server fetches the repository structure, parses languages and frameworks, synthesizes an architectural summary using Gemini, and caches it locally. Subsequent chat queries construct grounded prompts that keep AI answers strictly factual and tied to the repository."

---

## SLIDE 5: Usability / Application

### Slide Title
**Usability Features & Real-World Applications**

### Layout Recommendation
* **Layout:** 2-Column Grid (Left: Key Usability Features | Right: Industry & Academic Applications).

### Exact On-Slide Content

#### Left Column: Usability & UX Innovations
* 🚀 **Zero-Setup Web Access:** Instant browser accessibility with no local CLI or software installation required.
* ⚡ **One-Click Presets:** Instant loading for popular repos (`facebook/react`, `expressjs/express`, `tailwindlabs/tailwindcss`, `framer/motion`, `vitejs/vite`).
* 🎛️ **Dual Explanation Modes:**
  * **Technical Mode:** Deep-dive architectural patterns, type definitions, and structural code breakdown.
  * **In Simpler Language Mode:** Plain-English analogies tailored for junior devs or non-technical stakeholders.
* 🌌 **Lithos Geological Spotlight:** Interactive canvas hero revealing hidden repository layers upon cursor hover.
* 🔀 **Multi-View Workbench Switcher:** Switch seamlessly between Dual Workbench, Codebase Explorer, and Full Chat modes.

#### Right Column: Target Real-World Applications
1. 🏢 **Enterprise Developer Onboarding:** Cuts time required for new software engineers to understand complex codebases by up to 70%.
2. 🌐 **Open-Source Contribution Triage:** Helps contributors locate entry points, module boundaries, and contribution guidelines in minutes.
3. 🔒 **Code Security Audits & Tech Profiling:** Allows security engineers to instantly verify language composition, config manifests, and dependency risks.
4. 🎓 **Computer Science Education:** Enables students and educators to study production-grade software architectures interactively.

---

### Speaker Notes for Slide 5
> "On Slide 5, we highlight how CodeSage Studio translates complex data into real-world usability. Developers can choose between a technical view or a simplified plain-English view, making codebases accessible to senior engineers, junior developers, and product managers alike. Practical applications range from accelerating enterprise developer onboarding to assisting open-source contributors and security auditors."

---

## SLIDE 6: Contribution of Each Member

### Slide Title
**Team Member Contributions & Responsibilities**

### Layout Recommendation
* **Layout:** 4-Card Horizontal Grid or 2x2 Matrix Table.

### Exact On-Slide Content

#### Team Member Role Matrix

| Member Name | Designated Role | Key Deliverables & Technical Contributions |
|---|---|---|
| **Member 1** | **Lead Full-Stack Architect** | • Designed Express + Vite full-stack architecture.<br>• Implemented REST API router (`/api/v1/repositories`).<br>• Configured `esbuild` production bundling (`dist/server.cjs`) and port 3000 container execution. |
| **Member 2** | **AI & RAG Systems Engineer** | • Integrated Google GenAI SDK (`@google/genai`).<br>• Engineered grounded context system prompts.<br>• Implemented Technical vs. Simple answer style handlers in `geminiService.ts`. |
| **Member 3** | **Frontend & Motion UI Developer** | • Developed React 18 SPA views (`App.tsx`, `RagChatSection.tsx`).<br>• Integrated `motion/react` spring physics transitions.<br>• Built Lithos spotlight hero canvas & responsive Tailwind styling. |
| **Member 4** | **Data Parsing & Ingestion Specialist** | • Built `repoCloneService.ts` & `repoAnalysisService.ts`.<br>• Authored language regex calculators & framework signature detectors.<br>• Designed JSON storage schemas (`metadata.json`). |

---

### Speaker Notes for Slide 6
> "Slide 6 outlines our individual contributions. Member 1 handled full-stack architecture and production server bundling. Member 2 led the AI integration using the Google GenAI SDK and engineered grounded prompts. Member 3 built the React frontend, custom Tailwind styling, and Motion spring animations. Member 4 built the backend ingestion services, language detection algorithms, and storage schemas."

---

## SLIDE 7: References

### Slide Title
**References & Documentation Sources**

### Layout Recommendation
* **Layout:** Clean Structured List with Citation Cards.

### Exact On-Slide Content

1. 📚 **Google GenAI SDK & Gemini API Guidelines**
   * Google DeepMind (2025–2026). *@google/genai TypeScript SDK Specification & Gemini 2.5 Flash Guidelines*.  
   * Official Documentation: `https://ai.google.dev/docs`

2. 🐙 **GitHub REST API v3 Specification**
   * GitHub Developer Network. *Repositories, Git Trees, and Content Endpoints*.  
   * Official Documentation: `https://docs.github.com/en/rest`

3. ⚛️ **React 18 & Vite Web Architecture**
   * React Core Team & Evan You et al. *React 18 Concurrent Rendering and Vite 6.0 Build System*.  
   * Official Documentation: `https://react.dev` & `https://vitejs.dev`

4. 🚀 **Express.js Server & Node.js CommonJS/ESM Standards**
   * Express.js Technical Steering Committee. *Express 4.x API Reference & Container Integration*.  
   * Official Documentation: `https://expressjs.com`

5. 📄 **Retrieval-Augmented Generation (RAG) Research Foundations**
   * Lewis, P., et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. Advances in Neural Information Processing Systems (NeurIPS 2020). arXiv:2005.11401.

---

### Speaker Notes for Slide 7
> "Finally, on Slide 7, we present our primary references. Our work grounds itself in official documentation from Google DeepMind for the GenAI SDK, GitHub REST API specifications, React and Vite core standards, Express server container patterns, and foundational academic literature on Retrieval-Augmented Generation. Thank you for your time, and we welcome any questions!"
