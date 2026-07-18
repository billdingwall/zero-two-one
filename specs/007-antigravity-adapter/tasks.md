# Tasks: Antigravity Adapter

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/adapter-surface.md](contracts/adapter-surface.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **The guardrails are the 006 `claude` golden fixture (must stay byte-identical) and the neutral-core invariant** — 007 adds only `antigravity` Layer-2 paths. New module `scripts/init/surface.js`; the rendered-surface seam threads through `adapters`/`classes`/`sources`/`classify`/`apply`; the MCP note lands in `index.js`.*

**Proposed layout:** `adapters.js` gains `surfaceRenders` + `entrypoint.honored`; new `scripts/init/surface.js` (`renderSurface`); `classes.js` splits `frameworkSourceDirs` from render `toDir` ownership + `userFiles` honored; `sources.js` walks source dirs only; `classify.js` gets a rendered-surface loop + `GEMINI.md` dest resolution; `apply.js` writes the surface; `index.js` gets `reportStackNotes`; YAML frontmatter added to `skills/*.md` (×8); tests in `test/init/surface.test.js` + additions to `test/init/adapters.test.js`/`renderer.test.js`.

## Phase 1 — Setup & guardrails
- [x] T001 **Reconfirm the regression guard before touching content** — the 006 `claude` golden fixture (`test/init/fixtures/claude-golden.json`) is the bar; 007 must not perturb it. No new capture (claude's render path + `.claude/commands` are untouched); the `skills/*.md` frontmatter added in T017 is **outside** the golden set — T005 re-asserts the golden after it.
- [x] T002 [P] Antigravity test helpers — extend the inlined helpers in `test/init/renderer.test.js` (or a shared `test/init/surface.test.js` preamble): install-into-temp per stack, tree snapshot, `GEMINI.md` seeding. Reuse `test/init/fixtures.js`.

## Phase 2 — Tests first (author before their Phase 3 counterparts)
- [x] T003 [P] `renderSurface(sourceDir,'antigravity')` (contract): returns one `{dest,content}` per skill (8, `_INDEX.md` excluded) + per command (`021-init`,`021-status`); dests are `.agents/skills/021-<name>/SKILL.md`; `kind:'skill'` content == source verbatim; `kind:'command'` content starts with synthesized `---\nname: 021-<name>\ndescription: …\n---`; deterministic; `renderSurface(...,'claude')` → `[]` (data-model §3; FR-001/002).
- [x] T004 [P] `adapters.js` shape (contract): `getAdapter('antigravity')` has `surfaceRenders` (2 descriptors) + `entrypoint.honored:['GEMINI.md']`; `claude` unchanged (no `surfaceRenders`/`honored`); `getAdapter('kiro')` still throws; still pure data (no imports from classes/sources/surface).
- [x] T005 [P] **`claude` byte-identical (regression bar)**: after the whole change set, a `claude` install reproduces the 006 golden hashes for `CLAUDE.md` + `.claude/commands/021-*.md`; no `.agents/` path present (Scenario 3; FR-006; 006 FR-010). *(analyze A5: this is the Scenario 3 test; Scenario 2 needs none — covered by construction, R3.)*
- [x] T006 [P] **Antigravity install surface**: `--stack antigravity` → `.agents/skills/021-<name>/SKILL.md` present for all 8 skills + `021-init`/`021-status`, each with `name`/`description` frontmatter; `AGENTS.md` at root; **no** `CLAUDE.md`, **no** `.claude/commands/` in the tree (Scenario 1; FR-001).
- [x] T007 [P] **`GEMINI.md` honored**: target pre-seeded with `GEMINI.md` → left byte-unchanged and **no `AGENTS.md`** written; fresh target → `AGENTS.md` written (Scenario 2b; FR-004).
- [x] T008 [P] **Stack-aware ownership**: `classify('.agents/skills/021-init/SKILL.md','antigravity')` → `framework-owned`, under `'claude'` → `null`; `classify('AGENTS.md','antigravity')` and `classify('GEMINI.md','antigravity')` → `user-owned`; `.claude/commands/**` → `null` under antigravity (Scenario 5; FR-005, data-model §2/§5).
- [x] T009 [P] **Neutral-core invariant (incl. skills surface)**: `claude` + `antigravity` clean installs differ **only** in Layer-2 (`{CLAUDE.md,.claude/commands/**}` vs `{AGENTS.md,.agents/skills/**}`); every Layer-1 path — incl. the frontmatter'd `skills/*.md` — byte-identical; 006 carve-outs apply (Scenario 4; FR-006).
- [x] T010 [P] **`--upgrade` honors the recorded stack**: on an `antigravity` manifest, refresh `.agents/skills/**` + entrypoint; never introduce `CLAUDE.md`/`.claude/commands`; a hand-edited `SKILL.md` re-run without `--upgrade` → `conflict` (left unchanged) (Scenario 6; FR-007).
- [x] T011 [P] **Migrate wire-through**: a target with `.agents/`/`AGENTS.md` and no `--stack` → detection proposes `antigravity` (spec 002) → install writes the `.agents/` surface; existing `AGENTS.md` honored/untouched (Scenario 7; FR-008). *(analyze A3: no migrate-specific surface code — the framework-owned `021-`-namespaced surface flows through the shared classify/apply pipeline; this test just guards that migrate reaches it. `GEMINI.md`-only repos are out of scope for detection — analyze A2.)*
- [x] T012 [P] **MCP post-install note**: an antigravity install emits registration guidance referencing `~/.gemini/config/mcp_config.json`; assert **nothing** is written under `~/.gemini/` (Scenario 8; FR-009).

## Phase 3 — Implementation
- [x] T013 `scripts/init/adapters.js`: add antigravity `surfaceRenders` (skills + commands descriptors) and `entrypoint.honored:['GEMINI.md']` (data-model §1; FR-001/004). `claude`/`kiro` untouched. *(analyze A1: no `render.js` task — `STACK_TOKENS.antigravity` stays `{}`; FR-003 is satisfied by 006's identity render, research R3.)*
- [x] T014 `scripts/init/surface.js` (new): `renderSurface(sourceDir, stack) → [{dest,content}]` — match `fromDir/match` minus `exclude` via a **built-in suffix/prefix mini-matcher** *(analyze A6 — no glob dependency, FR-010)*; `021-`-prefix names; `kind:'skill'` passthrough, `kind:'command'` synthesize frontmatter (name from filename, description from first heading/non-empty line); sorted by `dest`; `[]` when no `surfaceRenders`. `fs`/`path` only (contract; FR-001/002/010; gated by T003).
- [x] T015 `scripts/init/classes.js`: split `frameworkSourceDirs(stack)` (LAYER1 ∪ `surfaceDirs`) from `frameworkDirs(stack)` (= source ∪ `surfaceRenders[].toDir`, used by `classify`); `userFiles(stack)` includes `entrypoint.honored`; verify `claude` sets are unchanged (data-model §2; FR-005; gated by T008).
- [x] T016 `scripts/init/sources.js`: `frameworkFiles` walks `frameworkSourceDirs` (never render `toDir`s) — keeps `.agents/skills` (source-absent) out of enumeration (contract).
- [x] T017 Add YAML `name: 021-<name>` / `description:` frontmatter to the 8 `skills/*.md` prompt files (`check-framework-compliance`, `fetch-speckit-context`, `generate-backlog`, `generate-edd`, `generate-frontend-component`, `generate-prd`, `generate-tdd`, `verify-spec-compliance`); **not** `_INDEX.md`/`tools.json` (FR-002; research R6). Re-run T005 — golden unaffected.
- [x] T018 `scripts/init/classify.js`: add the rendered-surface loop (state machine keyed on `sha256(content)` from `renderSurface`, class FRAMEWORK, carries `content`); resolve the entrypoint's effective dest via `entrypoint.honored` against target state; extend orphan detection across both surfaces (data-model §4/§5; FR-001/004).
- [x] T019 `scripts/init/apply.js`: write rendered-surface actions (`mkdir -p` + `writeFile(content)`) for create/refresh/force; ensure the manifest-inventory loop hashes them from disk (framework-owned) (contract; FR-001/011).
- [x] T020 `scripts/init/index.js`: `reportStackNotes(stack, log)` after `applyPlan` (sibling to `reportHook`) — antigravity MCP registration note from `skills/tools.json`, referencing `~/.gemini/config/mcp_config.json`; **no** writes outside the target (FR-009; gated by T012).
- [x] T021 `scripts/sync-to-package.js`: ship `scripts/init/surface.js` (under the already-synced `scripts/` tree — confirm no exclusion needed) and the frontmatter'd `skills/*.md`; keep `sync:package -- --check` green (FR-011).

## Phase 4 — Verify & polish
- [x] T022 Run the quickstart end-to-end (install antigravity, assert skills tree + GEMINI honoring + MCP note; diff vs claude for the invariant); reconcile any drift.
- [x] T023 [P] Wire `test/init/surface.test.js` (and any new assertions) into `npm test`; full suite green incl. the 006 golden + 001/002 regressions.
- [x] T024 [P] `npm run lint` green; no runtime dependency added; `npm run check:links` clean (incl. this spec's now-present `tasks.md`); `npm run sync:package -- --check` clean.
- [x] T025 **Dogfood**: regenerate the working repo's `.zero-two-one.json` (it is `claude`/`source` — the antigravity surface does not apply, but the run picks up the new `surface.js` module + the frontmatter'd `skills/*.md`); confirm the root `CLAUDE.md` is untouched.
- [x] T026 Update `specs/_INDEX.md` status (already listed); run `npm run 021-spec:verify -- 007` clean before `Done`.

## Dependencies (summary)
- Setup: T001 (guard) precedes the content edit (T017); T002 → all tests.
- Tests (T003–T012) authored before their Phase-3 counterparts; all `[P]`.
- Core order: T013 (adapters) → T014 (surface) + T015 (classes) → T016 (sources) → T017 (skills frontmatter) → T018 (classify) → T019 (apply) → T020 (index/MCP) → T021 (sync).
- Verify (T022–T026) last; T025 depends on the full engine landing; T026 gates `Done`.

## Parallelization notes
- All Phase-2 tests are independent (`[P]`) — different behaviors, separate assertions.
- T014 (surface) and T015 (classes) are parallel after T013; T016 depends on T015; T018 depends on T014+T015+T016.
- T017 (content) is independent of the engine tasks but must land before T006/T009 pass and after T001's guard is noted.
