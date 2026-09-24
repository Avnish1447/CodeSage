# Presentation Deck & Project Report (PPT Report)

**Project Title:** CodeSage Studio — Codebase Stratigraphy & Grounded RAG Analysis Engine  
**Target Event / Evaluation:** Full-Stack & AI Systems Capstone Project Presentation  
**Date:** August 2026  

---

## Slide 1: Topic of the Project

### Title Slide
* **Project Name:** CodeSage Studio
* **Subtitle:** Automated Codebase Geology & Grounded Retrieval-Augmented Generation (RAG) Platform
* **Domain:** Generative AI, Software Engineering Tools, Retrieval-Augmented Generation (RAG), Full-Stack Web Systems

### Core Project Identity & Overview
CodeSage Studio is an intelligent codebase exploration and analysis system. It peels back the structural layers ("stratigraphy") of any public GitHub repository to compute tech stack metrics, extract entry points, map out sequential reading roadmaps, and provide an interactive AI assistant grounded in codebase context.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                   REPOGPT RAG STUDIO                        │
       │                                                             │
       │   [ GitHub Repo URL ] ───► [ Codebase Stratigraphy Engine ] │
       │                                         │                   │
       │                                         ▼                   │
       │                        [ Grounded Gemini 2.5 RAG Chat ]     │
       └─────────────────────────────────────────────────────────────┘
```

---

## Slide 2: Problem Statement, Objective & Scope of the Project

### 2.1 Problem Statement
1. **Developer Cognitive Overload:** Reading an unfamiliar repository (10,000+ lines of code) takes hours of manual navigation.
2. **Context Loss & Friction:** Developers struggle to identify entry points, configuration frameworks, and key architectural patterns when joining open-source or enterprise projects.
3. **AI Hallucination in Generic Code Assistants:** Standard off-the-shelf AI chat models lack exact, grounded structural facts about specific repository versions, resulting in hallucinated imports, non-existent files, and invalid advice.

### 2.2 Objective
* Build an automated full-stack platform that ingests public GitHub repository URLs, performs fast static analysis, and extracts structural facts (language distribution, framework signatures, file trees).
* Integrate Google Gemini 2.5 Flash LLM with grounded prompt context to deliver precise, hallucination-free RAG chat.
* Provide an intuitive, responsive UI featuring liquid spring view transitions, geological spotlight reveals, and dual-style answer modes (Technical vs. In Simpler Language).

### 2.3 Scope of the Project
* **In-Scope:**
  * Ingestion & parsing of any public GitHub repository URL.
  * Auto-detection of 15+ programming languages and frameworks.
  * Interactive hierarchical stratigraphy file tree viewer.
  * AI-generated architectural executive summary and step-by-step reading roadmap.
  * Grounded RAG chat engine with technical and simplified explanation modes.
  * Preset quick-launch buttons for top open-source projects.
* **Out-of-Scope (Future Enhancements):**
  * Private repository access requiring OAuth tokens (ready for expansion).
  * In-browser code editing or multi-file Git commit pushing.

---

## Slide 3: Hardware & Software Requirements

### 3.1 Hardware Requirements

#### Minimum Server & Execution Environment
* **Processor:** 64-bit Dual-Core CPU (2.0 GHz or higher)
* **RAM:** 4 GB System Memory (8 GB recommended for concurrent repository analysis)
* **Disk Space:** 500 MB minimum available SSD storage for cached repository metadata
* **Network:** High-speed internet connectivity for fetching GitHub API data and communicating with Gemini API endpoints

#### User Client Hardware
* Any standard PC, Laptop, Tablet, or Mobile Device capable of running a modern HTML5/WebGL compatible browser.

---

### 3.2 Software Requirements

#### Backend & Server Stack
* **Operating System:** Linux (Ubuntu 22.04 LTS / Cloud Run Container Environment)
* **Runtime:** Node.js v22+ (ES Modules enabled)
* **Server Framework:** Express.js v4.21 with CORS middleware
* **Build & Transpilation:** `tsx` (Dev Execution), `esbuild` v0.25 (Production CommonJS Server Bundling), `vite` v6.1 (Asset Compilation)

#### Frontend Client Stack
* **Framework:** React 18.3 & TypeScript 5.7
* **Styling:** Tailwind CSS v3.4 (Utility-first styling with custom dark slate aesthetics)
* **Animation Engine:** Motion (`motion/react` v12.4) layout physics & `AnimatePresence`
* **Icons & Rendering:** Lucide React (`lucide-react`), React Markdown (`react-markdown` v10.1)

#### AI Service & APIs
* **SDK:** Google GenAI SDK (`@google/genai` v0.2.0)
* **Model:** Gemini 2.5 Flash / Gemini 1.5 Flash Model
* **API Ingestion:** GitHub REST API v3

---

## Slide 4: Architecture Diagram, Process Flow & Timeline

### 4.1 System Architecture Diagram

```
+───────────────────────────────────────────────────────────────────────────────────+
│                                 PRESENTATION LAYER                                │
│                                                                                   │
│  +─────────────────────────────────────────────────────────────────────────────+  │
│  │                            React 18 SPA (Vite)                              │  │
│  │   Lithos Spotlight Hero | Repo Input | Tech Stack Visualizer | RAG Chat     │  │
│  +──────────────────────────────────────┬──────────────────────────────────────+  │
+─────────────────────────────────────────┼─────────────────────────────────────────+
                                          │ HTTP REST API (Port 3000)
                                          ▼
