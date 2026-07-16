# r6 Update Plan: 04-ROADMAP.md → 05-ROADMAP.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #2 (rename to 05), #3 (table format), #8 (structural work into mvp scope)
**Target doc:** [../05-ROADMAP.md](../05-ROADMAP.md) (renamed from `04-ROADMAP.md`, this round)
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §1, §8.2 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §2, §3

## Intent

Rename the roadmap to `05-ROADMAP.md`, reshape it as a table that is a **summary view** over the canonical `_releases/` files (never a second source of truth), and reflect that the structural migration's engine-facing pieces land in mvp-3/mvp-4.

## Proposed Edits

### 1. Rename (decision #2)

- `04-ROADMAP.md` → **`05-ROADMAP.md`**. Update all inbound links (PRD/EDD/TDD/PRODUCT/README/backlog/`_releases/` files, `_INDEX.md`s). Atomic with the backlog rename ([r6-update-backlog.md](r6-update-backlog.md)) and template rename.

### 2. Table format (decision #3)

- Convert the per-release prose to a table: **description · status · priority · dependency · lifecycle phase**, one row per release, each linking to its `_releases/NNN.md` (canonical). Keep the Growth/MVP split and the changelog.
- `priority`/`dependency` are new columns summarizing the release files' ordering — do not restate release detail.
- *Assumption (review open question):* include `priority`/`dependency` columns now; alternative is to keep narrative engineering-dependency ordering until Growth — confirm at approval.

### 3. Lifecycle-phase column values (decision #1)

- Phase labels use the 3-phase model: mvp-1 = Planning (was "Planning" already), mvp-2…mvp-6 = MVP Build; no "Pre-build" phase label. (mvp-2's historical "Pre-build" release **name** can stay as history; the *lifecycle phase* column reads Planning/MVP/Growth.)

### 4. Structural migration in scope (decision #8)

- Add/annotate the engine-facing structural items so they're built against the new structure: the `bin/init.js` template→install mapping uses `04-BACKLOG`/`05-ROADMAP` and the `{planning,mvp,growth}` phase schema (mvp-3); the **Workflow-manager** build lands in an mvp release (recommend mvp-4) — mirror [r6-update-backlog.md](r6-update-backlog.md).

### 5. Changelog

- Add an r6 entry (rename, table format, 3-phase labels, structural items).

## Cascade

- Backlog rename + table ([r6-update-backlog.md](r6-update-backlog.md)); `_releases/*` link updates; `templates/04-ROADMAP-Template.md` → `05-ROADMAP-Template.md` + table skeleton via [r6-update-workflows.md](r6-update-workflows.md).
