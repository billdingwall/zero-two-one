# Release: mvp-6 — Test, Publish & Field Launch

- **Type:** MVP release
- **Status:** Planned (launch)
- **Lifecycle Phase:** MVP Build (Phase 2) → Growth transition
- **Branch:** feature branches per spec, then the launch tag
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Prove the framework in the field and ship it. Publishing happens **here and only here** — after Init v2 safe-install (mvp-3) has landed, so test repos never receive the legacy clobbering CLI (r5 audit finding 1).

## Scope

- [ ] End-to-end test via Claude Code — scaffold mode (fresh repo) and migrate mode (working repo). *(Unit tests for `bin/init.js` + `hooks/pre-commit` moved forward to mvp-3's exit gate, r7.)*
- [ ] **CI publish pipeline** (r7, TDD §14): tag-triggered, `npm run sync:package -- --check` then `npm publish --provenance` from `package/`; **pre-publish gate** fails on a dangling `main`, missing `LICENSE`, `.ai/context` dummies in the tarball, or broken links. Manual `publish:package` is a documented fallback only.
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry **via the pipeline** (name verified unclaimed — npm 404, r7).
- [ ] Field test: init the framework into three real repos —
  - Claude Code + GitHub Spec Kit, at **Growth**;
  - Google Antigravity + GitHub Spec Kit;
  - Kiro CLI + IDE — each at a different lifecycle phase.
- [ ] Feedback loop live: `021-feedback` issues flowing from the test repos into this repo, seeding the Growth backlog.

## Exit Gate

MVP launched, QA green, three-repo field test running, feedback arriving. Passing this gate triggers the [MVP → Growth transition](../../workflow/specific-workflows/mvp-to-growth-transition.md): MVP releases freeze as history, Growth releases activate, and the **v2 feature set is defined** (team direction, r5).

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-15 (r7):** Init/hook unit tests moved forward to mvp-3; publish rewritten as a CI-only, tag-triggered `--provenance` pipeline with a pre-publish gate (TDD §14). Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New launch release — publish moved out of the backlog top into this gated final release; three-repo field test and feedback-loop activation consolidated here.
