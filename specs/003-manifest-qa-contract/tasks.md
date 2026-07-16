# Tasks: Manifest as QA Contract

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/lib-api.md](contracts/lib-api.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. A **behavior-preserving** consolidation — parity with the captured baseline is the definition of done (FR-007).*

**Proposed layout:** the parser + CLI live in `scripts/speckit/lib.js`; consumers are `scripts/run-qa.sh`, `scripts/workflow-status.js`, `hooks/pre-commit`; tests in `test/speckit/lib.test.js`.

## Phase 1 — Baseline
- [ ] T001 Capture the parity baseline (quickstart "Baseline"): `run-qa.sh` "Detected Lifecycle Phase" + `workflow-status.js --json` for `planning|mvp|growth` manifests and the no-manifest case. This is the diff target for FR-007.

## Phase 2 — Tests first
- [ ] T002 [P] `manifestFacts` maps each phase value (`planning|mvp|growth` + legacy `prebuild`) → `phaseNum`/`phaseLabel` (data-model §2; FR-002).
- [ ] T003 [P] Resolution order: manifest → inference (`specs/` → mvp; `01-PRD>1KB` → planning; else planning) → Planning; `source` is `manifest`/`inferred` (data-model §3; FR-001/006).
- [ ] T004 [P] `readManifest` → `null` on missing/corrupt manifest (never throws); unparseable → one stderr warning + inference (FR-001/006).
- [ ] T005 [P] CLI: `node scripts/speckit/lib.js phase` prints only the `phaseNum` to stdout; warning (if any) to stderr; unknown subcommand → non-zero (contract; FR-003).
- [ ] T006 [P] Grep-guard: `.zero-two-one.json` is opened / phase inferred in `lib.js` only; `run-qa.sh` has no `workflow-status.js --json` pipe (FR-001).
- [ ] T007 [P] `--json` shape preserved: `workflow-status.js --json` still emits `{ phase:<num>, status:<label>, source }` (FR-004; contract §4).

## Phase 3 — Implementation
- [ ] T008 Add `readManifest` + `manifestFacts` (whole resolution) + the canonical phase vocabulary + the `phase` CLI (`require.main === module`) to `scripts/speckit/lib.js` (FR-001/002/006).
- [ ] T009 Route `run-qa.sh` phase read through `PHASE=$(node scripts/speckit/lib.js phase)`; remove the `workflow-status.js --json | node -e` scrape (FR-003).
- [ ] T010 Reduce `workflow-status.js` to a presenter over `manifestFacts` — delete its manifest read, `PHASE_FROM_MANIFEST`, and inference; keep only `--json`/human formatting (FR-004).
- [ ] T011 `hooks/pre-commit` guard-rail comment pointing at the contract (no second parser) (FR-005).

## Phase 4 — Verify & polish
- [ ] T012 Parity check against the T001 baseline — QA phase output, `--json`, and QA-tier/gate outcomes unchanged (FR-007).
- [ ] T013 [P] Wire `test/speckit/lib.test.js` into `npm test`.
- [ ] T014 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T015 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.

## Dependencies (summary)
- Baseline (T001) → before any change (it's the parity reference).
- Tests (T002–T007) authored before their implementation counterparts; all `[P]`.
- Core: T008 (lib.js) → T009/T010 (consumers) → T011 (gate comment).
- Verify (T012–T015) last; T015 gates `Done`.

## Parallelization notes
- All Phase 2 test cases live in one `lib.test.js` but are independent assertions.
- T013/T014 are independent of each other.
