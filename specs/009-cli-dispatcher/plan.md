# Implementation Plan: The `021` CLI Dispatcher

*The HOW for [spec.md](spec.md). The smallest mvp-4 spec: a thin `bin/021.js` dispatcher (Node built-ins, no logic moves) over the existing `scripts/*`, a re-point of every adapter instruction surface from `npm run 021-*` to `npx 021 …` (which re-baselines the 006 golden fixture — intentional), a `bin`+`exports` addition to both package manifests, and the README caveat removal.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`bin/021.js`), dispatching to existing Node/sh scripts |
| **Dependencies** | **None** — `child_process.spawnSync` + `path`/`process` only (FR-010) |
| **New files** | `bin/021.js` (the dispatcher) |
| **Changed** | `package.json` + `package/package.json` (`bin` + `exports`); the re-pointed instruction surfaces (below); `test/init/fixtures/claude-golden.json` (re-baselined); `README.md` (caveat removed); `sync-to-package.js` (ship `bin/021.js`) |
| **Reuses** | `scripts/workflow-status.js`, `scripts/run-qa.sh`, `scripts/speckit/{doctor,spec-status,fetch-speckit-context,verify-spec-compliance,lib}.js` — dispatched **unchanged** |
| **Testing** | `node:test` — dispatch parity (each subcommand → right script + exit code + arg pass-through), usage/exit codes, the re-baselined golden, `exports` resolves |
| **Source of truth** | repo-refactor §3.3 (the `021` CLI); TDD §6 (naming), §14 (programmatic API) |

## Constraints check (must hold)

- **No logic moves** — `bin/021.js` only routes; the scripts remain the implementation and stay independently runnable + npm-aliased (FR-006).
- **npm aliases unchanged** — `npm test`/`lint`/`sync:package`/`021-*` behave exactly as today (FR-006); the dogfood repo + CI are unaffected.
- **Golden re-baseline is the *only* intended claude-bytes change** — 006–008 held the bar; 009 advances it by re-pointing the referenced commands, and re-pins the fixture (FR-005). No *other* claude output changes.
- **Zero dependencies** — built-ins only (FR-010).
- **`exports` is additive & safe** — the whitelist includes `./speckit` + `./package.json` so nothing the package's consumers rely on breaks (FR-009).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The subcommand→script map; the `npm run 021-*` → `npx 021 …` re-point mapping; the `bin`/`exports` shapes |
| [contracts/cli.md](contracts/cli.md) | `bin/021.js` behavior — dispatch, arg pass-through, exit codes, usage; the `exports` contract |
| [research.md](research.md) | The deferred script-resolution decision + the golden-re-baseline rationale; rejected alternatives |
| [quickstart.md](quickstart.md) | End-to-end: run each subcommand, diff vs `npm run 021-*`, verify the re-pointed surfaces + `exports` |

## Approach

### A1. The dispatcher (`bin/021.js`) — FR-001/002/007

```
#!/usr/bin/env node
argv[2] = sub; rest = argv.slice(3)
map:
  status  → scripts/workflow-status.js
  qa      → scripts/run-qa.sh                     (via sh)
  doctor  → scripts/speckit/doctor.js
  phase   → scripts/speckit/lib.js  (+ 'phase')
  spec    → { status: spec-status.js, context: fetch-speckit-context.js, verify: verify-spec-compliance.js }[argv[3]], rest = argv.slice(4)
  -h|--help|(none)|unknown → usage; exit 0 for help, 1 otherwise
run: spawnSync(execPath, [scriptPath, ...extraArgs, ...rest], { stdio: 'inherit', cwd: process.cwd() })
     (qa: spawnSync('sh', [runQaPath, ...rest], …))
exit(result.status ?? 1)
```

- **Script path = package-relative** (`path.join(__dirname, '..', 'scripts', …)`) so the CLI dispatches to the scripts it ships with; **data = project-relative** because the scripts resolve state via `repoRoot()` (git root of `cwd`), and we exec with `cwd: process.cwd()`. This matches `npm run 021-*` semantics (operate on the invoking project) — see [research.md](research.md) R1.
- Arg pass-through: `021 spec verify 006` → `verify-spec-compliance.js` argv `['006']` (no `--` separator, FR-002).

### A2. Package `bin` + `exports` — FR-003/009/010

Both `package.json` and `package/package.json`:
```jsonc
"bin": { "zero-two-one-init": "bin/init.js", "021": "bin/021.js" },
"exports": {
  "./speckit": "./scripts/speckit/lib.js",
  "./package.json": "./package.json"
}
```
`exports` restricts subpath resolution to the whitelist — include `./package.json` so tooling that reads it still resolves (FR-009 guard).

### A3. Re-point instruction surfaces — FR-004

Rewrite `npm run 021-<x>` → `npx 021 <x>` (and `021-spec:<y>` → `021 spec <y>`, dropping `-- `) across: `templates/ASSISTANT-Template.md`, `.claude/commands/021-*.md`, `templates/kiro-steering/021-{product,tech,structure}.md`, `templates/{CODE,README}-Template.md`, `templates/06-REVIEW-Template.md`, `templates/reviews/06-REVIEW-mvp-Template.md`. (The exact mapping table is in [data-model.md](data-model.md).) The dogfood repo's own `CLAUDE.md`/`CODE.md` etc. are user-owned — update opportunistically, not required.

### A4. Golden re-baseline — FR-005

Re-pointing `ASSISTANT-Template.md` and `.claude/commands/021-*.md` changes the rendered `claude` bytes. Re-capture `test/init/fixtures/claude-golden.json` from the *new* output (the same capture procedure spec 006 used). The renderer/engine are unchanged — only the referenced-command text moves; the golden test then re-pins to it.

### A5. README + sync — FR-008/010

Remove the README.md:33 stack-availability caveat. `sync-to-package.js` ships `bin/021.js` (add to the `bin/` copy — already synced) and the manifest `bin`/`exports` land via `package/package.json` (preserved file — edit it directly or teach sync). `npm run sync:package -- --check` green.

## Testing strategy

`node:test`:
- **Dispatch parity** — for each subcommand, `021 <sub>` runs the same script as `npm run 021-<sub>` and returns its exit code; `021 spec verify <feature>` passes `<feature>` through (subprocess, assert output/exit).
- **Usage/exit** — no subcommand & unknown → usage + exit 1; `--help` → usage + exit 0.
- **Golden re-baseline** — the 006 renderer test now asserts the *new* `claude` bytes (re-captured fixture); 006–008 suites stay green against the updated fixture.
- **`exports`** — `require('zero-two-one/speckit')` (or a path-resolved equivalent in-repo) resolves to `lib.js` and exposes `manifestFacts`/`engineFor`.
- **Regression** — full 001–008 suite green; `npm run 021-*` aliases unchanged.

## Work breakdown

See [tasks.md](tasks.md).
