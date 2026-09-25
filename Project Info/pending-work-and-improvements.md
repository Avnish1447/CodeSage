---
tags:
  - tracking
  - roadmap
  - backlog
  - improvements
  - todo
last_updated: 2026-09-25
status: Active
priority: High
---

# 📋 CodeSage — Pending Work & Improvement Tracker

This document tracks all active, prioritized, and planned engineering tasks, UI/UX polish items, and architectural enhancements for **CodeSage**.

---

## 🚨 Items Requiring Immediate User Attention

All critical configuration items have been addressed:

| Item | Area / File | Context & Status | Severity |
| :--- | :--- | :--- | :--- |
| **`GEMINI_API_KEY` Configuration** | Project Root (`.env`) | ✅ Configured. Loaded via native `process.loadEnvFile()` in `server.ts` & `geminiService.ts`. Live RAG responses active. | 🟢 Resolved |
| **Gemini Model Alignment** | `server/services/geminiService.ts` | ✅ Configured. Tested and verified against active models (`gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-3.8-flash`). | 🟢 Resolved |

---

## ⚡ 1. Active Sprint Backlog (Prioritized Features)

| Task | Component / File | Description | Status |
| :--- | :--- | :--- | :--- |
| **API Health & Key Exhaustion Guard** | `src/components/ApiHealthBanner.tsx`, `server/services/geminiService.ts` | Add explicit client-side banner in the workbench when `GEMINI_API_KEY` is missing or free-tier quota is temporarily exhausted. | ✅ Completed |
| **Inline Code Snippet Previews** | `src/components/FileTreeViewer.tsx`, `server/routes/api.ts` | Click any file node in the stratigraphy tree to inspect syntax-highlighted source code with copy support and binary guards. | ✅ Completed |
| **PDF & PPTX Export for Pitch Deck** | `src/components/PresentationMode.tsx` | Implement dual export capabilities for the 7-slide interactive pitch deck: (1) high-fidelity print stylesheet / PDF export, and (2) native editable PowerPoint (.pptx) download using `pptxgenjs` for pitch deck submission. | ✅ Completed |
| **Persistent Repository History** | `src/App.tsx` | Store recently analyzed repositories in `localStorage` so users can switch between them instantly without re-cloning from scratch. | ⏳ Pending |
| **Branch Switching Selector** | `src/components/RepoInput.tsx`, `server/services/repoCloneService.ts` | Enable selecting and switching branches on multi-branch git repositories before analysis. | ⏳ Pending |

---

## 🏆 2. Recently Completed & Shipped (Sprint 06 - Sept 24-25, 2026)

The following major milestones and design refinements have been implemented and verified:

- [x] **API Health & Key Exhaustion Guard:**
  - Implemented dual-state detection for `missing_key` and `quota_exhausted` (429 rate limit or 503 high demand) via `/api/v1/gemini/health?probe=true` and in `server/services/geminiService.ts`.
  - Built `src/components/ApiHealthBanner.tsx` featuring Vercel styling, direct Google AI Studio key generator link, `.env` snippet copy helper, live connection retry button, and session dismissal.
  - Added dynamic AI Engine status indicator pills (`Online` / `Key Missing` / `Quota Busy`) to both the Studio header bar and `src/components/RagChatSection.tsx`.

- [x] **Dual Pitch Deck Exporter (PDF & Native PPTX):**
  - Built `src/utils/pitchDeckPPTX.ts` with `pptxgenjs` to generate native editable 16:9 `.pptx` presentations covering all 7 slides with branded shapes, cards, and typography.
  - Built `src/components/PitchDeckPrintView.tsx` with dedicated `@media print` landscape pagination to enable crisp vector PDF saving via native browser print (`window.print()`).
  - Added an interactive dropdown menu with loading state (`isExportingPPTX`) and success indicators in `src/components/PresentationMode.tsx`.
  - Configured Rollup `manualChunks` in `vite.config.ts` (`vendor-pptx`), isolating the PPTX engine and keeping the main application bundle under 70kB.

- [x] **File Content API Endpoint & Inline Code Inspection:**
  - Added secure `GET /api/v1/repositories/:repo_id/file?path=...` and wildcard `GET /api/v1/repositories/:repo_id/files/*` routes in `server/routes/api.ts`.
  - Implemented strict path traversal containment (ensures files remain within repository `sourceRoot`).
  - Added binary extension detection and null-byte buffer inspection with friendly UI warnings for audio/image/binary assets.
  - Implemented an interactive slide-out code inspection drawer in `src/components/FileTreeViewer.tsx` featuring line counts, size formatting, copy-to-clipboard, and clean close controls.

- [x] **Vercel Design System Overhaul:**
  - Migrated entire UI typography to **Geist Sans & Geist Mono** with OpenType `liga` enabled.
  - Applied calibrated 4-stop achromatic grayscale (`#FAFAFA`, `#F2F2F2`, `#171717`, `#4D4D4D`, `#8F8F8F`).
  - Implemented shadow-as-border simulation (`shadow-[0_0_0_1px_rgba(...)]`) across cards and sidebars.
  - Enforced the Three-Weight Rule (400 regular, 500 medium, 600 semibold; no heavy 700/800 bold).
