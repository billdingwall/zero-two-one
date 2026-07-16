# r1 Update Plan: 05-BACKLOG.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r1
**Findings addressed:** 3 (3.1–3.4 backlog items), 4.2
**Target doc:** [../04-BACKLOG.md](../04-BACKLOG.md)

## Intent

`05-BACKLOG.md` is currently an empty stub. This plan populates it with (a) MVP-supporting tasks, (b) the three v2 features from finding 3 — explicitly *out* of MVP scope per the review — and (c) the prioritization rules that take effect in the Growth phase (finding 4.2).

## Proposed Structure & Content

### 1. Header & phase

Current phase: Pre-build (Phase 2). Note that backlog ordering is roadmap-driven until Growth; from Growth onward, **user value** (defined from user feedback) is the primary prioritization signal.

### 2. `## MVP Backlog` (supports roadmap Phases 2–3)

- Implement package-manifest sync exclusions; remove `sync-to-package.js` from `package/scripts/` (r1 finding 1.1).
- Update `06-REVIEW-Template.md` Related Docs + template-maintenance workflow (r1 finding 2.1).
- Publish `zero-two-one` v1.1.x to NPM.
- End-to-end test of `npx zero-two-one-init` on a fresh repository via Claude Code.
- Automated tests for `bin/init.js` and `hooks/pre-commit`.

### 3. `## v2 / Growth Backlog` (not MVP scope)

From r1 finding 3:
1. **Design-system selection** — user picks a design system during setup; a dedicated workflow walks through decisions/gaps/implications and updates `DESIGN.md`, the EDD, and dev requirements to use it.
2. **Pluggable spec-driven delivery tool** — default remains GitHub Spec Kit; allow alternatives (e.g. Kiro) to manage specs and the SSD process.
3. **Pluggable AI assistant** — support assistants other than Claude Code (e.g. Kiro CLI): `CLAUDE.md` becomes the tool's equivalent (`KIRO.md`) wired into that tool's project settings, functionally identical.
4. **Configuration flow at init** (finding 3.2) — an interview at the start defining project tools and existing docs so the framework adapts to them.

Carried over from the old roadmap Phase 4 (per [r1-update-roadmap.md](r1-update-roadmap.md)):
5. Native MCP server support.
6. Additional templates (database schema, API design).
7. Issue-tracker integration (Linear, Jira) for spec status sync.

### 4. `## Open Questions & Blockers`

Register seeded with: "How should framework layers be formalized to stay tool-agnostic?" → answered by the `.021-updates/framework-architecture-proposal.md` proposal, revisit when v2 items are pulled.

### 5. `## Refinement Cycles`

Log r1 with a link to `_refinement/r1-review.md`.

## Cascade

- `templates/05-BACKLOG-Template.md` updated to carry the same section structure (MVP Backlog / v2 Growth Backlog / Open Questions / Refinement Cycles).
