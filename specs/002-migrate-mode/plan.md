# Implementation Plan: Migrate-Mode

*The HOW for [spec.md](spec.md). A detection/interview/resolution layer **in front of** spec 001's engine — it does not re-implement the merge.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (extends the spec 001 engine under `scripts/init/`) |
| **Dependencies** | **None** — built-ins only: `fs`, `path`, `node:crypto`, `node:readline` (prompts), `node:child_process` (git tag reads) |
| **Reuses** | spec 001: `classifyAll`, `applyPlan`, `manifest.js`, `classes.js`, `hash.js`, `instantiate.js` |
| **Testing** | `node:test` fixtures under `test/init/migrate/` (synthetic non-empty repos) |
| **Interaction** | Interactive (`readline`) when TTY; fully flag-driven otherwise |
| **Source of truth** | TDD §8 (detection + interview), §6 (import + duplicates), §7 (manifest) |

## Constraints check (must hold at every step)

- **Non-destructive** — inherits spec 001 FR-003; migrate only adds, creates-if-missing, updates-in-place-preserving, or archives-with-pointer. **Never removes content** (FR-010).
- **Zero runtime dependencies** — `readline` for prompts, no packages (FR-013); enforced by `npm run lint`.
- **CI never blocks** — no TTY ⇒ safe defaults, exit 0 (FR-012).
- **Idempotent** — recorded decisions are manifest-driven; a re-run re-applies nothing (FR-011).
- **Bounded determinism** — exact-dest duplicates only; fuzzy role-matching stays out (AI-reconcile sibling).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | Manifest `migrate` record, detection-signals model, duplicate-resolution + imported-docs structures |
| [contracts/manifest-migrate.schema.json](contracts/manifest-migrate.schema.json) | JSON Schema for the additive `migrate` manifest block |
| [contracts/cli-contract.md](contracts/cli-contract.md) | Migrate CLI flags (`--phase`/`--stack`/`--design`/`--dup`/`--yes`), exit codes, behaviors |
| [research.md](research.md) | Decisions & rationale (rolls up the 3 clarify sessions) + rejected alternatives |
| [quickstart.md](quickstart.md) | Manual validation walkthrough mapped to the acceptance criteria |

## Approach

When `index.js` resolves `mode: migrate` (FR-001), it runs a migrate pre-pass before delegating the actual writes to spec 001's `classifyAll` → `applyPlan`:

```
migrate(targetDir, opts)
  1. signals   = detect(targetDir)                 // read-only evidence (phase, stack, surfaces)
  2. phase     = resolvePhase(signals, opts)        // heuristic → interview/--phase
  3. stack     = resolveStack(signals, opts)        // surface → interview/--stack
  4. plan      = classifyAll(...)                   // spec 001, unchanged
  5. importDocs(targetDir, plan)                    // catalog pre-existing docs → imported-docs.md
  6. duplicates= resolveDuplicates(targetDir, plan, opts)  // archive | update | leave (per file)
  7. applyPlan(...)                                 // spec 001 apply (non-destructive)
  8. if phase == growth: growthEntry(targetDir)     // post-transition variant; dup-resolution still governs
  9. writeManifest(... mode:migrate, phase, tools, migrate:{duplicates,imported,archived} )
```

Every step is additive or create-if-missing; the spec 001 non-destructive invariant is inherited and must not be weakened (FR-010).

**Integration invariant (analyze A5):** the migrate branch is added *in front of* spec 001's `index.js` mode logic, which becomes **manifest-first** — `mode` comes from an existing manifest (re-run), else detection (`migrate` vs `source` vs `scaffold`). The existing **scaffold path and its tests must stay unchanged**.

**Growth-entry precedence (analyze A1):** `growthEntry` only chooses the *post-transition template variant* for `05-ROADMAP`/`04-BACKLOG`; if the user already has those files, duplicate resolution (step 6) governs — growth-entry never overwrites them.

**Catalog atomicity (analyze A6):** the import step writes the `imported-docs.md` row **and** the `migrate.imported` manifest entry together, so the user-facing catalog and the idempotency key never drift.

