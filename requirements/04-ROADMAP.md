# Project Roadmap: Zero Two One

*The roadmap stays **fully MVP-focused** until the Growth transition. Each delivery unit is a **release** with a dedicated file in [`_releases/`](_releases/_INDEX.md) — the roadmap keeps the summary and link; detail lives in the release file. MVP releases are sequenced in **engineering-dependency order** (r5): each builds on the one before it.*

## Releases (Growth)

*Empty until the product enters the Growth phase (see the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md)). At that point the MVP releases below freeze as history and Growth releases activate — each tied to a **release branch**, promoting items from [05-BACKLOG.md](05-BACKLOG.md) into their own SSD specs, prioritized by **user value**. The v2 feature set (deferred out of MVP) will be **defined here in the Growth phase**, after MVP ships.*

<!-- ### Release v1.x — <theme> · branch `release/v1.x` · [_releases/v1.x-<theme>.md](_releases/v1.x-<theme>.md)
**Goal:**
**Promoted backlog items:**
- -->

## MVP Releases

*Frozen as a historical record once the Growth phase begins. Lifecycle phases: mvp-1 = Planning (Phase 1), mvp-2 = Pre-build (Phase 2), mvp-3…mvp-6 = MVP Build (Phase 3). All previously-deferred v2 work has been pulled into these releases (r5).*

### mvp-1 — Planning (Completed) · [_releases/mvp-1.md](_releases/mvp-1.md)
- [x] Define the 4-phase lifecycle concept.
- [x] Establish the `requirements/` and `workflow/` directory structures.

### mvp-2 — Pre-build: Foundation & Design Docs (Delivered) · [_releases/mvp-2.md](_releases/mvp-2.md)
- [x] Implement the `npx zero-two-one-init` CLI scaffolder (legacy scaffold behavior; hardened in mvp-3).
- [x] Build the `pre-commit` refinement gate bash script.
- [x] **Decouple the architecture**: `package/` boundary for clean NPM publishing and dogfooding.
- [x] `_INDEX.md` / `-Template.md` conventions; `021-` naming convention (r3).
- [x] Living docs aligned via refinement rounds r1–r5 (cohesive PRD/EDD/TDD set, releases model, feedback/design/prototype commands designed).
- [x] **Dogfood `.zero-two-one.json`** at repo root; `021-status` reads the manifest (`phase` source of truth), prototype dropped from inference (r5).
- [x] CLI/DX documentation: `requirements/_design/command-design.md` + `workflow-design.md` (r5).
- [x] Finalize Claude Code integrations wiring (`/021-init`, `/021-status`) — root `.claude/commands/` dogfooded (mvp-2 close).
- [x] Stakeholder sign-off demo: a lightweight command-walkthrough / transcript of the `021` CLI experience, backing the Pre-build exit gate (EDD §3; r5 Q2) → [_design/cli-walkthrough-demo.md](_design/cli-walkthrough-demo.md).

### mvp-3 — Safe Install & Manifest (Next) · [_releases/mvp-3.md](_releases/mvp-3.md)

*The foundation everything else builds on. Init v2 (r2; TDD §§6–8), built adapter-shaped (TDD §9).*
- [ ] Ownership-based merge engine; `--dry-run`/`--force`; idempotent re-run.
- [ ] Conflict-aware `pre-commit` install (plain-hook chaining; husky/lefthook).
- [ ] `.zero-two-one.json` manifest write (full file-hash inventory) + `--upgrade` (scoped to templates/skills/scripts/hooks, TDD §7).
- [ ] Migrate-mode detection + phase interview; existing-doc import; duplicate resolution (archive/update/leave-alongside).
- [ ] Spec Kit reuse; migration acceptance test (zero user-file overwrites).
- [ ] Regenerate the framework's own `.zero-two-one.json` (`mode: source`, full hash inventory) — end-to-end manifest dogfooding (r5 Q3).

### mvp-4 — AI-Led Init & Stack/Design Adapters · [_releases/mvp-4.md](_releases/mvp-4.md)

