# Release: mvp-3 — MVP Build & Launch

- **Type:** MVP release
- **Status:** Planned (next)
- **Branch:** feature branches per spec (`NNN-feature-name`) through the refinement gate
- **Roadmap:** [04-ROADMAP.md](../04-ROADMAP.md) · task breakdown in [05-BACKLOG.md](../05-BACKLOG.md)

## Goal

Ship the launch-ready package and prove it in the field: full 021 tool set implemented, package published, framework installed into three real repos on different stacks and phases, feedback flowing back via `021-feedback`.

## Scope

*Absorbs the former v2 "Stacks & Design Adapters" scope (r4 finding 18). Each group is SSD spec material.*

1. **Init v2 — safe install & migration** (r2; TDD §§6–8), built adapter-shaped (TDD §9).
2. **AI-led init walkthrough** (r4; TDD §1) with the ask-don't-assume interview and archive/update-to-fit/leave-alongside conflict decisions.
3. **Stacks & Design Adapters** (r3; TDD §9): source layer, `antigravity` + `kiro` stacks, design-system adapter + `material-3`, init integration, 3×2 acceptance matrix.
4. **r4 features**: `021-feedback` (TDD §10), `021-design` (TDD §11), stage-specific review templates, `_releases/` scaffolding in init, README install prompts, upgrade-scope enforcement, EDD-cohesion + template-neutrality audits.
5. **Quality**: automated tests (`bin/init.js`, `hooks/pre-commit`); e2e via Claude Code in both init modes; migration acceptance test.
6. **Launch**: publish v1.1.x to NPM; init into three real repos (Claude Code + Spec Kit at Growth · Antigravity + Spec Kit · Kiro, different phases); collect `021-feedback` issues.

## Exit Gate

MVP launched, QA green, three-repo field test running → triggers the [MVP → Growth transition](../../workflow/specific-workflows/mvp-to-growth-transition.md): MVP Releases freeze as history, Growth releases activate.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-12 (r4):** File created as part of the releases restructure; scope set per r4-update-roadmap.md.
