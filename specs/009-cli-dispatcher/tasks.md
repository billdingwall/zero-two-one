# Tasks: The `021` CLI Dispatcher

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/cli.md](contracts/cli.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. The smallest mvp-4 spec — a routing shell + a re-point + a **deliberate** golden re-baseline. **Ordering note:** the re-point (T011) changes the golden-pinned `claude` files, so the golden re-capture (T012) must follow it; between them the 006 golden test is expected red.*

**Proposed layout:** new `bin/021.js` (dispatcher); `package.json` + `package/package.json` gain `bin."021"` + `exports`; re-point `npm run 021-*` → `npx 021 …` across the instruction surfaces; re-capture `test/init/fixtures/claude-golden.json`; drop the README caveat; `sync-to-package.js` ships the bin; tests in `test/cli/dispatch.test.js` (new).

## Phase 1 — Setup & guardrails
- [x] T001 **Golden re-baseline is intended (note before touching content).** The 006 fixture pins `claude`'s `CLAUDE.md` + `.claude/commands/021-*.md`; T011 changes those files' command references by design, so T012 re-captures the fixture. This is the one sanctioned move of the "claude byte-identical" bar (research R2) — the re-point (T011) must precede the re-capture (T012), and no *other* claude bytes change.
- [x] T002 [P] Test helpers — a subprocess runner for `node bin/021.js <args>` capturing stdout/stderr/exit; a parity helper comparing a subcommand's exit code to its `npm run 021-*` counterpart.

## Phase 2 — Tests first (author before their Phase 3 counterparts)
- [x] T003 [P] **Dispatch parity + arg pass-through**: `021 status|qa|doctor|phase` and `021 spec status|context|verify <arg>` each exec the mapped script (data-model §1) and return its exit code; `021 spec verify 006` forwards argv `['006']` (no `--`) (Scenario 1/2; FR-001/002).
- [x] T004 [P] **Usage & exit codes**: no subcommand ⇒ usage + exit 1; unknown subcommand ⇒ usage + exit 1; unknown `spec` leaf ⇒ usage + exit 1; `--help`/`-h` ⇒ usage + exit 0 (Scenario 7; FR-007).
- [x] T005 [P] **`exports` programmatic API**: `require('…/scripts/speckit/lib.js')` exposes `manifestFacts`/`engineFor`; the `exports` map lists `./speckit` + `./package.json`, and `./package.json` still resolves under it (Scenario —; FR-009).
- [x] T006 [P] **Adapters reference the CLI**: install `claude`/`antigravity`/`kiro` into temp targets; each rendered instruction surface references `npx 021 …` and **no `npm run 021-`** string remains (Scenario 3; FR-004).
- [x] T007 [P] **Golden re-baseline**: after T011+T012, a `claude` install matches the re-captured `claude-golden.json`; the only fixture diff vs pre-009 is the command-reference text (Scenario —; FR-005).
- [x] T008 [P] **npm aliases unchanged (regression)**: `npm run 021-status`/`021-qa`/`021-spec:verify …` behave exactly as before; `npm test`/`lint`/`sync:package` unaffected (Scenario 4; FR-006).

## Phase 3 — Implementation
- [x] T009 `bin/021.js`: the dispatcher — shebang, subcommand→script map (data-model §1), `spawnSync(process.execPath, [script, ...extra, ...rest], { stdio: 'inherit', cwd: process.cwd() })` (`sh` for `run-qa.sh`), exit `result.status ?? 1`, usage on none/unknown/`--help`. Package-relative script paths; Node built-ins only (contract; FR-001/002/007/010).
- [x] T010 `package.json` + `package/package.json`: add `bin."021": "bin/021.js"` (alongside `zero-two-one-init`) and the `exports` map (`./speckit`, `./package.json`) (data-model §3; FR-003/009). *(analyze A3: no internal `require('zero-two-one…')` exists, so the `exports` whitelist is safe. analyze A4: `package/package.json` is a **preserved** file in `sync-to-package.js` — hand-edit it directly; sync won't overwrite it, so keep it in step with root.)*
- [x] T011 **Re-point instruction surfaces** `npm run 021-*` → `npx 021 …` (drop the `-- ` separator; `021-spec:<y>` → `spec <y>`) across **every file with a literal `npm run 021-*`** *(analyze A1 — the corrected set)*: `templates/ASSISTANT-Template.md`, `.claude/commands/021-{init,status}.md`, **`skills/{fetch-speckit-context,verify-spec-compliance}.md`** (rendered to `.agents/`+`.kiro/` SKILL surfaces), `templates/kiro-steering/021-{product,tech,structure}.md`, `templates/README-Template.md`, **`workflow/{workflows,specific-workflows/init-and-migration,specific-workflows/release-launch,specific-workflows/spec-driven-delivery}.md`**, and `README.md`. **Not** `CODE-Template`/`06-REVIEW*` (no `npm run 021-*`, only prose command names). (data-model §2; FR-004). *Expect the 006 golden test to go red until T012 — only `ASSISTANT-Template.md` + `.claude/commands/*` are golden-pinned.*
- [x] T012 **Re-capture `test/init/fixtures/claude-golden.json`** from the post-re-point `claude` output (the spec 006 capture procedure); the 006 renderer test re-pins to it; 006–008 suites green again (FR-005; gated by T011). *(analyze A2: this is the **only** test-data change — the other `CLAUDE.md` test references are path/existence checks (unaffected) or identity-render assertions against the fixture's own `ASSISTANT-Template.md` (`engine.test.js:66`, self-consistent since both sides use the synthetic fixture, not the re-pointed real template).)*
- [x] T013 `README.md`: remove the stack-availability caveat (README.md:33) — all three stacks work now (FR-008).
- [x] T014 `scripts/sync-to-package.js`: ship `bin/021.js` (under the already-synced `bin/`); ensure `package/package.json` carries the new `bin`/`exports` (it is a preserved file — edit it directly, T010); `sync:package -- --check` green (FR-010).

## Phase 4 — Verify & polish
- [x] T015 Run the quickstart end-to-end (dispatch parity, usage, per-stack `npx 021` references, `exports`, bin registration); reconcile drift.
- [x] T016 [P] Wire `test/cli/dispatch.test.js` into `npm test`; full 001–008 suite green against the re-baselined fixture.
- [x] T017 [P] `npm run lint` green (the new bin passes `node --check`); no runtime dependency; `npm run check:links` clean (incl. this spec's `tasks.md`); `npm run sync:package -- --check` clean.
- [x] T018 **Dogfood**: regenerate `.zero-two-one.json` (picks up `bin/021.js`); the repo's own `npm run 021-*` + `node bin/021.js …` both work; root user-owned docs updated opportunistically (not required).
- [x] T019 Update `specs/_INDEX.md` status (already listed); run `npm run 021-spec:verify -- 009` clean before `Done`. **This closes mvp-4 (006–009).**

## Dependencies (summary)
- Setup: T001 (golden note) precedes T011/T012; T002 → all tests.
- Tests (T003–T008) authored before their Phase-3 counterparts; all `[P]`.
- Core order: T009 (bin) → T010 (manifests) → **T011 (re-point) → T012 (re-capture golden)** [strict — golden red between them] → T013 (README) → T014 (sync).
- Verify (T015–T019) last; T019 gates `Done` and completes the mvp-4 cut.

## Parallelization notes
- Phase-2 tests are independent (`[P]`), except T007 (golden) which validates the T011→T012 sequence.
- T009 (bin) is independent of T011 (re-point); they can proceed in parallel, but T012 (re-capture) must follow T011.
