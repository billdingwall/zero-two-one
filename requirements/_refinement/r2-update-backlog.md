# r2 Update Plan: 05-BACKLOG.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r2
**Findings addressed:** 1–6 task breakdown; r3 tagging
**Target doc:** [../05-BACKLOG.md](../05-BACKLOG.md)

## Intent

Break the r2 architecture into MVP backlog tasks (each maps to a future spec under SSD), and tag the existing v2 items that form the r3 theme.

## Proposed Edits

### 1. Add to `## MVP Backlog` (new "Init v2 — safe install & migration" group)

- [ ] Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing for user-owned files).
- [ ] `--dry-run` classified action plan and `--force <path>` overwrite opt-in.
- [ ] Idempotent re-run (skip present-and-unmodified; complete missing pieces only).
- [ ] Copy `.claude/commands/` into target, merge-safe (fixes gap 1 / PRD Feature 4).
- [ ] Conflict-aware pre-commit install (plain-hook chaining; husky/lefthook detection).
- [ ] `.zero-two-one.json` install manifest (version, mode, phase, tools, file hashes) + `--upgrade` flow.
- [ ] Migrate-mode detection + lifecycle-phase interview (`--phase` flag for non-interactive); Growth entry scaffolds post-transition roadmap/backlog shape.
- [ ] Existing-doc import to `requirements/_notes/imported-docs.md` with template cross-links.
- [ ] Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter against the gate, skip duplicate setup guidance.
- [ ] Migration acceptance test on a non-empty fixture repo (zero user-file overwrites).

### 2. Update `## v2 / Growth Backlog` — tag the r3 theme

- Item 2 (**Pluggable spec-driven delivery tool**) and item 3 (**Pluggable AI assistant**): tag `[r3]` and name the first candidates — Kiro (KIRO.md + Kiro spec management) and **Google Antigravity**. Note both build on the `.zero-two-one.json` `tools` block landing in r2.
- Item 4 (**Configuration flow at init**): mark partially delivered by r2 (phase interview + tool-stack recording); remaining scope (full tool selection interview) rolls into r3.

### 3. Update `## Open Questions & Blockers`

- Add: manifest location (root vs `.ai/`) — resolve at r2 TDD approval.
- Update the layering question: r2's manifest/adapters design is the first concrete step; full audit still pending before r3.

### 4. Log the round

Add r2 to `## Refinement Cycles` with a link to [r2-review.md](r2-review.md).

## Cascade

- Changelog entry in the backlog.
