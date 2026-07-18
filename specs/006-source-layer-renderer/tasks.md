# Tasks: Source Layer & Stack-Parameterized Renderer

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/render-and-surface.md](contracts/render-and-surface.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **The `claude` byte-identical guarantee is the guardrail** (FR-010) — pinned by a golden fixture captured **before** any refactor. Additive to the spec 001 classify→apply→manifest pipeline; the active stack is already resolved by `resolveTools()` (`scripts/init/index.js:39`).*

**Proposed layout:** new `scripts/init/adapters.js` (registry) + `scripts/init/render.js` (`renderEntrypoint`); stack threaded through `scripts/init/{classes,sources,classify,apply}.js`; new `templates/ASSISTANT-Template.md`, `templates/CLAUDE-Template.md` deleted; tests in `test/init/renderer.test.js` + `test/init/adapters.test.js`; golden fixture under `test/init/fixtures/claude-golden/`.

## Phase 1 — Setup & guardrail capture
- [x] T001 **Capture the golden fixture *before* touching anything** — snapshot today's rendered `claude` output (`CLAUDE.md` + `.claude/commands/021-*.md`) from the current (pre-006) engine as the byte reference for FR-010. **Store it as path→sha256 hashes (`test/init/fixtures/claude-golden.json`), not as `.md` copies** *(analyze A3)* — `check-links.js` scans `test/` (SKIP_DIRS excludes it), so committing rendered `.md` files with relative links would introduce CI link breakage. The test re-renders and compares hashes.
- [x] T002 [P] Per-stack test helpers — inlined in `test/init/renderer.test.js` (`tmp`, `sha256`, `snapshot` tree-walker), reusing the existing `test/init/fixtures.js`; no separate `render-fixtures.js` needed.

## Phase 2 — Tests first (author before their Phase 3 counterparts)
- [x] T003 [P] `getAdapter(stack)` → correct entry for `claude`/`antigravity`; absent/unknown ⇒ `claude`; **`kiro` throws** "not yet supported" (analyze A5) (data-model §1; FR-006/007).
- [x] T004 [P] **`claude` byte-identical**: sha256 of rendered `CLAUDE.md` + `.claude/commands/021-*.md` equal the T001 golden hashes (FR-010).
- [x] T005 [P] **`antigravity` entrypoint only**: `AGENTS.md` written at root; **no** `CLAUDE.md`, **no** `.claude/commands/` anywhere in the tree (Scenario 2; FR-002/009).
- [x] T006 [P] **Neutral-core invariant**: install `claude` + `antigravity` into clean targets; tree-diff (excluding `.zero-two-one.json` and empty `.ai/context`, per analyze A1) shows **only** Layer-2 paths differ; every Layer-1 content path byte-identical (Scenario 4).
- [x] T007 [P] **Stack-aware `classify`**: `.claude/commands/**` → `framework-owned` under `claude`, `null` under `antigravity`; `AGENTS.md` → `user-owned` under `antigravity` (data-model §3; FR-004/009, Scenario 6).
- [x] T008 [P] `userDocMappings(sourceDir, stack)` → entrypoint mapping tagged `action:'render'`; other guiding/`requirements` docs tagged `action:'instantiate'`; only existing-template mappings returned (data-model §4; FR-005).
- [x] T009 [P] **`--upgrade` honors the recorded stack**: on an `antigravity` manifest, refresh `AGENTS.md`, never introduce `CLAUDE.md`/`.claude/commands` (Scenario 5; FR-008).
- [x] T010 [P] **Default `claude`**: `tools.stack` absent ⇒ `claude` surface (FR-007).
- [x] T011 [P] **Preamble preservation**: re-rendering over an entrypoint carrying a marked user-owned local section keeps that section byte-unchanged (FR-003).
- [x] T012 [P] **Spec 001/002 regression** (analyze A2 — full touch-point set): re-point `test/init/engine.test.js:47` (framework-file-presence list → `ASSISTANT-Template.md`) and `:66`/`:116` (byte-compare → `renderEntrypoint(..., 'claude')`); update `test/init/fixtures.js:43` to seed `ASSISTANT-Template.md`; the rest of the 001/002 suite stays green (FR-003).

## Phase 3 — Implementation
- [x] T013 `scripts/init/adapters.js`: the registry + `getAdapter(stack)`; `claude` and `antigravity` entries. **A `kiro` (reserved, unpopulated) request throws a clear "stack not yet supported — lands in spec 008" error rather than silently falling back to the claude entry** *(analyze A5 — `bin/init` accepts `--stack kiro` today, so an interim run must fail loudly, not produce a `CLAUDE.md` tree under a kiro manifest)*. Unknown stacks still default to `claude`. Imports nothing from `classes`/`sources` — no cycle (FR-006).
- [x] T014 `scripts/init/render.js`: `renderEntrypoint(templatePath, stack, opts?)` — `fs`/`path` string transform; `claude` reproduces the golden bytes, `antigravity` resolves stack-specific tokens; preserves `opts.existing` marked local section (FR-002/003/011).
- [x] T015 Author `templates/ASSISTANT-Template.md` from the current `CLAUDE-Template.md` content, generalized so the `claude` render is byte-identical and only stack-specific lines (entrypoint filename, assistant references) vary (FR-001; gated by T004).
- [x] T016 `scripts/init/classes.js`: extract `LAYER1_DIRS`; `FRAMEWORK_DIRS(stack) = [...LAYER1_DIRS, ...getAdapter(stack).surfaceDirs]`; `classify(relPath, stack)` — non-chosen stack surface dirs → `null` (FR-004/009).
- [x] T017 `scripts/init/sources.js`: `frameworkFiles(sourceDir, stack)` + `userDocMappings(sourceDir, stack)` with `action` tags (FR-005).
- [x] T018 Thread `stack` through `scripts/init/classify.js` (plan build) and add the `render` branch to `scripts/init/apply.js` (entrypoint → `render.js`; other docs unchanged `instantiate`) (FR-002/005).
- [x] T019 **Remove `templates/CLAUDE-Template.md`** and re-point its references: TDD §5 mapping row, spec 001 FR-017 note, `templates/_INDEX.md` (+ package copy) (FR-003). *(Test-file references are handled in T012.)*
- [x] T020 `scripts/sync-to-package.js`: ship `templates/ASSISTANT-Template.md` + `scripts/init/{adapters,render}.js`; stop shipping `CLAUDE-Template.md`; keep `sync:package -- --check` green (FR-012).

## Phase 4 — Verify & polish
- [x] T021 Run the quickstart end-to-end for each stack (install → tree-diff → byte-assert); reconcile any drift.
- [x] T022 **Dogfood the inversion (W1)**: regenerate the working repo's `.zero-two-one.json` (`mode:source`) so the `files` inventory drops `CLAUDE-Template.md` and adds `ASSISTANT-Template.md` + the new/modified modules. The root `CLAUDE.md` is **user-owned** and elaborate (its own dogfooding content, richer than the template) — the engine leaves it untouched (create-if-missing → SKIP), so it is *not* re-rendered/overwritten. The preservation mechanism is delivered + tested (T011) for users who opt to re-render; the working repo keeps its bespoke entrypoint.
- [x] T023 [P] Wire `test/init/renderer.test.js` + `test/init/adapters.test.js` into `npm test`.
- [x] T024 [P] `npm run lint` green; no runtime dependency added; `npm run check:links` clean for the spec; `npm run sync:package -- --check` clean.
- [x] T025 Update `specs/_INDEX.md` (already listed); run `npm run 021-spec:verify` clean before `Done`.

## Dependencies (summary)
- Setup: **T001 (golden capture) must precede any refactor** — it snapshots pre-006 bytes; T002 → all tests.
- Tests (T003–T012) authored before their implementation counterparts; all `[P]`.
- Core order: T013 (adapters) → T014 (render) + T015 (source authoring, gated by T004) → T016 (classes) → T017 (sources) → T018 (classify/apply wiring) → T019 (template removal + ref re-point) → T020 (sync).
- Verify (T021–T025) last; T022 depends on the full engine landing; T025 gates `Done`.

## Parallelization notes
- Phase 2 cases split across `renderer.test.js` (T004–T006, T009–T012) and `adapters.test.js` (T003, T007–T008) — independent assertions.
- T013 and T014 are new, separate files. T016/T017 touch different existing modules and can proceed once T013 exists.
- T015 (author `ASSISTANT-Template.md`) is content work gated by the T004 byte assertion — iterate the source until `claude` matches the golden fixture.
