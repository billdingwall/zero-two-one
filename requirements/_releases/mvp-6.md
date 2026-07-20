# Release: mvp-6 — Test & Publish

- **Type:** MVP release
- **Status:** In Progress
- **Lifecycle Phase:** MVP Build (Phase 1)
- **Branch:** feature branches per spec, then the release tag
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Prove the framework installs correctly end-to-end, then **publish it to npm so it can be tested in real repositories**. The e2e test (spec 013) is the automated confidence that the packed tarball installs cleanly across all three stacks and both modes — with the safe-install engine (mvp-3) delivered and that proof in hand, the original reason to defer publishing (r5 finding 1: never ship a clobbering CLI to test repos) is resolved. So publishing moves **into** this release: it is the enabler for real-repo field testing, not the terminal act gated behind it. The full-work review and the human three-repo field test move to [mvp-7](mvp-7.md) — they now run against the **published** package.

## Scope

*Sequenced — publish is the last step of this release, and opens mvp-7.*

1. [x] **E2e test** — end-to-end across `{claude, antigravity, kiro} × {scaffold, migrate}`: installs the **packed tarball** and asserts install surface, `.zero-two-one.json` manifest, green `021 status/qa/doctor`, and the pre-commit gate proven by a real `git commit`. Delivered as **[spec 013](../../specs/013-e2e-test/spec.md)** (Done). *(Unit tests for `bin/init.js` + `hooks/pre-commit` are mvp-3's exit gate, r7.)*
2. [ ] **CI publish pipeline built** (r7, TDD §14): tag-triggered, `npm run sync:package -- --check` then `npm publish --provenance` from `package/`; **pre-publish gate** fails on a dangling `main`, missing `LICENSE`, `.ai/context` dummies in the tarball, broken links, or any internal feature spec (`specs/00N-*`) / dev file in the tarball (the spec 001–005 P1 regression check, r9). Plus an **install-focused shipped README** (split from the repo/contributor README). *(The r9 "fresh-install smoke test per stack" is **subsumed by spec 013's e2e**, which already installs the packed tarball per stack — step 4 keeps only the tarball-content audit.)* Manual `publish:package` is a documented fallback only.
3. [ ] **Publish `zero-two-one` v1.1.x to npm** — fire the pipeline (name verified unclaimed — npm 404, r7). This makes the framework installable via `npx zero-two-one-init` / `npx 021 …` in any repo, which is what mvp-7's field test consumes.

## Exit Gate

Steps 1–3 complete: e2e green (spec 013 ✅), the publish pipeline built and its pre-publish gate passing, and **`zero-two-one` v1.1.x live on npm**. QA green end-to-end. This does **not** trigger the MVP→Growth transition — that gate is [mvp-7](mvp-7.md) (field test + review). Publishing here simply makes real-repo testing possible.

## Delivered

*Summary written at release close. So far: spec 013 (e2e test harness) — Done.*

## Changelog
- **2026-07-20:** Re-scoped **Test, Review & Publish → Test & Publish**. Publish moved **into** this release (no longer terminal) so the framework can be installed and tested in real repos; the field test, feedback loop, and pre-publish review moved to the new [mvp-7](mvp-7.md), now run against the **published** package. Rationale: mvp-3 safe-install is Delivered and spec 013's e2e proves the packed tarball installs cleanly across all stacks/modes, so the r5/r8 reason to gate publish behind review is resolved. Step 1 (e2e) closed via spec 013. The r9 per-stack fresh-install smoke test is subsumed by spec 013.
- **2026-07-16 (r9):** Pre-publish gate extended (step 4) — tarball-content audit (no internal specs/dev files, the P1 regression check), install-focused shipped README, and per-stack fresh-install smoke test from the packed tarball. Per [_refinement/r9-review.md](../_refinement/r9-review.md).
- **2026-07-16 (r8):** Scope re-sequenced so **publish is the terminal MVP spec** — field test + feedback moved *before* publish (against the locally-packed tarball), and a **pre-publish review** step added as the decision point for one additional MVP spec before shipping. Per [_refinement/r8-update-roadmap.md](../_refinement/r8-update-roadmap.md). *(Superseded 2026-07-20 — publish is no longer terminal.)*
- **2026-07-15 (r7):** Init/hook unit tests moved forward to mvp-3; publish rewritten as a CI-only, tag-triggered `--provenance` pipeline with a pre-publish gate (TDD §14). Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New launch release — publish moved out of the backlog top into this gated final release; three-repo field test and feedback-loop activation consolidated here.
