# Quickstart: Validating the `021` CLI

*Manual + automated validation for [spec.md](spec.md). Run from the framework repo (or a scaffolded project); the CLI is `node bin/021.js …` in-repo, `npx 021 …` when installed.*

## 1. Dispatch parity

```
node bin/021.js status            # == npm run 021-status
node bin/021.js qa                # == npm run 021-qa
node bin/021.js doctor            # == npm run 021-doctor
node bin/021.js phase             # == node scripts/speckit/lib.js phase (bare number)
node bin/021.js spec status list  # == npm run 021-spec:status -- list
node bin/021.js spec verify 006   # == npm run 021-spec:verify -- 006
```

Each should produce the same output and exit code as its npm-alias counterpart. Note **no `--` separator** — `spec verify 006` passes `006` straight through.

## 2. Usage & exit codes

```
node bin/021.js            # prints the command list, exits 1
node bin/021.js bogus      # prints the command list, exits 1
node bin/021.js --help     # prints the command list, exits 0
node bin/021.js spec bogus # prints usage, exits 1
```

## 3. Adapters reference the CLI

Install each stack into a temp target and grep the instruction surface:
- `claude` → `CLAUDE.md` + `.claude/commands/021-*.md` reference `npx 021 …` (not `npm run 021-*`).
- `antigravity` → `AGENTS.md` references `npx 021 …`.
- `kiro` → `.kiro/steering/021-*.md` reference `npx 021 …`.

No `npm run 021-` string should remain in any rendered instruction surface.

## 4. Golden re-baseline

The 006 renderer golden test now asserts the **new** `claude` bytes (re-captured `test/init/fixtures/claude-golden.json`). Confirm:
- `npm test` green — the 006/007/008 install suites pass against the updated fixture.
- The only diff in the fixture vs pre-009 is the command-reference text.

## 5. `exports` programmatic API

```
node -e "const s=require('./scripts/speckit/lib.js'); console.log(typeof s.manifestFacts, typeof s.engineFor)"
# and, once the package resolves by name: require('zero-two-one/speckit')
```

`require('zero-two-one/speckit')` resolves to `lib.js`; `./package.json` still resolves under the new `exports`.

## 6. bin registration + README

- `package.json` and `package/package.json` both list `"021": "bin/021.js"` in `bin`.
- `README.md` no longer carries the "stack availability … land in mvp-4" caveat.

## 7. Gates

```
npm test
npm run lint
npm run check:links
npm run sync:package -- --check     # bin/021.js shipped; package/package.json carries bin+exports
npm run 021-spec:verify -- 009
```
