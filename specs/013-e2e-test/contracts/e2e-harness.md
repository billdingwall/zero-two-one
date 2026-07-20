# Contract: E2E Harness

*The interface of `test/e2e/harness.js` (helpers) and `test/e2e/e2e.test.js` (the `node --test` suite), plus the `test:e2e` script and CI job. Node built-ins only (FR-007).*

## `harness.js` API

```
packAndInstall() → { toolbox, tgz, BIN_INIT, BIN_021, SPECKIT }
```
- `sh('npm run sync:package -- --check', { cwd: REPO_ROOT })` — throws (fails the suite) on package drift.
- `sh('npm pack', { cwd: REPO_ROOT/package })` → resolves the emitted `zero-two-one-<ver>.tgz` path.
- `toolbox = mkdtemp()`; write minimal `package.json`; `sh('npm install --prefer-offline --no-audit --no-fund ' + tgz, { cwd: toolbox })`.
- Returns absolute bin paths and `SPECKIT = require(join(toolbox,'node_modules/zero-two-one/speckit'))`.

```
provisionTarget(mode) → target
```
- `target = mkdtemp()`; `git init -q`; local `git config user.email t@e.com` / `user.name T`.
- `mode==='migrate'`: write `README.md`, `specs/_INDEX.md`, and a pre-existing executable `.git/hooks/pre-commit` (a marked user body, e.g. `echo USER-HOOK`).
- `mode==='scaffold'`: no extra seeds.

```
runInit(BIN_INIT, target, stack) → { code, stdout, stderr }
```
- `spawnSync('node', [BIN_INIT, target, '--stack', stack], { encoding:'utf8' })` — `--phase` omitted (defaults planning, R5). Asserts `code === 0`.

```
run021(BIN_021, target, args[]) → { code, stdout, stderr }
```
- `spawnSync('node', [BIN_021, ...args], { cwd: target, encoding:'utf8' })` — project-scoped via `cwd`.

```
assertSurface(target, stack)     // per-stack signature + full key-doc trio (01-PRD/02-EDD/03-TDD) [A6]
assertManifest(SPECKIT, target, { stack, mode, ssd })   // ONE manifestFacts() call (carries mode) [A4]
assertLifecycleGreen(BIN_021, target)   // status / qa / doctor each exit 0 (doctor: advisory⇒0) [A3]
assertNonDestructive(target)     // migrate: docs/overview.md + CODE.md byte-unchanged; user hook body still present
```

```
proveGate(BIN_021, target, stack) → void (throws on violation)
```
0. **born HEAD [A1]:** `git -C target add -A && git -C target commit -m init` on the default branch (gate skipped off a non-`NNN-` branch) — else the unborn branch has no resolvable name and the gate can't evaluate.
1. `git -C target checkout -q -b 042-e2e-probe`.
2. `writeSpec(target, stack, '042-e2e-probe', 'Draft')` — engine-appropriate path/frontmatter (data-model).
3. write `target/src/feature.js` (`'// probe\n'`); `git -C target add -A`.
4. **blocked:** `spawnSync('git', ['-C',target,'commit','-m','probe'])` → assert `code !== 0` and `/COMMIT BLOCKED/.test(stderr)`.
5. `run021(BIN_021, target, ['spec','status','set','042-e2e-probe','Approved'])` → assert `code === 0`; then `git -C target add -A` (stage the status change).
6. **allowed:** `git commit` again → assert `code === 0`.

*Verified against the real `--gate` for both engines: Draft ⇒ exit 1 (blocked), Approved ⇒ exit 0 (allowed), with a born HEAD.*

```
teardown(paths[])   // rm -rf each; called in after()/finally on pass or fail
```

## Suite shape (`e2e.test.js`)

```
const ctx = packAndInstall();                 // once
after(() => teardown([ctx.toolbox, ctx.tgz, ...targets]));

for (const stack of ['claude','antigravity','kiro'])
  for (const mode of ['scaffold','migrate'])
    test(`${stack} · ${mode}`, () => {
      const t = provisionTarget(mode); targets.push(t);
      runInit(ctx.BIN_INIT, t, stack);
      assertSurface(t, stack);
      assertManifest(ctx.SPECKIT, t, { stack, mode, ssd: ssdFor(stack) });
      assertLifecycleGreen(ctx.BIN_021, t);
      if (mode === 'migrate') assertNonDestructive(t);
      proveGate(ctx.BIN_021, t, stack);
    });

test('meta: test:e2e is not in npm test; CI e2e job exists; package unchanged', …);
```

## Exit-code & assertion semantics

| Check | Pass condition |
|---|---|
| `sync:package --check` | exit 0 (no drift) — else the suite fails at setup |
| `npm install <tgz>` | exit 0, offline |
| `init <target> --stack` | exit 0; surface signature present |
| `manifestFacts/readManifest` | `stack`/`phase(=planning)`/`ssd`/`mode` match the cell |
| `021 status`/`qa`/`doctor` | each exit 0 |
| gate @ Draft | `git commit` exit ≠ 0, stderr matches `COMMIT BLOCKED` |
| gate @ Approved | `git commit` exit 0 |
| migrate non-destructive | seeded `README.md` byte-identical; original hook body still present |

## Wire-in contract

- **root `package.json`:** `"test:e2e": "node --test test/e2e/"`. **Not** referenced by `"test"`. (Root-only; not the shipped `package/package.json`.)
- **`.github/workflows/ci.yml`:** new job
  ```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm run test:e2e
  ```
  Triggered by the existing `on: [push (**), pull_request]` → runs on every PR (Q5). Lives under `.github/workflows/` → excluded from the package by `sync-to-package.js`.

## Invariants

- No network beyond the offline `npm install` of the local tarball.
- No global git config reliance (local identity per repo).
- Every temp path removed on pass or fail.
- Zero runtime dependencies; `node --test` only.
- Nothing new enters the tarball (`sync:package --check` green; 108-file set unchanged).
