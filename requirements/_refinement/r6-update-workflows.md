# r6 Update Plan: Workflows, Guiding Files, Templates, Scripts & Skills

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #1 (3-phase in process/scripts/templates), #4 (roles/lenses + entrypoint + Wait-rule dedup), #5 (workflow two-level + sync decomposition + retained workflows), #6 (`_architecture` in doc maps), #7 (skill renames)
**Target docs:** `workflow/specific-workflows/*`, `workflow/workflows.md`, `CLAUDE.md`, `PRODUCT.md`, `CODE.md`, `DESIGN.md`, `README.md`, `templates/*` (key-doc + reviews + ASSISTANT), `scripts/workflow-status.js`, `skills/*` + `skills/_INDEX.md`, `requirements/_design/command-design.md`, `.zero-two-one.json`
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §2, §3, §7, §8.2 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §3, §4, §5

## Intent

Carry the structural decisions into the process layer, guiding files, templates, scripts, and skills — and run the RLP constraint check on `CODE.md`. This is the plan with the widest surface; it must land atomically with the key-doc plans so no reference dangles.

## Proposed Edits

### 1. Lifecycle 4→3 across process/scripts/templates (decision #1)

- **`workflow/specific-workflows/product-lifecycle.md`**: rewrite to three phases (Planning absorbs Pre-build; Planning sign-off milestone as the MVP gate). Rename `phase0-to-phase1.md` → **`planning-to-mvp.md`**.
- **`scripts/workflow-status.js`**: phase map → `{ planning, mvp, growth }`; drop `prebuild`; inference fallback maps old prebuild signals to `planning`.
- **`.zero-two-one.json`** (dogfood): `phase: prebuild` → **`planning`**; verify `npm run 021-status` reports Planning.
- **`templates/reviews/`**: `06-REVIEW-{idea,prebuild,mvp,growth}` → `06-REVIEW-{planning,mvp,growth}` (fold idea+prebuild into planning). Update `refinement-loop.md` step 1 template-selection list.
- **CLAUDE.md**: "## 4-Phase Project Lifecycle" → "3-Phase"; Context section phase wording.
- **README.md**: lifecycle table + "4-phase" count → 3.
- **PRODUCT.md**: merge Pre-build steps into Planning; renumber (Planning / MVP Build / Growth).

### 2. Guiding files as roles/lenses + entrypoint framing + Wait-rule dedup (decision #4)

- Frame `PRODUCT.md`/`DESIGN.md`/`CODE.md` as **role lenses** (PM/Designer/Lead Engineer); note the distinction from `workflow/_personas/` (user/stakeholder/contributor docs).
- **Entrypoint**: keep `CLAUDE.md` as the `claude` rendering; where the entrypoint is described generically, frame it as the stack-rendered file from source `AGENTS.md` (`templates/ASSISTANT-Template.md`). Add `_architecture/` to CLAUDE.md's "Documentation Structure" list.
- **Wait rule**: author it in the entrypoint (outline plan → confirm before complex multi-file changes); **CODE.md §4 "Ask for Clarification" edited to defer to it** (one rule, cross-referenced) — this is also the RLP **constraint check** (step 4).

### 3. Workflow two-level layout + sync decomposition + retained files (decision #5)

- Keep `workflow/workflows.md` (index) + `specific-workflows/` (detail) + `_personas/`.
- Decompose `refinement-loop.md` into named children: `review-sync`, `requirements-sync`, `guidance-sync`, `prototype-sync`, `backlog-sync`, `release-sync`, `roadmap-sync` (author each; `refinement-loop.md` becomes the parent/overview).
- Add **`release-launch.md`**; rename `phase0-to-phase1`→`planning-to-mvp` (per §1).
- **Retain (do not drop)** `init-and-migration.md`, `design-system-selection.md`, `key-docs-to-ssd.md`, `review-to-ssd.md`, `key-docs-to-prototype.md`; ensure `workflows.md` indexes all of them and the two-level tree is complete.
- Update inbound workflow links in PRD/EDD/TDD/PRODUCT/CLAUDE/README per any rename.

### 4. Templates: numbering + table skeletons + ASSISTANT (decisions #2, #3)

- Rename `templates/04-ROADMAP-Template.md` → `05-ROADMAP-Template.md` and `05-BACKLOG-Template.md` → `04-BACKLOG-Template.md`; update the table skeletons (roadmap: description·status·priority·dependency·phase; backlog: description·status·ownership·release).
- Confirm `ASSISTANT-Template.md` is the neutral source name (`AGENTS.md` default output; `claude`→`CLAUDE.md`) — align with TDD §9.1 (may already be planned in mvp-4; note here, don't duplicate).
- Template-maintenance sweep: "Related Docs" lines and any `04-ROADMAP`/`05-BACKLOG`/phase references across `templates/`.

### 5. Skills: one generator per key doc (decision #7)

- Rename `skills/generate-tasks.md` → **`generate-backlog.md`** (repoint output to the `04-BACKLOG` table; no capability change).
- Add `skills/generate-prd.md` and `skills/generate-edd.md` (mirror `generate-tdd.md`'s gap-fill pattern across the cohesive set).
- Update `skills/_INDEX.md` and `requirements/_design/command-design.md` (both name `generate-tasks` today).

### 6. Net-new doc-map wiring (decision #6)

- `requirements/_architecture/`: add its `_INDEX.md` and register it in CLAUDE.md doc-structure + `workflows.md` architecture map (create dir on first use per the TDD boundary; the boundary text is authored in [r6-update-tdd.md](r6-update-tdd.md)).
- Advisory doc-sync + Workflow-manager: reference the TDD §13 definition from `workflow-design.md` (hooks/workflows ↔ files) — keep them out of the pre-commit gate description.

### 7. `sync:package` + changelogs

- After apply: `npm run sync:package` to carry process/script/template/skill changes into `package/`.
- Changelog entries where touched docs carry one.

## Cascade

- Companion to all five key-doc plans (PRD/EDD/TDD/Roadmap/Backlog). This plan holds the template-maintenance sweep and the RLP constraint check (CODE.md).
- RLP step 5 (Design & Prototype): no prototype in this repo → `DESIGN.md` untouched unless a role/lens reframe line is added; note N/A by design.
