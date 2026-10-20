<div align="center">

# 🏛️ CodeSage (TheCodeSage)
### Intelligent AI Codebase Stratigraphy & Grounded RAG Architecture Engine

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-thecodesage.vercel.app-e8702a?style=for-the-badge&logo=vercel&logoColor=white)](https://thecodesage.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)](LICENSE)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%205.7-38bdf8?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js 20](https://img.shields.io/badge/Backend-Node.js%2020%20%7C%20Express-34d399?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Google Gemini 2.5](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-f59e0b?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/Automated%20Tests-8%2F8%20Passing%20(100%25)-10b981?style=for-the-badge)](server/tests)

<p align="center">
  <b>Unearth, understand, and converse with unfamiliar codebases in minutes.</b><br>
  Treating software repositories like geological formations: excavating foundational primitives, mapping polyglot dependencies, and providing deterministic, hallucination-resistant AI exploration.
</p>

[Explore Live Demo](https://thecodesage.vercel.app/) • [Report Bug](https://github.com/Avnish1447/CodeSage/issues) • [Request Feature](https://github.com/Avnish1447/CodeSage/issues)

</div>

---

## 🌟 The "Codebase Stratigraphy" Metaphor

When software engineers join a new team or audit an open-source project, they face the **"codebase onboarding cliff"**—spending up to 58% of their time clicking through hundreds of files just to build a mental map of how modules connect.

In geology, **stratigraphy** is the study of rock layers. A geologist does not examine every single grain of sand in a mountain; they examine the distinct layers to understand its history and foundation.

**CodeSage applies this exact principle to software repositories:**
1. **Stratum 0 (Core Primitives):** Foundational manifests and build tools (`package.json`, `tsconfig.json`, `Cargo.toml`).
2. **Stratum 1 (Data & Schema Models):** Database definitions, ORMs, interfaces (`schema.prisma`, `models.py`, `types.ts`).
3. **Stratum 2 (Business & Domain Logic):** Server routes, services, handlers (`server.ts`, `api/`, `controllers/`).
4. **Stratum 3 (Presentation Layer):** UI components, design tokens, styles (`src/components/`, `index.css`).
5. **Stratum 4 (Infrastructure & CI/CD):** Containers and orchestration (`Dockerfile`, `.github/workflows/`, `vercel.json`).

Before calling any generative AI model, CodeSage deterministically computes a verified **Stratigraphy Card**, ensuring that every answer is grounded in actual repository facts.

---

## ✨ Key Features

### 1. ⚡ Instant Repository Ingestion & Shallow Extraction
* Ingests any public GitHub repository URL (`https://github.com/owner/repo`).
* Uses native Git shallow cloning (`--depth 1 --single-branch`) to download only the latest snapshot, discarding decades of history packfiles for 10x–50x faster ingestion without consuming GitHub API rate limits.
* Automatically filters binary bloat, vendor packages, lockfiles (`node_modules`, `.git`, `dist`, `.lock`).

### 2. 🧩 Polyglot Technology Stack Detector
* Scans dependency manifests (`package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`, `Gemfile`, `Dockerfile`).
* Identifies 50+ languages, frameworks, UI libraries, database drivers, and cloud configs with categorized confidence badges and version tags.

### 3. 🧠 Grounded Gemini 2.5 Flash RAG Engine
* Direct conversational dialogue powered by `@google/genai` with sub-second streaming response times.
* **Citation-Backed Answers:** Strict directory tree grounding forces the model to cite verified file paths and line ranges (`[server/routes/api.ts:L40-L65]`).
* **Zero Phantom Imports:** Prevents AI hallucinations by conditioning prompts on the pre-computed Stratigraphy Card.

### 4. 🛡️ "Failing Closed" (Deterministic Fallback)
* If the Gemini API is rate-limited, unconfigured, or the token spending cap is reached, CodeSage **never crashes**.
* The parsed Stratigraphy Card automatically serves a deterministic, 100% accurate Markdown briefing directly from the card's rule-based analysis.

### 5. 🎭 Dual-Register Communication
* **Technical Register:** Uses precise software engineering terms (*middleware, dependency injection, AST, microservices, abstraction layers*) for senior developers.
* **Plain-Language Register:** Uses real-world analogies, short sentences, and everyday terms for junior developers, students, and product managers.

### 6. 🪄 GitReverse AI System Prompt Synthesis
* One-click generation of fully structured, copyable system prompts designed for modern AI code generators (Cursor, Claude Dev, ChatGPT, GitHub Copilot).
* Encodes the repository's exact architecture, folder topology, and coding standards for immediate recreation or feature extension.

### 7. 🔒 Multi-Layer Defense-in-Depth Security
* **CWE-22 (Path Traversal):** Strict path sandboxing within `storageRoot` and kernel-level `O_NOFOLLOW` flag rejection against symbolic link escapes.
* **CWE-200 (Information Disclosure):** Route-level guards blocking access to `.env`, `server.cjs`, and raw repository clone paths.
* **CWE-362 (Race Conditions):** Custom in-memory `SpendingService` executing atomic token budget reservations before calling external LLMs.
* **CWE-409 (Decompression Bombs):** Pre-checkout tree inspection terminating archives exceeding 1,200 files or 50MB.
* **Anti-Disposable Email Shield:** Custom zero-latency validator rejecting temporary/burner email providers (`tempmail.com`, `guerrillamail.com`).

### 8. ⚡ Offline State Hydration via IndexedDB
* Analyzed repositories are atomically cached in the client's browser using native asynchronous IndexedDB.
* Returning users experience instantaneous state hydration in **under 50 milliseconds** with zero re-cloning or redundant API calls.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER                                   │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            React 18 SPA (Vite 6)                          │  │
│  │  • Lithos Spotlight Hero          • Studio Workbench (3 Dynamic Modes)    │  │
│  │  • Repo Input & Quick Presets     • Grounded RAG Chat (Markdown & Code)   │  │
│  │  • Tech Stack Badge Matrix        • Motion GPU-Accelerated Springs        │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                     CLIENT PERSISTENCE & GLOBAL STATE                     │  │
│  │  • IndexedDB (Multi-MB AST Cache)    • React Context (Auth & Toasts)      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ HTTP / REST API (Port 3000 / Vercel Edge)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS APPLICATION SERVER                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                          Security & Middleware Pipeline                   │  │
│  │  • Gzip Compression              • CORS Preflight Handlers                │  │
│  │  • Express Rate Limiter (IP-based)• Multer File Upload Ceiling            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                               Services Layer                              │  │
│  │  • RepoCloneService: Git Shallow Clone (--depth 1)                        │  │
│  │  • TechDetectorService: AST & Dependency Manifest Classifier              │  │
│  │  • SpendingService: Atomic Token Budget Reservation Ledger (CWE-362)      │  │
│  │  • GeminiService: Grounded AI Prompt Conditioning & Deterministic Fallback│  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────┬──────────────────────────┘
                           │ Local Storage             │ External AI APIs
                           ▼                           ▼
          ┌──────────────────────────────────┐ ┌──────────────────────────────────┐
          │     STORAGE / CACHE SUBSYSTEM    │ │       GOOGLE GEMINI AI API       │
          │  • /storage/repos/{repo_id}/     │ │  • Gemini 2.5 Flash Endpoint     │
          │  • Supabase PostgreSQL (RLS)     │ │  • Structured JSON Mode          │
          │  • O_NOFOLLOW Symlink Protection │ │  • Server-Only Key Protection    │
          └──────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose / Role |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | **React** | `18.3.1` | Declarative UI, concurrent rendering, and hook-based component architecture |
| **Programming Language** | **TypeScript** | `5.7.3` | End-to-end static type safety across recursive AST nodes and API payloads |
| **Build Tool & Bundler** | **Vite** | `6.1.0` | Ultra-fast native ESM dev server and optimized Rollup production bundling |
| **CSS Framework** | **Tailwind CSS** | `3.4.17` | Utility-first styling with zero runtime CSS overhead and custom dark theme |
| **Animations** | **Motion (Framer)** | `12.4.7` | GPU-accelerated layout transitions between workbench views with 0.00 CLS |
| **Icons** | **Lucide React** | `0.475.0` | Tree-shakeable SVG iconography for 50+ languages and UI states |
| **Markdown Parser** | **react-markdown** | `10.1.0` | XSS-safe markdown and syntax-highlighted code rendering for AI streams |
| **Client Storage** | **IndexedDB** | Native API | Asynchronous client-side caching of multi-megabyte repository ASTs |
| **Backend Runtime** | **Node.js** | `20 LTS` | Non-blocking asynchronous I/O and streaming Server-Sent Events (SSE) |
| **Server Framework** | **Express.js** | `4.21.2` | Minimalist routing, middleware pipelines, and API proxying |
| **Fast Execution & Bundle** | **`tsx` & `esbuild`**| `4.19` / `0.25` | Go-powered TypeScript compilation; builds backend bundle in <150ms |
| **AI LLM Engine** | **Google Gemini** | `2.5 Flash` | High-throughput conversational reasoning, low latency, and structured JSON |
| **Google GenAI SDK** | **`@google/genai`** | `0.2.0` | Official Google AI SDK for streaming parameter-tuned model calls |
| **Authentication** | **Clerk & Supabase**| `6.17` / `2.117` | Secure authentication, session management, and PostgreSQL with RLS |
| **Deployment** | **Vercel Edge** | Serverless | Global Anycast edge network distribution with automated Git CI/CD |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** 20.x or higher installed ([Download Node.js](https://nodejs.org/))
* **Git** installed on your system
* A **Google Gemini API Key** ([Get your free API key here](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/Avnish1447/CodeSage.git
cd CodeSage
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```
Add your credentials:
```env
# Server Port
PORT=3000

# Google Gemini API Key (Required for AI Chat & Summaries)
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication (Optional for local testing)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase (Optional for local testing)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run in Development Mode
Start both the Express backend and Vite frontend with live watch mode:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

### 5. Build for Production
```bash
# Builds the Vite client to dist/ and bundles server.ts via esbuild to dist/server.cjs
npm run build

# Start production server
npm start
```

---

## 🧪 Automated Test Suite

CodeSage incorporates eight comprehensive, automated verification test suites executed via `tsx`:

```bash
# Run all test suites
npm run test:all
```

| Command | Test Suite | What It Validates |
| :--- | :--- | :--- |
| `npm run test:compression` | Compression | Verifies Gzip/Deflate payload reduction on large AST responses |
| `npm run test:errors` | Error Logging | Validates structured JSON error formats and sanitized stack traces |
| `npm run test:concurrency` | Concurrency | Stress-tests parallel requests and rate limiter threshold integrity |
| `npm run test:backups` | Backups | Tests metadata snapshot persistence and atomic state restoration |
| `npm run test:seo` | SEO & Metadata | Verifies OpenGraph tags, dynamic canonical links, and sitemaps |
| `npm run test:404` | 404 Experience | Validates cinematic canvas, video fallback, and semantic routes |
| `npm run test:security` | Security Harness | Penetration testing for **CWE-22, 200, 362, 409, and 602** |
| `npm run test:email` | Email Validator | Tests 43-domain burner blocklist and institutional allowlists |

---

## 📡 REST API Reference

All backend API routes are versioned under `/api/v1`:

### Ingestion & Analysis
* `GET /api/v1/health`  
  Returns server health, uptime, and active model status.
* `POST /api/v1/repositories`  
  Ingests a GitHub repository URL, clones the snapshot, runs AST analysis, and returns the Stratigraphy Card.
  ```json
  { "url": "https://github.com/expressjs/express" }
  ```
* `GET /api/v1/repositories/:id`  
  Retrieves a previously analyzed repository card from disk/cache.

### Grounded Intelligence & Insights
* `POST /api/v1/repositories/:id/chat`  
  Streams a grounded answer conditioned on the Stratigraphy Card via Server-Sent Events (SSE).
  ```json
  {
    "message": "How does this project handle route registration?",
    "style": "technical" // or "simple"
  }
  ```
* `POST /api/v1/repositories/:id/insights`  
  Regenerates the 4–6 step structured learning path and architectural summary JSON.

---

## 🗺️ Project Roadmap

- [x] **Phase-I:** Public GitHub repository ingestion & shallow cloning
- [x] **Phase-I:** Deterministic AST stratigraphy & 50+ polyglot stack detector
- [x] **Phase-I:** Grounded Gemini 2.5 Flash RAG engine with line citations
- [x] **Phase-I:** Fail-closed deterministic fallback engine
- [x] **Phase-I:** Dual-register interaction (Technical vs. Plain-Language)
- [x] **Phase-I:** GitReverse system prompt generator for AI builders
- [x] **Phase-I:** Defense-in-depth security mitigations (CWE-22, 200, 362, 409)
- [x] **Phase-I:** 8 automated test suites & live deployment at `thecodesage.vercel.app`
- [ ] **Phase-II:** **Google OAuth Single Sign-On (SSO)** integration
- [ ] **Phase-II:** **Multi-Branch Selection & Analysis** (inspecting `dev`, `staging`, `main`)
- [ ] **Phase-II:** **GitReverse Pipeline Expansion** (deep schema extraction & multi-file exports)

---

## 👥 Authors & Capstone Team (Group No. 196)

This project was engineered as part of **DSN4091 – Capstone Project Phase-I** at the **School of Computing Science Engineering and Artificial Intelligence**, **VIT Bhopal University**:

| Member | Registration No. | Key Responsibilities |
| :--- | :---: | :--- |
| **Avnish Agrawal** *(Lead)* | `23BAI10628` | **System Architecture & Full-Stack Core:** Ingestion engine (`repoCloneService.ts`), static analysis (`techDetectorService.ts`), defense-in-depth security, automated test suites, Vercel edge deployment, and end-to-end integration. |
| **Pradumya Salunke** | `23BAI11095` | **Supabase & Resource Management:** Database schemas, API key rotation, spending reservation quotas, and token spending limit monitors (`SpendingService.ts`). |
| **Bhuvan Jangid** | `23BAI10372` | **Research Paper & Clerk Auth:** Literature review and co-authoring the IEEE research manuscript; Clerk authentication integration. |
| **Tanishk Kapoor** | `23BAI10933` | **Research Content & Diagrams:** Research methodology, comparative literature analysis, system architecture diagrams, and figures. |
| **Tanishq Nandwal** | `23BAI10397` | **Handling AI Requests:** Gemini 2.5 Flash API communication (`geminiService.ts`), prompt template conditioning, streaming SSE handlers, and JSON structured schema validation. |
| **Sanskar Behera** | `23BAI10211` | **User Interface (UI):** React 18 frontend components, Lithos Hero, Studio Workbench, file tree viewer, responsive modals, and Tailwind CSS design tokens. |

*Internal Faculty Project Guide:* **Dr. Abha Trivedi**, Assistant Professor, School of Computing Science Engineering and Artificial Intelligence, VIT Bhopal University.

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by Group No. 196 • Deployed on <a href="https://vercel.com">Vercel</a> • Powered by <a href="https://ai.google.dev">Google Gemini 2.5 Flash</a></sub>
</div>
