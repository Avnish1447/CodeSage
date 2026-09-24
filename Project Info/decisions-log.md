---
tags:
  - adr
  - decisions
  - governance
last_updated: 2026-09-19
---

# ⚖️ Architecture & Directional Decision Log (ADRs)

| ADR ID | Date | Decision | Context & Motivation | Consequences & Trade-offs |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | 2026-08-01 | **Unified Express + Vite Container** | App runs in Cloud Run with port 3000 hardcoded. Need both server-side API keys and fast SPA client. | **Positive:** Single deployment target, zero CORS friction. <br>**Trade-off:** Requires `esbuild` server bundling and Vite middleware mode configuration. |
| **ADR-002** | 2026-08-05 | **Google GenAI SDK (`@google/genai`)** | The legacy `@google/generative-ai` SDK is deprecated in favor of the unified GenAI standard. | **Positive:** First-class support for Gemini 2.5 Flash, structured outputs, and standard config interfaces. |
| **ADR-003** | 2026-08-15 | **Server-Side API Key Proxying** | Never expose `GEMINI_API_KEY` to client browser network tabs. | **Positive:** Secure credentials, centralized rate-limiting. <br>**Trade-off:** All client queries must transit through the `/api/v1/chat` express route. |
| **ADR-004** | 2026-09-08 | **Product Rebranding to CodeSage** | "RepoGPT-RAG" was clinical and sounded like an AI cliché. "CodeSage" conveys deep architectural wisdom. | **Positive:** Elevated brand identity, stronger pitch presence, matches the geological aesthetic. |
| **ADR-005** | 2026-09-15 | **Built-in Presentation Deck Mode** | Users and evaluators needed an interactive slide deck directly inside the web tool rather than opening PowerPoint. | **Positive:** Self-contained pitch deck, toggleable light/dark styling, interactive pipeline clicks. <br>**Trade-off:** Added ~500 LOC component to the client bundle. |
| **ADR-006** | 2026-09-18 | **Deterministic Grounding vs Vector DB** | Standard vector databases (Pinecone/Chroma) add external infra costs and cold starts. | **Positive:** Deterministic parsing of GitHub trees + package manifests passed in-context is faster and cheaper for <50MB repos. <br>**Trade-off:** Repositories exceeding context token limits must rely on truncated summaries. |
