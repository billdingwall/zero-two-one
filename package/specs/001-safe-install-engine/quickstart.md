# Quickstart / Validation: Safe Install & Merge Engine

*Manual validation walkthrough. Each step maps to an acceptance criterion in [spec.md](spec.md) and a fixture in [tasks.md](tasks.md). Run against a throwaway temp dir — never a real repo.*

## Setup

```sh
WORK=$(mktemp -d)          # throwaway target
cd "$WORK" && git init -q  # (skip this line to exercise the non-git path)
```

## Scenarios

### 1. Fresh install → full surface + populated manifest
```sh
zero-two-one-init
```
Expect: framework surface created; user-owned docs (`CLAUDE.md`, `requirements/*.md`, …) **instantiated from `templates/*-Template.md`** (default `claude` mapping); `bin/` and `specs/` **not** written into the target; `.zero-two-one.json` present with a non-empty `files{}` of sha256 hashes; `installedAt` set; `mode: scaffold`.

### 2. Idempotent re-run
```sh
zero-two-one-init
```
Expect: "all skipped"; **zero** file changes; `updatedAt` refreshed, `installedAt` unchanged.

### 3. Conflict on a modified framework file
```sh
echo "# hand edit" >> scripts/run-qa.sh
zero-two-one-init; echo "exit=$?"
```
Expect: `run-qa.sh` reported as **conflict**, left unchanged; other actions applied; `exit=0`.

### 4. User docs are sacrosanct
```sh
echo "my notes" > CLAUDE.md
zero-two-one-init
```
Expect: `CLAUDE.md` untouched. Then `zero-two-one-init --force CLAUDE.md` overwrites it (only with `--force`).

### 5. Dry run changes nothing
```sh
BEFORE=$(find . -type f -not -path './.git/*' | sort | xargs shasum | shasum)
zero-two-one-init --dry-run
AFTER=$(find . -type f -not -path './.git/*' | sort | xargs shasum | shasum)
[ "$BEFORE" = "$AFTER" ] && echo "unchanged ✅"
```
Expect: classified plan printed; `BEFORE == AFTER`.

### 6. Upgrade — refresh, conflict, orphan
Simulate an older install (bump a framework file's manifest hash / stage an orphan), then:
```sh
zero-two-one-init --upgrade
```
Expect: unmodified framework files refreshed; hand-modified ones reported conflict; a manifest file absent from the package reported **orphan** (not deleted); user docs untouched.

### 7. Missing manifest → adopt
```sh
rm .zero-two-one.json
zero-two-one-init
```
Expect: nothing overwritten; only missing files created; a fresh manifest written by hashing the present framework files.

### 8. Merged-entry deletion respected
```sh
# remove a framework-added line from .gitignore, then re-run
zero-two-one-init
```
Expect: the deleted framework `.gitignore` line is **not** re-added.

Also (merge/generated edge cases):
- Give `package.json` a user-defined `test` script, re-run ⇒ the user's value is **preserved** (not overwritten).
- `.ai/context/` is provisioned as an **empty scaffold** and otherwise left untouched.

### 9. Prerequisites
- No `package.json` in the target ⇒ a minimal one is created with the lifecycle scripts.
- Target without `git init` ⇒ `hooks/pre-commit` installed + a warning it is inactive until `git init`.

### 10. `--force` misuse
```sh
zero-two-one-init --force scripts/run-qa.sh; echo "exit=$?"
```
Expect: **error** (framework path), non-zero exit, message pointing to `--upgrade`.

### 11. Source-mode dogfood (framework repo only)
Run the engine against the framework's own repo (the `mode: source` case):
```sh
zero-two-one-init            # in the zero-two-one repo itself
```
Expect: `mode: source` **auto-detected** (`scripts/sync-to-package.js` + `package/` present); `.zero-two-one.json` regenerated with a full `files{}` inventory; `phase`/`tools` unchanged — a **no-op except the inventory** (replaces the hand-authored `files: {}` stub).

## Cross-platform check
On a CRLF/`autocrlf` checkout of an unmodified install, a re-run reports **no conflicts** (LF-normalized hashing, FR-015).

## Done when
All ten scenarios pass as an automated `node:test` suite (the mvp-3 exit-gate acceptance test) and `npm run lint` is green with no new dependency.