+───────────────────────────────────────────────────────────────────────────────────+
│                               APPLICATION SERVER LAYER                            │
│                                                                                   │
│  +─────────────────────────────────────────────────────────────────────────────+  │
│  │                         Express.js Server Router (/api/v1)                  │  │
│  +───────────────────┬─────────────────────────────────────┬───────────────────+  │
│                      │                                     │                      │
│                      ▼                                     ▼                      │
│  +───────────────────────────────────────+  +──────────────────────────────────+  │
│  │       Ingestion & Analysis Module     │  │        Gemini RAG Engine        │  │
│  │   RepoCloneService | RepoAnalysis      │  │   @google/genai SDK Integration  │  │
│  +───────────────────┬───────────────────+  +──────────────────┬───────────────+  │
+──────────────────────┼─────────────────────────────────────────┼──────────────────+
                       │ Local Caching                           │ Remote Call
                       ▼                                         ▼
+──────────────────────────────────────────+  +─────────────────────────────────────+
│            STORAGE SUBSYSTEM             │  │          GOOGLE GEMINI API          │
│  /storage/repos/{repo_id}/metadata.json  │  │   Gemini 2.5 Flash AI Service       │
+──────────────────────────────────────────+  +─────────────────────────────────────+
```

---

### 4.2 End-to-End Process Flow

```
 [1. User submits Repo URL] ───► [2. POST /api/v1/repositories]
                                         │
                                         ▼
                                [3. Fetch GitHub Metadata & Tree]
                                         │
                                         ▼
                                [4. Parse Languages & Frameworks]
                                         │
                                         ▼
                                [5. Gemini Synthesizes Architecture Roadmap]
                                         │
                                         ▼
                                [6. Cache Payload in metadata.json]
                                         │
                                         ▼
 [8. User asks RAG Chat Query] ◄── [7. Render Interactive Workbench]
             │
             ▼
 [9. Grounded Gemini Prompt Construction] ───► [10. Return Formatted Answer]
