---
tags:
  - ai-guidelines
  - copilot-rules
  - cursor-rules
  - standards
last_updated: 2026-09-19
---

# 🤖 AI Workspace Rules & Coding Guidelines

> [!warning] Mandatory Agent Directives
> Every AI agent (Cursor, Claude, Gemini, ChatGPT) reading this repository **MUST** adhere to the rules outlined below. Violations of file structure or design principles will be rejected.

---

## 1. Architectural Invariants

1. **Strict Port Constraint:**
   - The application binds **ONLY** to port `3000` on host `0.0.0.0`.
   - Never change port values in `server.ts` or Vite configuration.
2. **Server-Side Key Isolation:**
   - **NEVER** import or reference `process.env.GEMINI_API_KEY` in frontend files (`src/**`).
   - All AI interactions must occur through `/server/services/geminiService.ts` and be proxied via `/server/routes/api.ts`.
3. **Build Script Invariant:**
   - Any backend change must be compatible with:
     `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`)
   - Do not remove `--format=cjs` or `--packages=external`.

---

## 2. Design & Anti-Slop UI Standards

When modifying or adding frontend components, strictly avoid generic AI patterns:
- ❌ **No Purple/Cyan Glowing Gradients:** Stick to warm slate (`#020617`, `#0f172a`), crisp off-white, and focused amber-orange accents (`#e8702a`).
- ❌ **No Nested Cards:** Do not place standard cards inside other rounded cards. Flatten hierarchy using dividers, whitespace, and typographic contrast.
- ❌ **No Text Wrapping in Badges/Pills:** Ensure all badge elements utilize `whitespace-nowrap` and balanced optical padding (`px-3 py-1`).
- ✅ **Mathematical Radii:** If nesting a container inside another, ensure `Inner Radius = Outer Radius - Distance Between Borders`.
- ✅ **Typography:** Preserve the serif display headline pair (`font-playfair italic`) with `font-sans` (Plus Jakarta Sans) and `font-mono` (JetBrains Mono).

---

## 3. Documentation & State Synchronization Rules

Whenever code changes impact core behaviors:
1. **Update `Project Info/progress-tracker.md`:** Move tasks from "Current Sprint" to "What Is Done Till Now".
2. **Log Architectural Shifts:** If an approach to routing, database, or SDK integration changes, create a new entry in `Project Info/decisions-log.md`.
3. **Synchronize Metadata:** Verify that changes to the app purpose are reflected in `/metadata.json` and `<title>` tags in `index.html`.
