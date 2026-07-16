# Release: mvp-2 — Pre-build: Foundation & Design Docs

- **Type:** MVP release
- **Status:** Delivered
- **Lifecycle Phase:** Planning (Phase 0) — delivered during the former Pre-build phase, merged into Planning at r6
- **Branch:** worked on the pre-build branch; MVP-Build releases branch per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md)

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
- [x] Finalize Claude Code integrations wiring (`/021-init`, `/021-status`) — root [`.claude/commands/`](../../.claude/commands/) added so the source repo dogfoods its own slash commands (sync leaves root `.claude/` untouched; package `.claude/` preserved).
- [x] Stakeholder sign-off demo: a lightweight command-walkthrough / transcript of the `021` CLI experience, backing the Pre-build exit gate (EDD §3; r5 Q2) → [_design/cli-walkthrough-demo.md](../_design/cli-walkthrough-demo.md).

## Exit Gate

Every core scenario defined in the EDD and reviewable by stakeholders via the CLI-experience walkthrough demo (or a prototype, if one was added); architecture locked in the TDD; mvp-3 scope specced. **No prototype required** (r5).

## Delivered

All nine scope items shipped: the legacy `npx zero-two-one-init` scaffolder, the `pre-commit` refinement gate, the `package/` boundary + sync manifest, the `_INDEX.md`/`-Template.md` + `021-` conventions, five refinement rounds (r1–r5), the dogfooded `.zero-two-one.json` manifest (read by `workflow-status.js`), the `command-design.md` + `workflow-design.md` references, root `.claude/commands/` slash-command dogfooding, and the [CLI-experience walkthrough demo](../_design/cli-walkthrough-demo.md). **Planning sign-off milestone closed** (formerly the Pre-build exit gate) — every core scenario is reviewable via the walkthrough, architecture is locked in the TDD, and mvp-3 scope is specced.

## Changelog
- **2026-07-12 (mvp-2 close):** Closed the two remaining scope items — Claude Code command wiring (root `.claude/commands/`) and the stakeholder sign-off walkthrough ([_design/cli-walkthrough-demo.md](../_design/cli-walkthrough-demo.md)); Status → Delivered; Delivered summary written; Pre-build exit gate closed ahead of mvp-3.
- **2026-07-12 (r5):** Renamed to "Foundation & Design Docs"; added manifest dogfood, status-script fix, and the two design docs to scope; prototype removed as an exit condition.
- **2026-07-12 (r4):** File created as part of the releases restructure.
