---
tags:
  - tracking
  - roadmap
  - backlog
  - improvements
  - todo
last_updated: 2026-09-24
status: Active
priority: High
---

# 📋 CodeSage — Pending Work & Improvement Tracker

This document tracks all active, prioritized, and planned engineering tasks, UI/UX polish items, and architectural enhancements for **CodeSage**.

---

## ⚡ 1. Active Sprint Backlog (High Priority)

| Task | Component / File | Description | Status |
| :--- | :--- | :--- | :--- |
| **PDF Export for Pitch Deck** | `src/components/PresentationMode.tsx` | Implement a clean print stylesheet / PDF exporter for the 7-slide interactive pitch deck. | ⏳ Pending |
| **Persistent Repository History** | `src/App.tsx` | Store recently analyzed repositories in `localStorage` so users can switch between them instantly without re-fetching. | ⏳ Pending |
| **Branch Switching Selector** | `src/components/RepoInput.tsx`, `server/services/repoCloneService.ts` | Enable selecting and switching branches on multi-branch git repositories before analysis. | ⏳ Pending |
| **Inline Code Snippet Previews** | `src/components/FileTreeViewer.tsx`, `server/routes/api.ts` | Allow clicking a file node in the stratigraphy tree to preview syntax-highlighted source code in a slide-out drawer or modal. | ⏳ Pending |

---

## 🛠️ 2. Architectural & Backend Improvements

- [ ] **Gemini Model Alignment:**
  - Standardize model identifiers in `server/services/geminiService.ts` to include verified models (`gemini-2.5-flash`, `gemini-1.5-flash`, etc.) matching `Project Info/architecture-and-methodology.md`.
- [ ] **Environment Configuration & API Health Guard:**
  - Ensure `.env` is initialized with `GEMINI_API_KEY`.
  - Add explicit UI indicator / banner when `GEMINI_API_KEY` is missing or free-tier quota is exhausted.
- [ ] **Local SQLite / IndexedDB Analysis Cache:**
  - Transition parsed file tree metadata and stratigraphy stats from simple filesystem JSON into an indexed cache to achieve sub-second reloads.
- [ ] **Error Handling & Streaming Responses:**
  - Stream Gemini RAG responses via Server-Sent Events (SSE) or chunked transfer in `/api/v1/repositories/:repo_id/chat` instead of blocking for full completion.

---

## 🎨 3. UI/UX & Design Consistency (Anti-Slop)

- [ ] **Typography & Font Optimization:**
  - Consolidate Google Fonts between `index.html` (which requests Plus Jakarta Sans & JetBrains Mono) and `src/index.css` (which imports Inter & Playfair Display) to prevent redundant network requests and font-display flash.
- [ ] **Spotlight Hero Canvas Performance:**
  - Optimize `src/components/LithosHero.tsx` canvas rendering on low-power devices and track prefers-reduced-motion settings.
- [ ] **Mobile & Tablet Workbench Layout:**
  - Audit and refine responsiveness for dual-pane and full-chat views on viewport widths < 1024px.
- [ ] **Keyboard Accessibility:**
  - Expand shortcut coverage (e.g., `Esc` to close modals, `Tab` focus rings, `/` to focus RAG chat input).

---

## 🚀 4. Long-Term Roadmap & Enterprise Features (Phase 4)

- [ ] **Direct Local ZIP / Directory Upload:**
  - Enable drag-and-drop local archive analysis without needing a public GitHub URL.
- [ ] **Private Repository OAuth & PAT Support:**
  - Allow users to supply GitHub Personal Access Tokens (PAT) securely for private repository audits.
- [ ] **Multi-Repo Comparative Diff:**
  - Side-by-side architectural and dependency comparison between two distinct repositories or version tags.
- [ ] **Automated GitHub PR Summary Bot:**
  - Webhook listener generating stratigraphy and architectural impact reports on pull requests.

---

## 🧪 5. Testing & Verification

- [ ] Add automated type checks and lint verification to CI/CD pipeline (`tsc --noEmit && vite build`).
- [ ] Add unit tests for `RepoCloneService.generateRepositoryId` and `RepoValidationService`.
- [ ] Benchmark analysis latency against 10k+ line codebases to ensure compliance with SLA (< 5.0s).
