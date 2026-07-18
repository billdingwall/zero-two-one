---
status: Done
feature: Safe Install & Merge Engine
release: mvp-3
branch: 001-safe-install-engine
created: 2026-07-15
---

# Feature Spec: Safe Install & Merge Engine

*The foundational feature of [mvp-3 — Safe Install & Manifest](../../requirements/_releases/mvp-3.md). Turns the legacy scaffold-only CLI into a non-destructive, idempotent install engine that never overwrites a user's work and records exactly what it did in a manifest. Grounded in [TDD §6 (File Ownership & Merge Rules)](../../requirements/03-TDD.md) and TDD §7 (Install Manifest).*

## Why

Today's `bin/init.js` scaffolds files with no notion of ownership: re-running it, or running it on a repo that already has content, risks clobbering user-authored docs and hand-edited framework files. Every later release (adapters, lifecycle commands, publish) depends on install being **safe to run and re-run on a real repo**. This feature makes install trustworthy: predictable file classes, a dry-run preview, idempotent re-runs, and a manifest that is the durable record of the install.

## Users & Context

- **Primary user:** a developer adopting the framework, running `npx zero-two-one-init` (or the `/021-init` walkthrough) in a fresh or already-populated repository.
- **Secondary user:** the framework maintainer, who dogfoods the same engine to regenerate this repo's own `.zero-two-one.json` (`mode: source`).
- **Trigger:** an explicit install / re-run / `--upgrade` invocation. This feature covers the **scaffold** path (fresh or partially-present target); migrate-mode is a sibling spec (see Out of Scope).

## Clarifications

### Session 2026-07-15

- **Q: On re-run/`--upgrade`, how should the engine behave when it finds a hand-modified framework-owned file (hash mismatch)?**
  A: **Report & continue, exit 0.** Apply all non-conflicting actions, print the conflicting paths as informational, and exit 0 — a user-customized framework file is a normal, expected state on re-run, not a failure.
- **Q: During the additive `package.json` scripts merge, if a script key already exists with a different value, what wins?**
  A: **Preserve the user's value (skip).** Only script keys that are absent are added; an existing key is never overwritten, matching the never-touch-user-content ethos.
- **Q: On a fresh scaffold install (no migrate interview), what does the manifest get written with?**
  A: `phase: planning` and `design: none` as defaults (overridable by `--phase`/`--design`). **`stack` is implicit** — it is not hard-defaulted to `claude`; it is determined by the AI assistant driving the scaffold. Init is assistant-led (TDD §1), the assistant is required, and its stack context cascades into the scaffold and the manifest.
- **Q: What is the scope of `--force`?**
  A: **User-owned paths only.** `--force <path>` overwrites only user-owned instantiated files; framework-file conflicts are resolved by `--upgrade`/re-run logic, never by `--force`.

### Session 2026-07-15 — round 2

- **Q: On a re-run where framework files exist but `.zero-two-one.json` is absent, what should the engine do?**
  A: **Adopt current state** — hash existing files into a fresh manifest, skip everything present, create only what's missing (never overwrite). *Additionally:* provide an assistant-led command/skill the user can run to have the agent **review the adopted files, propose updates, and adjust them to fit the framework** — a guided reconcile pass (related to the §13 Workflow-Manager reporter). That command is a **sibling feature**, not part of this engine; the engine's job is only to leave a clean adopted manifest for it to work against.
- **Q: Which file classes are recorded in the manifest `files{}` inventory?**
  A: **Framework-owned only** — the sole class whose conflict detection needs a baseline. User-owned are never touched, merged are handled by contribution-tracking (below), generated churn; none are hashed into `files{}`.
- **Q: For a merged entry the framework added but the user later deleted, what does a re-run do?**
  A: **Respect the removal** — do not re-add it. This requires the manifest to **record the entries the framework contributed** to each merged file, so the engine distinguishes "never added" (add it) from "added then removed" (leave it out). *(Additive extension to the TDD §7 schema — flagged as a TDD follow-up.)*
- **Q: How does `installedAt` behave across re-runs/`--upgrade`?**
  A: **Preserve `installedAt`** (first-install date, untouched) and **write/refresh an `updatedAt`** field on every re-run/upgrade. *(Additive `updatedAt` field — TDD §7 follow-up.)*

### Session 2026-07-15 — round 3

- **Q: On `--upgrade`, what happens to a framework file that a newer package version no longer ships (orphan)?**
  A: **Always keep, just report.** Orphaned framework files are never deleted on upgrade; they are listed for manual removal. (Documented uninstall remains the path that removes hash-matching files.)
