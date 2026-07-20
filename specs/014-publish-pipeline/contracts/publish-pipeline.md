# Contract: Publish Pipeline & Pre-Publish Gate

*The interface of `scripts/prepublish-gate.js`, the `publish.yml` workflow, and the sync-exclusion change. Node built-ins only (FR-008).*

## `scripts/prepublish-gate.js`

```
// CLI
node scripts/prepublish-gate.js            # gate the real package/ + repo; exit 0 pass / 1 fail

// API (exported for tests)
prepublishGate({ root = repoRoot(), packageDir = path.join(root, 'package') })
  → { ok: boolean, failures: string[] }
```

- Runs `npm pack --json --dry-run` in `packageDir`; parses `[0].files` → `paths`.
- Applies checks (a)–(f) from data-model; collects a specific message per failure.
- Prints a `021 doctor`-styled report; `main`/CLI exits `failures.length ? 1 : 0`.
- **Zero-dep**, `child_process`/`fs`/`path` only. Reuses `check-links.js` via subprocess (R3).
- Parameters exist for tests (R6) — default invocation targets the real repo.

### Exit / report semantics

| Result | Exit | Report |
|---|---|---|
| all checks pass | 0 | `✓` per check + `pre-publish gate: PASS` |
| ≥1 failure | 1 | `✗ <check>: <reason>` per failure + `pre-publish gate: FAIL (n)` |

## `.github/workflows/publish.yml`

```yaml
name: Publish
on:
  push:
    tags: ['v*.*.*']
permissions:
  contents: read
  id-token: write            # provenance via trusted publishing (no NPM_TOKEN)
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"
      - run: npm run sync:package -- --check
      - run: npm run prepublish:check
      - run: npm publish --provenance
        working-directory: package
```

- A header comment documents the one-time npmjs **trusted-publisher** setup and the first-publish path (research R1).
- Lives under `.github/workflows/` → excluded from the package (`githubExclusions`).

## `scripts/sync-to-package.js` change

```
filesToCopy:       remove 'README.md'                     # sync no longer overwrites the package README
preserveInPackage: add 'README.md'                        # --check treats package/README.md as hand-maintained
scriptExclusions:  add 'prepublish-gate.js'               # dev-only; must not ship
```

Invariant: `npm run sync:package -- --check` exits 0 after these changes (with the new hand-authored `package/README.md` in place).

## `package.json` (root) change

```
scripts: + "prepublish:check": "node scripts/prepublish-gate.js"
```

Root-only (the shipped `package/package.json` is unchanged). Optionally `publish:package` chains the gate: `npm run sync:package && npm run prepublish:check && cd package && npm publish` — so the manual fallback is gated too (FR-007).

## Invariants

- The gate fails the build (non-zero) on any r7/r9 regression, naming the check.
- Tarball-aware checks read `npm pack --json` output, not the repo tree.
- CI and local `npm run prepublish:check` give the same verdict.
- Nothing new ships (gate excluded, workflow excluded, tests root-only); tarball stays 108 files; `sync --check` green.
- No runtime dependency; no `NPM_TOKEN`.
