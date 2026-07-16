# Tasks: Safe Install & Merge Engine

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/](contracts/), and [quickstart.md](quickstart.md); refined by the analyze pass (A1–A6). Dependency-ordered; tests precede implementation (the fixture acceptance suite is the mvp-3 exit-gate definition of done). `[P]` = parallelizable (distinct files, no ordering dependency). `021-spec:verify` reads these checkboxes — a `Done` spec has none unchecked.*

**Proposed layout:** `bin/init.js` = thin CLI wrapper; `scripts/init/*.js` = engine library (mirrors `scripts/speckit/`); `test/init/*.test.js` = `node:test` suites.

## Phase 1 — Setup
- [x] T001 Split `bin/init.js` into a CLI wrapper + `scripts/init/index.js` engine entry (no behavior change yet).
- [x] T002 [P] Add a `node:test` fixture harness `test/init/fixtures.js` — makes/cleans temp target repos and snapshots a whole-tree hash.
- [x] T003 [P] Confirm `npm test` discovers `test/init/**` (note: `npm run lint` scans only `bin`/`scripts`, so tests run via `npm test`, not lint); keep everything dependency-free.

## Phase 2 — Tests first (author failing, then implement)
*Contracts → contract tests; entities → model tests; quickstart scenarios → integration tests.*
- [x] T004 [P] Contract test: manifest output validates against `contracts/manifest.schema.json` (`test/init/manifest-schema.test.js`).
- [x] T005 [P] Integration — fresh install: full surface + populated `files{}` (quickstart §1).
- [x] T006 [P] Integration — fresh install instantiates user docs from `templates/*-Template.md` (claude mapping); `bin/` and `specs/` are **not** written (quickstart §1; FR-017 / analyze A1, A3).
- [x] T007 [P] Integration — idempotent re-run: zero diffs, all-skip, `updatedAt` moves / `installedAt` fixed (§2).
- [x] T008 [P] Integration — conflict on modified framework file, exit 0 (§3).
- [x] T009 [P] Integration — user docs untouched without `--force`, overwritten with it (§4).
- [x] T010 [P] Integration — `--dry-run` leaves whole-tree hash unchanged (§5).
- [x] T011 [P] Integration — `--upgrade` refresh/conflict/orphan (§6).
- [x] T012 [P] Integration — missing-manifest adopt (§7).
- [x] T013 [P] Integration — merged-entry deletion respected (§8).
- [x] T014 [P] Integration — `package.json` script-key collision preserves the user's value (FR-005 / analyze A5).
- [x] T015 [P] Integration — `.ai/context/` provisioned empty and left untouched (FR-006 / analyze A5).
- [x] T016 [P] Integration — prerequisites: `package.json` created; non-git hook installed + warned (§9).
- [x] T017 [P] Integration — `--force` on a framework path errors, non-zero exit (§10).
- [x] T018 [P] Integration — CRLF/`autocrlf` checkout of unmodified install → no conflicts (FR-015).
- [x] T019 [P] Integration — source-mode dogfood: `mode: source` detected, `files{}` regenerated, no-op except inventory (quickstart §11; FR-011 / analyze A2).

## Phase 3 — Core engine
- [x] T020 File-class resolver in `scripts/init/classes.js` (path → class; **excludes `bin/` and `specs/`**, analyze A3).
- [x] T021 LF-normalized `sha256` hashing util in `scripts/init/hash.js` (FR-015).
- [x] T022 `loadManifest()` / `writeManifest()` in `scripts/init/manifest.js` — schema + `installedAt` preserve / `updatedAt` refresh + `merged` record (data-model §1). Depends on T021.
- [x] T023 `classifyAll()` in `scripts/init/classify.js` producing `Action[]` (create/skip/merge/conflict/force/orphan/adopt). Depends on T020, T022.
- [x] T024 `applyPlan()` in `scripts/init/apply.js` — copies, create-if-missing, empty-scaffold provisioning; collects conflicts; exit 0 (FR-013). Depends on T023.
- [x] T025 Template instantiation in `scripts/init/instantiate.js` — render `templates/*-Template.md` → user docs under the default `claude` mapping (FR-017). Depends on T020, T024.
- [x] T026 Additive merge for `.gitignore` and `package.json` scripts, respecting user values + deletions via the `merged` record (FR-005). Depends on T022.
- [x] T027 Missing-manifest adopt path (FR-014) — hash present files into a fresh manifest, create-only-missing. Depends on T022, T023.

## Phase 4 — CLI & prerequisites
- [x] T028 Hand-rolled flag parsing in `bin/init.js` — `--dry-run --upgrade --force <path>… --phase --design --stack` (contracts/cli-contract). Depends on T023.
- [x] T029 `--dry-run` prints the classified plan, applies nothing, exit 0. Depends on T028.
- [x] T030 `--upgrade` refresh + conflict list + orphan keep/report (FR-010). Depends on T024.
- [x] T031 `--force` user-owned overwrite; reject a framework-owned path with an error (FR-004). Depends on T024.
- [x] T032 Prerequisite handling (FR-016): create minimal `package.json`; install `pre-commit` on non-git target + inactive warning. Depends on T026.
- [x] T033 `mode: source` heuristic detection + regenerate this repo's `.zero-two-one.json` inventory (FR-011), verified no-op except inventory. Depends on T022.

## Phase 5 — Integration & polish
- [x] T034 Wire the full `test/init/**` suite into `npm test` as the enforced mvp-3 exit-gate acceptance test.
- [x] T035 [P] Run `quickstart.md` end-to-end against a scratch dir; reconcile any drift.
- [x] T036 [P] Confirm `npm run lint` green and no runtime dependency added to `package.json`.
- [x] T037 [P] Update `specs/_INDEX.md` status as the spec advances.
- [x] T038 Run `npm run 021-spec:verify` clean before setting status to `Done`.

## Dependencies (summary)
- Setup (T001–T003) → everything.
- Tests (T004–T019) authored before their Phase 3/4 counterparts; all `[P]` (distinct files).
- Core: T021 → T022 → T023 → T024; T025 (instantiation) after T024; T026/T027 after T022/T023.
- CLI (T028–T033) after the core paths they drive.
- Polish (T034–T038) last; T038 gates `Done`.

## Parallelization notes
- All Phase 2 test files are independent → run `[P]` together.
- T020 and T021 touch different files → `[P]`.
- Phase 5 T035–T037 are independent of each other.
