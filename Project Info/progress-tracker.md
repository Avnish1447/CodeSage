---
tags:
  - roadmap
  - tracking
  - changelog
  - sprints
last_updated: 2026-09-25
current_sprint: Sprint 06 - Polish & Extended Exporters
---

# 📈 Progress Tracker & Engineering Roadmap

## 🏁 What Is Done Till Now (The Changelog)

### Sprint 06: Vercel Design System & 21st.dev UI Integration (Sept 24-25, 2026)
- [x] **API Health & Key Exhaustion Guard:** Built [ApiHealthBanner.tsx](file:///Users/avnish/Documents/GitHub/CodeSage/src/components/ApiHealthBanner.tsx) with Vercel design system aesthetics to alert users when `GEMINI_API_KEY` is missing or when free-tier rate limits (429/503) are reached. Integrated live backend probe endpoint (`/api/v1/gemini/health?probe=true`), status badges (`Online`, `Key Missing`, `Quota Busy`), and in-chat health synchronization.
- [x] **File Content API Endpoint & Inline Code Inspection:** Added secure `GET /api/v1/repositories/:repo_id/file` & `/files/*` with directory traversal protection, binary detection, and interactive slide-out snippet drawer in `FileTreeViewer.tsx`.
- [x] **Bundle Size Optimization:** Code-split `PresentationMode` via `React.lazy()` and partitioned vendor chunks, cutting initial bundle by 87% (down to 65kB).
- [x] **Vercel Design System Migration:** Implemented Geist Sans & Geist Mono with `liga` enabled, 4-stop achromatic grayscale, and shadow-as-border simulation across all cards.
- [x] **Hero UI Simplification:** Removed redundant "Open Studio" button from navbar; centered "Start Digging" CTA on the central axis; removed duplicate `CodeSage Stratigraphy` badge from transitional banner.
- [x] **Navigation De-Duplication:** Removed redundant view mode buttons from the collapsible sidebar navigation pane; preserved primary segmented view switcher exclusively in the central Studio header track.
- [x] **21st.dev Liquid Glass CTA:** Created and deployed `LiquidGlassButton.tsx` with physical SVG displacement refraction (`feDisplacementMap`), multi-layered specular shadows, and cursor-tracking fluid molten sheen.
- [x] **Anti-Clutter Clean-up:** Decoupled and removed non-essential modals ("Brand Assets" and "Launch Video") across Header, Hero, Studio top switcher, and footer.
- [x] **Hero Canvas Upgrades:** Added monochrome dimmed silhouette unhovered state + 48px blueprint grid, and automated spotlight sweep on initial load.

### Phase 3: Brand Evolution & Presentation Integration (Sept 2026)
- [x] **Complete Rebranding:** Migrated identity from `RepoGPT-RAG` to **`CodeSage`** across UI components, headers, PRD, and meta descriptors.
- [x] **Light/Dark Interactive Pitch Deck:** Built `PresentationMode.tsx` with a 7-slide interactive pitch deck (Topic, Problem, Specs, Architecture, Usability, Contributions, References) featuring full-screen toggle, keyboard controls (`F`, arrow keys), and custom light/dark styling.
- [x] **Lithos Spotlight Hero:** Implemented an interactive mouse-tracking spotlight canvas with geological stratigraphy theme and direct scroll-to-workbench routing.

### Phase 2: Grounded RAG & Codebase Geology (Aug 2026)
- [x] **Dual Explanation Mode:** Integrated user-facing toggle between **Technical Architecture** (class structures, API routes) and **Simplified Plain English** (concepts, metaphors).
- [x] **Language Stratigraphy Engine:** Computed exact byte-level language percentages and animated visual progress bars.
- [x] **Interactive Tree Explorer:** Collapsible tree viewer supporting directory expanding, file badges, and entry-point focus tags.
- [x] **Express Backend Proxy:** Unified Express server running Vite middleware in dev and `dist/` static files in production.

### Phase 1: Inception & Core Pipelines (Aug 2026)
- [x] Initialized Vite + React + Tailwind + TypeScript architecture.
- [x] GitHub REST API integration for tree ingestion and metadata parsing.
- [x] Provisioned Gemini 2.5 Flash integration via `@google/genai`.

---

## ⚡ Current Sprint Tasks (Active Workstream)

> [!todo] Active Sprint Focus
> - [x] Add dual PDF & PPTX export capability for the interactive Pitch Deck (`PresentationMode.tsx`).
> - [ ] Add persistent repository history in `localStorage` so users can switch between recently analyzed repositories without re-fetching.
> - [ ] Enable branch switching selector for multi-branch repositories.
> - [x] Implement inline code snippet previews for selected files directly in the File Tree.

---

## 🗺️ Future Roadmap

```mermaid
gantt
    title CodeSage Development Trajectory
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Engine
    GitHub Parser & Ingestion      :done, 2026-08-01, 2026-08-10
    Gemini 2.5 Flash RAG Setup     :done, 2026-08-11, 2026-08-20
    section Phase 2: Workbench UI
    Stratigraphy & Tree Viewer     :done, 2026-08-21, 2026-08-30
    Dual Explanation Switcher      :done, 2026-08-31, 2026-09-07
    section Phase 3: Presentation & Brand
    Rebranding to CodeSage         :done, 2026-09-08, 2026-09-12
    Interactive Pitch Deck         :done, 2026-09-13, 2026-09-19
    section Phase 4: Advanced Features
    Local Repository Upload (ZIP)  :active, 2026-09-20, 2026-10-05
    Multi-Repo Comparative Diff    :2026-10-06, 2026-10-25
    Automated PR Summary Bot       :2026-10-26, 2026-11-15
```

### Phase 4: Enterprise & Deep Code Inspection (Backlog)
- [ ] **Private Repository OAuth:** Allow personal access token (PAT) or GitHub App authentication to inspect private company repositories.
- [ ] **Comparative Codebase Diffs:** Upload two repositories or branches side-by-side to visually inspect architectural deviations.
- [ ] **Direct ZIP Archive Ingestion:** Allow drag-and-drop local folder/ZIP upload without requiring a public GitHub remote.
