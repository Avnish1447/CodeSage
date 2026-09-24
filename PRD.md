# Product Requirement Document (PRD)

## Project Title: CodeSage Studio
**Subtitle:** Codebase Stratigraphy & Grounded RAG Analysis Platform  
**Document Version:** 1.0.0  
**Date:** August 2026  
**Status:** Approved & Production-Ready  

---

## 1. Executive Summary & Vision

Software engineers, open-source maintainers, and code auditors spend over 60–70% of their onboarding time deciphering unfamiliar codebase structures, searching for entry points, and piecing together component relationships.

**CodeSage Studio** solves this cognitive overload by providing an instant, automated "codebase geology" breakdown (stratigraphy) alongside a grounded Retrieval-Augmented Generation (RAG) assistant. By analyzing public GitHub repositories in real-time, the platform extracts language distributions, frameworks, entry point stratigraphy, and architectural roadmaps, enabling developers to master 10,000+ line codebases in under three minutes.

---

## 2. Product Objectives & Target Audience

### 2.1 Core Product Objectives
1. **Accelerate Codebase Onboarding:** Reduce initial time-to-comprehension from hours to under 3 minutes.
2. **Grounded RAG Intelligence:** Provide an interactive AI assistant powered by Google Gemini that answers questions strictly anchored in codebase context without hallucinating non-existent modules.
3. **Multi-Modal Learning Views:** Deliver flexible viewing modes (Dual Workbench, Codebase Explorer, Full Chat Workbench) tailored to different cognitive workflows.
4. **Adaptive Communication Styles:** Allow users to toggle between **Technical Software Architecture** explanations and **In Simpler Language** plain-English breakdowns.

### 2.2 Target Audience
* **Software Engineers & Technical Leads:** Evaluating open-source libraries or onboarding onto new team codebases.
* **Open Source Contributors:** Quickly locating relevant files, architectural layers, and contribution entry points.
* **Code Auditors & Security Engineers:** Performing rapid tech stack profiling and structural inspection.
* **Computer Science Students & Educators:** Learning modern software architecture patterns by exploring real-world production repositories.

---

## 3. Product Features & Detailed Functional Requirements

### FR-1: Repository Ingestion & Ingestion Engine
* **URL Submission & Validation:** Ingests public GitHub URLs (`https://github.com/owner/repo`), validates URL formats, and extracts owner and repository identifiers.
* **Metadata Extraction:** Fetches repository file counts, estimated storage size, language composition, and framework signatures via GitHub REST API / raw file trees.
* **Quick Presets:** Offers one-click preset buttons for popular open-source repositories (e.g., `facebook/react`, `expressjs/express`, `tailwindlabs/tailwindcss`, `framer/motion`, `vitejs/vite`).

### FR-2: Codebase Stratigraphy & Tech Stack Profiling
* **Language Distribution Visualizer:** Computes percentage breakdown across 15+ languages (TypeScript, JavaScript, Python, Rust, Go, CSS, HTML, C++, etc.) with dynamic color-coded percentage progress bars.
* **Framework Matrix:** Automatically detects active frameworks and tools (e.g., React, Express, Vite, Tailwind CSS, Next.js, FastApi, Django, etc.).
* **Important Files Identification:** Tags and highlights key configuration files (e.g., `package.json`, `server.ts`, `App.tsx`, `dockerfile`, `tsconfig.json`).

### FR-3: Repository Stratigraphy Tree Explorer
* **Collapsible File Tree:** Interactive hierarchical directory viewer with depth indentation, folder icons, and file extension styling.
* **Focus Badging:** Highlights top-level architectural entry points to guide developer exploration.

### FR-4: Grounded CodeSage RAG Chat Engine
* **Context-Aware Q&A:** Ingests parsed repository metadata into Gemini API context window for precise, grounded answers.
* **Dual Response Modes:**
  * **Technical:** Code-heavy, architectural, and design pattern oriented.
  * **In Simpler Language:** Conceptual explanations with real-world analogies suitable for beginners or high-level stakeholders.
* **Suggested Queries:** Provides instant quick-start questions (e.g., *"How is the entry point initialized?"*, *"Explain the core data flow"*, *"What dependencies are critical?"*).
* **Rich Markdown Formatting:** Renders syntax-highlighted code blocks, bold headings, bulleted lists, and inline tags.

### FR-5: Learning Path & Architecture Roadmap
* **Step-by-Step Stratigraphy Guide:** Auto-generates a ordered reading list (e.g., Step 1: Entry Point -> Step 2: API Layer -> Step 3: State Management).
* **Architectural Executive Summary:** High-level overview explaining the repository's core purpose and design patterns.

### FR-6: Responsive Multi-View Workbench & Liquid Motion UI
* **View Modes:**
  * `Dual Workbench`: Split layout featuring codebase insights on the left and RAG chat assistant on the right.
  * `Full Chat Workbench`: Full-width chat container for deep dive Q&A sessions.
  * `Codebase Explorer`: Full-width visual grid for tech stack, tree explorer, and learning path.
* **Liquid Spring Transitions:** Animated mode switcher utilizing `motion/react` spring physics layout indicators.
* **Lithos Spotlight Hero:** Interactive landing canvas featuring a hardware-accelerated spotlight mask revealing codebase geological strata.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Responsiveness
* Repository ingestion and static analysis response time `< 3 seconds` for average GitHub repositories.
* RAG chat responses streaming/returning within `< 2 seconds`.
* Smooth 60 FPS UI transitions powered by CSS GPU acceleration and Motion physics.

### 4.2 Security & Data Privacy
* **API Key Protection:** Server-side proxying (`/api/v1/*`) of `GEMINI_API_KEY` ensures zero client-side key leakage to browser dev tools.
* **Input Sanitization:** Validates all incoming repository URLs and chat payloads to prevent injection attacks or SSRF.

### 4.3 Reliability & Error Handling
* Graceful fallback when Gemini API keys are unconfigured (returns baseline static stratigraphy analysis with actionable user notifications).
* Non-blocking background RAG indexing status indicator.

### 4.4 Accessibility & UI/UX Standards
* WCAG AA contrast compliance with dark twilight theme aesthetics (`#0f172a`, `#1e293b`, `#e8702a`).
* Responsive desktop-first and mobile-optimized layouts supporting screen widths from 320px to 2560px+.

---

## 5. Technology Stack Summary

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 18, TypeScript 5.7, Tailwind CSS v3, Motion (`motion/react`), Lucide React Icons |
| **Backend Server** | Node.js (v22 ESM), Express 4.21, Cors, `tsx` (Dev), `esbuild` (Prod CJS Bundle) |
| **AI / RAG Engine** | Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash / Gemini 1.5 Flash Model |
| **Ingestion / Service** | GitHub REST API, Node `fs` & `path` modules, Regex Static Code Analyzers |

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

1. **Onboarding Speedup:** 75% reduction in time required for a new developer to explain a repository's architecture.
2. **Query Accuracy:** >95% accuracy on grounded codebase Q&A queries.
3. **User Engagement:** High interaction rates with suggested queries and dual workbench mode switches.
4. **System Uptime:** 99.9% uptime on server API endpoints (`/api/v1/health`, `/api/v1/repositories`).
