# Research: End-to-End Test Harness (scaffold + migrate)

*Decisions and their grounding, keyed to the Clarify answers (Q1–Q5) and the code as it actually is. Rejected alternatives at the end.*

## R1 — The artifact is the `package/` tarball, not the repo root (Q1)

The framework publishes from the **`package/` snapshot** (`publish:package` = `sync:package && cd package && npm publish`; TDD §14). `cd package && npm pack --dry-run` → **108 files, 90.4 kB**, name `zero-two-one` v1.1.0, with both bins, `hooks/pre-commit`, `scripts/speckit/verify-spec-compliance.js`, and the `exports` map. Root `npm pack` would ship the *dev* tree (wrong `files`, dev-only content). So the harness runs **`npm run sync:package -- --check`** (fail on drift) then **`cd package && npm pack`**. This is what makes FR-008 meaningful: the e2e proves the *shipped* artifact installs and runs.

**Fold of the mvp-6 step-4 per-stack smoke test:** because this installs the tarball per stack, step 4's "fresh-install smoke test per stack" is subsumed here. Step 4's publish gate keeps only the concerns this harness does *not* cover: the tarball-**content** audit (no internal `specs/00N-*` or dev files — note `specs/` is absent from the `files` whitelist, so that regression is already structurally prevented) and the provenance/`--check`/link gate.

## R2 — Toolbox topology keeps target repos pristine

`bin/init.js` sources the framework from `PACKAGE_ROOT = __dirname/..` (the installed package), and `bin/init.js <target>` accepts a **target-dir positional**. So the harness installs the tarball **once** into a throwaway **toolbox** dir (`npm install --prefer-offline <tgz>`), then runs `node <toolbox>/node_modules/zero-two-one/bin/init.js <target> --stack …` against each of the 6 pristine targets. Benefits: (a) targets carry **no `node_modules`/`package-lock`** that could trip migrate detection; (b) one install amortized across 6 cells; (c) the installed `021` CLI resolves scripts package-relative and data from `cwd`, so `run021(cmd, {cwd: target})` is correctly project-scoped.

## R3 — The gate-probe file must be OUTSIDE the hook's exclude surface (Q4)

`hooks/pre-commit` only treats a staged file as "implementation" when it is **not** `*.md` **and not** under `^(specs/|\.kiro/|requirements/|workflow/|skills/|templates/|prototype/|hooks/|scripts/|bin/|\.github/|\.ai/)`. A naïve probe like `scripts/x.js` is in the exclude set → the gate **ignores it and the commit passes**, silently breaking the test's premise. The probe is therefore **`src/feature.js`** (JS, outside every excluded prefix). Confirmed against the hook body in-repo. This is the single most important correctness detail in the harness.

## R4 — The gate proof is engine-aware; status set via the shipped CLI

The gate calls `verify-spec-compliance.js --gate`, which resolves spec state through the **SSD engine** (spec 008). `claude`/`antigravity` → `github-speckit` (`specs/<feat>/spec.md`, `status:` frontmatter); `kiro` → `kiro-specs` (`.kiro/specs/<feat>/requirements.md`, `status:` frontmatter). So `proveGate` writes the **engine-appropriate** spec doc for the cell's stack, and flips Draft→Approved with the **shipped** `021 spec status set <feat> Approved` (engine `writeStatus`), never a hand-edit — this also exercises the CLI's write path end-to-end. Pattern precedent: `test/speckit/engine.test.js` already drives the gate via subprocess against a git fixture (T013/T014); the e2e goes further with a **real `git commit`** rather than invoking `--gate` directly.

## R5 — `--phase planning` so `021 qa` is green without app code

