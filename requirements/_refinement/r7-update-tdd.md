# r7 Update Plan: 03-TDD.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r7
**Audit items addressed:** groups A4/A5 (init contract), B1/B4 (main, prototype shipping), C2 (status `--json`), D2 (sync `--check`), G2 (manifest as QA contract), G3 (Workflow-Manager read-only first), G4 (API decision), G5 (publish hardening)
**Target doc:** [../03-TDD.md](../03-TDD.md)
**References:** [_notes/full-repo-audit.md](../_notes/full-repo-audit.md) §2, §4–§5 · [r7-review.md](r7-review.md)

## Intent

Amend the technical contracts so code and spec agree before any publish: the interim init hardening becomes documented behavior (not just Init v2 design), the package manifest stops claiming surfaces we no longer ship, and the approved architectural improvements (QA-contract manifest reads, reporter-first Workflow Manager, CI-only publish) are written into the sections that govern them.

## Proposed Edits

### 1. §1/§4 — interim init hardening + `.claude` install (A1–A4)

- §1 CLI Engine: note the **v1 interim guards** (arg validation with `--help`/`--version`, reject unknown flags and `-`-prefixed targets; create-if-missing for user-owned docs; `pre-commit` → `pre-commit.backup` before install) as shipped behavior ahead of the full mvp-3 engine.
- §4: TDD says init copies `.claude/commands/` merge-safe — code now implements it (A4). No text change beyond marking it implemented (was design-only).

### 2. §5 Package Manifest — prototype + dummies + LICENSE (B2–B4)

- Remove `prototype/` from the "Ships in the package" table (§4 resolution: generated on demand by `021-prototype`, TDD §12).
- Add `LICENSE` to the shipped files list.
- Add a manifest rule: `.ai/` ships **only** the empty `context/` scaffold (`.gitkeep`) — generated bundles never sync into `package/` (fixes the `001-dummy.*` class).
- Note `sync-to-package.js --check` (drift mode, D2) as part of the manifest's enforcement story.

### 3. §7 Install Manifest — status tooling contract (C2, G2)

- Document `workflow-status.js --json` (machine-readable phase output).
- Add the **QA-contract rule** (G2): once the mvp-3 manifest write lands, `run-qa.sh` and `hooks/pre-commit` read phase/stack from `.zero-two-one.json` via a single parser in `scripts/speckit/lib.js` — no consumer scrapes human output.

### 4. §13 Workflow Manager — reporter-first delivery (G3)

- Amend: ships **read-only first** — drift *detection* with proposed diffs (`021-doctor`-style report); auto-apply of working-tree edits is a later increment. Guardrails unchanged (never blocks, never auto-commits).

### 5. New §14 (or §3 note) — publish pipeline (G5, B1)

- Publish is **CI-only, tag-triggered, `npm publish --provenance`** (mvp-6), with a pre-publish gate failing on: dangling `main`, missing LICENSE, `.ai/context` dummy artifacts, sync drift.
- Record the `main` decision: **removed** from both manifests; a programmatic `exports` surface (e.g. `zero-two-one/speckit` exposing `lib.js`) is an explicit **mvp-4 decision item** (G4) — *assumption: defer to mvp-4; confirm at approval*.

### 6. Changelog

- Add the r7 entry.

## Cascade

- Roadmap/backlog re-scoping ([r7-update-roadmap.md](r7-update-roadmap.md), [r7-update-backlog.md](r7-update-backlog.md)); code/config execution in [r7-update-workflows.md](r7-update-workflows.md).
- `templates/03-TDD-Template.md`: no skeleton change needed (§13/§14 are project-specific sections) — verify during apply.
