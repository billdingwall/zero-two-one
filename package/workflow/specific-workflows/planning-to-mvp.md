# Planning → MVP Build Transition

*How the workflows shift when a project passes the Planning sign-off milestone and enters MVP Build (Phase 0 → Phase 1). Renamed from the former Pre-build → MVP Build transition for the 3-phase model (r6).*

**Trigger:** the Planning sign-off milestone passes — every core scenario is stakeholder-reviewable (docs, or prototype if one was added) and the architecture is locked in the TDD (see [product-lifecycle.md](product-lifecycle.md)).

## What changes
1. **State:** record `phase: mvp` in `.zero-two-one.json` and the assistant's memory; `021-status` now reports MVP Build.
2. **Driver:** work shifts from refining the key docs to **Spec-Driven Delivery** — features become `specs/NNN-feature-name/` and flow through the refinement gate ([spec-driven-delivery.md](spec-driven-delivery.md)).
3. **Reviews:** the refinement loop switches to the **MVP** review template (code review + build testing).
4. **Roadmap:** the MVP releases begin execution in engineering-dependency order; each release launches via [release-launch.md](release-launch.md).
5. **Refinement continues:** the loop still runs for doc changes, but its cascade now feeds specs and releases as well as the key docs.

## What stays
- The deterministic `pre-commit` refinement gate (now actively blocking implementation without an approved spec).
- The key docs as the living source of truth; the manifest as state source of truth.
