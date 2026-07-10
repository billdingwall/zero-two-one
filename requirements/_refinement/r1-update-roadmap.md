# r1 Update Plan: 04-ROADMAP.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r1
**Findings addressed:** 4 (4.1)
**Target doc:** [../04-ROADMAP.md](../04-ROADMAP.md)

## Intent

The roadmap currently reads as a flat 4-phase list with no defined behavior for what happens after MVP. Finding 4 asks the roadmap to change shape at the MVP→Growth transition: MVP phases become a historical record, and forward work is expressed as **releases pulled from the backlog**.

## Proposed Edits

### 1. Restructure into two top-level sections

- **`## Releases (Growth)`** — placed *above* the MVP section. Empty until the Growth phase begins, with a short instruction block: releases are defined at the team's discretion by pulling backlog items, prioritized by user value (per finding 4.2, see [r1-update-backlog.md](r1-update-backlog.md)). Each release gets a heading (`### Release v1.x — <theme>`), a goal, and its pulled backlog items.
- **`## MVP Roadmap (Phases 1–3)`** — the existing phased plan. Once Growth is reached, this section is frozen as history (completed items checked, no new scope added here).

### 2. Update current phase content

- Mark the `_INDEX.md` rename / package decoupling work as done under Phase 2.
- Phase 3 (MVP Build) remains: publish v1.1.x to NPM, end-to-end test on a fresh repo via Claude Code, automated tests for `init.js` and the pre-commit hook.
- Move the Phase 4 (Growth) feature bullets (MCP support, extra templates, issue-tracker integration) out of the roadmap and into the backlog as v2 candidates — under the new model, Growth work lives in the backlog until pulled into a release.

### 3. Add a transition note

One-paragraph pointer to the new MVP→Growth transition workflow (defined in [r1-update-workflows.md](r1-update-workflows.md)) describing when and how the switch is made.

## Cascade

- `05-BACKLOG.md` absorbs the Phase 4 bullets and the r1 v2 features — see [r1-update-backlog.md](r1-update-backlog.md).
- `templates/04-ROADMAP-Template.md` updated to carry the same two-section structure so new projects start with it.
- Changelog entry in the roadmap.