```

---

### 4.3 Implementation Timeline

```
+───────────────────────────────────────────────────────────────────────────────────+
│ Phase 1: Core Architecture & Parsing Engine (Weeks 1 - 2)                        │
│ - Set up Express + Vite TypeScript scaffold.                                      │
│ - Implement RepoCloneService and RepoAnalysisService for language parsing.        │
+───────────────────────────────────────────────────────────────────────────────────+
│ Phase 2: AI & RAG Integration (Weeks 3 - 4)                                       │
│ - Integrate Google GenAI (@google/genai) SDK with server-side API proxying.       │
│ - Engineer grounded system prompts for architecture summaries and Q&A chat.     │
+───────────────────────────────────────────────────────────────────────────────────+
│ Phase 3: Frontend UI/UX & Liquid Motion (Weeks 5 - 6)                             │
│ - Build Lithos Spotlight Hero, File Tree Explorer, and Tech Stack visualizer.     │
│ - Integrate Motion layout spring transitions and dual chat style toggles.        │
+───────────────────────────────────────────────────────────────────────────────────+
│ Phase 4: Bundling & Container Production Launch (Weeks 7 - 8)                      │
│ - Configure esbuild single-file CJS server bundling (dist/server.cjs).            │
│ - Conduct performance verification, linting, and Cloud Run production readiness.  │
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## Slide 5: Usability & Real-World Applications

### 5.1 Primary Use Cases

1. **Developer Onboarding in Software Engineering Teams**
   * New hires enter an unfamiliar project URL and receive an instant step-by-step reading guide, cutting onboarding friction by up to 70%.

2. **Open Source Contribution & Triage**
   * Contributors quickly pinpoint entry points, active frameworks, and directory structures before submitting Pull Requests.

3. **Code Quality Audits & Security Inspection**
   * Security leads and auditors inspect language percentage distributions, detect key config manifests (`package.json`, `dockerfile`), and query dependencies.

4. **Computer Science & Higher Education**
   * Students analyze real-world production repos (e.g., React, Vite, Express) to understand real-world architectural patterns.

### 5.2 Key Usability Features
* **Zero Installation Required:** Pure Web SPA accessible instantly in any browser.
* **Single-Click Quick Presets:** Includes predefined top open-source repos for immediate demonstration.
* **Dual Response Modes:** Technical deep-dives for senior engineers vs. simplified explanations for junior developers or managers.

---

## Slide 6: Contribution of Each Team Member

| Team Member | Role | Core Contributions |
|---|---|---|
| **Member 1** | **Lead Full-Stack Architect** | Designed overall Express + Vite full-stack architecture, API router endpoints (`/api/v1/*`), port binding setup, and `esbuild` production bundling pipeline. |
| **Member 2** | **AI & RAG Systems Engineer** | Integrated `@google/genai` SDK (`geminiService.ts`), authored grounded context prompts, implemented technical vs. simple answer style modes, and error fallback handling. |
| **Member 3** | **Frontend & Motion UI Developer** | Built React SPA components (`App.tsx`, `LithosHero.tsx`, `RagChatSection.tsx`), implemented Motion spring animations, responsive Tailwind layouts, and Markdown rendering. |
| **Member 4** | **Data Parsing & Ingestion Specialist** | Developed `repoCloneService.ts` and `repoAnalysisService.ts`, created regex algorithms for language/framework detection, file tree builder, and JSON storage schema. |

---

## Slide 7: References

1. **Google AI Studio & GenAI SDK Documentation**  
   * Google DeepMind. *@google/genai TypeScript SDK Specification & Gemini 2.5 Flash Guidelines*.  
   * URL: `https://ai.google.dev/docs`

2. **GitHub REST API v3 Documentation**  
   * GitHub Developer Docs. *Repositories, Trees, and Contents Endpoints*.  
   * URL: `https://docs.github.com/en/rest`

3. **React 18 & Vite Build Framework**  
   * React Core Team. *React 18 Architecture and Hooks Reference*.  
   * URL: `https://react.dev`

4. **Express.js & ESM Server Architecture**  
   * StrongLoop / Express Contributors. *Express 4.x API Reference and Middleware Integration*.  
   * URL: `https://expressjs.com`

5. **Retrieval-Augmented Generation (RAG) Architecture Standards**  
   * Lewis et al. *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. arXiv:2005.11401.
