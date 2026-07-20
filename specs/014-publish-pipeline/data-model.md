# Data Model: CI Publish Pipeline & Pre-Publish Gate

*Runtime structures — no persistent schema. Grounds [contracts/publish-pipeline.md](contracts/publish-pipeline.md).*

## The gate: `prepublishGate({ root, packageDir })`

Input: a repo `root` (default `repoRoot()`) and a `packageDir` (default `root/package`). Derives the tarball file list from `npm pack --json --dry-run` in `packageDir`. Returns `{ ok: boolean, failures: string[] }` and the CLI exits non-zero when `!ok`.

### The six checks

| # | Check | Input | Fails when |
|---|---|---|---|
| a | **No dangling `main`** | `root/package.json`, `packageDir/package.json` | a manifest declares `main` but that path is not in the tarball file list |
| b | **`LICENSE` present** | filesystem + tarball list | `root/LICENSE` missing, or `LICENSE` not in the tarball |
| c | **No `.ai/context` bundle** | tarball list | a path matches `^\.ai/context/.+` whose basename ≠ `.gitkeep` |
| d | **No broken links** | `node scripts/check-links.js` (cwd `root`) | the subprocess exits non-zero |
| e | **No spec/dev leak** | tarball list | a path matches `^(specs\|test\|tests)/` or a dev-file denylist (`sync-to-package.js`, `check-links.js`, `prepublish-gate.js`, `.editorconfig`, `CONTRIBUTING.md`…) |
| f | **Shipped README non-trivial** | tarball list | `README.md` absent from the tarball, or its size ≤ 200 bytes |

*Each failure pushes a specific string (e.g. `"dangling main: ./index.js"`, `".ai/context bundle would ship: .ai/context/013-e2e-test.md"`). Report is `021 doctor`-styled (✓/✗ per check + summary).*

## The workflow: `publish.yml`

| Field | Value |
|---|---|
| trigger | `on: push: tags: ['v*.*.*']` (Q4) |
| permissions | `contents: read`, `id-token: write` (provenance, Q1) |
| runner | `ubuntu-latest`, `actions/setup-node@v4` node 20, `registry-url: https://registry.npmjs.org` |
| steps | `sync:package -- --check` → `prepublish:check` (the gate) → `npm publish --provenance` (`working-directory: package`) |
| auth | trusted publishing (OIDC) — **no `NPM_TOKEN`** |

## The README split

| File | Role | Sync behavior (after change) |
|---|---|---|
| `README.md` (root) | contributor / repo (unchanged) | **removed** from `filesToCopy` — no longer copied to `package/` |
| `package/README.md` | install-focused (npm consumers) — **new, hand-maintained** | added to `preserveInPackage` — sync leaves it; `--check` treats it like `package.json` |

## File inventory & ownership

| Path | New/Changed | Ships? |
|---|---|---|
| `scripts/prepublish-gate.js` | new | **no** — added to `scriptExclusions` |
| `.github/workflows/publish.yml` | new | no — `githubExclusions: workflows` |
| `package/README.md` | new content (install-focused) | **yes** — the shipped README |
| `test/publish/gate.test.js` | new | no — `test/` not in `files` |
| `package.json` (root) | +`prepublish:check` script | no (root pkg not shipped) |
| `scripts/sync-to-package.js` | README exclusion + gate exclusion | no (dev-only, already excluded) |
| `scripts/_INDEX.md` | +`prepublish-gate.js` row | ships (unchanged behavior) |

**Net tarball effect:** still **108 files** — only `package/README.md`'s *content* changes (root→independent); no file added or removed from the shipped set. `sync:package --check` stays green.
