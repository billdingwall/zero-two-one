# Data Model: End-to-End Test Harness (scaffold + migrate)

*The entities the harness manipulates — no persistent schema; these are runtime test structures. Grounds [contracts/e2e-harness.md](contracts/e2e-harness.md).*

## The matrix (Q3)

`{claude, antigravity, kiro} × {scaffold, migrate}` = **6 cells**, each a fresh target repo, all at `--phase planning`.

| Cell | Stack | Mode | Expected `mode` | Expected `ssd` |
|---|---|---|---|---|
| 1 | claude | scaffold | `scaffold` | `github-speckit` |
| 2 | claude | migrate | `migrate` | `github-speckit` |
| 3 | antigravity | scaffold | `scaffold` | `github-speckit` |
| 4 | antigravity | migrate | `migrate` | `github-speckit` |
| 5 | kiro | scaffold | `scaffold` | `kiro-specs` |
| 6 | kiro | migrate | `migrate` | `kiro-specs` |

## Entities

### Toolbox
The shared install host. `mkdtemp()` + minimal `package.json`; receives `npm install --prefer-offline <tgz>` **once**. Exposes:
- `BIN_INIT` = `node_modules/zero-two-one/bin/init.js`
- `BIN_021` = `node_modules/zero-two-one/bin/021.js`
- `SPECKIT` = `require('<toolbox>/node_modules/zero-two-one/speckit')` (the `exports` map → `scripts/speckit/lib.js`)

### Packed artifact
`package/zero-two-one-<ver>.tgz` produced by `cd package && npm pack` after `sync:package --check`. The real 108-file shipped tarball (R1).

### Target repo
A `mkdtemp()` dir, `git init -q`, **local** `git config user.email/name`. One per cell; pristine (no `node_modules`). Seeded per mode:

| Mode | Seeds (pre-install) | Asserted post-install |
|---|---|---|
| **scaffold** | *(nothing — bare git repo)* | `mode: scaffold`; full stack surface rendered |
| **migrate** | `docs/overview.md` (non-framework, **non-code** → the migrate trigger, keeps phase planning) + custom `CODE.md` (create-if-missing preservation) + pre-existing `.git/hooks/pre-commit` (chaining signal) | `mode: migrate`; `docs/overview.md` **and** `CODE.md` byte-unchanged; original hook body still present + runs after the gate |

> **Migrate-trigger rule (analyze A2):** `detectMode` ⇒ migrate iff a **non-framework** file exists. Framework-surface files — including the user docs `README.md`/`CODE.md`/`PRODUCT.md`/`DESIGN.md` (create-if-missing) — do **not** count; `specs/_INDEX.md` is **not** a populated-specs signal (`populatedSpecs` needs `specs/<dir>/spec.md`); a **code** file would trigger migrate **but** flip the detected phase to `mvp` (→ `qa` code tier → fail). Hence the trigger is a non-framework **non-code** doc under `docs/`. The pre-existing `.git/hooks/pre-commit` (under `.git/`, NOISE-ignored) tests chaining but is not itself a trigger.

### Install-surface signature (per stack)
The files whose presence proves the stack rendered (asserted in `assertSurface`):

| Stack | Signature files |
|---|---|
| **claude** | `CLAUDE.md`; `.claude/commands/021-status.md` (+ other `021-*.md`) |
| **antigravity** | `AGENTS.md`; `.agents/skills/021-status/SKILL.md` |
| **kiro** | `.kiro/steering/021-product.md` (+ `021-tech.md`, `021-structure.md`); `.kiro/agents/021.json` |

*(All stacks also get the Layer-1 neutral core: `requirements/`, `workflow/`, `scripts/`, `hooks/pre-commit`, `.zero-two-one.json`.)*

### Manifest facts (assertion source)
`SPECKIT.manifestFacts(target)` → `{ stack, phase, ssd, … }` and `SPECKIT.readManifest(target).mode`. Read through the shipped parser — the FR-003 "no output-scraping" rule. Asserted against the cell's expected row.

### Gate probe
The structures `proveGate` creates in a target to prove the refinement gate:

| Element | Value | Why |
|---|---|---|
| initial commit | `git commit -m init` on the default branch **before** the probe branch | **born HEAD** — else `git rev-parse --abbrev-ref HEAD` fails on the unborn branch, `currentBranch()`→null, the branch never resolves to a spec (analyze A1) |
| branch | `042-e2e-probe` | matches the gate's `^[0-9]{3}-` feature-branch regex |
| spec doc (github-speckit) | `specs/042-e2e-probe/spec.md`, `status: Draft` → `Approved` | engine resolves gate state here |
| spec doc (kiro-specs) | `.kiro/specs/042-e2e-probe/requirements.md`, `status: Draft` → `Approved` | kiro engine's spec surface |
| impl file | `src/feature.js` | **outside** the hook exclude surface (R3) — the file the gate actually guards |
| status flip | `021 spec status set 042-e2e-probe Approved` | engine `writeStatus`; never hand-edited |
| expected | `git commit` **blocked** at Draft, **allowed** at Approved | the gate's contract, end-to-end |

## File inventory & ownership

| Path | New/Changed | Ownership | Ships? |
|---|---|---|---|
| `test/e2e/e2e.test.js` | new | dev / test | no (`test/` not in `files`) |
| `test/e2e/harness.js` | new | dev / test | no |
| `package.json` (root) | changed (+`test:e2e`) | dev | no (root pkg isn't the shipped one) |
| `.github/workflows/ci.yml` | changed (+`e2e` job) | dev / CI | no (`githubExclusions: workflows`) |

**Net effect on the package: none.** `sync:package --check` stays green; the tarball's 108-file set is unchanged.
