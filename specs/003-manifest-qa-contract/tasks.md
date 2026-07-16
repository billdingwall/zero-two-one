# Tasks: Manifest as QA Contract

*Derived from [plan.md](plan.md). Dependency-ordered; tests-first. `[P]` = parallelizable. A behavior-preserving consolidation — parity with today's outputs is the definition of done. Initial breakdown; refined by the `plan`/`tasks`/`analyze` passes.*

## Phase 1 — Setup / baseline
- [ ] T001 Snapshot current behavior: capture `run-qa.sh` "Detected Lifecycle Phase" + `021-status` output for planning/mvp/growth manifests and for the no-manifest case (the parity baseline).

## Phase 2 — Tests first
- [ ] T002 [P] `manifestFacts` maps each phase (`planning|mvp|growth` + legacy `prebuild`) → number/label (FR-002).
- [ ] T003 [P] `readManifest` → null on missing/corrupt manifest; `manifestFacts` → Planning fallback (FR-001/006).
- [ ] T004 [P] Grep-guard: `.zero-two-one.json` is opened in exactly one module (`lib.js`) (FR-001).
- [ ] T005 [P] `run-qa.sh` prints the same phase as `021-status` for a fixture manifest, and no longer pipes `workflow-status.js --json` (FR-003).
- [ ] T006 [P] No-manifest → same Planning fallback + warning from `run-qa.sh` and `021-status` (FR-006).

## Phase 3 — Implementation
- [ ] T007 Add `readManifest` + `manifestFacts` + the canonical phase vocabulary to `scripts/speckit/lib.js` (FR-001/002).
- [ ] T008 Route `run-qa.sh` phase read through `lib.js`; remove the `workflow-status.js --json` scrape (FR-003).
- [ ] T009 Delegate `workflow-status.js` manifest branch to `manifestFacts`; keep the single no-manifest fallback (FR-004/006).
- [ ] T010 `hooks/pre-commit` guard-rail + comment pointing at the contract (no second parser) (FR-005).

## Phase 4 — Verify & polish
- [ ] T011 Assert parity against the T001 baseline (phase output + QA-tier/gate outcomes unchanged) (FR-007).
- [ ] T012 [P] Wire the `lib.js` tests into `npm test`.
- [ ] T013 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T014 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.
