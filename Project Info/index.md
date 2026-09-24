---
tags:
  - project/active
  - type/fullstack
  - domain/ai-developer-tooling
  - stack/react
  - stack/express
  - ai/gemini
status: Active
started_date: 2026-08-01
last_updated: 2026-09-19
priority: High
version: 0.1.0
completion_percentage: 85%
current_phase: Phase 3 - Polish, Pitch & Interactive UX
lead_architect: Avnish Agrawal
---

# 🧭 CodeSage — Project Context & Dashboard

> [!abstract] Executive Summary
> **CodeSage** (formerly RepoGPT-RAG) is an automated **codebase geology and grounded Retrieval-Augmented Generation (RAG) platform**. It analyzes public GitHub repositories in real time to extract language distributions, framework signatures, entry-point stratigraphy, and structured learning roadmaps, eliminating cognitive friction and onboarding developers onto complex codebases in under 3 minutes.

---

## 📊 Status at a Glance

| Metric | Current State | Target / SLA |
| :--- | :--- | :--- |
| **Current Phase** | Phase 3: Interactive Pitch & UX Polish | Production v1.0 Launch |
| **Overall Completion** | `85%` | `100%` |
| **Analysis Latency** | ~2.8s (cached) / ~4.5s (fresh API parse) | < 5.0s on 10k+ line repos |
| **Grounded RAG Accuracy** | High (Strict repo facts prompt injection) | Zero hallucinated imports |
| **Build State** | Passing (`tsc --noEmit` & Vite production build) | Zero runtime warnings |

> [!info] Current Phase Focus
> We have completed the full GitHub parsing pipeline, the Lithos spotlight hero canvas, the multi-workbench viewer (Dual, Explorer, Full Chat, Presentation), and the dual-explanation (Technical vs. Simple) Gemini RAG engine. The current sprint focuses on multi-repository comparisons and local SQLite/IndexedDB caching.

---

## 🗂️ Project Navigation Hub

Use the map below to navigate the core documentation vault:

- **System Blueprint:** [[architecture-and-methodology]] — Deep dive into Node.js 22, Express proxy, React 18, and `@google/genai` integration.
- **Roadmap & Sprints:** [[progress-tracker]] — Reverse-chronological changelog, current sprint backlog, and long-term milestones.
- **Pending Work & Improvements:** [[pending-work-and-improvements]] — Active task tracking, technical debt, and planned polish.
- **Architectural History:** [[decisions-log]] — ADRs covering ESM bundling, single-container hosting, and anti-slop design.
- **Agent Directives:** [[agents.md]] — Behavioral guidelines, anti-slop styling rules, and edit hygiene for AI copilots (Cursor, Claude, Gemini).
- **External Resources:** [[sources-and-resources]] — Live deployment URLs, SDK documentation, and research citations.

---

## 🎯 Core Value Pillars

1. **Codebase Stratigraphy:** Peels back repository file hierarchy into distinct layers: Core logic, Frameworks, Configs, and Tests.
2. **Grounded RAG:** Ingests real file trees and manifests into Google Gemini 2.5 Flash with prompt grounding to avoid phantom files.
3. **Dual Explanation Persona:** Instant switching between high-level architectural abstractions and low-level code implementations.
4. **Anti-Slop Craftsmanship:** Pure, high-contrast visual hierarchy, mathematical padding scales, and zero generic AI clichés.
