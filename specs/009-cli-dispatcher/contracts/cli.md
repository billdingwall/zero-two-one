# Contract: The `021` CLI

*Behavior + guarantees for `bin/021.js` and the `exports` surface. Zero runtime dependencies.*

## `bin/021.js`

```
021 <subcommand> [args…]
  status | qa | doctor | phase
  spec <status|context|verify> [args…]
  -h | --help
```

- **Dispatch:** resolve `subcommand` (and, for `spec`, the leaf) to a script path **package-relative** (`path.join(__dirname, '..', 'scripts', …)`); exec via `spawnSync(process.execPath, [script, ...extra, ...rest], { stdio: 'inherit', cwd: process.cwd() })` (or `sh` for `run-qa.sh`).
- **Exit code:** `process.exit(result.status ?? 1)` — the CLI is transparent to the wrapped script's exit code.
- **Arg pass-through:** everything after the resolved subcommand forwards verbatim; **no `--` separator** (FR-002). `021 spec verify 006` ⇒ `verify-spec-compliance.js` sees `['006']`.
- **Usage:** no subcommand or unknown ⇒ print the command list to stderr, exit **1**; `-h`/`--help` ⇒ same list to stdout, exit **0** (FR-007).
- **`phase`:** prepends the `phase` arg so `021 phase` ⇒ `node scripts/speckit/lib.js phase` (the bare-number output scripts/hooks consume).

**Guarantees:**
1. **Parity** — `021 <sub> [args]` produces the same stdout/stderr/exit as the corresponding `npm run 021-<sub>` (minus the `--` separator). No behavior lives in the CLI.
2. **Project-scoped** — dispatched with `cwd: process.cwd()`, so the wrapped scripts resolve state (manifest, specs) for the *invoking* project via `repoRoot()`, exactly as the npm aliases do.
3. **Transparent I/O** — `stdio: 'inherit'`; the CLI adds no output of its own except usage.

## `exports` surface

```jsonc
"exports": { "./speckit": "./scripts/speckit/lib.js", "./package.json": "./package.json" }
```

- **Guarantee:** `require('zero-two-one/speckit')` resolves to `lib.js`'s public exports (`manifestFacts`, `engineFor`, `readStatus`, `writeStatus`, `listSpecs`, `resolveSpec`, `countTasks`, `STATUSES`, …) — additive, read-mostly helpers for agent runtimes (TDD §14).
- **Guarantee:** adding `exports` does not break the package's own consumers — `./package.json` stays resolvable; the package has no `"."` main (removed r7), so no `require('zero-two-one')` contract regresses.

## `npm` aliases (unchanged)

- **Guarantee:** `npm run 021-status|qa|doctor|spec:status|spec:context|spec:verify`, `npm test`, `npm run lint`, `npm run sync:package` behave **identically** to pre-009. The CLI is additive; the scripts are untouched.

## Golden fixture (FR-005)

- **Guarantee:** the *only* change to `claude` install bytes is the re-pointed command references in `CLAUDE.md` + `.claude/commands/021-*.md`; `test/init/fixtures/claude-golden.json` is re-captured to match, and the 006 renderer test re-pins to it. The renderer, adapters, and engine are unchanged.
