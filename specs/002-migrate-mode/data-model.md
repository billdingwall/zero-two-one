# Data Model: Migrate-Mode

*Entities migrate reads and writes. Extends the spec 001 manifest with a `migrate` block. Behavior lives in [plan.md](plan.md); the contract in [contracts/](contracts/).*

## 1. Manifest `migrate` block (additive)

Added to `.zero-two-one.json` when `mode: migrate`. Makes the adoption auditable and re-runs manifest-driven (FR-011). `mode`/`phase`/`tools` reuse the spec 001 schema.

| Field | Type | Notes |
|---|---|---|
| `migrate.duplicates` | map<string, enum> | `dest path → "archive" \| "update" \| "leave"` — the resolution applied per exact-dest collision. |
| `migrate.imported` | string[] | Paths cataloged in `imported-docs.md` (leave-alongside), keyed for idempotency. |
| `migrate.archived` | map<string,string> | `original dest → archive path` — so re-run skips re-archiving. |

On re-run, `mode`/`phase`/`stack` are read from the manifest (not re-detected, FR-001); recorded `duplicates`/`imported`/`archived` short-circuit their steps.

## 2. Detection signals (read-only)

Gathered before any decision (FR-002/FR-004); never mutate the repo.

| Signal | Evidence | Feeds |
|---|---|---|
| `hasNonFrameworkContent` | any file outside the framework surface (ignoring empty/`.git`) | mode (migrate vs scaffold) |
| `hasTests` | a test dir/glob (`test/`, `*.test.*`, `__tests__/`) | phase |
| `hasCI` | `.github/workflows/` or a known CI config | phase |
| `hasReleaseHistory` | **git tags** (`git tag` non-empty) | phase (growth requires all three) |
| `hasSubstantialCode` | ≥1 source file outside config/docs/tests dirs (analyze A2) | phase (mvp) |
| `stackSurfaces` | `.claude/` / `.agents/`\|`AGENTS.md` / `.kiro/` / `.specify/`\|`specs/` | stack |

Phase precedence (strict): `growth` iff `hasTests && hasCI && hasReleaseHistory`; else `hasSubstantialCode ⇒ mvp`; else `planning`.

## 3. Duplicate resolution

One decision per **exact framework-dest collision** (a user file where the framework would write).

| Action | Effect | Content invariant |
|---|---|---|
| `archive` | move user file → `requirements/_notes/archive/<path>` + pointer stub; instantiate fresh template at dest | preserved in archive |
| `update` (wrap) | rewrite dest to template structure; embed user's original under `## Imported content` | embedded verbatim |
| `leave` | keep user file at dest; catalog in `imported-docs.md`; for `CLAUDE`/`CODE`/`PRODUCT`/`DESIGN` also write `<name>.zero-two-one.md` | untouched |

Resolution source (precedence): `--dup <path>=<action>` → interactive prompt (TTY) → safe default `leave`.

## 4. Imported-docs catalog

`requirements/_notes/imported-docs.md` — a table the guiding docs link to. One row per leave-alongside path (keyed by path — no duplicate rows on re-run).

| Column | Meaning |
|---|---|
| Path | the user's doc kept in place |
| Framework role | the dest it collides with (CLAUDE / PRD / …) |
| Description | slot for the user (or AI-reconcile sibling) to fill |
