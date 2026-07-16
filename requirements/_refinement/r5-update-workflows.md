# r5 Update Record: Workflows, Manifest, Design Docs & CODE.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 2 (prototype exit-gate unschedulable), Showstopper 3 (manifest/phase drift), Gap 6 (EDD naming), plus re-audit Q2/Q3 and the RLP close-out constraint check
**Target docs:** `.zero-two-one.json` (new), `scripts/workflow-status.js`, `workflow/specific-workflows/product-lifecycle.md`, `workflow/specific-workflows/refinement-loop.md`, `workflow/specific-workflows/key-docs-to-prototype.md`, `workflow/workflows.md`, `requirements/_design/command-design.md` (new), `requirements/_design/workflow-design.md` (new), `requirements/_releases/mvp-4.md`–`mvp-6.md` (new), `CODE.md`

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Carry the r5 resolutions into process docs, code, and templates: dogfood the manifest to fix the phase-drift showstopper, make the prototype optional everywhere the process docs assumed one existed, document the CLI experience in dedicated design docs instead of duplicating it across the EDD, and close the round per the Refinement Loop Process (RLP) steps 4–6.

## Edits Applied

### 1. Manifest dogfooded (Showstopper 3, team resolution #3)

Created **`.zero-two-one.json`** at the repo root (`mode: source`, `phase: prebuild`, `stack: claude`) — this repo's own dogfood manifest, resolving the conflict where every doc said Phase 2 but `workflow-status.js` inferred 1.5 from a missing prototype.

### 2. `scripts/workflow-status.js` updated (Showstopper 3)

Changed to read `.zero-two-one.json`'s `phase` field first as the source of truth; falls back to repo-state inference only when the manifest is absent, and the inference no longer treats a missing prototype as a phase signal.

### 3. Prototype made optional across process docs (Showstopper 2, team resolution #2)

Updated `product-lifecycle.md`, `refinement-loop.md`, `key-docs-to-prototype.md`, and `workflow/workflows.md` so the prototype is never assumed: it exists only once `021-prototype` has generated it, prototype-related steps are skipped otherwise, and the Pre-build exit gate no longer requires one.

### 4. New CLI-experience design docs (re-audit Q2)

Created **`requirements/_design/command-design.md`** (every command surface: npm scripts, assistant-rendered commands, agent skills, underlying scripts) and **`requirements/_design/workflow-design.md`** (how each workflow and git hook reads/writes project files, plus the manifest as shared state). Added per re-audit clarification Q2: a lightweight command-walkthrough/transcript demo of the `021` CLI experience was scoped into mvp-2 to back the Pre-build exit gate — later delivered as `requirements/_design/cli-walkthrough-demo.md` at mvp-2 close.

### 5. Manifest `mode: source` + full-inventory regeneration scoped (re-audit Q3)

Per re-audit clarification Q3: added a **`source`** value to the manifest's `mode` field for the framework's own repo, and scoped mvp-3 to regenerate this repo's own manifest with a full file-hash inventory (end-to-end manifest dogfooding).

### 6. New release files

Created `requirements/_releases/mvp-4.md`, `mvp-5.md`, `mvp-6.md` (companions to the roadmap re-sequencing in [r5-update-roadmap.md](r5-update-roadmap.md)).

### 7. `sync:package` run

Ran `npm run sync:package` to carry the round's script/doc changes into `package/`.

### 8. RLP close-out (steps 4–6)

- **Step 4 — Constraint Check:** amended `CODE.md` §1 "Spec-Driven First" so the prototype principle states it is **optional**, generated on demand by `021-prototype` (previously implied it was a standing part of the workflow). No change needed to `templates/CODE-Template.md` (carries no prototype line).
- **Step 5 — Design & Prototype Update:** none this round — no prototype exists in this repo and none was added, so `DESIGN.md` was left untouched by design.
- **Step 6 — Commit:** round closed; all r5 changes committed.

## Cascade

- Companion to [r5-update-prd.md](r5-update-prd.md), [r5-update-edd.md](r5-update-edd.md), and [r5-update-tdd.md](r5-update-tdd.md) (F9 / manifest / prototype-command mechanics).
- Changelog entries added where the touched process docs carry one.