`scripts/run-qa.sh` runs a **docs tier** in phase 0 (planning) and **full code QA** (unit tests, a11y) in phases 1–2. A freshly installed target has no app code, so the harness installs at the **default `--phase planning`**; `021 qa` then runs the docs tier and exits 0. (Different phases are the human field test's job, step 2 — not the automated coherence floor.)

## R6 — Hermeticity: offline install + local git identity + full teardown

- **Offline:** the tarball is zero-runtime-dependency (TDD §3), so `npm install --prefer-offline --no-audit --no-fund <tgz>` completes without the registry. No other step touches the network.
- **Git identity:** each target sets **local** `git config user.email/user.name` (the `test/speckit/engine.test.js` pattern) — no dependence on the developer's global config; the gate's branch/commit logic is unaffected.
- **Teardown:** toolbox + all 6 targets + the packed `.tgz` are created under `os.tmpdir()` and `rm -rf`'d in `after`/`finally` on pass or fail (FR-006).

## R7 — Nothing new ships; CI on every PR (Q2/Q5)

- `test/e2e/**` is root-only (`test/` isn't in the package `files` whitelist) and the `test:e2e` script lives only in the **root** `package.json` (the dev entry). `package/package.json` is a preserved, hand-maintained file and is untouched → `sync:package --check` stays green, tarball file set unchanged.
- CI: `.github/workflows/` is dropped from the package by `sync-to-package.js` `githubExclusions` (`workflows`), so adding an **`e2e` job** to the existing `.github/workflows/ci.yml` is dev-only. The current `ci.yml` already has a lightweight *"init into a fixture repo"* step (source-tree, claude-only, **no** gate/lifecycle). The e2e job **supersedes** it; at implementation, either drop that step or keep it as a fast smoke pre-check before the heavier e2e job (leaning: keep it — it fails faster on gross breakage).

## R8 — Migrate detection is signal-specific (fixture design) — corrected by analyze A2

`detectMode` (read from `scripts/init/migrate/detect.js`) ⇒ **migrate iff any non-framework file exists** in the target, where "framework" excludes `.zero-two-one.json`, every **framework-surface** path, `.ai/context/*`, and `*.zero-two-one.md`. Two traps this closes:

- **The user docs are framework surface.** `README.md`/`CODE.md`/`PRODUCT.md`/`DESIGN.md` are `USER_FILES_COMMON` (create-if-missing) — so seeding them does **not** trigger migrate. And `specs/_INDEX.md` is not a signal: `populatedSpecs` requires `specs/<dir>/spec.md`.
- **A code file would trigger migrate but flip the phase.** `hasSubstantialCode` (any `CODE_EXT` file outside `test|tests|docs|requirements|specs|.github|.ai`) drives `detectPhase` → `mvp`, which makes `021 qa` run the **code** tier (needs `npm test`) → fail.

So the **migrate fixture** seeds a **non-framework, non-code** doc — **`docs/overview.md`** (`docs/` is a NON_CODE_DIR, unowned) — as the reliable migrate trigger that keeps phase `planning`, plus a custom **`CODE.md`** (to assert create-if-missing preservation) and a pre-existing **`.git/hooks/pre-commit`** (chaining; under `.git/`, NOISE-ignored, so not itself a trigger). The **scaffold fixture** seeds **nothing** (bare `git init`) ⇒ scaffold. The toolbox topology (R2) keeps `node_modules`/lockfiles out of both, so no false signal leaks in.

## R9 — Migrate runs non-interactively under `spawnSync` (analyze A5)

The migrate interview (`scripts/init/migrate/interview.js`) prompts only when `!opts.yes && !opts.nonInteractive && process.stdin.isTTY && process.stdout.isTTY`. `spawnSync` with piped stdio has **no TTY**, so `promptable()` is false ⇒ zero prompts, safe defaults, never blocks. The harness passes **`--yes`** on migrate cells anyway, as explicit belt-and-suspenders against a TTY-inheriting CI runner.

## Rejected alternatives

- **Install from the source tree / `node bin/init.js` (repo root).** Faster, but tests the dev tree, not the shipped `package/` — misses packaging drift, which is the whole point of an e2e before publish. Rejected per Q1. (The old `ci.yml` source-smoke step does exactly this at claude-only; the e2e replaces it.)
- **Prove the gate by running `verify-spec-compliance.js --gate` directly** (as `engine.test.js` does). Lower fidelity — skips the installed `.git/hooks/pre-commit` wiring and real `git commit` exit semantics, which are exactly the integration seams an e2e exists to cover. Rejected per Q4.
- **A `021 qa` e2e tier / folding e2e into `npm test`.** Would slow every routine QA/test run with 6 real installs + git. Rejected per Q2 — kept as a standalone `test:e2e` lane.
- **claude-only automation.** Cheaper, but abandons the cross-stack promise that is mvp-4's core deliverable; the harness parametrizes by `--stack` at negligible extra cost. Rejected per Q3.
- **A shell-driver harness (`test/e2e/run.sh`).** Closer to a raw user session but introduces a second test style diverging from the repo's `node --test` suites and is harder to assert/teardown cleanly. Rejected per Q4 (kept `node --test`).
- **Installing the tarball into each target** (not a shared toolbox). Pollutes targets with `node_modules` (false migrate signals) and pays the install cost 6×. Rejected per R2.
