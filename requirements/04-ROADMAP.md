# Project Roadmap: Zero Two One

*The roadmap stays **fully MVP-focused** until the Growth transition. Each delivery unit is a **release** with a dedicated file in [`_releases/`](_releases/_INDEX.md) — the roadmap keeps the summary and link; detail lives in the release file.*

## Releases (Growth)

*This section activates when the product enters the Growth phase (see the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md)). Each Growth release ties to a specific **release branch**; items from [05-BACKLOG.md](05-BACKLOG.md) are **promoted** into the release and implemented as their own SSD specs through the refinement gate. Releases are prioritized by **user value** as defined from user feedback (including `021-feedback` issues). Until the transition, this section stays empty and the MVP Releases below drive all work.*

<!-- ### Release v1.x — <theme> · branch `release/v1.x` · [_releases/v1.x-<theme>.md](_releases/v1.x-<theme>.md)
**Goal:**
**Promoted backlog items:**
- -->

## MVP Releases

*Frozen as a historical record once the Growth phase begins — completed items get checked, no new scope is added here.*

### mvp-1 — Planning (Completed) · [_releases/mvp-1.md](_releases/mvp-1.md)
- [x] Define the 4-phase lifecycle concept.
- [x] Establish the `requirements/` and `workflow/` directory structures.

### mvp-2 — Pre-build (Current) · [_releases/mvp-2.md](_releases/mvp-2.md)
- [x] Implement the `npx zero-two-one-init` CLI scaffolder.
- [x] Build the `pre-commit` refinement gate bash script.
- [x] **Decouple the architecture**: Establish the `package/` boundary for clean NPM publishing and dogfooding.
- [x] Rename directory indexes to `_INDEX.md` and align package templates to the `-Template.md` convention.
- [x] Zero-two-one naming convention adopted (`CODE.md` rule) + `021-` command rename (npm scripts, `/021-init`, `/021-status`) — applied with the r3 round.
- [x] Living docs launch-ready: r4 vision-alignment round applied (cohesive PRD/EDD/TDD set, AI-led init, releases model, feedback loop).
- [ ] Finalize Claude Code integrations (`/021-init`, `/021-status`).

### mvp-3 — MVP Build & Launch (Next) · [_releases/mvp-3.md](_releases/mvp-3.md)

*Absorbs the former v2 "Stacks & Design Adapters" scope (r4: needed at launch for multi-repo testing). Task breakdown in [05-BACKLOG.md](05-BACKLOG.md); each group is SSD spec material.*

1. **Init v2 — safe install & migration** (r2; TDD §§6–8): ownership-based merge rules, `--dry-run`/`--force`, idempotent re-run, command delivery, conflict-aware hook install, `.zero-two-one.json` manifest, migrate-mode detection + phase interview, Spec Kit reuse, migration acceptance test — built **adapter-shaped** (TDD §9).
2. **AI-led init walkthrough** (r4; TDD §1): stack-rendered init skill driving the CLI engine; ask-don't-assume interview; archive/update-to-fit/leave-alongside conflict decisions.
3. **Stacks & Design Adapters** (r3 group, promoted from v2; TDD §9): source-layer generalization, `antigravity` + `kiro` stacks, `kiro-specs` engine dispatch, design-system adapter + `material-3`, init integration, 3×2 acceptance matrix.
4. **r4 features**: `021-feedback` (TDD §10), `021-design` (TDD §11), stage-specific review templates, `requirements/_releases/` scaffolding, README install prompts, upgrade-scope enforcement, EDD-cohesion + template-neutrality audits.
5. **Quality**: automated tests for `bin/init.js` and `hooks/pre-commit`; end-to-end test via Claude Code in scaffold and migrate modes.
6. **Launch sequence**: publish `zero-two-one` v1.1.x to NPM → init the framework into three real repos (Claude Code + Spec Kit at Growth · Antigravity + Spec Kit · Kiro, at different phases) → feedback flows back via `021-feedback` into this repo's issues.

## Transition Note

When the mvp-3 exit gate passes (MVP launched, QA green), the roadmap changes shape: the MVP Releases above freeze as history and the Releases (Growth) section takes over, pulling from the backlog. Mechanics are defined in [mvp-to-growth-transition.md](../workflow/specific-workflows/mvp-to-growth-transition.md). Growth-phase feature ideas live in [05-BACKLOG.md](05-BACKLOG.md) — not here — until promoted into a release.

## Changelog
- **2026-07-12 (r4):** MVP phases renamed **MVP releases** (`mvp-1`…`mvp-3`) with dedicated files in `requirements/_releases/`; Growth releases tied to release branches with backlog promotion → SSD specs; former v2 stack/design scope absorbed into mvp-3; launch sequence added (publish → three-repo testing → feedback loop). Per [_refinement/r4-update-roadmap.md](_refinement/r4-update-roadmap.md).
- **2026-07-10 (r3):** Added adapter-shaped Init v2 milestone and the (completed) naming-convention rename to Phase 3; replaced the r3 pre-scope note with the designed-state summary. Per [_refinement/r3-update-roadmap.md](_refinement/r3-update-roadmap.md).
- **2026-07-10 (r2):** Added Init v2 migration milestone group + acceptance test to Phase 3; extended the e2e test to cover both init modes; added r3 sequencing note. Per [_refinement/r2-update-roadmap.md](_refinement/r2-update-roadmap.md).
- **2026-07-10 (r1):** Restructured into Releases (Growth) + MVP Roadmap sections; moved former Phase 4 feature bullets to the backlog; added transition note. Per [_refinement/r1-update-roadmap.md](_refinement/r1-update-roadmap.md).