## New modules (`scripts/init/migrate/`)

| Module | Role |
|---|---|
| `detect.js` | `detectMode`, `detectPhaseSignals`, `detectStackSurfaces` — pure, read-only |
| `interview.js` | `node:readline` prompts + non-interactive resolution from flags; TTY guard (FR-003/FR-012) |
| `import.js` | build/update `requirements/_notes/imported-docs.md` catalog (FR-006) |
| `duplicates.js` | archive / update-to-fit / leave-alongside, per file; record decisions (FR-007) |
| `speckit-reuse.js` | detect `.specify/`/populated `specs/`, validate frontmatter, signal skip (FR-008) |
| `growth-entry.js` | scaffold post-transition `05-ROADMAP`/`04-BACKLOG` shape (FR-009) |

`index.js` gains a migrate branch; `manifest.js` gains the `migrate.duplicates` field.

## Detection heuristics (FR-002/FR-004)

- **Mode (clarified):** migrate when the target has **any non-framework content** (any file outside the framework surface, ignoring empty/`.git`-only dirs) and no `.zero-two-one.json`; else scaffold.
- **Phase (clarified — strict precedence):** `growth` only if **all** of tests + CI config + release history (**git tags only**); else `mvp` if substantial code but no framework key docs; else `planning`.
- **Re-run (clarified):** detection runs only on the first (no-manifest) pass. When a manifest exists, mode/phase/stack are **read from it**, not re-detected; recorded duplicate decisions are honored idempotently.
- **Stack:** `.claude/`→claude, `.agents/`|`AGENTS.md`→antigravity, `.kiro/`→kiro; `.specify/`|populated `specs/`⇒ ssd github-speckit. Multiple surfaces ⇒ list, defer to interview/`--stack`.

## Interview (FR-003/FR-012, clarified)

`node:readline` prompts only when `process.stdout.isTTY` and the value is unresolved by a flag. Each prompt shows the inferred value as the default. **Non-interactive (no TTY): safe defaults, proceed** — anything not fixed by a flag resolves to a non-destructive default (leave-alongside for duplicates; documented default `claude` when the stack is ambiguous/absent). CI never blocks.

## Import & duplicate resolution (FR-006/FR-007, clarified)

- **Duplicate = exact framework-dest collision:** the user already has a file where the framework would write (`CLAUDE.md`, `README.md`, `requirements/01-PRD.md`, …). Broader/role-based matching of docs elsewhere is the AI-reconcile sibling's job, not here.
- **Resolution** per duplicate: `--dup <path>=<archive|update|leave>` (non-interactive), a prompt (TTY), or the safe default `leave`.
  - `archive` → move the user's file to `requirements/_notes/archive/<path>` + leave a pointer stub, then instantiate the fresh template at the dest.
  - `update` (**wrap**) → rewrite the dest to the framework template's structure with the user's original content embedded verbatim under a marked `## Imported content` section.
  - `leave` → keep the user's file at the dest; append a row to `requirements/_notes/imported-docs.md` (path + description slot); do not overwrite. For guiding/router docs (`CLAUDE`/`CODE`/`PRODUCT`/`DESIGN`) also write the framework template alongside as `<name>.zero-two-one.md` so its content is present; `README`/`requirements/*` catalog only.
- Decisions recorded to `manifest.migrate.duplicates`. **Re-run is manifest-driven** (clarified): recorded decisions are not re-prompted/re-applied; `imported-docs.md` rows keyed by path; archive skips if already archived.

## Testing strategy

`node:test` fixtures under `test/init/migrate/`, driving migrate against synthetic non-empty repos:
- detected-migrate, phase heuristics (growth/mvp/planning), stack surfaces (single + conflicting)
- import catalog created + original unchanged
- each duplicate action (archive/update/leave) + manifest record + no content removed
- Spec Kit reuse skip, non-interactive (no-TTY) completeness, growth entry shape
- **the migration acceptance test**: non-empty fixture → zero user-file overwrites (mvp-3 exit gate).

## Work breakdown

See [tasks.md](tasks.md).
