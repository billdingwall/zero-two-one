# Quickstart / Validation: Conflict-Aware Pre-commit Install

*Seed a hook setup, run init, confirm the gate chained in — and the user's hook is intact. Each step maps to an acceptance criterion in [spec.md](spec.md). Use throwaway repos.*

## Setup
```sh
WORK=$(mktemp -d); cd "$WORK"; git init -q
```

## 1. No hook → direct (spec 001 parity)
```sh
zero-two-one-init --yes
cat .git/hooks/pre-commit   # → the gate; manifest.hook = "direct"
```

## 2. Plain hook → chained gate-first
```sh
printf '#!/bin/sh\necho "my hook"\nexit 0\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
zero-two-one-init --yes
grep -c 'my hook' .git/hooks/pre-commit          # → 1 (preserved)
grep -c 'zero-two-one gate' .git/hooks/pre-commit # → 1 (inserted after shebang)
test -x .git/hooks/pre-commit.zto && echo "gate present"
# the gate runs even though the user's hook ends in exit 0 (gate is first)
```

## 3. husky → `.husky/pre-commit`
```sh
mkdir .husky
zero-two-one-init --yes
grep -c 'zero-two-one gate' .husky/pre-commit    # → 1
test ! -f .git/hooks/pre-commit && echo ".git/hooks untouched"
```

## 4. lefthook → report-only
```sh
printf 'pre-commit:\n  commands:\n    lint:\n      run: eslint\n' > lefthook.yml
BEFORE=$(md5 -q lefthook.yml)
zero-two-one-init --yes    # prints the snippet; manifest.hook = "manual"
test "$(md5 -q lefthook.yml)" = "$BEFORE" && echo "lefthook.yml byte-unchanged"
```

## 5. Idempotent re-run
```sh
zero-two-one-init --yes    # re-run over case 2/3
grep -c 'zero-two-one gate' .git/hooks/pre-commit  # → still 1 (marker respected)
```

## 6. Sentinel guardrail
```sh
# a hook containing a unique string is never overwritten/emptied by any strategy
```

## 7. Dry-run names the strategy
```sh
zero-two-one-init --dry-run   # plan output includes the hook strategy that would apply
```

## Done when
The hook `node:test` suite passes (each situation → correct strategy + files; spec 001's hook tests still green; sentinel never overwritten; idempotent re-run), `npm test`/`npm run lint` are green, and no runtime dependency was added.
