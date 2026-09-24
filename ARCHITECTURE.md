# Architecture Report & Technical Specification

**Project:** CodeSage Studio (Codebase Stratigraphy Engine)  
**Version:** 1.0.0  
**Runtime Environment:** Cloud Run / Node.js 22 Container (Port 3000)  
**Architecture Pattern:** Full-Stack Monolithic SPA with Express Proxy & Gemini RAG Services  

---

## 1. System Overview & Architectural Topology

CodeSage Studio is designed as a unified, high-performance full-stack application. It combines a client-side Single Page Application (SPA) built with React and TypeScript with a lightweight Node.js Express backend service. 

The architecture strictly separates client-side visual rendering from server-side security, repository ingestion, and AI model orchestration.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER                                   │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            React 18 SPA (Vite)                            │  │
│  │  - Lithos Spotlight Hero          - Interactive Workbench (Dual/Explorer) │  │
│  │  - Repo Input & Preset Launcher    - RAG Chat Section (Markdown Renderer)  │  │
│  │  - Tech Stack Visualizer          - Motion Layout Spring Animations       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ HTTP / REST API (Port 3000)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             EXPRESS.JS BACKEND SERVER                           │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                              API Router (/api/v1)                         │  │
│  │  - GET  /health                   - POST /repositories                    │  │
│  │  - GET  /repositories/:id         - POST /repositories/:id/chat           │  │
│  │  - POST /repositories/:id/insights                                        │  │
│  └──────────────────┬──────────────────────────────────────┬─────────────────┘  │
│                     │                                      │                    │
│                     ▼                                      ▼                    │
│  ┌──────────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      Repo Analysis & Ingestion       │  │     Gemini RAG Engine Service   │  │
│  │  - RepoCloneService (GitHub API)     │  │  - @google/genai SDK            │  │
│  │  - RepoAnalysisService (Parser)      │  │  - Grounded Context Synthesis   │  │
│  │  - File Tree & Metric Calculator     │  │  - Technical vs Simple Styles   │  │
│  └──────────────────┬───────────────────┘  └────────────────┬────────────────┘  │
│                     │                                       │                   │
└─────────────────────┼───────────────────────────────────────┼───────────────────┘
                      │ Local Persistence                     │ External API
                      ▼                                       ▼
┌──────────────────────────────────────────┐    ┌─────────────────────────────────┐
│        LOCAL STORAGE SUBSYSTEM           │    │     GOOGLE GEMINI AI PLATFORM   │
│  - /storage/repos/{repo_id}/             │    │  - Gemini 2.5 Flash / 1.5 Flash │
│    ├── metadata.json                     │    │  - Grounded Context Ingestion   │
│    └── repo_raw_data/                    │    │  - GEMINI_API_KEY (Server Only) │
└──────────────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 2. Layer Breakdown & Core Modules

### 2.1 Backend Layer (`/server`)

#### 1. Entry Point (`server.ts`)
* Configures Express middleware (CORS, JSON parser).
* Binds server to `0.0.0.0:3000`.
* In Development mode: Integrates Vite middleware (`createViteServer`) for instant HMR-less SPA serving.
* In Production mode: Serves pre-compiled static assets from `dist/` and fallback SPA route `*`.

#### 2. API Routes (`server/routes/api.ts`)
* `GET /api/v1/health`: Returns server status and version payload.
* `POST /api/v1/repositories`: Accepts `{ url }`, performs validation, cloning/fetching, static analysis, Gemini insight synthesis, and stores metadata.
* `GET /api/v1/repositories/:repo_id`: Retrieves cached repository analysis and metadata.
* `POST /api/v1/repositories/:repo_id/chat`: Handles grounded RAG chat queries with style parameters (`technical` | `simple`).
* `POST /api/v1/repositories/:repo_id/insights`: Force-regenerates AI learning paths and architectural summaries.

