# Data Model: Conflict-Aware Pre-commit Install

*The states and artifacts the installer works with. Behavior in [plan.md](plan.md); the contract in [contracts/](contracts/). No manifest schema change beyond the additive `hook` field.*

## 1. HookSituation

The detected state of the target's hook setup — chooses the strategy. Resolved by `detectHookSituation(targetDir)` (read-only).

| Situation | Detected by | Strategy |
|---|---|---|
| `already-installed` | `.git/hooks/pre-commit` contains the gate marker | no-op (`direct`, idempotent) |
| `husky` | `.husky/` directory exists | insert block in `.husky/pre-commit` |
| `lefthook` | `lefthook.{yml,yaml,toml,json}` or a `lefthook` key in `package.json` | report snippet (`manual`) |
| `plain` | a non-marker `.git/hooks/pre-commit` exists | `.zto` gate + insert block in the hook |
| `none` | none of the above | direct install |

**Precedence:** `already-installed → husky → lefthook → plain → none` (a manager wins over a bare `.git/hooks` shim it owns).

## 2. Strategy → effect

| Strategy | Writes | Never |
|---|---|---|
| `direct` | `.git/hooks/pre-commit` = gate (executable) | — |
| `chain-plain` | `.git/hooks/pre-commit.zto` = gate; guarded block after the shebang of `.git/hooks/pre-commit` | truncate/reorder/replace the user's hook |
| `husky` | `.git/hooks/pre-commit.zto` = gate; guarded block after the shebang of `.husky/pre-commit` (create v9-style if absent) | touch `.git/hooks/pre-commit` |
| `manual` (lefthook) | nothing — prints the snippet | edit the lefthook config |
| `inactive-no-git` | nothing (staged) | — |

## 3. The guarded block

Inserted after the shebang; idempotent by marker presence.

```sh
# >>> zero-two-one gate >>>
[ -x "$(git rev-parse --show-toplevel)/.git/hooks/pre-commit.zto" ] && "$(git rev-parse --show-toplevel)/.git/hooks/pre-commit.zto" "$@" || exit $?
# <<< zero-two-one gate <<<
```

- **Marker:** `>>> zero-two-one gate >>>` — a `grep` for it is the idempotency check and the user's find/remove handle.
- **Gate-first:** placed at the top (after `#!/bin/sh`) so it runs before — and independent of — the user's steps, even if they end in `exit`.
- **`|| exit $?`:** a gate failure blocks the commit with the gate's exit code.

## 4. Manifest `hook` field (additive)

| Field | Type | Notes |
|---|---|---|
| `hook` | `'direct' \| 'chain-plain' \| 'husky' \| 'manual' \| 'inactive-no-git'` | the strategy applied; already computed by `apply.js` for logging — now **persisted** for idempotency + `021-doctor` (spec 004). |
