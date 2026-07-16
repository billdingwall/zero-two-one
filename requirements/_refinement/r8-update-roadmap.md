# r8 Update Plan: 05-ROADMAP.md + `_releases/mvp-6.md`

**Status:** Applied — executed on user direction (2026-07-16)
**Date:** 2026-07-16
**Round:** r8
**Trigger:** direct request — make publishing the last spec of MVP, with room to review all work and potentially add one more MVP spec before shipping.
**Target docs:** [../05-ROADMAP.md](../05-ROADMAP.md) · [../_releases/mvp-6.md](../_releases/mvp-6.md)

## Intent

Publishing to NPM is a one-way door. Make it the **terminal MVP spec** — the single, deliberate, final act — preceded by a full-work review that can add one more MVP spec if the review surfaces a gap. This keeps every prior release validated before the public release exists.

## Edits applied

### 1. `_releases/mvp-6.md` — re-sequenced; publish terminal (renamed "Test, Review & Publish")

- **Scope is now an ordered 6-step sequence**, publish last: (1) e2e test → (2) field test into three real repos **against the locally-packed tarball** → (3) feedback loop → (4) CI publish pipeline built + dry-run → (5) **pre-publish review** → (6) **publish `v1.1.x` — the final MVP spec**.
- **Field test + feedback moved *before* publish** (the one behavioral change): they run against `npm pack` output, not the public registry, so publish stays last and the public release is a single act.
- **New step 5 — pre-publish review:** a full-work audit across mvp-1…mvp-6 (QA green end-to-end, every spec `Done`, field test/feedback digested). Explicitly the **decision point for one additional MVP spec** before shipping — a clean review is required to open step 6.
- Goal + Exit Gate reworded: publish fires only after steps 1–5, as the MVP→Growth trigger.

### 2. `05-ROADMAP.md` — mvp-6 row + changelog

- mvp-6 row renamed/re-described: "Test, Review & Publish — … pre-publish review gate (slot for one more MVP spec), then publish as the terminal MVP spec".
- r8 changelog entry added.

## Cascade / not-yet-done

- No TDD change needed (the publish pipeline is already TDD §14, r7); the review step is process, not architecture.
- The "one more MVP spec" is a **slot**, intentionally unfilled — it is created only if the pre-publish review (or the user's own work-check) calls for it.
