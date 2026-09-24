---
tags:
  - architecture
  - backend/express
  - frontend/react
  - ai/gemini-sdk
  - tooling/vite
last_updated: 2026-09-19
status: Implemented
---

# 🏛️ Architecture & Implementation Methodology

## 1. High-Level System Architecture

CodeSage runs as a **unified full-stack single container** on Google Cloud Run. Port `3000` is the single ingress entry point routing traffic between the client single-page application and backend API handlers.

```
[ Browser Client: React 18 + Vite ]
         │
         ▼ (Port 3000 / HTTP & SSE)
┌─────────────────────────────────────────────────────────────┐
│  Express.js Unified Server Runtime (Node.js 22 LTS)         │
│  ├─ Static SPA Middleware / Vite Dev Middleware             │
│  └─ REST Router: /api/v1/*                                  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Repository Ingestion Engine  │ │ Grounded Gemini RAG Engine │
│ ├─ repoCloneService.ts       │ │ ├─ geminiService.ts        │
│ ├─ repoAnalysisService.ts    │ │ ├─ Grounded System Prompts │
│ └─ Language & Tree Parsers   │ │ └─ @google/genai (v0.2.0)  │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
       [ GitHub REST API ]             [ Gemini 2.5 Flash ]
```

---

## 2. Technology Stack & Specifications

### 2.1 Backend & Runtime
- **Runtime:** Node.js v22 LTS (Native ES Module syntax).
- **HTTP Server:** Express.js 4.21 with CORS and JSON streaming middlewares.
- **Production Bundler:** `esbuild` compiling `server.ts` into a standalone CommonJS bundle at `dist/server.cjs` (`--packages=external`).
- **AI SDK:** `@google/genai` (v0.2.0) utilizing `gemini-2.5-flash` for high-speed, grounded reasoning.

### 2.2 Frontend Client
- **Framework:** React 18.3 + TypeScript 5.7.
- **Build Tool:** Vite 6 with React SWC plugin.
- **Styling:** Tailwind CSS v3.4 (configured via `@import "tailwindcss";`).
- **Motion & Physics:** `motion/react` (v12.4) powering spring transitions and fluid layout shifts.
- **Icons:** `lucide-react`.
- **Markdown Rendering:** `react-markdown` with code highlighting support.

---

## 3. Implementation Methodology & Patterns

### 3.1 Lazy AI Client Initialization
To prevent container startup crashes when environment variables are pending, the Gemini client uses lazy instantiation:

```typescript
let aiClient: GoogleGenAI | null = null;
export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured.");
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}
```

### 3.2 Grounded Context Injection (Anti-Hallucination)
Rather than passing an entire massive repository blindly to the model, CodeSage applies a multi-stage parser:
1. **GitHub Tree Fetch:** Recursively extracts metadata for all files up to a depth of 4.
2. **Deterministic Stratigraphy:** Maps file extensions into language buckets and parses `package.json`/`requirements.txt`/`go.mod` to isolate exact framework signatures.
3. **Prompt Grounding Injection:** Injects verified repository facts into the model's system instruction. If the user asks about a package or file not present in the ingested map, the model is instructed to refuse speculation.

### 3.3 Anti-Slop UI Principles
- **No generic purple/blue gradients or glassmorphic blur clichés.**
- **High-contrast mathematical spacing:** Padding ratios strictly respect `outer_padding >= inner_spacing`.
- **Display Typography Pairing:** Playfair Display italic accents combined with JetBrains Mono code badges and Plus Jakarta Sans body copy.
