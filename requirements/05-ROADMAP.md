# Project Roadmap: Zero Two One

*The roadmap stays **fully MVP-focused** until the Growth transition. Each delivery unit is a **release** with a dedicated file in [`_releases/`](_releases/_INDEX.md) — the roadmap keeps the summary and link; detail lives in the release file. MVP releases are sequenced in **engineering-dependency order** (r5): each builds on the one before it.*

## Releases (Growth)

*Empty until the product enters the Growth phase (see the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md)). At that point the MVP releases below freeze as history and Growth releases activate — each tied to a **release branch**, promoting items from [04-BACKLOG.md](04-BACKLOG.md) into their own SSD specs, prioritized by **user value**. The v2 feature set (deferred out of MVP) will be **defined here in the Growth phase**, after MVP ships.*

<!-- ### Release v1.x — <theme> · branch `release/v1.x` · [_releases/v1.x-<theme>.md](_releases/v1.x-<theme>.md)
**Goal:**
**Promoted backlog items:**
- -->

## MVP Releases

*Summary view over the canonical [`_releases/`](_releases/_INDEX.md) files — detail (goal, scope, exit gate, delivered) lives there. Frozen as a historical record once the Growth phase begins. Lifecycle phases (3-phase model, r6): mvp-1/mvp-2 = **Planning**; mvp-3…mvp-6 = **MVP Build**. All previously-deferred v2 work has been pulled into these releases (r5). **All three stacks (Claude Code, Antigravity, Kiro) are MVP scope** — the non-`claude` stacks land at mvp-4 (r7).*

| Release | Description | Status | Priority | Dependency | Phase |
|---|---|---|---|---|---|
| [mvp-1](_releases/mvp-1.md) | Planning — phased lifecycle concept + `requirements/`/`workflow/` structures | ✅ Completed | — | — | Planning |
| [mvp-2](_releases/mvp-2.md) | Foundation & Design Docs — scaffolder, refinement gate, `package/` boundary, r1–r6 living docs, manifest dogfood, CLI/DX design docs | ✅ Delivered | — | mvp-1 | Planning |
| [mvp-3](_releases/mvp-3.md) | Safe Install & Manifest — Init v2 merge engine, `--dry-run`/`--force`, manifest write + `--upgrade`, migrate-mode, Spec Kit reuse, manifest-as-QA-contract, read-only Workflow-Manager reporter, conflict-aware pre-commit chaining | ✅ Delivered | High | mvp-2 | MVP Build |
| [mvp-4](_releases/mvp-4.md) | AI-Led Init & Stack/Design Adapters — init walkthrough, `antigravity`/`kiro` stacks (**all three stacks land here**), `material-3`, 3×{none,material-3} matrix; **API-surface decision** (r7) | ◻ Planned | High | mvp-3 | MVP Build |
| [mvp-5](_releases/mvp-5.md) | Lifecycle Commands — `021-feedback`, `021-design`, `021-prototype`, stage-specific review-template selection | ◻ Planned | Medium | mvp-4 | MVP Build |
| [mvp-6](_releases/mvp-6.md) | Test, Review & Publish — e2e, field test in three real repos (local tarball) + live feedback, **pre-publish review gate** (slot for one more MVP spec), then **publish as the terminal MVP spec** (CI provenance pipeline, r8) | ◻ Planned | Medium | mvp-5 | MVP Build |

*Priority/dependency are the roadmap's summary fields (r6); they never restate the release files' scope. `bin/init.js` in mvp-3 implements the r6 `04-BACKLOG`/`05-ROADMAP` numbering and the `{planning,mvp,growth}` phase schema, so the engine is built against the new structure.*

## Transition Note

When the mvp-6 exit gate passes (MVP launched, QA green, field test running), the roadmap changes shape: the MVP Releases above freeze as history and the Releases (Growth) section takes over, pulling from the backlog. The **v2 feature set is defined at that point** (team direction, r5). Mechanics: [mvp-to-growth-transition.md](../workflow/specific-workflows/mvp-to-growth-transition.md).

## Changelog
- **2026-07-16 (mvp-3 close):** mvp-3 delivered — all five specs (001–005) Done: safe install engine, migrate-mode, manifest-as-QA-contract, Workflow-Manager `021-doctor`, conflict-aware pre-commit chaining. Row advanced to Delivered.
- **2026-07-16 (r8):** mvp-6 re-sequenced so **publishing is the terminal MVP spec** — field test + feedback moved ahead of publish (validated against the locally-packed tarball), and a **pre-publish review gate** added as the explicit decision point for one additional MVP spec before shipping. Renamed mvp-6 "Test, Publish & Field Launch" → "Test, Review & Publish". Per [_refinement/r8-update-roadmap.md](_refinement/r8-update-roadmap.md).
- **2026-07-15 (r7):** Release re-scoping from the repo/package audit — init+hook tests pulled forward to mvp-3's exit gate; mvp-3 gains manifest-as-QA-contract + read-only Workflow-Manager reporter; mvp-4 gains the programmatic-API decision and the "all three stacks land here" note; mvp-6 publish → CI pipeline (provenance + pre-publish gate). Per [_refinement/r7-review.md](_refinement/r7-review.md).
- **2026-07-15 (r6):** Renamed `04-ROADMAP.md` → **`05-ROADMAP.md`** (backlog↔roadmap numbering swap); MVP Releases converted to a summary **table** (description·status·priority·dependency·phase) as the view over `_releases/`; phase labels updated to the 3-phase model (mvp-1/2 = Planning, mvp-3–6 = MVP Build); Workflow-Manager build folded into mvp-3. Per [_refinement/r6-review.md](_refinement/r6-review.md).
- **2026-07-12 (mvp-2 close):** mvp-2 closed (Delivered) — the two remaining Pre-build items done: root `.claude/commands/` slash-command dogfooding and the stakeholder [CLI-experience walkthrough demo](_design/cli-walkthrough-demo.md); Pre-build exit gate closed. mvp-3 activated (In progress); framework manifest advanced to MVP Build (later reset to Planning under the 3-phase model, r6).
- **2026-07-12 (r5):** MVP roadmap re-sequenced into six engineering-ordered releases (mvp-1…mvp-6): Foundation & Design Docs → Safe Install & Manifest → AI-Led Init & Adapters → Lifecycle Commands → Test/Publish/Launch. Publish moved into the launch release (mvp-6) behind safe-install; manifest dogfood + CLI docs added to mvp-2; `021-prototype` added to mvp-5; Growth section emptied (v2 defined in Growth). Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** MVP phases renamed **MVP releases** (`mvp-1`…`mvp-3`) with dedicated files in `requirements/_releases/`; Growth releases tied to release branches with backlog promotion → SSD specs; former v2 stack/design scope absorbed into mvp-3; launch sequence added. Per [_refinement/r4-update-roadmap.md](_refinement/r4-update-roadmap.md).
- **2026-07-10 (r3):** Added adapter-shaped Init v2 milestone and the (completed) naming-convention rename; replaced the r3 pre-scope note with the designed-state summary. Per [_refinement/r3-update-roadmap.md](_refinement/r3-update-roadmap.md).
- **2026-07-10 (r2):** Added Init v2 migration milestone group + acceptance test; extended the e2e test to cover both init modes; added r3 sequencing note. Per [_refinement/r2-update-roadmap.md](_refinement/r2-update-roadmap.md).
- **2026-07-10 (r1):** Restructured into Releases (Growth) + MVP Roadmap sections; moved former Phase 4 feature bullets to the backlog; added transition note. Per [_refinement/r1-update-roadmap.md](_refinement/r1-update-roadmap.md).
