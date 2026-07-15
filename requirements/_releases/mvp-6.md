# Release: mvp-6 — Test, Publish & Field Launch

- **Type:** MVP release
- **Status:** Planned (launch)
- **Lifecycle Phase:** MVP Build (Phase 2) → Growth transition
- **Branch:** feature branches per spec, then the launch tag
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Prove the framework in the field and ship it. Publishing happens **here and only here** — after Init v2 safe-install (mvp-3) has landed, so test repos never receive the legacy clobbering CLI (r5 audit finding 1).

## Scope

- [ ] Automated tests for `bin/init.js` and `hooks/pre-commit`.
- [ ] End-to-end test via Claude Code — scaffold mode (fresh repo) and migrate mode (working repo).
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry (`npm run publish:package`).
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
- **2026-07-12 (r5):** New launch release — publish moved out of the backlog top into this gated final release; three-repo field test and feedback-loop activation consolidated here.