- **Q: How is file content hashed given cross-platform line-ending differences?**
  A: **Normalize line endings to LF before hashing.** A Windows/`autocrlf` checkout must not flag every framework file as modified. Trade-off accepted: a CRLF-only change is not treated as a modification.
- **Q: What happens when `--force <path>` targets a framework-owned (non-user-owned) path?**
  A: **Reject with an error** explaining `--force` is for user-owned files and pointing to `--upgrade` for framework files.

### Session 2026-07-15 — round 4

- **Q: If the target repo has no `package.json` (nowhere for the lifecycle npm scripts to live), what does init do?**
  A: **Create a minimal `package.json`** containing the lifecycle scripts so the framework works out of the box. The created file is a merged-class artifact the user then owns.
- **Q: If the target is not a git repo, what happens to the `pre-commit` hook?**
  A: **Install the hook file anyway and warn it is inactive until `git init`.** Everything is in place for when the directory becomes a git repo.
- **Q: How does the engine decide it is running against the framework's own repo (`mode: source`)?**
  A: **Heuristic auto-detect** from the repo signature (`scripts/sync-to-package.js` + `package/` present). Zero-config for the maintainer dogfooding case.

## User Scenarios (Acceptance)

Written as Given / When / Then so each maps to a fixture test.

1. **Fresh install** — *Given* an empty repo, *when* the user runs init, *then* the full framework surface is created and a `.zero-two-one.json` manifest is written with a populated `files{}` sha256 inventory.
2. **Idempotent re-run** — *Given* a repo already installed and unmodified, *when* the user re-runs init, *then* nothing changes on disk and every file is reported as skipped.
3. **Conflict on a modified framework file** — *Given* the user edited a framework-owned file (e.g. `scripts/run-qa.sh`), *when* the user re-runs init, *then* the engine reports a conflict for that path and does **not** overwrite it.
4. **User docs are sacrosanct** — *Given* a repo with an authored `CLAUDE.md` and `requirements/01-PRD.md`, *when* the user installs or re-runs, *then* those files are never modified (only `--force <path>` can overwrite them).
5. **Dry run** — *Given* any target repo, *when* the user runs init with `--dry-run`, *then* a classified action plan (create / skip / merge / conflict per file) is printed and the working tree is unchanged.
6. **Upgrade** — *Given* an installed repo whose framework files still match their install hashes, *when* the user runs init with `--upgrade`, *then* framework-owned surfaces are refreshed, user-owned docs are untouched, any hand-modified framework file is reported as a conflict rather than refreshed, and a framework file no longer shipped is kept and reported as an orphan.
7. **Source-repo dogfood** — *Given* this framework repo (`mode: source`), *when* the engine regenerates its manifest, *then* `.zero-two-one.json` carries a full `files{}` hash inventory (no `files: {}` stub) and `mode: source`.

## Functional Requirements

