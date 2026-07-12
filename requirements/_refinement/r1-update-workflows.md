# r1 Update Plan: Workflows, Templates & Sync Tooling

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r1
**Findings addressed:** 1.1, 2.1, 2.2, 4.1, 4.2
**Target docs:** `workflow/specific-workflows/product-lifecycle.md`, `workflow/specific-workflows/refinement-loop.md`, `workflow/workflows.md`, `templates/06-REVIEW-Template.md`, `scripts/sync-to-package.js`

## Intent

Three mechanical changes that don't belong to a single living requirements doc: fixing the package-sync leak, curing template drift, and defining the MVP→Growth transition mechanics.

## Proposed Edits

### 1. Sync tooling (finding 1.1; contract defined in [r1-update-tdd.md](r1-update-tdd.md))

- Add a `scriptExclusions` list to `scripts/sync-to-package.js` so it never copies itself (or future dev-only scripts) into `package/scripts/`.
- Delete `package/scripts/sync-to-package.js`; strip any `sync:package` script entry from `package/package.json` if present.
- Re-run `npm run sync:package` and verify with `cd package && npm pack --dry-run`.

### 2. Review template & template maintenance (findings 2.1, 2.2)

- `templates/06-REVIEW-Template.md`: add a **Related Docs** line to the meta block listing the current guiding + key docs — PRD, EDD, TDD, Roadmap, Backlog, `CODE.md`, `PRODUCT.md`, `DESIGN.md`. (The stale `04-PROJECT-TRACKING.md` reference existed only in `r1-review.md`, already fixed.)
- Add a **template-maintenance rule** to the Refinement Loop (step 4.5 or a note in `workflows.md`): whenever a guiding/key doc is added, renamed, or removed, sweep `templates/` for affected references in the same round.
- Guiding docs in the package: confirmed present as `templates/*-Template.md`; the TDD package manifest (see [r1-update-tdd.md](r1-update-tdd.md)) records this as the delivery mechanism, so no extra files ship.

### 3. MVP→Growth transition workflow (findings 4.1, 4.2)

New file `workflow/specific-workflows/mvp-to-growth-transition.md`, linked from `workflows.md` §3 and from `product-lifecycle.md` Phase 4:

- **Trigger:** MVP launched, QA green (Phase 3 exit gate passed).
- **Roadmap flip:** freeze the MVP phases as history; activate the `Releases` section above them (structure per [r1-update-roadmap.md](r1-update-roadmap.md)).
- **Backlog flip:** all remaining v2/deferred items move to the backlog; prioritization switches from roadmap-driven to **user value**, defined from user feedback collected in refinement rounds.
- **Release definition:** team pulls backlog items into a named release at its discretion; each release then flows through the existing Review > Backlog > SSD pipeline.
- **Refinement loop amendment:** in Growth, step 3 of the RLP cascade reads "Roadmap > Releases > Backlog" — reviews feed the backlog, releases pull from it.

## Cascade

- `workflow/workflows.md` §3 gains the new workflow link; §2 manifest already matches current file names.
- `product-lifecycle.md` Phase 4 gains a pointer to the transition workflow.
- Changelog entries where the touched docs carry one.
