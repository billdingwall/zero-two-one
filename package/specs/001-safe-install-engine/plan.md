# Implementation Plan: Safe Install & Merge Engine

*The HOW for [spec.md](spec.md). Implementation detail lives here, not in the spec.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (matches the existing `bin/init.js`, `scripts/*.js`) |
| **Dependencies** | **None** — built-ins only: `node:fs`, `node:path`, `node:crypto`, `node:child_process` (git reads) |
| **Entry point** | `bin/init.js` (CLI: `zero-two-one-init`), refactored into a library + thin CLI wrapper |
| **Testing** | `node:test` + `node:assert`, fixture repos in an OS temp dir |
| **Target platform** | Cross-platform (macOS/Linux/Windows); LF-normalized hashing for parity |
| **Scale** | A single repo's file surface (tens–hundreds of files); no perf constraint |
| **Source of truth** | TDD §5 (what ships), §6 (ownership/merge), §7 (manifest), §1 (assistant-led init) |

## Constraints check (must hold at every step)

- **Never overwrite user work** without `--force` — the load-bearing invariant (spec FR-003/FR-004).
- **Zero runtime dependencies** — enforced by `npm run lint` staying dependency-free (TDD §7/§8).
- **Idempotent** — a re-run on an unmodified install changes nothing (FR-008).
- **Non-fatal conflicts** — conflicts report and exit 0; they are expected state (FR-013).
- **Out of scope stays out** — no migrate interview, no QA-contract refactor, no Workflow-Manager reporter, no husky/lefthook chaining (see spec Out of Scope).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The manifest schema, file-class model, action-plan and merged-contribution structures |
| [contracts/manifest.schema.json](contracts/manifest.schema.json) | JSON Schema for `.zero-two-one.json` (incl. the clarified additive fields) |
| [contracts/cli-contract.md](contracts/cli-contract.md) | CLI flags, exit codes, and per-flag behavior contract |
| [research.md](research.md) | Decisions & rationale (rolls up the 4 clarify sessions) and rejected alternatives |
| [quickstart.md](quickstart.md) | Manual validation walkthrough mapped to the acceptance criteria |

## Approach

Refactor `bin/init.js` from a flat scaffolder into a **classify → plan → apply** pipeline. Every run first builds a full **action plan** (one resolved action per path), then either prints it (`--dry-run`) or applies it. The manifest is both an output (written at the end) and an input (read at the start to detect modifications on re-run/upgrade).

```
init(targetRoot, opts)
  1. loadManifest(targetRoot)            // null on fresh install
  2. plan = classifyAll(sources, manifest, opts)   // create | skip | merge | conflict | force
  3. if opts.dryRun: printPlan(plan); return
  4. applyPlan(plan)                      // fs writes, additive merges
  5. writeManifest(targetRoot, freshHashes)
```

Zero runtime dependencies throughout: `node:fs`, `node:path`, `node:crypto` (sha256), `node:child_process` only for git reads if needed. This is a normative constraint (TDD §7/§8) and is checked by `npm run lint` staying dependency-free.

## File classes → behavior (TDD §6)

| Class | Source paths | Fresh | Re-run (hash match) | Re-run (hash mismatch) | `--upgrade` |
|---|---|---|---|---|---|
| Framework-owned | `scripts/ hooks/ skills/ workflow/ templates/ .github/ .claude/commands/` | copy | skip | **conflict** (no write) | refresh if match; else conflict |
| User-owned | `CLAUDE.md CODE.md PRODUCT.md DESIGN.md README.md requirements/*.md` | create-if-missing **from `templates/*-Template.md`** (default `claude` mapping) | skip | skip | skip (never touch) |
| Merged | `.gitignore` `package.json` (scripts) | additive merge | idempotent no-op | additive merge | idempotent |
| Generated | `.ai/context/` | provision empty | leave | leave | leave |

**Install-surface boundary (analyze A3):** `bin/` (the CLI, shipped in the npm package) and the framework's own `specs/` (each project authors its own) are **not** classified and **not** written into a target repo — they are excluded from the walk. `templates/` is copied as framework-owned reference *and* is the render source for the create-if-missing user docs (FR-017); per-stack rendering of the neutral `ASSISTANT-Template` is deferred to mvp-4.

`--force <path>` promotes a single user-owned path to an overwrite for this run only; it is never implied by `--upgrade`. A `--force` naming a framework-owned path is **rejected with an error** (clarified) that points to `--upgrade`.

**Upgrade orphans (clarified):** on `--upgrade`, a framework-owned file recorded in the manifest but no longer present in the package is **kept and listed as an orphan** for manual removal — never auto-deleted. (Deleting hash-matching files stays the job of the documented uninstall path, TDD §7.)

**Conflict run behavior (clarified):** a framework-file hash mismatch is not fatal. `applyPlan()` applies every non-conflicting action, collects conflicts, prints them as informational, and the process **exits 0**. Conflicts are surfaced in the plan/report, never by a non-zero exit.

**`package.json` merge collision (clarified):** the scripts merge only adds absent keys. If a script key already exists with a different value, the user's value is preserved (skipped) — never overwritten.

