# Project Roadmap: Zero Two One

## Releases (Growth)

*This section activates when the product enters the Growth phase (see the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md)). Releases are defined at the team's discretion by pulling items from [05-BACKLOG.md](05-BACKLOG.md), prioritized by **user value** as defined from user feedback. Until then, this section stays empty and the MVP Roadmap below drives all work.*

<!-- ### Release v1.x — <theme>
**Goal:**
**Pulled backlog items:**
- -->

## MVP Roadmap (Phases 1–3)

*Frozen as a historical record once the Growth phase begins — completed items get checked, no new scope is added here.*

### Phase 1: Planning (Completed)
- [x] Define the 4-phase lifecycle concept.
- [x] Establish the `requirements/` and `workflow/` directory structures.

### Phase 2: Pre-build (Current)
- [x] Implement the `npx zero-two-one-init` CLI scaffolder.
- [x] Build the `pre-commit` refinement gate bash script.
- [x] **Decouple the architecture**: Establish the `package/` boundary for clean NPM publishing and dogfooding.
- [x] Rename directory indexes to `_INDEX.md` and align package templates to the `-Template.md` convention.
- [ ] Finalize Claude Code integrations (`/init`, `/status`).

### Phase 3: MVP Build (Next)
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry.
- [ ] Test the framework end-to-end using Claude Code — both scaffold mode (brand new, empty repository) and migrate mode (existing working repository).
- [ ] Implement automated testing for the `init.js` script and `pre-commit` hook.
- [ ] **Init v2 — safe install & migration** (r2): ownership-based merge rules, `--dry-run`/`--force`, idempotent re-run, `.claude/commands/` delivery, conflict-aware hook install, `.zero-two-one.json` manifest, migrate-mode detection + phase interview, Spec Kit reuse. (TDD §§6–8; task breakdown in [05-BACKLOG.md](05-BACKLOG.md).)
- [ ] Migration acceptance test: init into a non-empty working repo (existing README, docs, husky hook, populated `specs/`) with zero user files overwritten.

## Transition Note

When the Phase 3 exit gate passes (MVP launched, QA green), the roadmap changes shape: the MVP Roadmap above freezes as history and the Releases section takes over, pulling from the backlog. Mechanics are defined in [mvp-to-growth-transition.md](../workflow/specific-workflows/mvp-to-growth-transition.md). Growth-phase feature ideas live in [05-BACKLOG.md](05-BACKLOG.md) — not here — until pulled into a release.

**Upcoming rounds:** r3 theme — tool-agnostic init/migration: extend the adapter layer to alternative assistants and SSD engines (Kiro, Google Antigravity first), building on the `.zero-two-one.json` `tools` block (TDD §7) and the framework architecture proposal. Items stay in the backlog until r3 opens.

## Changelog
- **2026-07-10 (r2):** Added Init v2 migration milestone group + acceptance test to Phase 3; extended the e2e test to cover both init modes; added r3 sequencing note. Per [_refinement/r2-update-roadmap.md](_refinement/r2-update-roadmap.md).
- **2026-07-10 (r1):** Restructured into Releases (Growth) + MVP Roadmap sections; moved former Phase 4 feature bullets to the backlog; added transition note. Per [_refinement/r1-update-roadmap.md](_refinement/r1-update-roadmap.md).
