# Tasks: Kiro Adapter & Engine Dispatch

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/install-surface.md](contracts/install-surface.md), [contracts/engine-dispatch.md](contracts/engine-dispatch.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **Two regression bars:** the 006 `claude` golden fixture (install) and today's `github-speckit` behavior (engine — `engines/github-speckit.js` is the current `lib.js` logic extracted verbatim). Two halves: **Part A** install adapter (`.kiro/` surface), **Part B** engine dispatch (`scripts/speckit/*`). Sequence A before B — a kiro install is only usable once the lifecycle reads its `.kiro/specs`.*

**Proposed layout:** `adapters.js` un-reserves `kiro` (no `entrypoint`, `surfaceRenders`); `surface.js` gains `kind:'steering'`/`'agent-json'`; `classes`/`sources`/`classify` null-guard the entrypoint; new content `templates/kiro-steering/021-{product,tech,structure}.md` + `templates/kiro-agent/021.json`; new `scripts/speckit/engines/{github-speckit,kiro-specs}.js`; `lib.js` gains `engineFor`/`manifestFacts.ssd`; the 4 speckit scripts + `hooks/pre-commit` consume the engine; tests in `test/init/surface.test.js` (extend) + `test/speckit/engine.test.js` (new).

## Phase 1 — Setup & guardrails
- [x] T001 **Two regression bars noted before touching anything.** (a) The 006 `claude` golden fixture (install surface); (b) today's `github-speckit` behavior — `engines/github-speckit.js` (T019) must be the current `lib.js` logic extracted with **zero behavior change**, guarded by the live dogfood repo + the existing 003/004/005 suites. No new golden capture.
- [x] T002 [P] Test helpers — kiro install into a temp target (reuse `surface.test.js` patterns); a `kiro-specs` engine fixture builder (temp repo with `.zero-two-one.json` `tools.ssd:"kiro-specs"` + `.kiro/specs/<feature>/{requirements.md,design.md,tasks.md}`).

## Phase 2 — Tests first (author before their Phase 3/4 counterparts)
### Part A — install
- [x] T003 [P] `getAdapter('kiro')` **no longer throws**; entry has no `entrypoint`, `surfaceDirs:[]`, 3 `surfaceRenders` (steering/agent-json/skill); `claude`/`antigravity` unchanged; `kiro` gone from `RESERVED` (contract; FR-001).
- [x] T004 [P] `renderSurface(REPO_ROOT,'kiro')` → `.kiro/steering/021-{product,tech,structure}.md` (flat, keep filename), `.kiro/agents/021.json`, `.kiro/skills/021-<name>/SKILL.md` (8); sorted; `renderSurface(...,'claude')` still `[]` (data-model §2; FR-002/003/004).
- [x] T005 [P] **Kiro install surface (scaffold + migrate)**: `--stack kiro` → steering + agent + skills present; **no** `CLAUDE.md`/`.claude/`, **no** `AGENTS.md`/`.agents/`; manifest `tools.stack=kiro`, `tools.ssd=kiro-specs`. *(analyze A1 — FR-010/Scenario 8)*: also a **migrate** case — a non-empty target with `.kiro/` and no `--stack` detects `kiro` (spec 002 `detect.js:133`) and installs the surface via the shared pipeline (no migrate-specific surface code, like 007 A3) (Scenario 1/2/8; FR-001/005/010).
- [x] T006 [P] **Entrypoint-optional ownership**: `classify('.kiro/steering/021-product.md','kiro')`=framework-owned, `null` under claude/antigravity; `classify('CLAUDE.md','kiro')`=`null`; `userFiles('kiro')` has no `CLAUDE.md`/`AGENTS.md`; `userDocMappings(...,'kiro')` emits **no** render mapping. *(analyze A3)*: `classify('.kiro/specs/my-feature/requirements.md','kiro')`=`null` — the engine's spec state is **not** a framework install path, so install never creates/refreshes/clobbers it (Scenario 5/7; FR-005, data-model §1/§3).
- [x] T007 [P] **3-stack neutral-core invariant**: install claude+antigravity+kiro; trees differ **only** in each stack's Layer-2 (`.claude`/`.agents`/`.kiro`); every Layer-1 path byte-identical (extend the 006 T006 predicate with `.kiro/`) (Scenario 3; FR-006).
- [x] T008 [P] **006/007 regression**: `claude` install byte-identical to the golden fixture, no `.kiro/`; `antigravity` `.agents/` surface intact, no `.kiro/` (FR-006/009).

### Part B — engine dispatch
- [x] T009 [P] `manifestFacts` gains `ssd` — default `github-speckit` on **both** the manifest branch (no `ssd` key) and the no-manifest `inferFacts` branch *(analyze A5)*; `kiro-specs` only when `tools.ssd` says so; `engineFor` treats anything `!== 'kiro-specs'` as github (data-model §6; FR-007).
- [x] T010 [P] **`github-speckit` engine (regression bar)**: `engines/github-speckit.js` — `listSpecs`/`specPath`/`readStatus`/`writeStatus`/`docs`/`contextFiles`/`requiredArtifacts` reproduce today's `specs/NNN-*/spec.md` behavior exactly (contract; FR-009).
- [x] T011 [P] **`kiro-specs` engine**: against the T002 fixture — `listSpecs` enumerates `.kiro/specs/*/`; `readStatus` reads `requirements.md` frontmatter; `writeStatus` updates it there; `docs` = `{primary:'requirements.md',plan:'design.md',tasks:'tasks.md'}`; `countTasks` over `.kiro/specs/<f>/tasks.md` (data-model §4/§5; FR-007).
- [x] T012 [P] **`lib.js` delegation**: `engineFor(root)` resolves from `ssd`; `listSpecs`/`specPath`/`readStatus`/`writeStatus` delegate; `resolveSpec`/`countTasks`/`extractCriteria` unchanged; default `github-speckit` byte-unchanged (contract; FR-007/009).
- [x] T013 [P] **Consumers under `kiro-specs`**: `verify`/`fetch-context`/`doctor`/`spec-status` resolve `.kiro/specs/<feature>/{requirements,design,tasks}.md` via `engine.docs.*`; under `github-speckit` outputs are identical to today (contract; FR-007). *(analyze A2)*: verify's **C2 optional-artifact set** comes from `engine.optionalArtifacts` (`github`: `['data-model.md','contracts']`; `kiro`: `[]`) so kiro doesn't spuriously WARN; and `resolveSpec`'s branch/numeric-id heuristic is **github-`NNN-`-shaped** — under `kiro-specs`, resolution is by explicit feature name (test that a kiro feature resolves by name, not by `\d{3}` id/branch).
- [x] T014 [P] **Gate honors the engine**: on the `kiro-specs` fixture, an implementation change with a non-gate-passing feature **blocks**; gate-passing **permits**; a `.kiro/specs/**`-only change is treated as docs; `github-speckit` gate unchanged (Scenario 6; FR-008).

## Phase 3 — Implementation, Part A (install)
- [x] T015 `scripts/init/adapters.js`: remove `kiro` from `RESERVED`; add the kiro entry (no `entrypoint`, `surfaceRenders` steering/agent-json/skill) (data-model §1; FR-001).
- [x] T016 `scripts/init/surface.js`: add `kind:'steering'` + `kind:'agent-json'` (flat relocate, `dest = toDir/basename`, content passthrough); `kind:'skill'` reused (data-model §2; FR-002/003/004).
- [x] T017 `scripts/init/{classes,sources,classify}.js`: make `entrypoint` optional — null-guard `userFiles`, skip the render mapping in `userDocMappings`, guard the `classify.js` entrypoint/honored resolution; confirm claude/antigravity branches unchanged (data-model §1; FR-005).
- [x] T018 New content: `templates/kiro-steering/021-{product,tech,structure}.md` (stable operating guidance + inclusion-mode frontmatter) and `templates/kiro-agent/021.json` (`prompt`/`resources`/`hooks` + `skill://` → `.kiro/skills/021-*`) (FR-002/003; gated by T004/T005).

## Phase 4 — Implementation, Part B (engine dispatch)
- [x] T019 `scripts/speckit/engines/github-speckit.js`: **extract** today's `lib.js` spec-state logic verbatim behind the `SpecEngine` interface — the regression bar (contract; FR-009).
- [x] T020 `scripts/speckit/engines/kiro-specs.js`: `.kiro/specs/<feature>/` reader/writer — `status:` in `requirements.md`, `docs` map, `listSpecs` over `.kiro/specs/*/` (data-model §4/§5; FR-007).
- [x] T021 `scripts/speckit/lib.js`: `engineFor(root)` + `manifestFacts.ssd`; convert `listSpecs`/`specPath`/`readStatus`/`writeStatus` to delegators; keep `countTasks`/`extractCriteria`/`resolveSpec`; additive exports only (contract; FR-007).
- [x] T022 Consumers: `spec-status.js`/`verify-spec-compliance.js`/`fetch-speckit-context.js`/`doctor.js` read `engine.docs.*`/`contextFiles`/`requiredArtifacts`/`optionalArtifacts` instead of literal `spec.md`/`plan.md`/`tasks.md`/`data-model.md`/`contracts` (analyze A2). `resolveSpec` stays github-`NNN-`-shaped for branch/numeric ids; document that kiro resolves by explicit feature name (contract; FR-007; gated by T013).
- [x] T023 `hooks/pre-commit`: add `.kiro/` to the implementation-exclude set (line 41) and `.kiro/specs/` to the spec-change Notice (line 25); the gate still shells `verify-spec-compliance.js` (FR-008; gated by T014).

## Phase 5 — Verify & polish
- [x] T024 Run the quickstart end-to-end (kiro install → surface + invariant; engine dispatch on both a `github-speckit` and a `kiro-specs` fixture; gate both ways); reconcile drift.
- [x] T025 [P] `scripts/sync-to-package.js`: ship `scripts/speckit/engines/*` + `templates/kiro-*` (under already-synced trees — confirm no exclusion); `sync:package -- --check` green (FR-012).
- [x] T026 [P] Wire `test/speckit/engine.test.js` + the `surface.test.js` kiro additions into `npm test`; full 001–008 suite green.
- [x] T027 [P] `npm run lint` green; no runtime dependency added; `npm run check:links` clean (incl. this spec's `tasks.md`); `npm run sync:package -- --check` clean.
- [x] T028 **Dogfood**: regenerate `.zero-two-one.json` (repo stays `claude`/`github-speckit`/`source`; picks up the new `engines/*` + `templates/kiro-*` + `surface.js` changes); confirm `021-status`/`021-spec:status list` behavior unchanged (github-speckit default).
- [x] T029 Update `specs/_INDEX.md` status (already listed); run `npm run 021-spec:verify -- 008` clean before `Done`.

## Dependencies (summary)
- Setup: T001 (bars) precedes the engine extraction (T019); T002 → all tests.
- Tests (T003–T014) authored before their Phase-3/4 counterparts; all `[P]`.
- **Part A order:** T015 (adapters) → T016 (surface kinds) + T017 (entrypoint-optional) → T018 (templates). A must land before Part B is meaningful (kiro must install).
- **Part B order:** T019 (github extract) → T020 (kiro engine) → T021 (lib delegation + `manifestFacts.ssd`) → T022 (consumers) → T023 (gate). T019 is the regression bar — extract first, prove unchanged, then add T020.
- Verify (T024–T029) last; T028 depends on the full engine landing; T029 gates `Done`.

## Parallelization notes
- All Phase-2 tests are `[P]` — install (T003–T008) and engine (T009–T014) are independent surfaces.
- Within Part A: T016 + T017 parallel after T015; T018 gated by the T004/T005 shape.
- Within Part B: strictly sequential (T019→T020→T021→T022→T023) — each builds on the prior seam.
- Part A and Part B tests can be authored in parallel; implementation sequences A then B.
