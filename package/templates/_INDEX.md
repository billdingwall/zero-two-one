# Templates Overview

Templates for creating standardized project documentation.

**Template neutrality (r4):** everything in this directory is **tool-agnostic**. Stack-specific formatting and naming (Claude commands, Antigravity skills, Kiro steering) is applied at render time by the init adapter (TDD §9.1) — never authored into the templates.

## Manifest

- `01-PRD-Template.md`: Template for PRD.
- `02-EDD-Template.md`: Template for EDD.
- `03-TDD-Template.md`: Template for TDD.
- `04-ROADMAP-Template.md`: Template for Roadmap.
- `05-BACKLOG-Template.md`: Template for Project Backlog.
- `06-REVIEW-Template.md`: Generic fallback template for Refinement Reviews.
- `reviews/06-REVIEW-{idea,prebuild,mvp,growth}-Template.md`: Stage-specific review templates — pick by lifecycle phase (r4).
- `07-USER-PERSONA-Template.md`: Template for User Persona.
- `08-STAKEHOLDER-PERSONA-Template.md`: Template for Stakeholder Persona.
- `09-CONTRIBUTOR-PERSONA-Template.md`: Template for Contributor Persona.
- `10-RELEASE-Template.md`: Template for release files (`requirements/_releases/`) — MVP and Growth releases (r4).
- `CLAUDE-Template.md`, `CODE-Template.md`, `PRODUCT-Template.md`, `DESIGN-Template.md`, `README-Template.md`: Guiding-doc templates instantiated by init (TDD §5).
