# Tasks: Conflict-Aware Pre-commit Install

*Derived from [plan.md](plan.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **Never overwrite a user hook** is the guardrail (FR-007) — asserted with a sentinel. Replaces spec 001's `installHook`. Initial breakdown; refined by the `plan`/`tasks`/`analyze` passes.*

## Phase 1 — Setup
- [ ] T001 Hook fixture helpers in `test/init/fixtures.js` (or a hook-specific harness): make a target with `.git/hooks/`, seed a plain sentinel hook, a `.husky/` dir, a `lefthook.yml`.

## Phase 2 — Tests first
- [ ] T002 [P] `detectHookSituation` → none / plain / husky / lefthook / already-installed, with the documented precedence (FR-001).
- [ ] T003 [P] none → gate installed directly at `.git/hooks/pre-commit` (spec 001 behavior unchanged) (FR-002).
- [ ] T004 [P] plain → original bytes preserved + guarded line appended; `.git/hooks/pre-commit.zto` present + executable (FR-003).
- [ ] T005 [P] husky → `.husky/pre-commit` gets the guarded block; `.git/hooks/pre-commit` not written (FR-004).
- [ ] T006 [P] lefthook → chosen strategy (register/report) is non-lossy; config not truncated (FR-005).
- [ ] T007 [P] idempotent re-run → no duplicate guarded block (marker respected) (FR-006).
- [ ] T008 [P] **sentinel guardrail**: a hook/config with a unique string is never overwritten or emptied by any strategy (FR-007).
- [ ] T009 [P] `manifest.hook` records the applied strategy; `--dry-run` names it (FR-008).
- [ ] T010 [P] spec 001's existing hook tests (T016/T016b) stay green (FR-002/009 regression).

## Phase 3 — Implementation
- [ ] T011 `detectHookSituation(targetDir)` (read-only) + the gate marker check (FR-001).
- [ ] T012 `appendGuarded(file, block)` — create-or-append, marker-idempotent (FR-003/004/006).
- [ ] T013 Strategy functions: direct / chain-plain / husky / lefthook in `scripts/init/apply.js` (replace `installHook`) (FR-002…005).
- [ ] T014 Persist `manifest.hook` (thread the strategy through `apply.js` → `buildManifest`) + `--dry-run` strategy report (FR-008/007).

## Phase 4 — Verify & polish
- [ ] T015 Run init end-to-end against fixtures with each hook setup; reconcile drift.
- [ ] T016 [P] Wire any new tests into `npm test`.
- [ ] T017 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T018 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.
