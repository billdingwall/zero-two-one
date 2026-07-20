# Implementation Plan: CI Publish Pipeline & Pre-Publish Gate

*The HOW for [spec.md](spec.md). A zero-dep **`scripts/prepublish-gate.js`** inspects the packed `package/` tarball + manifests and fails on any r7/r9 hygiene regression; a tag-triggered **`.github/workflows/publish.yml`** runs `sync --check` → the gate → `npm publish --provenance` via **trusted publishing (OIDC, no secret)**; and the **shipped `package/README.md`** becomes a separately-maintained install-focused file (sync stops overwriting it). Grounded in TDD §14 + the 2026-07-20 Clarify session.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/prepublish-gate.js`), GitHub Actions YAML, Markdown (README) |
| **Dependencies** | **None** (FR-008) — gate uses `child_process`/`fs`/`path` only; workflow uses `actions/checkout` + `actions/setup-node` only |
| **New files** | `scripts/prepublish-gate.js`; `.github/workflows/publish.yml`; `package/README.md` (install-focused); `test/publish/gate.test.js` |
| **Changed** | root `package.json` (+`prepublish:check` script); `scripts/sync-to-package.js` (`README.md`: `filesToCopy` → `preserveInPackage`; `prepublish-gate.js` → `scriptExclusions`); `scripts/_INDEX.md` |
| **Tarball inspection** | `cd package && npm pack --json --dry-run` → `[{path,size,…}]` file list (FR-004); zero-dep parse |
| **Reuses** | `scripts/check-links.js` via **subprocess** (`node scripts/check-links.js`, non-zero ⇒ broken-links fail — it's a script, not a module); `sync-to-package.js --check` (the drift guard, run by the workflow before the gate) |
| **Auth** | **Trusted publishing (OIDC)** — `permissions: id-token: write`, `npm publish --provenance`, **no `NPM_TOKEN`** (Q1); npmjs trusted-publisher config is the maintainer's |
| **Not shipped** | `.github/workflows/**` (sync `githubExclusions`); `scripts/prepublish-gate.js` (added to `scriptExclusions`); `test/publish/**` (test/ not in `files`) — `sync --check` stays green |
| **Source of truth** | TDD §14 (Publish Pipeline); mvp-6 scope step 2; r7 audit + r9 review (the hygiene catalogue) |

## Constraints check (must hold)

- **Publish is CI-only, tag-triggered, provenance** (FR-001/002) — `on: push: tags: ['v*.*.*']`; `npm publish --provenance` from `package/` under `id-token: write`; no stored secret (trusted publishing). Local `publish:package` stays as the documented fallback (FR-007).
- **The gate fails the build, naming the check** (FR-003) — non-zero exit on any of (a) dangling `main`, (b) missing `LICENSE`, (c) `.ai/context` bundle in tarball (`.gitkeep` allowed), (d) broken links, (e) `specs/00N-*`/dev-file in tarball, (f) missing/trivial shipped README. A clean tree passes.
- **Tarball-aware** (FR-004) — (c)/(e)/(f) read the real `npm pack --json` file list from `package/`, not the repo tree.
- **Same verdict in CI and locally** (FR-005) — `npm run prepublish:check` is the one entry; the workflow calls it.
- **README split keeps sync green** (FR-006) — remove `README.md` from `filesToCopy`, add it to `preserveInPackage`, so sync neither copies nor flags `package/README.md`; author it install-focused; `sync:package --check` stays clean.
- **Nothing new ships** — gate script in `scriptExclusions`, workflow under `.github/workflows/`, tests root-only; the tarball's 108-file set changes only by the README content (still 108 files).
- **Zero dependencies** (FR-008).
- **Out of scope: the actual publish** — this spec builds + dry-runs; firing the pipeline (tagging) + npmjs trusted-publisher setup are the maintainer's.

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The six gate checks (input → pass/fail rule), the parameterized gate signature, the workflow job shape, file inventory + ownership |
| [contracts/publish-pipeline.md](contracts/publish-pipeline.md) | `prepublish-gate.js` CLI/API contract (exit codes, report format, `--package`/`--root` params for tests); the `publish.yml` job contract; the sync-exclusion change |
| [research.md](research.md) | Why trusted publishing (first-publish path); tarball inspection via `npm pack --json`; check-links reuse via subprocess; README-split sync mechanics; the current tree already passes (gate = regression guard); rejected alternatives |
| [quickstart.md](quickstart.md) | Local dry-run: `npm run prepublish:check` on the clean tree; inject a violation and watch it fail; `npm publish --dry-run`; the real release ritual (tag push) |

## Approach

### A1. The gate (`scripts/prepublish-gate.js`) — FR-003/004/005/008

```
node scripts/prepublish-gate.js            # gate the real package/ + repo
  → prepublishGate({ root = repoRoot, packageDir = root/package }) → { ok, failures[] }

steps:
  files = JSON.parse( sh('npm pack --json --dry-run', { cwd: packageDir }) )[0].files  # [{path,size}]
  paths = files.map(f => f.path)
  (a) main:    for m in [root/package.json, packageDir/package.json]:
                 if m.main && !paths.includes(m.main) → FAIL "dangling main: <m.main>"
  (b) license: assert exists(root/LICENSE) && paths.includes('LICENSE')            → else FAIL
  (c) ai:      p in paths matching /^\.ai\/context\/.+/ && basename !== '.gitkeep'  → FAIL
  (d) links:   sh('node scripts/check-links.js', {cwd: root}) exit !== 0            → FAIL "broken links"
  (e) leak:    p in paths matching /^(specs|test|tests)\// OR a dev-file denylist   → FAIL
  (f) readme:  readme = paths.find(=='README.md'); size > 200 bytes                → else FAIL
  print a doctor-style report; exit(failures.length ? 1 : 0)
```

- Parameterized (`root`, `packageDir`) so tests point it at fixtures (contracts). Default = the real repo.
- `npm pack --json --dry-run` is the single tarball source of truth; no second packer.
- Report mirrors `021 doctor` styling (✓/✗ per check, a summary line).

### A2. The workflow (`.github/workflows/publish.yml`) — FR-001/002

```yaml
name: Publish
on:
  push:
    tags: ['v*.*.*']
permissions:
  contents: read
  id-token: write            # provenance via trusted publishing (Q1)
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", registry-url: "https://registry.npmjs.org" }
      - run: npm run sync:package -- --check      # drift guard (TDD §14)
      - run: npm run prepublish:check             # the gate (FR-005)
      - run: npm publish --provenance
        working-directory: package
```

No `NPM_TOKEN` — trusted publishing authenticates via OIDC. A header comment documents the one-time npmjs trusted-publisher setup + the first-publish path (research R1).

### A3. README split — FR-006

`scripts/sync-to-package.js`: remove `'README.md'` from `filesToCopy`; add `'README.md'` to `preserveInPackage` (so `--check` treats it like `package.json` — hand-maintained, not drift). Author `package/README.md` install-focused (what it is → prerequisites → `npx zero-two-one-init` / `npx 021 …` → link to the getting-started guides). Root `README.md` stays contributor-focused (unchanged). Add `'prepublish-gate.js'` to `scriptExclusions`.

### A4. Wire-in — npm script + indexes

root `package.json`: `"prepublish:check": "node scripts/prepublish-gate.js"`. Optionally have `publish:package` run the gate first (fallback stays gated). `scripts/_INDEX.md` gains the `prepublish-gate.js` row.

## Testing strategy

`node:test` in `test/publish/gate.test.js`, using fixture package dirs:
- **Clean passes** — gate over a fixture mirroring today's clean tarball → `ok:true`.
- **Each violation fails** — inject and assert a named failure: a dangling `main`; a removed `LICENSE`; a `.ai/context/013-x.md` bundle; a `specs/099-x/spec.md` leak; a trivial/empty `README.md`. (`.ai/context/.gitkeep` alone must still pass.)
- **Broken links** — point `root` at a fixture with an unresolved link → the subprocess check fails the gate.
- **Tarball-aware** — the injected files live only in the fixture `package/`, proving `npm pack --json` inspection (not repo-tree scanning).
- **Meta / regression** — the real tree passes (`prepublish:check` green); `npm test` green; `sync:package --check` green after the README-exclusion change; the tarball still lists `README.md` and stays 108 files.

## Cross-artifact analysis (folded)

*Six findings from the 2026-07-20 Analyze pass, verified against the real `npm pack --json` output and `sync-to-package.js`. Annotated `analyze A#` where they touch tasks.*

- **A1 (sequencing) — `sync --check` is git-status-based.** `sync -- --check` runs the deterministic sync then flags `package/` via `git status`, so it reports drift for **any uncommitted `package/` change**. The README split works because sync stops writing `package/README.md` (removed from `filesToCopy`, added to `preserveInPackage`), so the committed install-focused copy persists — but **"sync --check green" (T018) is a post-commit check**; during dev expect drift until `package/README.md` is committed (the known "unstaged-package drift resolves on commit" pattern). CI checks a committed tree, so it passes. Touches T012/T013/T018.
- **A2 (correctness) — tarball paths have no `./` prefix; normalize `main`.** `npm pack --json` yields bare paths (`.ai/context/.gitkeep`, `README.md`). The dangling-`main` check (a) must **strip a leading `./` from the manifest `main`** before comparing to the path list (a valid `main: "./bin/x.js"` vs tarball `bin/x.js` would otherwise false-fail). Checks (c)/(e)/(f) anchor on bare paths (`^\.ai/context/`, `^(specs|test|tests)/`, `README.md`). Touches T011.
- **A3 (hygiene) — `--dry-run` leaves no tarball.** `npm pack --json --dry-run` reports the file list **without** writing a `.tgz`, so the gate leaves `package/` clean (unlike spec 013, which packed for real then removed the tgz). No cleanup step; `sync --check` unaffected. Touches T011.
- **A4 (guard) — the leak denylist must not false-positive on shipped config.** `.gitignore` is legitimately shipped (`filesToCopy`); the dev-file denylist (`sync-to-package.js`/`check-links.js`/`prepublish-gate.js`/`CONTRIBUTING.md`/`.editorconfig`) targets files **already excluded** from the tarball, so check (e) is a pure regression guard — it must **not** list `.gitignore`/`README.md`/`LICENSE`. Verified: today's 108-file tarball has zero matches. Touches T011/T008.
- **A5 (scope) — `check-links` scans the repo, a superset of shipped markdown.** The gate reuses `check-links.js` over the repo root; shipped markdown (templates/skills/workflow/README) is a subset, so a clean repo ⇒ clean shipped links. No tarball-scoped link check needed. Touches T011.
- **A6 (maintainer note) — first publish can't self-bootstrap.** `npm publish --provenance` runs in `package/`; trusted publishing needs the npmjs package/publisher pre-configured, so the very first publish follows the R1 path (pre-configure, or seed once via `publish:package`). Documented in the workflow header + quickstart — not a code concern. Touches T014.

## Work breakdown

See [tasks.md](tasks.md) (generated in the Task step).
