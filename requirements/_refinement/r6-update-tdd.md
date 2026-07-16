# r6 Update Plan: 03-TDD.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #1 (manifest enum), #2 (04/05 numbering + init mapping), #6 (net-new: `_architecture/` boundary, Workflow-manager component, advisory doc-sync)
**Target doc:** [../03-TDD.md](../03-TDD.md)
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §1, §2, §3, §7 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §1, §2, §3

## Intent

The TDD carries the mechanical contracts, so it absorbs the most structural change: the phase enum, the doc-numbering swap (including the `init.js` template→install mapping the engine will implement in mvp-3), and the authored homes for the two net-new pieces (Workflow-manager component, `_architecture/` boundary).

## Proposed Edits

### 1. §7 Install Manifest — phase enum `{ planning, mvp, growth }` (decision #1)

- Change the schema `"phase": "planning | prebuild | mvp | growth"` → `"planning | mvp | growth"`.
- Update the §7 dogfood note: the framework manifest moves `phase: prebuild` → `planning` (the enum value ceases to exist — this is the migration, not a silent edit).

### 2. §8 Migrate-Mode Detection — heuristics (decision #1)

- Rewrite "otherwise **Planning/Pre-build**" → "otherwise **Planning**". Keep the "shipped product → Growth", "code, no framework docs → mid-MVP" heuristics.
- §8 "Growth entry scaffolds `04-ROADMAP.md`/`05-BACKLOG.md`" → swapped numbering (see below).

### 3. Numbering swap 04↔05 (decision #2)

- §2 Data Models: "`04-ROADMAP.md` keeps per-release summaries" → **`05-ROADMAP.md`**.
- §5 Package Manifest + Template→install mapping: `templates/0N-*-Template.md → requirements/0N-*.md` holds, but the concrete pair renames — `04-ROADMAP`→`05-ROADMAP`, `05-BACKLOG`→`04-BACKLOG`. State the swap explicitly so `bin/init.js` (built mvp-3) implements the new mapping.
- §8 Growth-entry scaffold names updated.
- Sweep the whole TDD for any other `04-ROADMAP`/`05-BACKLOG` path string.

### 4. New §13 — Workflow Manager (decision #6; net-new component)

- Add as a **fifth** entry to the §1 System Architecture list and a dedicated §13: a **post-commit / assistant-side state-sync** that keeps the manifest `phase` and backlog/roadmap/release status aligned as work lands.
- **Guardrails (normative):** advisory/corrective only; **never in the blocking commit path**; **never auto-commits** (it edits the working tree; the user commits); zero-runtime-dependency (built-in `fs`/`path`, no packages).
- **Advisory doc-sync**: document the non-blocking BACKLOG-vs-work drift check here too (assistant-side or CI), explicitly distinct from the deterministic `pre-commit` gate (§1/§3).
- *Assumption (review open question):* author the component now; **schedule the build into an mvp release** (recommend mvp-4 alongside the adapter work, or a dedicated item) — confirm at approval.

### 5. `_architecture/` boundary (decision #6)

- Add a note (§2 Data Models or §3 Constraints): `requirements/_architecture/` holds ADRs, full diagrams, and expanded data models that back the TDD. **Boundary:** the TDD keeps decisions + their summary (remains one third of the cohesive PRD/EDD/TDD set); `_architecture/` holds the supporting detail the TDD links into.
- *Assumption (review open question):* define the boundary now; create the directory on first use (empty + `_INDEX.md` when first needed) — confirm at approval.

### 6. Entrypoint framing (already aligned — verify)

- §9.1/§9.2 already state `AGENTS.md` is the neutral source and `CLAUDE.md` the `claude` rendering — no change needed; verify the proposal's framing matches and leave as-is.

### 7. Changelog

- Add an r6 entry.

## Cascade

- Roadmap re-sequence + table + numbering ([r6-update-roadmap.md](r6-update-roadmap.md)); backlog table + numbering ([r6-update-backlog.md](r6-update-backlog.md)); `workflow-status.js` phase map + templates via [r6-update-workflows.md](r6-update-workflows.md).
- The Workflow-manager build item and the numbering-aware `init.js` mapping must appear in mvp-3/mvp-4 scope ([r6-update-backlog.md](r6-update-backlog.md), [r6-update-roadmap.md](r6-update-roadmap.md)).
- `templates/03-TDD-Template.md` skeleton gains the §13 heading (template-maintenance rule).
