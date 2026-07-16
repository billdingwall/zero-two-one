# CLI Contract: migrate-mode

*The migrate-specific surface layered onto `zero-two-one-init` (spec 001's CLI). Migrate engages automatically when the target is detected as migrate (FR-001); these flags steer it.*

## Flags (in addition to spec 001's)

| Flag | Arg | Effect |
|---|---|---|
| `--phase` | `planning\|mvp\|growth` | Override the inferred phase; skips the phase prompt. |
| `--stack` | `claude\|antigravity\|kiro` | Set the stack; skips the stack prompt / resolves ambiguity. |
| `--design` | `<system>` | Record the design choice (default `none`). |
| `--dup` | `<path>=<archive\|update\|leave>` (repeatable) | Pre-resolve a duplicate; skips that prompt. |
| `--yes` | — | Accept all inferred defaults non-interactively (equivalent to no-TTY safe-defaults). |

## Interaction model

- **TTY present + value unresolved by a flag** → prompt (showing the inferred value as the default).
- **No TTY (or `--yes`)** → **safe defaults, proceed**: `leave` for unspecified duplicates; documented default `claude` for an ambiguous/absent stack; inferred phase unless `--phase`.
- **Re-run (manifest present)** → mode/phase/stack read from the manifest; recorded duplicate decisions re-applied idempotently (no prompts).

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success — including safe-default resolutions, reported conflicts/orphans (spec 001), and skipped-but-warned Spec Kit specs. |
| non-zero | Usage error only: bad `--dup` syntax, unknown `--phase`/`--stack` value, or a spec-001-level error (e.g. `--force` on a framework path). |

## Behavioral guarantees (assertable)

1. **Non-destructive** — no user file's content is removed; archive leaves a pointer, update embeds verbatim, leave keeps in place.
2. **Migration acceptance** — a non-empty fixture completes with **zero user-file overwrites**.
3. **CI-safe** — no TTY + no flags still completes (exit 0) via safe defaults.
4. **Idempotent** — a second run re-applies nothing (manifest-driven).
5. **Spec Kit untouched** — existing specs are validated + reported, never modified.
6. **Guiding-doc coexistence** — leave on `CLAUDE/CODE/PRODUCT/DESIGN` also writes `<name>.zero-two-one.md`.
7. **Manifest** — records `mode:migrate`, confirmed `phase`/`tools`, and the `migrate` block ([schema](manifest-migrate.schema.json)).
