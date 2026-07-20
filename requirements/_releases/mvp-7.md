# Release: mvp-7 — Field Test & Review

- **Type:** MVP release (terminal — the MVP→Growth gate)
- **Status:** Planned
- **Lifecycle Phase:** MVP Build (Phase 1) → Growth transition
- **Branch:** feature branches per spec, then the release tag
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Validate the **published** framework in the field and review the whole MVP before Growth. With [mvp-6](mvp-6.md) having published `zero-two-one` to npm, this release exercises it the way real users will — installed via `npx zero-two-one-init` into real repositories — gathers live feedback, and runs a full-work review across every MVP release. Passing this release's exit gate is the **MVP→Growth trigger**: MVP releases freeze as history, Growth releases activate, and the v2 feature set is defined.

## Scope

1. [ ] **Field test (post-publish)** — install the **published** package into three real repos, each at a different phase/stack:
   - Claude Code + GitHub Spec Kit, at **Growth**;
   - Google Antigravity + GitHub Spec Kit;
   - Kiro CLI + IDE.
   Because these consume the published `npx zero-two-one-init`, this is the real-user path — distinct from spec 013's automated tarball e2e, which is the pre-publish confidence.
2. [ ] **Feedback loop live** — `021-feedback` issues flowing from the test repos into this repo (`billdingwall/zero-two-one`), seeding the Growth backlog.
3. [ ] **Pre-Growth review** — a full-work audit across **all** MVP releases (mvp-1…mvp-7): QA green end-to-end, every spec `Done`, field test + feedback digested. **This is the decision point for whether one more MVP spec is needed** before declaring the MVP complete — if the review surfaces a gap, an additional MVP spec lands *here*. Only a clean review closes the release.

## Exit Gate

Steps 1–3 complete: field test run against the published package, feedback arriving, **review clean**, and QA green end-to-end. Passing this gate triggers the [MVP → Growth transition](../../workflow/specific-workflows/mvp-to-growth-transition.md): the MVP releases freeze as history, Growth releases activate, and the **v2 feature set is defined** (team direction, r5).

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-20:** Created by splitting [mvp-6](mvp-6.md) (Test, Review & Publish). Publishing stayed in mvp-6 so the framework could be installed and tested in real repos; the field test (now against the **published** package), feedback loop, and full-work review moved here. This release is the new terminal MVP release and the MVP→Growth gate (previously mvp-6's role under r8).
