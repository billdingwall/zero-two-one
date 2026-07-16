# Tasks: Migrate-Mode

*Derived from [plan.md](plan.md). Dependency-ordered; tests precede implementation (the migration acceptance test is the mvp-3 exit-gate definition of done). `[P]` = parallelizable. Initial breakdown — refined by the `plan`/`tasks`/`analyze` passes.*

**Proposed layout:** `scripts/init/migrate/*.js` = migrate layer; `index.js` gains a migrate branch; `test/init/migrate/*.test.js` = suites.

## Phase 1 — Setup
- [ ] T001 Add a migrate branch stub in `scripts/init/index.js` (resolve `mode: migrate`, delegate to `migrate/`).
- [ ] T002 [P] Migrate fixture harness `test/init/migrate/fixtures.js` — synthetic non-empty repos (code, docs, tool surfaces).

## Phase 2 — Tests first
- [ ] T003 [P] mode detection: non-empty repo → migrate; empty/framework-only → scaffold (FR-001).
- [ ] T004 [P] phase heuristics: growth / mvp / planning from signals (FR-002).
- [ ] T005 [P] `--phase` overrides inference non-interactively (FR-003).
- [ ] T006 [P] stack detection from surfaces; conflicting surfaces reported; `--stack` resolves (FR-004).
- [ ] T007 [P] existing-doc import: catalog written, original byte-unchanged (FR-006).
- [ ] T008 [P] duplicate resolution archive: moved to `_notes/archive/` + pointer left; content preserved (FR-007).
- [ ] T009 [P] duplicate resolution update-to-fit: in-place, content preserved (FR-007).
- [ ] T010 [P] duplicate resolution leave-alongside: catalog + cross-link (FR-007).
- [ ] T011 [P] duplicate decisions recorded in `manifest.migrate.duplicates` (FR-011).
- [ ] T012 [P] Spec Kit reuse: `.specify/`/populated `specs/` → validate frontmatter, skip setup (FR-008).
- [ ] T013 [P] non-interactive (no TTY) with flags → zero prompts (FR-012).
- [ ] T014 [P] growth entry scaffolds post-transition roadmap/backlog shape (FR-009).
- [ ] T015 [P] **migration acceptance test**: non-empty fixture → zero user-file overwrites (exit gate).

## Phase 3 — Core
- [ ] T016 `detect.js` — mode/phase/stack detection (read-only).
- [ ] T017 `interview.js` — readline prompts + non-interactive flag resolution + TTY guard.
- [ ] T018 `import.js` — imported-docs catalog.
- [ ] T019 `duplicates.js` — archive/update/leave + decision records.
- [ ] T020 `speckit-reuse.js` — detect + validate + skip.
- [ ] T021 `growth-entry.js` — post-transition shape scaffolding.
- [ ] T022 `manifest.js` — add `migrate.duplicates`; `index.js` migrate branch wiring.

## Phase 4 — CLI & polish
- [ ] T023 CLI flags: `--phase --stack --design --dup <path>=<action>` (+ non-interactive guard).
- [ ] T024 Wire migrate suite into `npm test`.
- [ ] T025 [P] Run quickstart end-to-end on a non-empty scratch repo.
- [ ] T026 [P] `npm run lint` green; no runtime dependency added; `sync:package`.
- [ ] T027 Update `specs/_INDEX.md`; run `021-spec:verify` clean before `Done`.
