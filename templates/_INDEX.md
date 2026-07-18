# Templates Overview

Templates for creating standardized project documentation.

**Template neutrality (r4):** everything in this directory is **tool-agnostic**. Stack-specific formatting and naming (Claude commands, Antigravity skills, Kiro steering) is applied at render time by the init adapter (TDD §9.1) — never authored into the templates.

## Manifest

- `01-PRD-Template.md`: Template for PRD.
- `02-EDD-Template.md`: Template for EDD.
- `03-TDD-Template.md`: Template for TDD.
- `05-ROADMAP-Template.md`: Template for Roadmap.
- `04-BACKLOG-Template.md`: Template for Project Backlog.
- `06-REVIEW-Template.md`: Generic fallback template for Refinement Reviews.
- `reviews/06-REVIEW-{planning,mvp,growth}-Template.md`: Stage-specific review templates — pick by lifecycle phase (3-phase model, r6; the former `idea`+`prebuild` templates merged into `planning`).
- `07-USER-PERSONA-Template.md`: Template for User Persona.
- `08-STAKEHOLDER-PERSONA-Template.md`: Template for Stakeholder Persona.
- `09-CONTRIBUTOR-PERSONA-Template.md`: Template for Contributor Persona.
- `10-RELEASE-Template.md`: Template for release files (`requirements/_releases/`) — MVP and Growth releases (r4).
- `ASSISTANT-Template.md`: Neutral assistant-entrypoint **source** (spec 006, TDD §9.1) — rendered per stack into the entrypoint doc (`claude` → `CLAUDE.md`, `antigravity` → `AGENTS.md`) by `scripts/init/render.js`. Not a verbatim copy.
- `CODE-Template.md`, `PRODUCT-Template.md`, `DESIGN-Template.md`, `README-Template.md`: Guiding-doc templates instantiated verbatim by init (TDD §5).
