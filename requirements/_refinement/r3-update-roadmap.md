# r3 Update Plan: 04-ROADMAP.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 3 (stack model sequencing); open question (implementation timing)
**Target doc:** [../04-ROADMAP.md](../04-ROADMAP.md)

## Intent

Record r3 as designed, keep implementation sequencing honest. Recommended position (open question in the review): **stack/adapter implementation stays post-MVP** — MVP ships the `claude` stack, but the Init v2 code is built adapter-shaped so the `antigravity` and `kiro` stacks drop in without rework.

## Proposed Edits

### 1. Phase 3 (MVP Build) — one addition

- [ ] Build Init v2 **adapter-shaped**: instruction/skill/command rendering and SSD paths resolved through the stack adapter interface (TDD §9), even though only the `claude` stack and `none` design binding ship in MVP.

### 2. Update the "Upcoming rounds" note

Replace the r3 pre-scope line with: **r3 designed (2026-07-10)** — three supported stacks locked in TDD §9 (`claude` + Spec Kit · `antigravity` + Spec Kit · `kiro` all-in-one) plus the independent design-system role (`none` / `material-3`). Implementation staged in the v2 backlog as the "Stacks & Design Adapters" group, pulled into Growth releases (or earlier at the team's discretion).

### 3. If the open question resolves the other way

Should any slice be pulled into MVP at approval (candidate: the neutral `AGENTS.md` rendering, near-zero cost), it gets added under Phase 3 explicitly at apply time.

## Cascade

- Backlog task breakdown — [r3-update-backlog.md](r3-update-backlog.md).
- Changelog entry in the roadmap.
