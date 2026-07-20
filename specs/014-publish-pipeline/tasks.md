# Tasks: CI Publish Pipeline & Pre-Publish Gate

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/publish-pipeline.md](contracts/publish-pipeline.md), [research.md](research.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. The zero-dep `scripts/prepublish-gate.js` is the core; the workflow, README split, and sync change ride on it.*

**Proposed layout:** new `scripts/prepublish-gate.js`, `.github/workflows/publish.yml`, `package/README.md`, `test/publish/gate.test.js`; changed `scripts/sync-to-package.js` (README + gate exclusions), root `package.json` (+`prepublish:check`), `scripts/_INDEX.md`.

## Phase 1 — Setup & guardrails
- [x] T001 **Pin the seams (no task changes these).** (a) Artifact/tarball inspection = `cd package && npm pack --json --dry-run` → `[0].files` (research R2); today 108 files, only `.ai/context/.gitkeep`, no `specs/`/`test/` → the gate is a **regression guard** (clean tree passes). (b) `check-links.js` is a **script not a module** → reuse via subprocess, non-zero ⇒ broken-links fail (R3). (c) README split = remove `README.md` from `filesToCopy` **and** add to `preserveInPackage` in `sync-to-package.js` (R4). (d) `prepublish-gate.js` must join `scriptExclusions` or it ships and flags itself (R5). (e) Auth = **trusted publishing (OIDC), no `NPM_TOKEN`**; npmjs setup + first-publish path is the maintainer's (R1). (f) Gate is **parameterized** (`root`, `packageDir`) for fixture tests (R6).
- [x] T002 [P] **Test fixtures** — a helper that builds a minimal fixture: a `packageDir` (`package.json` + a seeded file set incl. `README.md`, `LICENSE`, `.ai/context/.gitkeep`) and a `root` (`LICENSE`, a clean Markdown file), plus mutators to inject each violation (dangling `main`, remove `LICENSE`, add `.ai/context/x.md`, add `specs/099-x/spec.md`, empty `README.md`, add a broken-link `.md`). `npm pack` runs in the fixture `packageDir`.

## Phase 2 — Tests first (author before Phase 3)
- [x] T003 [P] **Clean passes** (contract): `prepublishGate` over a clean fixture → `{ ok: true, failures: [] }` (Scenario 1). `.ai/context/.gitkeep` alone must **not** trip check (c).
- [x] T004 [P] **Dangling `main` fails** (check a): a fixture manifest with `main: './nope.js'` not in the tarball → failure naming it.
- [x] T005 [P] **Missing `LICENSE` fails** (check b): remove `LICENSE` from the fixture → failure (Scenario 4).
- [x] T006 [P] **`.ai/context` bundle fails** (check c): add `.ai/context/013-x.md` to the fixture tarball → failure; `.gitkeep` still passes (Scenario 4).
- [x] T007 [P] **Broken links fail** (check d): point `root` at a fixture with an unresolved Markdown link → the subprocess check fails the gate (Scenario 4).
- [x] T008 [P] **Spec/dev leak fails** (check e): add `specs/099-x/spec.md` (and a dev file) to the fixture tarball → failure (Scenario 2). Proves **tarball-aware** — files live only in the fixture `package/` (FR-004).
- [x] T009 [P] **Trivial README fails** (check f): empty/≤200B `README.md` in the fixture → failure; a real README passes (Scenario 6).
- [x] T010 [P] **Dispatch/report shape**: `ok` maps to exit 0/1; the report lists a `✗ <check>: <reason>` line per failure (contract exit semantics).

## Phase 3 — Implementation
- [x] T011 `scripts/prepublish-gate.js`: implement `prepublishGate({ root, packageDir })` → `{ ok, failures }` with checks (a)–(f) per data-model; derive `paths` from `npm pack --json --dry-run` in `packageDir` (**`--dry-run` writes no tgz** — no cleanup, *analyze A3*); **strip a leading `./` from each manifest `main` before comparing to bare tarball paths** (*analyze A2* — paths have no `./` prefix); leak denylist (e) must **not** list shipped config `.gitignore`/`README.md`/`LICENSE` (*analyze A4*); reuse `check-links.js` via `spawnSync('node', ['scripts/check-links.js'], { cwd: root })` (repo-wide, a superset of shipped md, *analyze A5*); `021 doctor`-styled report; `main` exits `failures.length ? 1 : 0`. Export `prepublishGate` for tests. `child_process`/`fs`/`path` only (FR-003/004/005/008).
- [x] T012 `scripts/sync-to-package.js`: remove `'README.md'` from `filesToCopy`; add `'README.md'` to `preserveInPackage`; add `'prepublish-gate.js'` to `scriptExclusions` (FR-006, R4/R5).
- [x] T013 `package/README.md`: author the **install-focused** shipped README — what Zero Two One is → prerequisites (Node ≥18, git) → assistant-led install prompt + `npx zero-two-one-init [--stack …]` → key `npx 021 …` commands → link to `getting-started/` guides. Distinct from the contributor root `README.md` (FR-006). Non-trivial (passes check f).
- [x] T014 `.github/workflows/publish.yml`: the tag-triggered publish job per contract (`on: push: tags: ['v*.*.*']`; `id-token: write`; `sync --check` → `prepublish:check` → `npm publish --provenance` in `package/`). Header comment: trusted-publisher setup + first-publish path (FR-001/002, R1).
- [x] T015 root `package.json`: add `"prepublish:check": "node scripts/prepublish-gate.js"`; chain the gate into `publish:package` (`sync:package && prepublish:check && cd package && npm publish`) so the fallback is gated too (FR-005/007). `scripts/_INDEX.md`: add the `prepublish-gate.js` row.

## Phase 4 — Verify & polish
- [x] T016 Run the [quickstart](quickstart.md): `npm run prepublish:check` PASS on the clean tree; inject a `package/specs/099-x/spec.md` leak → FAIL naming it → clean up; `cd package && npm publish --dry-run` shows the shipped set. Reconcile any drift.
- [x] T017 [P] Wire `test/publish/gate.test.js` into `npm test`; full suite green; `npm run lint` (`node --check scripts/prepublish-gate.js`) green; **no runtime dependency** (FR-008); `npm run check:links` clean (incl. this spec's `tasks.md`).
- [x] T018 [P] **Packaging**: `npm run sync:package -- --check` green **after committing** the README exclusion + hand-authored `package/README.md` (`--check` is git-status-based, so it shows drift until committed, *analyze A1*); `cd package && npm pack --dry-run` still **108 files**; the tarball still lists `README.md` (now install-focused content); confirm `scripts/prepublish-gate.js` is **absent** from `package/scripts/`.
- [x] T019 Update `specs/_INDEX.md` status; run `npx 021 spec verify 014-publish-pipeline` clean before `Done`.

## Dependencies (summary)
- Setup: T001 (seams) precedes impl; T002 (fixtures) → all tests.
- Tests (T003–T010) authored before Phase 3; all `[P]`.
- Core order: **T011 (gate) → T015 (npm script)**; T012 (sync change) enables T018; T013 (README) needed for T012's `--check` to pass and for check (f); T014 (workflow) independent `[P]`.
- Verify (T016–T019) last; T019 gates `Done`.

## Parallelization notes
- Phase-2 tests are independent (`[P]`), each exercising one gate check against a fixture.
- T011 is the critical path. T013 (README) + T014 (workflow) can be authored alongside it. T012 must land with T013 (removing README from sync without the hand-authored `package/README.md` present would leave a stale copy — author first, then flip sync).

## Analyze pass — done (2026-07-20)
Six findings folded into [plan.md](plan.md) "Cross-artifact analysis" and annotated above: **A1** `sync --check` is git-status-based → T018 is post-commit; **A2** tarball paths have no `./` → normalize `main` (T011); **A3** `--dry-run` writes no tgz (T011); **A4** leak denylist must not list shipped `.gitignore`/`README`/`LICENSE` (T011/T008); **A5** `check-links` scans the repo (superset of shipped md); **A6** first publish can't self-bootstrap (maintainer note, T014). Verified against real `npm pack --json` + `sync-to-package.js`.
