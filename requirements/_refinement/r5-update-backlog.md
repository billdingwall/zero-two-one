# r5 Update Record: 05-BACKLOG.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 1 (publish-before-safe-install), Gap 4 (orphaned v2 items), Gap 8 (mvp-3 overloaded, no dependency ordering)
**Target doc:** [../04-BACKLOG.md](../04-BACKLOG.md)

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Re-map the backlog onto the roadmap's new six-release sequence ([r5-update-roadmap.md](r5-update-roadmap.md)) and empty the Growth/v2 backlog per team resolution #1.

## Edits Applied

### 1. Release-mapped restructure (Gap 8)

Regrouped every backlog item under its corresponding `mvp-N` release from the re-sequenced roadmap, so each item's release tag matches an actual `_releases/mvp-N.md` file instead of the former single overloaded mvp-3 bucket.

### 2. V2/Growth backlog emptied (Gap 4, Showstopper 1, team resolution #1)

Moved all previously-deferred v2 work into the appropriate MVP release group. Dropped the three orphaned carry-over items (MCP server, extra templates, issue-tracker sync) that had no PRD anchor — noted for later re-derivation from field-test/`021-feedback` evidence once the product enters Growth, rather than assumed as pre-committed scope.

### 3. Publish task relocated

The "Publish v1.1.x to NPM" task moved from ahead of the Init v2 safe-install group to **mvp-6** only, matching the corrected roadmap order (safe-install lands before anything is published).

## Cascade

- Mirrors the roadmap re-sequencing exactly ([r5-update-roadmap.md](r5-update-roadmap.md)).
- Changelog entry added to the backlog.