*Depends on mvp-3. Absorbs the r3 "Stacks & Design Adapters" group (TDD §9).*
- [ ] AI-led init walkthrough (TDD §1) driving the engine; ask-don't-assume interview.
- [ ] Source-layer generalization (`ASSISTANT-Template.md`; `AGENTS.md` neutral default).
- [ ] `antigravity` stack (+ Spec Kit pairing validation); `kiro` stack (+ `kiro-specs` engine dispatch).
- [ ] Design-system adapter + `material-3` binding.
- [ ] Init integration (`--stack`/`--design`, detection, manifest keys); **3 stacks × {none, material-3} acceptance matrix**.

### mvp-5 — Lifecycle Commands · [_releases/mvp-5.md](_releases/mvp-5.md)

*Depends on mvp-4 (per-stack rendering). The r4 command set + optional prototype.*
- [ ] `021-feedback` (TDD §10) — `gh` / pre-filled issue URL to `billdingwall/zero-two-one`; `.github/ISSUE_TEMPLATE/021-feedback.yml`.
- [ ] `021-design` (TDD §11) — design-system install / BYO over the §9.4 adapter.
- [ ] `021-prototype` (TDD §12) — optional prototype generation from key docs + workflow wire-in.
- [ ] Stage-specific review-template selection wired into the refinement loop (templates shipped r4).

### mvp-6 — Test, Publish & Field Launch · [_releases/mvp-6.md](_releases/mvp-6.md)

*The launch release. Publish happens here — never before safe-install (mvp-3) lands (r5 audit finding 1).*
- [ ] Automated tests for `bin/init.js` and `hooks/pre-commit`; e2e via Claude Code (scaffold + migrate).
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry.
- [ ] Field test: init into three real repos — Claude Code + Spec Kit (Growth) · Antigravity + Spec Kit · Kiro (different phases).
- [ ] Feedback loop live: `021-feedback` issues flowing back into this repo, seeding the Growth backlog.

## Transition Note

When the mvp-6 exit gate passes (MVP launched, QA green, field test running), the roadmap changes shape: the MVP Releases above freeze as history and the Releases (Growth) section takes over, pulling from the backlog. The **v2 feature set is defined at that point** (team direction, r5). Mechanics: [mvp-to-growth-transition.md](../workflow/specific-workflows/mvp-to-growth-transition.md).

## Changelog
- **2026-07-12 (mvp-2 close):** mvp-2 closed (Delivered) — the two remaining Pre-build items done: root `.claude/commands/` slash-command dogfooding and the stakeholder [CLI-experience walkthrough demo](_design/cli-walkthrough-demo.md); Pre-build exit gate closed. mvp-3 activated (In progress); framework manifest advanced to Phase 3 (MVP Build).
- **2026-07-12 (r5):** MVP roadmap re-sequenced into six engineering-ordered releases (mvp-1…mvp-6): Foundation & Design Docs → Safe Install & Manifest → AI-Led Init & Adapters → Lifecycle Commands → Test/Publish/Launch. Publish moved into the launch release (mvp-6) behind safe-install; manifest dogfood + CLI docs added to mvp-2; `021-prototype` added to mvp-5; Growth section emptied (v2 defined in Growth). Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** MVP phases renamed **MVP releases** (`mvp-1`…`mvp-3`) with dedicated files in `requirements/_releases/`; Growth releases tied to release branches with backlog promotion → SSD specs; former v2 stack/design scope absorbed into mvp-3; launch sequence added. Per [_refinement/r4-update-roadmap.md](_refinement/r4-update-roadmap.md).
- **2026-07-10 (r3):** Added adapter-shaped Init v2 milestone and the (completed) naming-convention rename; replaced the r3 pre-scope note with the designed-state summary. Per [_refinement/r3-update-roadmap.md](_refinement/r3-update-roadmap.md).
- **2026-07-10 (r2):** Added Init v2 migration milestone group + acceptance test; extended the e2e test to cover both init modes; added r3 sequencing note. Per [_refinement/r2-update-roadmap.md](_refinement/r2-update-roadmap.md).
- **2026-07-10 (r1):** Restructured into Releases (Growth) + MVP Roadmap sections; moved former Phase 4 feature bullets to the backlog; added transition note. Per [_refinement/r1-update-roadmap.md](_refinement/r1-update-roadmap.md).
