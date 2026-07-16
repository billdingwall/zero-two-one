# Tasks: Conflict-Aware Pre-commit Install

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/hook-install.md](contracts/hook-install.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **Never overwrite a user hook** is the guardrail (FR-007) — asserted with a sentinel. Replaces spec 001's `installHook`.*

**Proposed layout:** detection + `insertGuarded` in `scripts/init/hook.js`; strategy chooser wired into `scripts/init/apply.js`; `manifest.hook` persisted via `manifest.js`; tests in `test/init/hook.test.js`.

## Phase 1 — Setup
- [ ] T001 Hook fixture helpers in `test/init/hook-fixtures.js` — a target with `.git/hooks/`; seed a plain sentinel hook (ending in `exit 0`), a `.husky/` dir, a `lefthook.yml`.

## Phase 2 — Tests first
- [ ] T002 [P] `detectHookSituation` → none / plain / husky / lefthook / already-installed, with the documented precedence (data-model §1; FR-001).
- [ ] T003 [P] none → gate installed directly at `.git/hooks/pre-commit`; strategy `direct` (FR-002).
- [ ] T004 [P] plain → original lines preserved in order + guarded block inserted **after the shebang**; `.git/hooks/pre-commit.zto` present + executable; gate still runs when the user's hook ends in `exit 0` (FR-003).
- [ ] T005 [P] husky → `.husky/pre-commit` gets the guarded block after the shebang (v9-style if created); `.git/hooks/pre-commit` not written (FR-004).
- [ ] T006 [P] lefthook → strategy `manual`; `lefthook.yml` **byte-unchanged**; the command snippet is printed (FR-005).
- [ ] T007 [P] idempotent re-run → no duplicate guarded block (marker respected); no hook-file rewrite (FR-006).
- [ ] T008 [P] **sentinel guardrail**: a hook/config with a unique string is never overwritten or emptied by any strategy (FR-007).
- [ ] T009 [P] `manifest.hook` records the applied strategy; `--dry-run` names it (FR-008/007).
- [ ] T010 [P] spec 001's hook tests (T016 non-git / T016b direct install) stay green (FR-002/009 regression).

## Phase 3 — Implementation
- [ ] T011 `scripts/init/hook.js`: `detectHookSituation` (read-only) + the gate-marker check (FR-001).
- [ ] T012 `insertGuarded(file, block)` — insert after the shebang (gate-first), or create v9-style when absent; marker-idempotent (FR-003/004/006).
- [ ] T013 Strategy chooser replacing `installHook` in `scripts/init/apply.js`: direct / chain-plain / husky / lefthook-report (FR-002…005).
- [ ] T014 Persist `manifest.hook` (thread the strategy through `apply.js` → `buildManifest`/`manifest.js`) + include the strategy in `--dry-run` output (FR-008/007).

## Phase 4 — Verify & polish
- [ ] T015 Run init end-to-end against fixtures for each hook setup (quickstart); reconcile drift.
- [ ] T016 [P] Wire `test/init/hook.test.js` into `npm test`.
- [ ] T017 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T018 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.

## Dependencies (summary)
- Setup (T001) → everything.
- Tests (T002–T010) authored before their implementation counterparts; all `[P]`.
- Core: T011 (detect) + T012 (`insertGuarded`) → T013 (chooser) → T014 (manifest + dry-run).
- Verify (T015–T018) last; T018 gates `Done`.

## Parallelization notes
- All Phase 2 test cases live in one `hook.test.js` but are independent assertions.
- T011 and T012 touch the same new file but are separable functions.
