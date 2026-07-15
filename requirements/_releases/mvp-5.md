# Release: mvp-5 — Lifecycle Commands

- **Type:** MVP release
- **Status:** Planned
- **Lifecycle Phase:** MVP Build (Phase 2)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Ship the assistant-driven lifecycle commands that ride on the per-stack rendering from mvp-4: feedback, design-system install, and the optional prototype — plus wiring the stage-specific review templates into the loop.

## Scope

- [ ] `021-feedback` (TDD §10): file an issue to `billdingwall/zero-two-one` via `gh` or a pre-filled issue URL; attach manifest context (version, stack, phase); `.github/ISSUE_TEMPLATE/021-feedback.yml`.
- [ ] `021-design` (TDD §11): design-system install / BYO over the §9.4 adapter and the design-system-selection workflow.
- [ ] `021-prototype` (TDD §12): generate the optional prototype from key docs + `DESIGN.md`; wire prototype steps into Design / Refinement step 5 / QA on first run.
- [ ] Stage-specific review-template selection wired into the refinement loop by manifest `phase` (templates shipped r4).

## Exit Gate

Each command works end-to-end on the `claude` stack (and renders on the other two); `021-feedback` files a real issue; `021-prototype` produces a themed prototype and activates its workflow steps.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-12 (r5):** New release — groups the r4 command set (`021-feedback`, `021-design`) with the new optional `021-prototype` and review-template wiring, after the stack adapters (mvp-4).
