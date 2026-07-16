# Contract: conflict-aware hook install

*The install surface that replaces spec 001's `installHook`. Lives in `scripts/init/apply.js` (+ a `scripts/init/hook.js` helper). All effects are additive.*

## API

```js
detectHookSituation(targetDir) → 'already-installed' | 'husky' | 'lefthook' | 'plain' | 'none'
installHook(targetDir) → strategy   // 'direct' | 'chain-plain' | 'husky' | 'manual' | 'inactive-no-git'
```

### `detectHookSituation(targetDir)`
- Read-only. Applies the [data-model §1](../data-model.md) precedence. Identifies the framework's own hook by its marker line (`Zero Two One pre-commit hook`), so a prior install reads as `already-installed`, not `plain`.

### `installHook(targetDir)`
- Chooses and applies the strategy for the detected situation; returns the strategy string (persisted as `manifest.hook`).
- Each strategy performs **one bounded write** (insert-a-block, or create a file) or **no write** (`manual`, `inactive-no-git`). Never a truncate/replace of a user file.

## Guarantees (assertable)

1. **No user file overwritten** — a sentinel string in any pre-existing hook/manager file is present, in order, after install (the guardrail test).
2. **Gate always runs** — the block sits after the shebang; a hook ending in `exit 0` still triggers the gate.
3. **Idempotent** — a second `installHook` detects the prior install (`already-installed`, via the direct-gate marker **or** the chained guard-marker block), adds no second block, and rewrites nothing.
4. **Manager-safe** — `husky`/`lefthook` situations never write `.git/hooks/pre-commit`.
5. **Spec 001 parity** — the `none` path is byte-for-byte the old direct install; 001's hook tests pass unchanged.
6. **Reported** — `--dry-run` names the strategy; `manual` (lefthook) prints the snippet and writes nothing.
7. **Zero deps** — text only; no config-format parser.

## CLI surface

- No new flags. Behavior is automatic from detection; `--dry-run` (spec 001) now includes the hook strategy in its plan output.
