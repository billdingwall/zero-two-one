# r6 Update Plan: 02-EDD.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #1 (3-phase lifecycle + Planning sign-off gate), #4 (entrypoint framing), #5 (workflow renames — inbound links)
**Target doc:** [../02-EDD.md](../02-EDD.md)
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §7, §3 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §1, §3

## Intent

Update the experience doc for the 3-phase model: the stage-aware review list drops `prebuild` and renames `idea`→`planning`, and the Pre-build exit gate is re-expressed as the **Planning sign-off milestone** (the EDD is where that gate is defined, around the CLI/DX experience). Fix workflow inbound links that move in this round.

## Proposed Edits

### 1. §2 — Stage-aware review list (idea/prebuild/mvp/growth → planning/mvp/growth)

- Rewrite the stage list from four stages to three: **Planning** (completing key/guiding docs, refining key docs, roadmap definition, optional prototype reviews — absorbs the old Idea + Pre-build bullets), **MVP** (code review + build testing), **Growth** (product review + user feedback). Matches `templates/reviews/{planning,mvp,growth}`.

### 2. §3 — Pre-build exit gate → Planning sign-off milestone

- Where §3 backs the "Pre-build exit gate," rename to the **Planning sign-off milestone**: every core scenario stakeholder-reviewable (docs, or prototype if added) + architecture locked in the TDD, as the gate into MVP Build. Keep the CLI/DX-experience framing.

### 3. Init/CLI entrypoint wording

- §2 "Project Initialization" and §3: where the assistant context file is named, keep `CLAUDE.md` as the `claude` rendering but ensure any general reference reads as the **stack-rendered entrypoint** (source `AGENTS.md` → `CLAUDE.md`/`AGENTS.md`/kiro steering), consistent with proposal §3 and TDD §9.1/§9.2. Design principle 3 ("Agent-First") `CLAUDE.md` example → note it is the `claude` rendering.

### 4. Workflow inbound links

- Update links to any renamed workflow (`init-and-migration` retained; `key-docs-to-prototype` retained; if `refinement-loop` children are newly split, point prototype/design references appropriately). No dangling links after the round.

### 5. Changelog

- Add an r6 entry.

## Cascade

- Templates `06-REVIEW-{...}` set (4→3) via [r6-update-workflows.md](r6-update-workflows.md); TDD §12 prototype/gate references ([r6-update-tdd.md](r6-update-tdd.md)).
- `templates/02-EDD-Template.md` stage list skeleton updated in the same round (template-maintenance rule).
