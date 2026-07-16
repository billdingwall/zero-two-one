# CLI Contract: `zero-two-one-init`

*The externally observable behavior of the install engine. Referenced by the fixture tests as the assertion surface.*

## Invocation

```
zero-two-one-init [--dry-run] [--upgrade] [--force <path>]... [--phase <phase>] [--design <system>] [--stack <stack>]
```

Flag parsing is hand-rolled (no `commander`/`yargs`) to hold the zero-dependency line.

## Flags

| Flag | Arg | Effect |
|---|---|---|
| *(none)* | — | Fresh install or idempotent re-run: classify → apply → write manifest. |
| `--dry-run` | — | Print the classified action plan; **apply nothing**; exit 0. Composes with any other flag (previews that flag's plan). |
| `--upgrade` | — | Refresh framework-owned files whose hash matches install; list conflicts and orphans; never touch user docs. |
| `--force` | `<path>` (repeatable) | Overwrite the named **user-owned** path this run only. A framework-owned path ⇒ **error** (points to `--upgrade`). |
| `--phase` | `<planning\|mvp\|growth>` | Override the scaffold phase default (`planning`). |
| `--design` | `<system>` | Override the scaffold design default (`none`). |
| `--stack` | `<claude\|antigravity\|kiro>` | Supplied by the driving assistant; sets `tools.stack` (else the assistant provides it non-interactively). |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success — including runs that reported conflicts and/or orphans (these are expected state, not failures, per FR-013). |
| non-zero | Usage error only: `--force` on a framework-owned path, unknown flag, or unreadable target. |

## Behavioral guarantees (assertable)

1. **Non-destructive:** no user-owned file is modified without a matching `--force <path>`.
2. **Idempotent:** a re-run on an unmodified install writes nothing and reports all-skip.
3. **Dry-run purity:** `--dry-run` leaves the working tree byte-for-byte identical (verify by whole-tree hash before/after).
4. **Conflict handling:** a hand-modified framework file is reported as `conflict`, left untouched, other actions still applied, exit 0.
5. **Upgrade orphans:** a manifest file absent from the package is reported as `orphan`, never deleted.
6. **Prerequisites:** no `package.json` ⇒ a minimal one is created; non-git target ⇒ `pre-commit` installed with an inactive-until-`git init` warning.
7. **Manifest:** every run ends with a valid manifest (see [manifest.schema.json](manifest.schema.json)); `installedAt` preserved, `updatedAt` refreshed on re-run/upgrade.
8. **Zero dependencies:** the process imports only Node built-ins.

## Report format

Human-readable by default (one line per non-skip action, conflicts and orphans grouped last). A machine-readable `--json` emission is deferred to align with the repo's `--json` contract (`workflow-status.js`) — noted, not specified here.
