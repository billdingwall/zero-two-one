# r5 Update Record: 03-TDD.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 2 (prototype exit-gate unschedulable), Showstopper 3 (manifest/phase drift), Gap 7 (`021-feedback` target repo placeholder)
**Target doc:** [../03-TDD.md](../03-TDD.md)

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Give the PRD's new optional-prototype feature (F9) a technical contract, wire the manifest into `workflow-status.js` as the actual phase source of truth, and resolve the placeholder feedback-repo target.

## Edits Applied

### 1. New §12 — Prototype Command (Showstopper 2)

Added the `021-prototype` command contract: generates a static prototype from the key + guiding docs on demand; not part of the default install; wired into the refinement loop only once a prototype has been added to the project (prototype-sync behavior).

### 2. §7 Install Manifest — manifest-read mechanics (Showstopper 3)

Documented `.zero-two-one.json` as the phase **source of truth**: `scripts/workflow-status.js` reads the manifest's `phase` field first, falling back to repo-state inference only when the manifest is absent, and no longer treats a missing prototype as a phase-inference signal.

### 3. §10 — Feedback command repo slug (Gap 7)

Resolved the `<owner>/zero-two-one` placeholder to the concrete target: **`billdingwall/zero-two-one`**.

## Cascade

- Companion to [r5-update-prd.md](r5-update-prd.md) (F9) and [r5-update-edd.md](r5-update-edd.md) (prototype workflow experience).
- `scripts/workflow-status.js` code change applied alongside this doc update (see [r5-review.md](r5-review.md) Outcome).
- Roadmap re-sequencing carries the manifest-dogfood and repo-slug work into mvp releases ([r5-update-roadmap.md](r5-update-roadmap.md)).
- Changelog entry added to the TDD.
