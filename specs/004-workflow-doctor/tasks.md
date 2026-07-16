# Tasks: Workflow-Manager Reporter

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/doctor-cli.md](contracts/doctor-cli.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. **Read-only** is a hard guardrail — writing nothing is asserted (FR-009). Reuses spec 003's `lib.js`.*

**Proposed layout:** the checks + render + CLI live in `scripts/speckit/doctor.js`; the `021-doctor` npm script; tests in `test/speckit/doctor.test.js`.

## Phase 1 — Setup
- [ ] T001 Doctor fixture harness `test/speckit/doctor-fixtures.js` — build temp repos with seeded `specs/NNN/{spec.md,tasks.md}`, `specs/_INDEX.md`, `_releases/*.md`, `05-ROADMAP.md`, `04-BACKLOG.md`, `.zero-two-one.json`.

## Phase 2 — Tests first
- [ ] T002 [P] Clean repo → zero findings, "no drift", exit 0 (FR-001/008).
- [ ] T003 [P] Spec ↔ index mismatch → hard finding with proposed `_INDEX` value; missing row/dir also hard (FR-002).
- [ ] T004 [P] `Done` spec with unchecked tasks → hard finding + count; `In Progress` + open tasks → **no** finding (FR-003; R7).
- [ ] T005 [P] Release ↔ specs: **advanceable** (all `Done`, Status not advanced) and **overclaimed** (Status `Delivered`, a spec not `Done`) both flagged; in-flight release (no `Done` specs) → **no** finding (FR-004 / analyze A1, A3).
- [ ] T006 [P] Roadmap row Status disagrees with release file → advisory finding (FR-005).
- [ ] T007 [P] Backlog release with `Open` rows while its specs are `Done` → advisory (release-level, no prose matching) (FR-006).
- [ ] T008 [P] Manifest phase ≠ inferred (`source: manifest`) → advisory finding (FR-007).
- [ ] T009 [P] `normalizeStatus` collapses glyphs (✅/🔜/◻) + words to `done|in-progress|open` (data-model §4; R8).
- [ ] T010 [P] Exit code: non-zero iff a **hard** finding exists; advisory-only → 0 (FR-008/009).
- [ ] T011 [P] Read-only: whole-tree snapshot unchanged after a run; `hooks/pre-commit` has no `doctor` reference (FR-009). Grep-guard: `doctor.js` has no direct `.zero-two-one.json` read — phase comes via `manifestFacts` (FR-010 / analyze A2).

## Phase 3 — Implementation
- [ ] T012 `normalizeStatus` + `_INDEX`/roadmap-table/release-`Status`/backlog-table parsers in `scripts/speckit/doctor.js` (tolerant; data-model §4).
- [ ] T013 `checkSpecIndex` + `checkSpecWork` (reuse `lib.js` `listSpecs`/`readStatus`/`countTasks`) — hard severity (FR-002/003/010).
- [ ] T014 `checkReleaseSpecs` + `checkRoadmapRelease` + `checkBacklogRelease` — advisory (FR-004/005/006).
- [ ] T015 `checkManifestPhase` via `manifestFacts` — advisory (FR-007/010).
- [ ] T016 `render` (grouped findings, `✗`/`•` severity glyphs, proposed fixes, "no drift" line) + severity-aware exit + CLI (`require.main`) + `021-doctor` npm script (FR-008/009/001).

## Phase 4 — Verify & polish
- [ ] T017 Run `021-doctor` against this repo; reconcile any true drift it surfaces.
- [ ] T018 [P] Wire `test/speckit/doctor.test.js` into `npm test`.
- [ ] T019 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [ ] T020 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before `Done`.

## Dependencies (summary)
- Setup (T001) → everything.
- Tests (T002–T011) authored before their implementation counterparts; all `[P]`.
- Core: T012 (parsers) → T013–T015 (checks) → T016 (render + CLI + exit).
- Verify (T017–T020) last; T020 gates `Done`.

## Parallelization notes
- All Phase 2 test cases live in one `doctor.test.js` but are independent assertions.
- The six checks (T013–T015) are independent pure functions once T012 lands.
