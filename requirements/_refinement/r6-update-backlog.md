# r6 Update Plan: 05-BACKLOG.md → 04-BACKLOG.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #2 (rename to 04), #3 (table format + ownership), #8 (structural work as items)
**Target doc:** [../04-BACKLOG.md](../04-BACKLOG.md) (renamed from `05-BACKLOG.md`, this round)
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §1, §8.2 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §2, §3

## Intent

Rename the backlog to `04-BACKLOG.md`, reshape the release-grouped checklists into a table with an `ownership` column, and add the r6 structural-migration work as tracked items (most lands via this refinement round; the engine-facing pieces map to mvp releases).

## Proposed Edits

### 1. Rename (decision #2)

- `05-BACKLOG.md` → **`04-BACKLOG.md`**. Update all inbound links. Atomic with the roadmap rename ([r6-update-roadmap.md](r6-update-roadmap.md)).

### 2. Table format + ownership (decision #3)

- Convert the release-grouped checklists to a table: **description · status · ownership · release**. Preserve the current release grouping via the `release` column (mvp-2…mvp-6). `ownership` is a new field — default to the responsible role/lens (PM/Design/Eng) or owner name.
- Preserve item content; this is a reformat, not a re-scope (existing `[x]`/`[ ]` map to a status value).

### 3. Add r6 structural-migration items

- New backlog rows for the migration surface (proposal §8.2), each tagged to where it lands:
  - 3-phase migration across docs/scripts/templates + dogfood manifest `prebuild→planning` (this round).
  - 04/05 rename across docs + templates + **`init.js` template→install mapping** (mvp-3 for the engine part).
  - Table-format templates + `backlog-sync`/`roadmap-sync` output-format updates.
  - Guiding-files-as-roles/lenses + entrypoint framing + Wait-rule dedup (this round).
  - Workflow sync-decomposition + renames + retained workflows (this round).
  - `_architecture/` boundary (doc now; dir on first use) + **Workflow-manager** (author TDD §13 now; **build in mvp-4**).
  - Skill renames `generate-tasks`→`generate-backlog` + new `generate-prd`/`generate-edd` + `command-design`/`_INDEX` updates.

### 4. Current-phase header

- Update "Current Phase: Pre-build (Phase 2)" per the 3-phase model (Planning) once the lifecycle change applies — keep consistent with the manifest (`planning`).

### 5. Changelog + Refinement Cycles

- Add the r6 row to Refinement Cycles and an r6 changelog entry.

## Cascade

- Roadmap rename/table ([r6-update-roadmap.md](r6-update-roadmap.md)); TDD numbering + Workflow-manager scheduling ([r6-update-tdd.md](r6-update-tdd.md)); `templates/05-BACKLOG-Template.md` → `04-BACKLOG-Template.md` + table skeleton via [r6-update-workflows.md](r6-update-workflows.md).
