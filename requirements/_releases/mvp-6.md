# Release: mvp-6 — Test, Review & Publish

- **Type:** MVP release
- **Status:** Planned (launch)
- **Lifecycle Phase:** MVP Build (Phase 1) → Growth transition
- **Branch:** feature branches per spec, then the launch tag
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Prove the framework in the field, review the whole MVP, and only then ship it. **Publishing is the terminal MVP spec** — the very last thing that happens, gated behind a full-work review — so nothing ships until every prior release is validated and QA is green end-to-end (r8). Everything before publish runs against the **locally-packed tarball** (`npm pack`), never the public registry, so the public release is a single deliberate act (r5 audit finding 1: test repos never receive the legacy clobbering CLI).

## Scope

*Sequenced — publish is the final spec; nothing lands after it.*

1. [ ] **E2e test** — end-to-end via Claude Code: scaffold mode (fresh repo) and migrate mode (working repo). *(Unit tests for `bin/init.js` + `hooks/pre-commit` are mvp-3's exit gate, r7.)*
2. [ ] **Field test (pre-publish)** — install the **locally-packed tarball** into three real repos, each at a different phase/stack:
   - Claude Code + GitHub Spec Kit, at **Growth**;
   - Google Antigravity + GitHub Spec Kit;
   - Kiro CLI + IDE.
3. [ ] **Feedback loop live** — `021-feedback` issues flowing from the test repos into this repo, seeding the Growth backlog.
4. [ ] **CI publish pipeline built** (r7, TDD §14): tag-triggered, `npm run sync:package -- --check` then `npm publish --provenance` from `package/`; **pre-publish gate** fails on a dangling `main`, missing `LICENSE`, `.ai/context` dummies in the tarball, or broken links. **Plus (r9): a tarball-content audit** — no internal feature specs (`specs/00N-*`) or dev files in the tarball (the spec 001–005 P1 regression check); **an install-focused shipped README** (not the repo/contributor README — split decision at the publish spec); and **a fresh-install smoke test per stack** (claude/antigravity/kiro) from the packed tarball. Manual `publish:package` is a documented fallback only. *(Built and dry-run here; fired in step 6.)*
5. [ ] **Pre-publish review** — a full-work audit across **all** MVP releases (mvp-1…mvp-6): QA green end-to-end, every spec `Done`, field test + feedback digested. **This is the decision point for whether one more MVP spec is needed before shipping** — if the review surfaces a gap, an additional MVP spec lands *here*, before publish (r8). Only a clean review opens step 6.
6. [ ] **Publish `zero-two-one` v1.1.x — the final MVP spec.** Fire the pipeline (name verified unclaimed — npm 404, r7). Nothing ships after this; passing it is the MVP→Growth trigger.

## Exit Gate

Steps 1–5 complete (field test run, feedback arriving, **pre-publish review clean**), then **publish fires as the terminal spec** and QA is green. Passing this gate triggers the [MVP → Growth transition](../../workflow/specific-workflows/mvp-to-growth-transition.md): MVP releases freeze as history, Growth releases activate, and the **v2 feature set is defined** (team direction, r5).

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-16 (r9):** Pre-publish gate extended (step 4) — tarball-content audit (no internal specs/dev files, the P1 regression check), install-focused shipped README, and per-stack fresh-install smoke test from the packed tarball. Per [_refinement/r9-review.md](../_refinement/r9-review.md).
- **2026-07-16 (r8):** Scope re-sequenced so **publish is the terminal MVP spec** — field test + feedback moved *before* publish (against the locally-packed tarball), and a **pre-publish review** step added as the decision point for one additional MVP spec before shipping. Per [_refinement/r8-update-roadmap.md](../_refinement/r8-update-roadmap.md).
- **2026-07-15 (r7):** Init/hook unit tests moved forward to mvp-3; publish rewritten as a CI-only, tag-triggered `--provenance` pipeline with a pre-publish gate (TDD §14). Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New launch release — publish moved out of the backlog top into this gated final release; three-repo field test and feedback-loop activation consolidated here.