- **FR-001 — File classification.** Every path the installer touches is classified into one of the four ownership classes in TDD §6: *framework-owned*, *user-owned (instantiated)*, *merged*, *generated*. The install surface **excludes `bin/`** (the CLI ships in the npm package, never copied into a target) and the framework's own **`specs/`** (each project authors its own); neither is written to a target repo *(clarified via analyze A3)*.
- **FR-002 — Framework-owned install/re-run.** Framework-owned paths (`scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/`, `.claude/commands/`) are copied on fresh install; on re-run they are overwritten **only if unmodified versus the manifest hash**, otherwise reported as a conflict and left in place.
- **FR-003 — User-owned protection.** User-owned instantiated files (`CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`, `requirements/*.md`) are **create-if-missing** (from templates, per FR-017); never modified on install or re-run.
- **FR-004 — `--force` override.** `--force <path>` is the **only** mechanism that overwrites a user-owned file. A `--force` targeting a **framework-owned (non-user-owned) path is rejected with an error** pointing to `--upgrade` *(clarified 2026-07-15)*.
- **FR-005 — Merged files.** `.gitignore` and `package.json` (scripts) receive an **additive, idempotent** merge — existing entries preserved, framework entries added once. On a `package.json` script-key collision (key present with a different value), the **user's value is preserved** (skipped, never overwritten). A framework-contributed entry the user has **deleted is not re-added**: the manifest records which entries the framework contributed to each merged file, so a re-run distinguishes "never added" (add) from "added then removed" (leave out) *(clarified 2026-07-15)*.
- **FR-006 — Generated files.** `.ai/context/` is provisioned as an empty scaffold and otherwise left alone.
- **FR-007 — Dry run.** `--dry-run` prints the classified action plan and exits **without changing anything** on disk.
- **FR-008 — Idempotent re-run.** A re-run skips everything present-and-unmodified and completes only missing pieces.
- **FR-009 — Manifest write.** Init writes `.zero-two-one.json` to the target repo root with `version`, `installedAt`, `mode`, `phase`, `tools`, and a `files{}` map of `path → sha256-at-install`. The **`files{}` inventory covers framework-owned files only** — the sole class needing a conflict baseline *(clarified 2026-07-15)*. On a fresh scaffold, defaults are `phase: planning` and `design: none` (overridable by `--phase`/`--design`); **`tools.stack` is set implicitly from the AI assistant driving the scaffold**, not hard-defaulted, with `assistant`/`ssd` derived from it (TDD §7). `installedAt` is set once at first install and **preserved** thereafter; an **`updatedAt`** field is written/refreshed on every re-run and `--upgrade` *(clarified 2026-07-15)*.
- **FR-010 — Upgrade scope.** `--upgrade` refreshes **only** framework-owned surfaces whose hash still matches install; conflicts are listed, never force-refreshed; user-owned instantiated docs are never touched. A framework file no longer shipped by the package (orphan) is **kept and reported**, never deleted on upgrade *(clarified 2026-07-15)*.
- **FR-011 — Source-manifest regeneration.** The engine regenerates this repo's own manifest (`mode: source`) with a full hash inventory, replacing the r5 hand-authored `files: {}` stub. `mode: source` is **heuristically auto-detected** from the repo signature (`scripts/sync-to-package.js` + `package/` present) *(clarified 2026-07-15)*.
- **FR-012 — Zero runtime dependencies.** Hashing uses `node:crypto`; all file work uses built-in `fs`/`path`. No new packages.
- **FR-013 — Conflict run behavior.** When one or more framework-owned files conflict (hash mismatch) on re-run/`--upgrade`, the engine applies every non-conflicting action, prints the conflicting paths as informational, and **exits 0** — a conflict is an expected state, not a failure *(clarified 2026-07-15)*.
- **FR-014 — Missing-manifest adoption.** On a run where framework files are present but `.zero-two-one.json` is absent, the engine **adopts current state**: it hashes the existing framework-owned files into a fresh manifest, skips everything present, and creates only what is missing — never overwriting. It does **not** attempt to reconcile whether adopted files match the package (that guided review is a sibling command, see Out of Scope) *(clarified 2026-07-15)*.
- **FR-015 — Hash normalization.** File content is **normalized to LF line endings before hashing**, so a Windows/`autocrlf` checkout does not report every framework file as modified. A CRLF-only difference is therefore not treated as a modification *(clarified 2026-07-15)*.
- **FR-016 — Prerequisite handling.** Missing prerequisites are reported and handled, never fatal: if the target has **no `package.json`**, init **creates a minimal one** holding the lifecycle scripts (merged class thereafter); if the target is **not a git repo**, init still **installs `hooks/pre-commit`** and warns it is inactive until `git init` *(clarified 2026-07-15)*.
- **FR-017 — Template instantiation.** The create-if-missing user-owned docs (FR-003) are produced by instantiating the corresponding `templates/*-Template.md` under the default **`claude`-stack mapping** (`CLAUDE-Template.md → CLAUDE.md`, `PRODUCT-Template.md → PRODUCT.md`, and `CODE`/`DESIGN`/`README`/`requirements/*` from their templates per TDD §5 "Template → install mapping"). **Stack-aware rendering** — the neutral `ASSISTANT-Template.md` transformed to per-stack output names/formats (`AGENTS.md`, `.kiro/steering/*`) per TDD §9.1–9.2 — is **deferred to mvp-4** (see Out of Scope) *(clarified via analyze A1)*. **Superseded by [spec 006](../006-source-layer-renderer/spec.md) (delivered mvp-4):** `CLAUDE-Template.md` was dropped; the entrypoint now renders from `ASSISTANT-Template.md` via `scripts/init/render.js`, and the install surface is stack-parameterized.

## Key Entities

