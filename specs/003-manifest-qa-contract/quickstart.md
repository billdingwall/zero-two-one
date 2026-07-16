# Quickstart / Validation: Manifest as QA Contract

*A pure refactor — validation is **parity**: capture outputs before, prove they're identical after. Each step maps to an acceptance criterion in [spec.md](spec.md).*

## Baseline (before the refactor — task T001)

```sh
# Capture the phase each entrypoint reports, per manifest value + the no-manifest case.
for p in planning mvp growth; do
  node -e "require('fs').writeFileSync('.zero-two-one.json', JSON.stringify({version:'x',phase:'$p'}))"
  echo "$p → qa=$(bash scripts/run-qa.sh 2>/dev/null | grep 'Detected Lifecycle Phase') | status=$(node scripts/workflow-status.js --json)"
done
git checkout .zero-two-one.json   # restore
# no-manifest case: run in a temp dir without a manifest → note the Planning fallback + warning
```

## After the refactor

### 1. Single reader
```sh
grep -rl "zero-two-one.json" scripts bin hooks | sort   # expect: scripts/speckit/lib.js only
grep -n "workflow-status.js --json" scripts/run-qa.sh    # expect: no match
```

### 2. The CLI
```sh
node scripts/speckit/lib.js phase        # prints 0 | 1 | 2 (matches the manifest)
```

### 3. Parity — QA == status
```sh
# For planning/mvp/growth manifests, the run-qa "Detected Lifecycle Phase: N" and
# `workflow-status.js --json` .phase agree, and match the baseline exactly.
```

### 4. One fallback
```sh
# In a repo with no .zero-two-one.json: run-qa.sh and 021-status both resolve to the
# same inferred/Planning phase and emit the same warning (warning on stderr).
node scripts/speckit/lib.js phase 2>/dev/null   # clean integer, no warning text captured
```

### 5. `--json` preserved
```sh
node scripts/workflow-status.js --json   # still { "phase": <num>, "status": <label>, "source": … }
```

### 6. Vocabulary once
```sh
grep -rn "MVP Build (One)" scripts | grep -v speckit/lib.js   # expect: no match
```

## Done when
The `lib.js` `node:test` suite passes, every parity check matches the T001 baseline (QA phase, `--json`, gate outcomes unchanged), `npm run 021-qa` + `npm run 021-spec:verify` are green, `npm run lint` passes, and no runtime dependency was added.
