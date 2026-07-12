# Release: mvp-2 — Pre-build: Foundation & Design Docs

- **Type:** MVP release
- **Status:** In progress (current)
- **Lifecycle Phase:** Pre-build (Phase 2)
- **Branch:** working on the pre-build branch; Phase 3 releases branch per spec (`NNN-feature-name`)
- **Roadmap:** [04-ROADMAP.md](../04-ROADMAP.md)

## Goal

A working framework skeleton with launch-ready living docs and a documented CLI/DX surface: scaffolder, refinement gate, clean package boundary, five refinement rounds (r1–r5), the dogfooded manifest, and the command/workflow design references.

## Scope

- [x] `npx zero-two-one-init` CLI scaffolder (legacy scaffold behavior; hardened in mvp-3).
- [x] `pre-commit` refinement gate.
- [x] `package/` boundary + sync manifest (r1).
- [x] `_INDEX.md` / `-Template.md` conventions; `021-` naming convention (r3).
- [x] Refinement rounds r1–r5 applied to the living docs.
- [x] Dogfood `.zero-two-one.json`; `workflow-status.js` reads manifest phase; prototype dropped from inference (r5).
- [x] `requirements/_design/command-design.md` + `workflow-design.md` (r5).
- [ ] Finalize Claude Code integrations wiring (`/021-init`, `/021-status`).
- [ ] Stakeholder sign-off demo: a lightweight command-walkthrough / transcript of the `021` CLI experience, backing the Pre-build exit gate (EDD §3; r5 Q2).

## Exit Gate

Every core scenario defined in the EDD and reviewable by stakeholders via the CLI-experience walkthrough demo (or a prototype, if one was added); architecture locked in the TDD; mvp-3 scope specced. **No prototype required** (r5).

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-12 (r5):** Renamed to "Foundation & Design Docs"; added manifest dogfood, status-script fix, and the two design docs to scope; prototype removed as an exit condition.
- **2026-07-12 (r4):** File created as part of the releases restructure.
