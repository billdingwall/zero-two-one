# Tasks: Workflow-Manager Reporter

*Derived from [plan.md](plan.md). Dependency-ordered; tests-first. `[P]` = parallelizable. Read-only reporter — writing nothing is a hard guardrail (FR-008). Initial breakdown; refined by the `plan`/`tasks`/`analyze` passes.*

## Phase 1 — Setup
- [ ] T001 Doctor fixture harness `test/speckit/doctor-fixtures.js` — build temp repos with seeded `specs/NNN/{spec.md,tasks.md}`, `specs/_INDEX.md`, `_releases/*.md`, `.zero-two-one.json`.

## Phase 2 — Tests first
- [ ] T002 [P] Clean repo → zero findings, exit 0 (FR-001/007).
- [ ] T003 [P] Spec ↔ index mismatch flagged with proposed `_INDEX` value (FR-002).
- [ ] T004 [P] `Done` spec with unchecked tasks flagged + count (FR-003).
- [ ] T005 [P] Release Status lags all-`Done` specs → advanceable finding (FR-004).
- [ ] T006 [P] Roadmap row Status disagrees with release file → flagged (FR-005).
- [ ] T006b [P] Backlog release with `Open` rows while its specs are `Done` → advisory finding (release-level, no prose matching) (FR-006).
- [ ] T007 [P] Manifest phase ≠ inferred → advisory finding (FR-007).
- [ ] T008 [P] Read-only: whole-tree snapshot unchanged after a run; `hooks/pre-commit` does not reference the doctor (FR-009).
- [ ] T009 [P] Exit code: non-zero only on **hard** drift (spec↔index/tasks); advisory-only → exit 0 (FR-008/009).

## Phase 3 — Implementation
- [ ] T010 `normalizeStatus` + `_INDEX`/roadmap-table/release-`Status` parsers in `scripts/speckit/doctor.js` (tolerant of glyphs + words).
- [ ] T011 `checkSpecIndex` + `checkSpecWork` (reuse `lib.js` `listSpecs`/`readStatus`/`countTasks`) (FR-002/003/009).
- [ ] T012 `checkReleaseSpecs` + `checkRoadmapRelease` + `checkBacklogRelease` (backlog table parse, group by Release) (FR-004/005/006).
- [ ] T013 `checkManifestPhase` via `manifestFacts` (FR-007/010).
- [ ] T014 `render` (findings grouped, severity, proposed fixes, "no drift") + severity-aware exit + CLI (`require.main`) + `021-doctor` npm script (FR-008/009/001).

## Phase 4 — Verify & polish
- [ ] T015 Run `021-doctor` against this repo; reconcile any true drift it surfaces.
- [ ] T016 [P] Wire `test/speckit/doctor.test.js` into `npm test`.
- [ ] T017 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T018 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.
