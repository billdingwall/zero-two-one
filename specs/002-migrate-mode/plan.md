# Implementation Plan: Migrate-Mode

*The HOW for [spec.md](spec.md). A detection/interview/resolution layer **in front of** spec 001's engine — it does not re-implement the merge.*

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
  8. if phase == growth: growthEntry(targetDir)     // post-transition roadmap/backlog shape
  9. writeManifest(... mode:migrate, phase, tools, migrate:{duplicates} )
```

Every step is additive or create-if-missing; the spec 001 non-destructive invariant is inherited and must not be weakened (FR-010).

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

- **Mode:** migrate when the target has non-framework content (source files, docs, or a tool surface) and no `.zero-two-one.json`; else scaffold.
- **Phase:** `growth` if tests + CI config + release history (tags or `_releases/`); `mvp` if substantial code but no framework key docs; else `planning`.
- **Stack:** `.claude/`→claude, `.agents/`|`AGENTS.md`→antigravity, `.kiro/`→kiro; `.specify/`|populated `specs/`⇒ ssd github-speckit. Multiple surfaces ⇒ list, defer to interview/`--stack`.

## Interview (FR-003/FR-012)

`node:readline` prompts only when `process.stdout.isTTY` and the value is unresolved by a flag. Each prompt shows the inferred value as the default. Non-interactive: `--phase`/`--stack`/`--design` fully determine the run; a genuinely-ambiguous stack with no `--stack` and no TTY resolves to a documented default (open question — clarify).

## Import & duplicate resolution (FR-006/FR-007)

- **Import:** for a user-owned doc the framework would instantiate but the project already has an equivalent, append a row to `requirements/_notes/imported-docs.md` (path + description slot); the instantiated template links to the catalog.
- **Duplicates:** per duplicate, the resolution is `--dup <path>=<archive|update|leave>` (non-interactive) or a prompt. `archive` → move to `requirements/_notes/archive/<path>` + leave a pointer stub; `update` → structure-preserving in-place edit; `leave` → the import behavior. Decisions recorded to `manifest.migrate.duplicates`.

## Testing strategy

`node:test` fixtures under `test/init/migrate/`, driving migrate against synthetic non-empty repos:
- detected-migrate, phase heuristics (growth/mvp/planning), stack surfaces (single + conflicting)
- import catalog created + original unchanged
- each duplicate action (archive/update/leave) + manifest record + no content removed
- Spec Kit reuse skip, non-interactive (no-TTY) completeness, growth entry shape
- **the migration acceptance test**: non-empty fixture → zero user-file overwrites (mvp-3 exit gate).

## Work breakdown

See [tasks.md](tasks.md).
