# Tasks: Migrate-Mode

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/](contracts/), and [quickstart.md](quickstart.md). Dependency-ordered; tests precede implementation (the migration acceptance test is the mvp-3 exit-gate definition of done). `[P]` = parallelizable (distinct files). Builds on spec 001's engine — reuses `classifyAll`/`applyPlan`/`manifest.js`/`instantiate.js`.*

**Proposed layout:** `scripts/init/migrate/*.js` = migrate layer; `index.js` gains a migrate branch; `manifest.js` gains the `migrate` block; `test/init/migrate/*.test.js` = suites.

## Phase 1 — Setup
- [x] T001 Add a migrate branch in `scripts/init/index.js` — make mode **manifest-first** (recorded mode on re-run, else detect migrate/source/scaffold), route `mode: migrate` → `scripts/init/migrate/`. **Invariant (analyze A5): the scaffold path and its spec 001 tests stay unchanged.**
- [x] T002 [P] Migrate fixture harness `test/init/migrate/fixtures.js` — synthetic non-empty repos (code, docs, tool surfaces, git tags).

## Phase 2 — Tests first
- [x] T003 [P] Contract test: migrate manifest block validates against `contracts/manifest-migrate.schema.json`.
- [x] T004 [P] Integration — detected migrate vs scaffold (quickstart §1; FR-001).
- [x] T005 [P] Integration — phase strict precedence: growth needs tests+CI+git-tags; else mvp/planning (§2; FR-002).
- [x] T006 [P] Integration — `--phase` overrides inference (§2; FR-003).
- [x] T007 [P] Integration — stack detection single + conflicting; `--stack` resolves (§3; FR-004).
- [x] T008 [P] Integration — leave-alongside import: dest byte-unchanged + catalog row (§4; FR-006).
- [x] T009 [P] Integration — archive: moved to `_notes/archive/` + pointer; fresh template at dest; content preserved (§5; FR-007).
- [x] T010 [P] Integration — update/wrap: template structure + user content under `## Imported content` (§6; FR-007).
- [x] T011 [P] Integration — guiding-doc leave coexistence: `CLAUDE.md` untouched + `CLAUDE.zero-two-one.md` written (§7; FR-007).
- [x] T012 [P] Integration — duplicate decisions recorded in `manifest.migrate` (FR-011).
- [x] T013 [P] Integration — Spec Kit reuse: valid + invalid frontmatter → report + skip, files untouched (§8; FR-008).
- [x] T014 [P] Integration — non-interactive (no TTY / `--yes`) completeness: zero prompts, exit 0 (§9; FR-012); also assert `--design material-3` is recorded as `tools.design` (FR-005 / analyze A3).
- [x] T015 [P] Integration — growth entry post-transition shape (§10; FR-009); **and** when `05-ROADMAP`/`04-BACKLOG` already exist, duplicate resolution governs (growth-entry doesn't overwrite) (analyze A1).
- [x] T016 [P] Integration — idempotent re-run: manifest-driven; no re-prompt/re-apply/dup rows/re-archive (§11; FR-011).
- [x] T017 [P] Integration — **migration acceptance test**: non-empty fixture → zero user-file overwrites (exit gate; FR-010).

## Phase 3 — Core
- [x] T018 `scripts/init/migrate/detect.js` — mode + strict-precedence phase + stack signals; git tags via `node:child_process` (FR-001/002/004).
- [x] T019 `scripts/init/migrate/interview.js` — `readline` prompts + flag resolution + TTY/`--yes` guard + safe defaults (FR-003/012).
- [x] T020 `scripts/init/migrate/duplicates.js` — exact-dest detection; archive / update(wrap) / leave; guiding-doc namespaced install; decision records (FR-007).
- [x] T021 `scripts/init/migrate/import.js` — `imported-docs.md` catalog, path-keyed idempotent (FR-006); write the catalog row and the `migrate.imported` manifest entry together so they never drift (analyze A6).
- [x] T022 `scripts/init/migrate/speckit-reuse.js` — detect + validate + report + skip; never modify user specs (FR-008).
- [x] T023 `scripts/init/migrate/growth-entry.js` — post-transition `05-ROADMAP`/`04-BACKLOG` shape (FR-009).
- [x] T024 `manifest.js` migrate block (`duplicates`/`imported`/`archived`); `index.js` migrate branch + re-run reads recorded mode/phase/stack (FR-001/011).

## Phase 4 — CLI & polish
- [x] T025 CLI flags in `bin/init.js`: `--phase --stack --design --dup <path>=<action> --yes` (contracts/cli-contract).
- [x] T026 Wire the migrate suite into `npm test`.
- [x] T027 [P] Run `quickstart.md` end-to-end on a non-empty scratch repo; reconcile drift.
- [x] T028 [P] `npm run lint` green; no runtime dependency added; `npm run sync:package`.
- [x] T029 Update `specs/_INDEX.md`; run `npm run 021-spec:verify` clean before setting `Done`.

## Dependencies (summary)
- Setup (T001–T002) → everything.
- Tests (T003–T017) authored before their Phase 3/4 counterparts; all `[P]`.
- Core: T018 (detect) → T019 (interview) feed the flow; T020/T021 after `instantiate`/`manifest` (spec 001); T024 wires the branch + manifest.
- CLI (T025) after the core it drives; polish (T026–T029) last; T029 gates `Done`.

## Parallelization notes
- All Phase 2 test files are independent → run `[P]` together.
- Phase 3 modules touch distinct files but share the detect→resolve ordering; T027–T028 are independent.