- **Install manifest (`.zero-two-one.json`)** — user-visible install state at the target root. Schema per TDD §7 (`version`, `installedAt`, `mode`, `phase`, `tools{stack,assistant,ssd,design}`, `files{}`), plus two additive fields this spec introduces (now synced into TDD §7): **`updatedAt`** (last re-run/upgrade timestamp) and a **merged-contribution record** naming the entries the framework added to each merged file. `files{}` holds framework-owned hashes only. Basis for idempotent re-run, `--upgrade`, and a future documented uninstall.
- **File class** — the ownership category (framework-owned / user-owned / merged / generated) that determines install, re-run, and upgrade behavior for a path.
- **Action plan** — the per-file list of resolved actions (create / skip / merge / conflict / force / orphan / adopt — see [data-model.md](data-model.md) §3) that `--dry-run` prints and every run computes before acting.

## Acceptance Criteria

- A fresh install into an empty fixture repo creates the full framework surface **and** a manifest whose `files{}` inventory is populated with sha256 hashes.
- A fresh install **instantiates the user-owned docs** (`CLAUDE.md`, `requirements/*.md`, …) from their `templates/*-Template.md` under the default `claude` mapping; `bin/` and the framework's `specs/` are **not** written into the target.
- A `package.json` with a user-defined script key of the same name is **not overwritten** by the scripts merge (user value preserved).
- `.ai/context/` is **provisioned as an empty scaffold** and otherwise left untouched.
- A re-run on an unmodified install makes **zero** disk changes and reports every path as skipped (idempotent).
- A re-run where a framework-owned file was hand-edited **reports a conflict**, leaves that file unchanged, applies any other pending actions, and **exits 0**.
- User-owned docs (`CLAUDE.md`, `requirements/*.md`) are **never** modified by install or re-run absent `--force`.
- `--dry-run` prints a classified action plan and leaves the working tree byte-for-byte unchanged.
- `--upgrade` refreshes an outdated-but-unmodified framework file, reports a hand-modified one as a conflict, and leaves user docs untouched.
- The framework's own `.zero-two-one.json` is **engine-regenerated** with `mode: source` and a full hash inventory (no `files: {}` stub).
- A run with framework files present but **no manifest** adopts current state — creates only missing files, overwrites nothing, and writes a fresh manifest hashing the existing framework-owned files.
- A merged entry the framework added and the user then **deleted** is **not re-added** on re-run (removal respected via the contribution record).
- Re-run/`--upgrade` **preserves `installedAt`** and refreshes **`updatedAt`**.
- On `--upgrade`, a framework file no longer shipped is **kept and reported**, never deleted.
- A CRLF-normalized checkout of an unmodified install produces **no conflicts** (LF-normalized hashing).
- `--force` on a framework-owned path **errors** rather than overwriting.
- A target with **no `package.json`** gets a minimal one created holding the lifecycle scripts.
- A **non-git** target still gets `hooks/pre-commit` installed, with a warning it is inactive until `git init`.
- `npm run lint` passes and no runtime dependency is added to `package.json`.

## Out of Scope (sibling mvp-3 specs)

- **Migrate-mode** detection heuristics + phase interview + existing-doc import + duplicate resolution (TDD §8) — sibling spec.
- **Conflict-aware `pre-commit` chaining** (husky/lefthook detection) — sibling spec. *This spec installs the plain `hooks/pre-commit` file as an ordinary framework-owned copy; it does not detect or chain third-party hook managers.*
- **Manifest-as-QA-contract** — routing `run-qa.sh` / `pre-commit` through a single `scripts/speckit/lib.js` parser (TDD §7 QA contract) — sibling spec.
- **Workflow-Manager read-only reporter** (`021-doctor`-style drift report, TDD §13) — sibling spec.
- **Assistant-led "review & fit to framework" command** — a guided reconcile pass where the agent reviews adopted/existing files, proposes updates, and adjusts them to fit the framework (surfaced by the FR-014 missing-manifest case; related to the §13 reporter) — sibling spec.
- **Stack/design adapters & stack-aware template rendering** (`antigravity`, `kiro`, `material-3`; the neutral `ASSISTANT-Template.md` → per-stack output names/formats, TDD §9.1–9.2) — mvp-4. *This spec instantiates user docs under the default `claude` mapping only (FR-017).*

## Dependencies & References

- TDD §6 (File Ownership & Merge Rules), §7 (Install Manifest), §5 (Package Manifest — what ships).
- [init-and-migration.md](../../workflow/specific-workflows/init-and-migration.md) workflow.
- Existing `bin/init.js` (legacy scaffolder — the behavior this feature hardens) and `scripts/sync-to-package.js` (the sync/`--check` drift contract that pairs with `--upgrade`).

## Open Questions

*None blocking. The programmatic-API surface (`require('zero-two-one/speckit')`) is explicitly deferred to mvp-4 (TDD §14) and is not part of this spec.*
