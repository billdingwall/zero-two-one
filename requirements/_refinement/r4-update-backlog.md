# r4 Update Plan: 05-BACKLOG.md

**Status:** Applied (2026-07-12; approvals: issue-URL fallback accepted, carried v2 items stay in Growth backlog)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 1, 4, 9, 12, 13, 14, 17, 18
**Target doc:** [../04-BACKLOG.md](../04-BACKLOG.md)

## Intent

Restructure the backlog around the launch-ready roadmap: the v2 "Stacks & Design Adapters" group moves into the MVP backlog (finding 18), and the new r4 feature work is added as spec-ready task groups.

## Proposed Edits

### 1. Promote v2 → MVP (finding 18)

Move the entire **Stacks & Design Adapters** group (source layer, `antigravity` stack, `kiro` stack, design-system adapter, init integration, 3×2 acceptance matrix) from "v2 / Growth Backlog" into the MVP backlog under mvp-3. The three carried-over pre-r1 items (MCP server, additional templates, issue-tracker sync) remain in the Growth backlog unless the user says otherwise.

### 2. New MVP group: r4 features (each future SSD spec material)

- [ ] **AI-led init walkthrough** (finding 4; TDD §1): stack-rendered init skill/command driving `bin/init.js` via flags; ask-don't-assume question pattern; per-conflict archive / update-to-fit / leave-alongside decisions recorded in the manifest (finding 3).
- [ ] **`021-feedback` command** (finding 14; TDD §10): issue filing via `gh` or pre-filled issue URL; manifest context attached; `.github/` issue template for triage.
- [ ] **`021-design` command** (finding 17; TDD §11): design-system install/BYO flow over the §9.4 adapter and design-system-selection workflow.
- [ ] **Stage-specific review templates** (finding 13): per-phase review templates + phase-aware selection in the review flow.
- [ ] **Releases structure** (findings 7, 8): `requirements/_releases/` scaffolding, `10-RELEASE-Template.md`, roadmap linkage; init scaffolds it (Growth entry included).
- [ ] **README install prompts** (finding 9): copy-paste install blocks for Claude, Antigravity, Kiro in the repo-root README (+ README template).
- [ ] **Upgrade-scope enforcement** (finding 12): `--upgrade` limited to templates/skills/scripts/hooks + stack command surfaces; test that user-owned docs survive an upgrade byte-identical.
- [ ] **EDD-cohesion sweep** (finding 1): audit workflows, skills, scripts, and templates so every PRD/TDD reference includes the EDD; fix `021-status` doc checks if they omit the EDD.
- [ ] **Tool-agnostic template audit** (finding 2): verify no template hard-codes stack-specific names/paths; move any found into adapter render logic.

### 3. Open Questions & Blockers

- `021-feedback` transport: is the no-auth fallback (pre-filled GitHub issue URL) acceptable when `gh` is absent, or should MVP require `gh`? (Recommend: URL fallback — zero setup, works everywhere.)
- Should the three carried v2 items (MCP server, extra templates, issue-tracker sync) also move to MVP per the letter of finding 18? (Recommend: no — they aren't needed for multi-repo launch testing; confirm at approval.)

### 4. Refinement Cycles

Add the r4 row: vision-alignment round — cohesive doc set, AI-led init, launch-ready roadmap with releases, feedback loop, v2→MVP promotion.

## Cascade

- Changelog entry in the backlog.