#### 3. Services Layer (`server/services/`)
* **`repoCloneService.ts`**: Normalizes GitHub URLs, fetches repository trees and commit metadata via GitHub REST API, calculates repository size, file count, and generates unique `repository_id` hashes.
* **`repoAnalysisService.ts`**: Static analysis engine that parses file extensions to compute language distributions, inspects configuration manifests (`package.json`, `Cargo.toml`, `pyproject.toml`, `requirements.txt`) to extract active frameworks, and builds a clean tree summary structure.
* **`geminiService.ts`**: Interface with `@google/genai` SDK using `process.env.GEMINI_API_KEY`. Constructs grounded system prompts containing the repository facts and streams formatted responses.

---

### 2.2 Frontend Layer (`/src`)

#### 1. Main Hub (`src/App.tsx`)
* Manages global application state: active repository data (`repoData`), loading state (`loading`), workbench view mode (`split`, `chat`, `explorer`), preset repository selection history, and error states.
* Wraps sub-views in `motion/react` `AnimatePresence` containers for fluid layout transitions.

#### 2. Key UI Components
* **`LithosHero.tsx`**: Interactive geological landing canvas featuring dual-layer background rendering and a spotlight cursor mask.
* **`RepoInput.tsx`**: URL input card with preset repository quick-buttons and real-time validation.
* **`RepoOverviewCard.tsx`**: Key metrics header displaying owner, repo name, total files, size, GitHub link, and stats grid.
* **`TechStackCard.tsx`**: Visual language percentage distribution bar chart and detected framework tag matrix.
* **`FileTreeViewer.tsx`**: Collapsible stratigraphy folder explorer with file type icons and entry point badging.
* **`LearningPathCard.tsx`**: Step-by-step reading roadmap and architectural summary.
* **`RagChatSection.tsx`**: Grounded chat assistant supporting technical vs simple answer modes, suggested questions, and real-time markdown streaming rendering.

---

## 3. Data Schema & Core Interface (`src/types.ts`)

```typescript
export interface RepoOverview {
  repository_id: string;
  owner: string;
  repo: string;
  files: number;
  size_mb: number;
  normalized_url: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  important?: boolean;
}

export interface RepoFacts {
  repository_id: string;
  url: string;
  languages: Record<string, number>; // Language name -> Percentage
  frameworks: string[];
  important_files: string[];
  tree_summary: TreeNode[];
  stats: {
    total_files: number;
    total_dirs: number;
    estimated_loc: number;
  };
}

export interface RepoResponse {
  repository_id: string;
  status: 'ready' | 'processing' | 'error';
  overview: RepoOverview;
  facts: RepoFacts;
  learning_path: string[];
  architecture_summary: string;
  storage_path?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
```

---

## 4. RAG Ingestion & Chat Data Flow

```
   [User Inputs Question] 
             │
             ▼
   POST /api/v1/repositories/:repo_id/chat  { message, style }
             │
             ▼
   Read Local Cached Metadata (/storage/repos/:repo_id/metadata.json)
             │
             ▼
   Construct Grounded System Prompt:
   "You are CodeSage. Answer strictly based on the following repo facts:
    - Owner/Repo: {owner}/{repo}
    - Languages: {languages}
    - Frameworks: {frameworks}
    - Architecture Summary: {architecture_summary}
    - File Tree: {tree_summary}"
             │
             ▼
   Google GenAI SDK Call:
   ai.models.generateContent({
     model: 'gemini-2.5-flash',
     contents: [systemPrompt, userQuestion]
   })
             │
             ▼
   Formatted Response Output -> Client Render (React Markdown)
```

---

## 5. Build & Production Deployment Pipeline

### 5.1 Compilation Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  }
}
```

### 5.2 Single Container Execution & Port Binding
* The production build bundles `server.ts` into a self-contained CommonJS file (`dist/server.cjs`) using `esbuild`.
* All external npm dependencies are marked as external (`--packages=external`).
* Node natively launches `dist/server.cjs` which binds to `0.0.0.0:3000`, fulfilling Cloud Run container ingress requirements.
