# Data Model: Safe Install & Merge Engine

*Entities the engine reads and writes. Schema-level detail; behavior lives in [plan.md](plan.md), the contract in [contracts/](contracts/).*

## 1. Install manifest — `.zero-two-one.json`

The durable, user-visible record of an install. Written to the target repo root. Extends the TDD §7 schema with three additive members introduced by this spec (flagged as a TDD §7 follow-up).

| Field | Type | Notes |
|---|---|---|
| `version` | string | Package version at install/last upgrade. |
| `installedAt` | string (ISO-8601) | First install. **Written once, preserved** across re-runs/upgrades. |
| `updatedAt` | string (ISO-8601) | **Additive.** Refreshed on every re-run/`--upgrade`. Absent until the first re-run. |
| `mode` | enum | `scaffold` \| `migrate` \| `source`. This spec writes `scaffold` and `source` (migrate is a sibling). |
| `phase` | enum | `planning` \| `mvp` \| `growth`. Scaffold default `planning`. |
| `tools.stack` | enum | `claude` \| `antigravity` \| `kiro`. **Not defaulted** — supplied by the driving assistant. |
| `tools.assistant` | enum | Derived from `stack`. |
| `tools.ssd` | enum | `github-speckit` \| `kiro-specs`. Derived from `stack`. |
| `tools.design` | enum | `none` \| `material-3` \| `<system>`. Scaffold default `none`. |
| `files` | map<string,string> | `relpath → sha256(LF-normalized bytes)`. **Framework-owned files only.** |
| `merged` | map<string,string[]> | **Additive.** Entries the framework contributed per merged file — e.g. `".gitignore"` → lines, `"package.json.scripts"` → keys. Basis for respecting user deletions. |

Invariants:
- `files` never contains user-owned, merged, or generated paths.
- `installedAt` is monotonic-stable; only `updatedAt` moves.
- Hashes are over **LF-normalized** content (FR-015).

## 2. File class

The ownership category that drives every decision. Derived from the path, per TDD §6.

| Class | Membership | Hashed into `files`? | Overwrite policy |
|---|---|---|---|
| `framework-owned` | `scripts/ hooks/ skills/ workflow/ templates/ .github/ .claude/commands/` | **Yes** | copy on fresh; on re-run overwrite only if hash-match; else conflict |
| `user-owned` | `CLAUDE.md CODE.md PRODUCT.md DESIGN.md README.md requirements/*.md` | No | create-if-missing (instantiated from `templates/*-Template.md`, FR-017); only `--force <path>` overwrites |
| `merged` | `.gitignore` `package.json` | No (tracked in `merged`) | additive; user values/deletions respected |
| `generated` | `.ai/context/` | No | provision empty, then leave |

*Excluded from the install surface (not classified, not written to a target): `bin/` (ships in the npm package) and the framework's own `specs/` (each project authors its own) — analyze A3.*

## 3. Action

One resolved decision per path, produced by `classifyAll()` before anything is written.

| Field | Type | Notes |
|---|---|---|
| `path` | string | Target-relative path. |
| `class` | FileClass | See §2. |
| `action` | enum | `create` \| `skip` \| `merge` \| `conflict` \| `force` \| `orphan` \| `adopt`. |
| `reason` | string | Human-readable justification for the report/`--dry-run`. |

Action semantics:
- `create` — not present ⇒ write it.
- `skip` — present and unmodified (hash match) ⇒ no-op.
- `merge` — additive merge (merged class).
- `conflict` — framework file present but hash-mismatched ⇒ leave untouched, report, **exit 0**.
- `force` — user-owned path named in `--force` ⇒ overwrite.
- `orphan` — in manifest, absent from package (on `--upgrade`) ⇒ keep + report, never delete.
- `adopt` — missing-manifest path present on disk ⇒ hash into fresh manifest, no write.

## 4. Action plan

The full `Action[]` for a run, plus a summary. `--dry-run` prints it and exits without applying. Every run computes it first (plan-then-apply).

| Field | Type | Notes |
|---|---|---|
| `actions` | Action[] | One per path. |
| `conflicts` | Action[] | Subset with `action = conflict` — surfaced prominently. |
| `orphans` | Action[] | Subset with `action = orphan`. |
| `prereqs` | string[] | Missing-prerequisite notes (no `package.json` created, non-git hook inactive, …). |
