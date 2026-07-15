# r5 Update Record: 04-ROADMAP.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 1 (publish-before-safe-install), Gap 4 (orphaned v2 items), Gap 8 (mvp-3 overloaded, no dependency ordering)
**Target doc:** [../05-ROADMAP.md](../05-ROADMAP.md)

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Fix the launch-order defect (publish was scheduled ahead of the safe-install engine, which would ship the legacy clobbering CLI to test repos) and split the overloaded mvp-3 into a properly dependency-ordered sequence of releases, absorbing all v2 scope into MVP.

## Edits Applied

### 1. Re-sequenced into six engineering-ordered MVP releases (Gap 8)

Replaced the single overloaded mvp-3 with six releases in dependency order: **mvp-1** (Planning, completed) → **mvp-2** (Pre-build: Foundation & Design Docs) → **mvp-3** (Safe Install & Manifest — Init v2 engine) → **mvp-4** (AI-Led Init & Stack/Design Adapters) → **mvp-5** (Lifecycle Commands) → **mvp-6** (Test, Publish & Field Launch). Each release now has its own `_releases/mvp-N.md` file.

### 2. Publish moved to the launch release (Showstopper 1, team resolution #1)

NPM publish is now scoped **only** to mvp-6 (Test, Publish & Field Launch) — the last release, after the safe-install engine (mvp-3) has landed. Publishing before safe-install would have shipped the legacy clobbering CLI to real test repos, violating PRD F1 / TDD §6.

### 3. Growth (v2) section emptied (Gap 4, team resolution #1)

All previously-deferred v2 work was pulled into the MVP releases above. The three remaining orphaned items (MCP server, extra templates, issue-tracker integration) had no PRD anchor and were **dropped for now** — to be re-derived in the Growth phase from field-test and `021-feedback` evidence, not carried forward as assumed scope.

## Cascade

- Backlog restructured to match the new release sequence ([r5-update-backlog.md](r5-update-backlog.md)).
- New `_releases/mvp-4.md`, `mvp-5.md`, `mvp-6.md` files created (existing `mvp-1.md`–`mvp-3.md` retained/updated).
- Changelog entry added to the roadmap.