- [x] **Navigation Pane De-Duplication & Clean-up:**
  - Removed duplicate "Workbench View" switcher from the collapsible sidebar (`aside`) navigation pane, leaving the primary view switcher (`Dual Workbench`, `Chat Assistant`, `Code Explorer`, `Pitch Deck`) exclusively in the central Studio header track.
  - Refined collapsed sidebar mode to display Quick Filter buttons (`Show All`, `Tech Stack`, `File Tree`, `Architecture Guide`).
- [x] **21st.dev Liquid Glass Hero Button:**
  - Designed and deployed [LiquidGlassButton.tsx](file:///Users/avnish/Documents/GitHub/CodeSage/src/components/ui/LiquidGlassButton.tsx) inspired by the 21st.dev Apple Tahoe / Ali Imam design pattern.
  - Features real-time SVG displacement refraction (`feDisplacementMap` + `feTurbulence`), multi-layered specular box-shadows, ambient magma underglow, and cursor-tracking fluid reflection highlight.
  - Centered directly on the primary vertical axis below the main headline (*"Layers hold tales of time"*).
- [x] **Spotlight Canvas & Blueprint Grid:**
  - Implemented unhovered state featuring a dimmed monochrome geological silhouette (`opacity-20 grayscale brightness-75 contrast-125`) overlaid with a technical 48px blueprint grid.
  - Added an automated natural sweep arc that illuminates the strata canvas on initial load before mouse tracking begins.
- [x] **Typography & Font Consolidation:**
  - Removed deprecated fonts (`Plus Jakarta Sans`, `JetBrains Mono`) from `index.html`. Preconnected Geist and Geist Mono via Google Fonts.

---

## 🛠️ 3. Architectural & Backend Improvements

- [x] **Gemini Model Alignment & Environment Loading (Resolved):**
  - Configured native `process.loadEnvFile()` in `server.ts` and `server/services/geminiService.ts` to automatically ingest `.env`.
  - Verified active Flash models (`gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-3.8-flash`) against the live Gemini GenAI API. Live grounded RAG chat is fully operational.
- [x] **API Health & Key Exhaustion Guard (Resolved):**
  - Implemented dual-state API health detection (`missing_key` vs `quota_exhausted` / high demand 429/503) on backend `/api/v1/gemini/health?probe=true` and in analysis/chat service layers.
  - Built [ApiHealthBanner.tsx](file:///Users/avnish/Documents/GitHub/CodeSage/src/components/ApiHealthBanner.tsx) with Vercel design aesthetic:
    - Missing Key state: Amber alert with contextual explanation, Google AI Studio direct link ("Get Free Gemini Key"), copy `.env` snippet helper, and "Check Key Status" retry probe.
    - Quota Exhausted state: Orange alert detailing 60-second rate limit window, automatic heuristic fallback explanation, and "Retry Connection" probe trigger.
  - Embedded in Studio Workbench canvas and [RagChatSection.tsx](file:///Users/avnish/Documents/GitHub/CodeSage/src/components/RagChatSection.tsx) with dynamic AI Engine status indicator pills (`Online` / `Key Missing` / `Quota Busy`).
- [ ] **Local SQLite / IndexedDB Analysis Cache:**
  - Transition parsed file tree metadata and stratigraphy stats from filesystem JSON into an indexed cache to achieve sub-second reloads.
- [ ] **Streaming Responses for Gemini Chat:**
  - Stream Gemini RAG responses via Server-Sent Events (SSE) or chunked transfer in `/api/v1/repositories/:repo_id/chat` instead of blocking for full completion.

---

## ⚡ 4. Performance & Optimization

- [x] **Code-Splitting & Bundle Optimization (Resolved):**
  - Wrapped `PresentationMode` in `React.lazy()` with `React.Suspense` fallback.
  - Configured Rollup `manualChunks` in `vite.config.ts` (`vendor-react`, `vendor-motion`, `vendor-markdown`, `vendor-icons`).
  - **Result:** Cut initial entry bundle from ~502kB down to **65kB** (14.5kB gzipped); completely eliminated Vite >500kB warning.
- [x] **CSS Font Import Deduplication (Resolved):**
  - Removed redundant `@import url(...)` in `src/index.css`; relying on high-performance `<link rel="preconnect">` in `index.html`.
- [ ] **Canvas Throttle on Low-Power Devices:**
  - Add `requestAnimationFrame` debouncing / reduced motion bypass for the spotlight mask calculation.

---

## 🚀 5. Long-Term Roadmap & Enterprise Features (Phase 4)

- [ ] **Direct Local ZIP / Directory Upload:**
  - Enable drag-and-drop local archive analysis without requiring a public GitHub URL.
- [ ] **Private Repository OAuth & PAT Support:**
  - Allow users to supply GitHub Personal Access Tokens (PAT) securely for private company repository audits.
- [ ] **Multi-Repo Comparative Diff:**
  - Side-by-side architectural and dependency comparison between two distinct repositories or release tags.
- [ ] **Automated GitHub PR Summary Bot:**
  - Webhook listener generating stratigraphy and architectural impact reports on pull requests.

---

## 🧪 6. Testing & Verification

- [x] Automated TypeScript compilation check (`tsc --noEmit`) passes with 0 errors.
- [x] Production bundle build (`vite build && esbuild server.ts`) passes with 0 errors.
- [ ] Add unit tests for `RepoCloneService.generateRepositoryId` and `RepoValidationService`.
- [ ] Benchmark analysis latency against 10k+ line codebases to ensure compliance with SLA (< 5.0s).
