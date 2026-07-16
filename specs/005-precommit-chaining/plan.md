# Implementation Plan: Conflict-Aware Pre-commit Install

*The HOW for [spec.md](spec.md). Replaces spec 001's `installHook` (`scripts/init/apply.js`) with a strategy chooser; reuses the apply pipeline + manifest.*

## Approach

```
installHook(targetDir)
  if no .git/          → 'inactive-no-git'      (FR-009, unchanged)
  situation = detectHookSituation(targetDir)    (FR-001)
  switch situation:
    already-installed → 'direct' (idempotent)
    none     → cp gate → .git/hooks/pre-commit  (FR-002, unchanged)          → 'direct'
    plain    → cp gate → .git/hooks/pre-commit.zto; insert guarded block AFTER  → 'chain-plain'
               the shebang of the existing .git/hooks/pre-commit (FR-003)
    husky    → cp gate → .git/hooks/pre-commit.zto; insert guarded block after  → 'husky'
               the shebang of .husky/pre-commit (create v9-style if absent) (FR-004)
    lefthook → print the pre-commit command snippet; DO NOT edit the config      → 'manual'
  return strategy   // recorded in manifest.hook (FR-008)
```

`detectHookSituation` is pure/read-only; the strategy functions each do one bounded write (append or create), never a truncate/replace.

## Detection (FR-001)

- **already-installed**: `.git/hooks/pre-commit` exists and contains the gate marker (`Zero Two One pre-commit hook`).
- **husky**: `.husky/` directory exists.
- **lefthook**: `lefthook.{yml,yaml,toml,json}` or a `lefthook` key in `package.json`.
- **plain**: `.git/hooks/pre-commit` exists (and isn't the marker) — after husky/lefthook are ruled out, since a manager may also drop a `.git/hooks/pre-commit` shim.
- **none**: otherwise.

Precedence: already-installed → husky → lefthook → plain → none (managers win over a bare `.git/hooks` shim they own).

## The guarded invocation (FR-003/004/006)

A stable block, idempotent by marker presence:

```sh
# >>> zero-two-one gate >>>
[ -x "$(git rev-parse --show-toplevel)/.git/hooks/pre-commit.zto" ] && "$(git rev-parse --show-toplevel)/.git/hooks/pre-commit.zto" "$@" || exit $?
# <<< zero-two-one gate <<<
```

`insertGuarded(file, block)` (clarified: **gate-first**) = if the file exists, insert the block immediately **after the shebang line** (so a trailing `exit` in the user's hook can't bypass the gate); if absent (husky), create a minimal `#!/bin/sh` + block. Idempotent: skip when the `>>> zero-two-one gate >>>` marker already appears.

## lefthook (FR-005 — report-only, clarified)

Detect lefthook, print the exact `pre-commit` command snippet for the user to add, set strategy `manual`, and **never edit** the config (safe under zero-dep + `yml/yaml/toml/json` variety). Snippet, e.g.:

```yaml
pre-commit:
  commands:
    zto-gate:
      run: sh "$(git rev-parse --show-toplevel)/hooks/pre-commit"
```

## Manifest (FR-008)

`buildManifest` gains a `hook` field = the strategy string; `apply.js` returns it (it already returns `hook` for the log — now it's persisted). `021-doctor` can read it later.

## Testing strategy

`node:test` fixtures (temp `.git/hooks`, `.husky/`, `lefthook.yml`, sentinel hooks):
- each situation → correct strategy + correct files written; the no-hook and framework tests from spec 001 stay green.
- plain hook: original bytes preserved + guarded line appended; `.zto` executable.
- husky: `.husky/pre-commit` gets the block; `.git/hooks/pre-commit` absent.
- idempotent re-run: no duplicate block.
- sentinel test: a hook with a unique string is never truncated/overwritten by any strategy.

## Work breakdown

See [tasks.md](tasks.md).
