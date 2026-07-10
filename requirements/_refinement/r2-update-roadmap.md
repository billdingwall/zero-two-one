# r2 Update Plan: 04-ROADMAP.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r2
**Findings addressed:** 6 (scope), r3 sequencing
**Target doc:** [../04-ROADMAP.md](../04-ROADMAP.md)

## Intent

Per the round's scope statement, migration support for the default stack (Claude Code + GitHub Spec Kit) becomes **MVP scope** — the package should handle working projects before it's worth publishing broadly. Multi-tool support stays out of MVP and is sequenced as the r3 theme.

## Proposed Edits

### 1. Phase 3 (MVP Build) gains a migration milestone group

Add under Phase 3:
- [ ] **Init v2 — safe install & migration** (r2): ownership-based merge rules, `--dry-run`/`--force`, idempotent re-run, `.claude/commands/` delivery, conflict-aware hook install, `.zero-two-one.json` manifest, migrate-mode detection + phase interview, Spec Kit reuse.
- [ ] Migration acceptance test: init into a non-empty working repo (existing README, docs, husky hook, populated specs/) with zero user files overwritten.

The existing Phase 3 items (NPM publish, e2e test on empty repo, automated tests) remain; the e2e test item is extended to cover both scaffold and migrate modes.

### 2. Sequencing note for r3

Add one line under the Transition Note (or a short "Upcoming rounds" note): **r3 theme — tool-agnostic init/migration**: extend the adapter layer to alternative assistants and SSD engines (Kiro, Google Antigravity first), building on the `.zero-two-one.json` `tools` block and the framework architecture proposal. Backlog items stay in `05-BACKLOG.md` until r3 opens.

## Cascade

- Backlog: concrete task breakdown — [r2-update-backlog.md](r2-update-backlog.md).
- Changelog entry in the roadmap.