## Manifest (`.zero-two-one.json`, TDD §7)

- **Hashing:** `sha256` via `node:crypto` over content **normalized to LF line endings** (clarified) for every installed **framework-owned** file; stored as `files{ "<relpath>": "<hex>" }`. Framework-owned only (clarified) — user-owned/merged/generated are not hashed into `files{}`. LF-normalization means a Windows/`autocrlf` checkout doesn't spuriously conflict; a CRLF-only change is not a modification.
- **`updatedAt` (clarified):** `installedAt` is written once at first install and preserved; `updatedAt` is set to now on every re-run and `--upgrade`. Both are additive to the TDD §7 schema (synced to TDD §7).
- **Merged-contribution record (clarified):** the manifest records which entries the framework contributed to each merged file (e.g. `merged: { ".gitignore": ["<line>", …], "package.json.scripts": ["<key>", …] }`). The merge adds a framework entry only if it is absent **and** not already recorded as contributed — so a user deletion is respected rather than re-added. Additive to TDD §7 (synced).
- **Missing-manifest adoption (FR-014, clarified):** when no manifest is found but framework files exist, `loadManifest()` returns null and the engine runs an *adopt* path — hash the present framework-owned files into a fresh manifest, mark them skip, create only missing files, overwrite nothing. The engine does not evaluate whether adopted files match the package (that guided reconcile is a sibling assistant-led command).
- **Modification detection:** on re-run/upgrade, a path is *unmodified* iff its current on-disk hash equals the manifest hash. Missing-from-manifest ⇒ treat as fresh create.
- **`mode`:** `scaffold` for a normal target; `source` when the target root is the framework repo itself (detected by presence of `scripts/sync-to-package.js` + `package/`). Migrate is out of scope here.
- **`phase` / `tools` (clarified):** fresh scaffold defaults to `phase: planning` and `design: none` (overridable by `--phase`/`--design`). **`tools.stack` is not hard-defaulted** — it is supplied by the AI assistant driving the assistant-led init (TDD §1); `assistant`/`ssd` derive from it. This spec does not change the phase enum (`planning | mvp | growth`) or run the migrate phase interview (sibling spec). The engine accepts the stack as an input parameter/flag from its caller; how the assistant determines and cascades its own stack is the adapter concern (mvp-4), out of scope here.
- **Source dogfood (FR-011):** running the engine with `mode: source` on this repo regenerates `.zero-two-one.json` with a real inventory, replacing the hand-authored `files: {}` stub. Verify the resulting `phase`/`tools` match the current hand-authored values so the dogfood is a no-op except for the inventory.

## Prerequisites (clarified)

Missing prerequisites are reported in the action plan and handled, never fatal:

- **No `package.json`:** create a minimal one carrying the lifecycle scripts, then run the normal scripts merge against it. It becomes a merged-class artifact the user owns.
- **Not a git repo:** still install `hooks/pre-commit`; emit a warning that it stays inactive until `git init`. (Hook path wiring for husky/lefthook is the sibling pre-commit-chaining spec.)
- **`mode: source` detection:** heuristic — `scripts/sync-to-package.js` + `package/` both present ⇒ the framework's own repo; regenerate its manifest. No flag required.

## CLI surface

- `zero-two-one-init` (default): classify → apply → write manifest.
- `--dry-run`: classify → print plan → exit 0, no writes.
- `--force <path>` (repeatable): overwrite the named user-owned path this run.
- `--upgrade`: refresh framework-owned surfaces whose hash matches install; list conflicts.

Flag parsing stays hand-rolled (no `commander`/`yargs`) to hold the zero-dependency line.

## Testing strategy

Node's built-in `node:test` + `node:assert` (no test framework dependency), driving the engine against **fixture repos** created in a temp dir:

- `fresh-empty/` → asserts full surface created + manifest `files{}` populated.
- `installed-clean/` → re-run asserts zero diffs (idempotent) + all-skipped report.
- `installed-modified/` → hand-edit a framework file, re-run asserts conflict + file unchanged.
- `has-user-docs/` → asserts `CLAUDE.md` / `requirements/*.md` untouched without `--force`; touched with it.
- `dry-run` → asserts plan printed + working tree unchanged (snapshot hash of the whole tree before/after).
- `upgrade` → asserts unmodified framework file refreshed, modified one conflicted, user docs untouched.

The **fixture acceptance test is the definition of done** for the merge engine (mvp-3 exit gate, r7). Wire it into `npm test` / `npm run lint` surfaces so CI enforces it.

## Risks & mitigations

- **Partial-write on crash mid-apply** → apply is ordered (create/merge before manifest write); a failed run leaves a stale/absent manifest that the next run reconciles idempotently. Acceptable for v1; atomic staging is a later hardening.
- **Hash drift between `sync:package` and install** → reuse the same relpath normalization the sync/`--check` contract uses so a source-repo install and the sync drift check agree.
- **Scope creep into migrate-mode** → guarded by the Out of Scope list in the spec; conflict/merge paths here must not start interviewing the user (that's the sibling spec).

## Work breakdown

See [tasks.md](tasks.md).
