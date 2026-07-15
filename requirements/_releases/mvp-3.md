# Release: mvp-3 — Safe Install & Manifest

- **Type:** MVP release
- **Status:** In progress (current)
- **Lifecycle Phase:** MVP Build (Phase 2)
- **Branch:** feature branches per spec (`NNN-feature-name`) through the refinement gate
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Turn the legacy scaffold-only CLI into the safe, non-destructive Init v2 engine (TDD §§6–8), built adapter-shaped (TDD §9). This is the foundation every later release depends on — and the prerequisite for publishing (mvp-6).

## Scope

- [ ] Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing for user-owned files).
- [ ] `--dry-run` classified action plan; `--force <path>` overwrite opt-in.
- [ ] Idempotent re-run (skip present-and-unmodified; complete missing pieces only).
- [ ] Conflict-aware `pre-commit` install (plain-hook chaining; husky/lefthook detection).
- [ ] `.zero-two-one.json` manifest write with full file-hash inventory + `--upgrade` (scoped to templates/skills/scripts/hooks + command surfaces, TDD §7).
- [ ] Migrate-mode detection + lifecycle-phase interview (`--phase` non-interactive); Growth entry scaffolds post-transition shape (incl. `_releases/`).
- [ ] Existing-doc import + duplicate resolution (archive / update-to-fit / leave-alongside), decisions recorded in the manifest.
- [ ] Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter, skip duplicate setup.
- [ ] Migration acceptance test on a non-empty fixture repo (zero user-file overwrites).
- [ ] Regenerate the framework's own `.zero-two-one.json` (`mode: source`, full hash inventory) — end-to-end manifest dogfooding, replacing the r5 hand-authored `files: {}` stub (r5 Q3).
- [ ] **Automated tests for `bin/init.js` + `hooks/pre-commit`** on a non-empty fixture repo (pulled forward from mvp-6, r7) — the migration acceptance test is the merge engine's definition of done.
- [ ] **Manifest as QA contract** (r7): `run-qa.sh` + `hooks/pre-commit` read phase/stack from `.zero-two-one.json` via a single parser in `scripts/speckit/lib.js` — no output scraping.
- [ ] **Workflow Manager — read-only reporter** (`021-doctor`-style drift report; no auto-apply) (TDD §13, r7).

## Exit Gate

Migration acceptance test **green and enforced as the definition of done** (r7); a working repo can be initialized with zero user-file overwrites and a correct manifest; the framework's own manifest is engine-regenerated (`mode: source`); `run-qa.sh`/gate read phase from the manifest via `lib.js`; the Workflow-Manager drift report runs read-only.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-15 (r7):** Pulled `bin/init.js` + `hooks/pre-commit` automated tests forward from mvp-6 (acceptance test = definition of done); added manifest-as-QA-contract (single `lib.js` parser) and the read-only Workflow-Manager reporter; exit gate tightened. Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New release — Init v2 split out of the former monolithic mvp-3 as the dependency foundation. Manifest full-inventory write lands here (the r5 dogfood manifest is hand-authored until then).
