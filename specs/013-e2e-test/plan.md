# Implementation Plan: End-to-End Test Harness (scaffold + migrate)

*The HOW for [spec.md](spec.md). A **`node --test` suite in `test/e2e/`**, run via a new **`npm run test:e2e`** (out of the default `npm test`), that installs the **`package/` tarball** (`npm pack`, the real shipped artifact) into a reusable **toolbox** and drives it against **6 throwaway git repos** (3 stacks × 2 modes). Each cell asserts install surface + manifest (via the shipped `zero-two-one/speckit` export) + green `021 status/qa/doctor` + the pre-commit gate proven by a **real `git commit`**. Zero new runtime deps; wired into `.github/workflows/ci.yml` on every PR. Grounded in the mvp-6 scope (r8) + the 2026-07-19 Clarify session.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js `node --test` suite; `child_process` drives real `git`, `npm`, and the installed bins |
| **Dependencies** | **None** (FR-007) — `node:test`, `node:child_process`, `node:fs`, `node:os`, `node:path`, `node:crypto` only |
| **New files** | `test/e2e/e2e.test.js` (the suite); `test/e2e/harness.js` (provision/install/assert helpers) |
| **Changed** | root `package.json` (+`test:e2e` script; **root-only, not shipped**); `.github/workflows/ci.yml` (+`e2e` job) |
| **Artifact under test** (Q1) | The **`package/` tarball** — `npm run sync:package -- --check` (fail on drift) → `cd package && npm pack` → `zero-two-one-1.1.0.tgz` (108 files, the real publish artifact per TDD §14) |
| **Install topology** | One **toolbox** temp dir gets `npm install --prefer-offline <tgz>` once; the 6 target repos stay **pristine** (invoked as `node <toolbox>/node_modules/zero-two-one/bin/init.js <target> --stack …`, target-dir positional — no `node_modules` pollution that would perturb scaffold/migrate detection) |
| **Reuses** | the shipped `require('<toolbox>/node_modules/zero-two-one/speckit').manifestFacts(target)` (exports map, spec 009) for manifest assertions — **no output-scraping** (FR-003); the git-init/config fixture pattern from `test/speckit/engine.test.js` |
| **Matrix** (Q3) | `{claude, antigravity, kiro} × {scaffold, migrate}` = 6 installs, all `--phase planning` (default) so `021 qa` runs the docs tier and passes without app code |
| **Not synced** | `test/e2e/**` is root-only (`test/` not in the package `files` whitelist); the CI job lives in `.github/workflows/` which `sync-to-package.js` `githubExclusions` drops — **nothing new ships** |
| **Source of truth** | mvp-6 scope steps 1–2 (r8); TDD §5 (package), §7 (manifest), §9 (adapters + SSD gate), §14 (publish artifact = `package/`) |

## Constraints check (must hold)

- **Real artifact, real flow** (FR-001/008) — installs the **`package/` tarball**, not the source tree, via `npm install`, then runs the **installed bins** (`bin/init.js`, `bin/021.js`) exactly as a consumer does. Bin arg parsing, `npm`'s bin-linking, hook wiring, and cross-file references are all exercised.
- **Hermetic** (FR-006) — everything under `os.tmpdir()`; per-repo local `git config user.*` (no global reliance); `npm install --prefer-offline` (zero-dep tarball installs offline); no other network; `after`/`finally` `rm -rf` every temp dir on pass **or** fail.
- **Gate proven by a real commit** (FR-004, Q4) — the installed `.git/hooks/pre-commit` fires on a real `git commit`. **The probe impl file must sit outside the hook's exclude surface** — the gate ignores `specs/ .kiro/ requirements/ workflow/ skills/ templates/ prototype/ hooks/ scripts/ bin/ .github/ .ai/` and all `*.md`, so the probe is e.g. **`src/feature.js`** (a naïve `scripts/x.js` would be *ignored* and wrongly pass). Git identity for the commit is local to the repo.
- **Gate is engine-aware** — proof adapts to the stack's SSD engine: `claude`/`antigravity` → `github-speckit` (`specs/NNN-feature/spec.md`); `kiro` → `kiro-specs` (`.kiro/specs/<feature>/requirements.md`, `status:` frontmatter). Status is flipped via the shipped `021 spec status set … Approved` (delegates to the engine — spec 008), never by hand-editing.
- **Hook is active at commit time** — the plain-strategy install writes `.git/hooks/pre-commit` → so the target repo is **`git init`'d before install**; migrate additionally seeds a **pre-existing** `.git/hooks/pre-commit` to prove chaining (not clobbering).
- **Complements, does not duplicate, the unit suites** (FR-005) — no re-assertion of `scripts/init/*` internals; the e2e only checks end-to-end coherence. It stays **out of `npm test`** and `021 qa` (FR-010); it is its own `test:e2e` lane.
- **Zero dependencies** (FR-007) — built-ins only; `node --test`, no runner, no framework.
- **Nothing new ships** — `test/e2e/**` and the `test:e2e` script and the CI job are all dev-only; `sync:package --check` stays green and the tarball content is unchanged.

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The 6-cell matrix; the toolbox + target-repo entities; scaffold vs migrate fixture seeds; per-stack install-surface signatures; the gate-probe shape; file inventory + ownership |
| [contracts/e2e-harness.md](contracts/e2e-harness.md) | `harness.js` API (`packAndInstall`, `provisionTarget`, `runInit`, `run021`, `assertSurface`, `assertManifest`, `proveGate`, `teardown`); the `test:e2e` script + CI job contract; exit-code/assertion semantics |
| [research.md](research.md) | Why the `package/` tarball (not root/source); toolbox topology (pristine targets); the gate-exclude-surface correction; engine-aware gate proof; `--phase planning` for green `qa`; migrate-detection signal analysis; `prefer-offline` hermeticity; step-4 smoke-test fold; rejected alternatives |
| [quickstart.md](quickstart.md) | `npm run test:e2e` locally; the packed-tarball setup; reading a single cell's output; what a gate-proof failure looks like; CI on every PR |

## Approach

### A1. Global setup — pack the real artifact, install once (FR-001/008)

```
before all:
  1. sh: npm run sync:package -- --check          # fail fast on package drift (FR-008)
  2. sh: (cd package && npm pack)                 # → package/zero-two-one-<ver>.tgz  (the shipped 108-file artifact)
  3. toolbox = mkdtemp(); write minimal package.json
     sh: npm install --prefer-offline --no-audit --no-fund <abs tgz>   (in toolbox)  # offline: zero-dep
  4. BIN_INIT = toolbox/node_modules/zero-two-one/bin/init.js
     BIN_021  = toolbox/node_modules/zero-two-one/bin/021.js
     SPECKIT  = require(toolbox/node_modules/zero-two-one/speckit)      # exports map (spec 009)
```

Packing from `package/` (not the repo root) is the crux: it tests exactly what `npm publish` ships. The toolbox is installed **once** and reused across all 6 cells — targets never receive `node_modules`, so migrate/scaffold detection sees only what the fixture seeds.

### A2. Per-cell provision + install (FR-002)

```
for stack in [claude, antigravity, kiro]:
  for mode in [scaffold, migrate]:
    target = mkdtemp()
    sh: git -C target init -q ; git config user.email/name (local)     # hook live at commit time
    if mode == migrate: seed README.md + specs/_INDEX.md + a pre-existing .git/hooks/pre-commit (+ a tool surface)
    sh: node BIN_INIT target --stack <stack> [--phase planning]         # installed bin, target positional
    → assert (A3)
```

- **scaffold** cell: bare `git init` repo, no migrate signals → expect `mode: scaffold`, full render.
- **migrate** cell: pre-populated (guiding doc + `specs/` + existing hook) → expect `mode: migrate`, user docs preserved byte-for-byte, existing hook **chained** (both the gate and the user's original hook body present in `.git/hooks/pre-commit`).

### A3. Per-cell assertions (FR-003)

1. **Install surface** — the stack's signature files exist (data-model §per-stack): claude → `CLAUDE.md` + `.claude/commands/021-*.md`; antigravity → `AGENTS.md` + `.agents/skills/021-*/SKILL.md`; kiro → `.kiro/steering/021-*.md` + `.kiro/agents/021.json`.
2. **Manifest** — `SPECKIT.manifestFacts(target)` → `{ stack, phase, ssd }` matches, and `readManifest(target).mode` matches the cell mode. Read through the **shipped** parser (dogfoods the exports map; no scrape).
3. **Lifecycle green** — `run021('status'|'qa'|'doctor')` with `cwd: target` each exit `0` (planning phase → `qa` docs tier, no app code needed).
4. **Migrate-only** — user's `README.md`/`CODE.md` unchanged; original hook body still runs after the gate.

### A4. Gate proof — a real commit (FR-004, Q4)

```
proveGate(target, stack):
  feat = "042-e2e-probe"
  sh: git -C target checkout -q -b <feat>
  engineWriteSpec(target, stack, feat, status="Draft")     # github-speckit: specs/<feat>/spec.md ; kiro: .kiro/specs/<feat>/requirements.md
  write target/src/feature.js  ("// probe")                # OUTSIDE the hook exclude surface
  sh: git -C target add -A
  BLOCKED: git -C target commit -m x   → EXPECT non-zero exit, stderr "COMMIT BLOCKED"     (Draft ⇒ gate blocks)
  sh: node BIN_021 spec status set <feat> Approved   (cwd target)                          (engine writeStatus)
  ALLOWED: git -C target commit -m x   → EXPECT zero exit                                  (Approved ⇒ gate permits)
```

Runs on **every** cell; the engine-appropriate spec doc + resolution differ for kiro (`.kiro/specs`). This is the highest-fidelity proof: the *installed* hook, a *real* branch, a *real* impl file, *real* `git commit` exit codes — the exact thing a developer hits.

### A5. Wire-in — `test:e2e` + CI (FR-010, Q2/Q5)

- root `package.json`: `"test:e2e": "node --test test/e2e/"` — **separate from** `"test"` (unit suites stay fast).
- `.github/workflows/ci.yml`: a new **`e2e`** job (`runs-on: ubuntu-latest`, `setup-node@20`, `run: npm run test:e2e`) triggered on every push/PR (existing `on:` covers it). The existing lightweight *"init into a fixture repo"* step (source-tree, claude-only, no gate) is **superseded** by the e2e job; keep it as the fast pre-check or fold it — decided at implementation (noted in research R7).

## Testing strategy

The harness **is** the test. `node --test test/e2e/e2e.test.js` emits one subtest per matrix cell plus the gate proof:
- **6 install cells** — surface + manifest (mode/stack/phase) + `021 status/qa/doctor` green; migrate cells additionally assert non-destructive + hook chaining.
- **6 gate proofs** — real-commit blocked-then-allowed, engine-aware.
- **Setup/teardown** — pack+install once; every temp dir removed on pass/fail.
- **Meta** — `test:e2e` exists and is **not** part of `npm test`; the CI `e2e` job exists; `sync:package --check` green and the tarball file set unchanged (nothing new ships).

Runtime budget: 6 installs + 12 commits off one `npm install` of a zero-dep tarball — acceptable on every PR (Q5).

## Cross-artifact analysis (folded)

*Six findings from the 2026-07-19 Analyze pass, two empirically verified against the real gate. Annotated `analyze A#` where they touch tasks/contracts.*

- **A1 (CRITICAL) — `proveGate` needs a *born* HEAD.** A freshly-installed target has **zero commits**; on an unborn branch `git rev-parse --abbrev-ref HEAD` fails → `lib.currentBranch()` returns `null` → `lib.resolveSpec` can't match the branch → G1 fails and the gate never evaluates status (the whole proof is invalid). Fix: `proveGate` makes an **initial commit on the default branch** (staging the installed framework files; the hook skips the gate off an `NNN-` branch) **before** `git checkout -b 042-e2e-probe`. **Verified:** with a born HEAD, both engines block at Draft (`--gate` exit 1) and allow at Approved (exit 0). Also `git add -A` the status-file change before the "allowed" commit. Touches T004/T009 + contract.
- **A2 (CRITICAL) — the migrate fixture must trigger migrate without flipping the phase, and README/CODE.md/`specs/_INDEX.md` don't qualify.** `detectMode` ⇒ migrate iff a **non-framework** file exists — excluding `.zero-two-one.json`, framework-surface files **including the user docs `README.md`/`CODE.md`/`PRODUCT.md`/`DESIGN.md`** (create-if-missing), `.ai/context/*`, and `*.zero-two-one.md`. So (a) seeding `README.md`/`CODE.md` does **not** trigger migrate; (b) `specs/_INDEX.md` is **not** a populated-specs signal (`populatedSpecs` needs `specs/<dir>/spec.md`); (c) a **code** file (`src/app.js`) would trigger migrate **but** flips `detectPhase` → `mvp` (via `hasSubstantialCode`) → `021 qa` runs the code tier → fails. Fix: seed a **non-framework, non-code** file — `docs/overview.md` (`docs/` is a NON_CODE_DIR, unowned) — as the trigger, keeping phase planning; assert non-destructive on it, and optionally on a custom `CODE.md` (create-if-missing preservation). The pre-existing `.git/hooks/pre-commit` (under `.git/`, NOISE-ignored) exercises chaining but is **not** itself a trigger. Touches T004 + data-model + research R8.
- **A3 (robustness) — `021 doctor` green contract.** `doctor` exits non-zero **only** on a hard-severity finding; advisory-only ⇒ 0 (spec 004). A fresh planning scaffold (template docs, no conflicting spec/release/roadmap state) is expected to emit **no** hard finding ⇒ exit 0. `assertLifecycleGreen` asserts exit 0; T014 confirms empirically, and if a fresh install legitimately yields a hard finding the assertion narrows to the documented advisory contract rather than blanket exit 0. Touches T008/T014.
- **A4 (simplification) — `manifestFacts` already carries `mode`.** `manifestFacts(target)` returns `{ phase (='planning' key), stack, ssd (defaults 'github-speckit'), mode, … }` — so `assertManifest` is a **single** call; no separate `readManifest().mode`. Touches T007 + contract.
- **A5 (confirm) — migrate is non-interactive under `spawnSync`.** The interview prompts only with a **TTY** and neither `--yes`/`--non-interactive`; `spawnSync` (piped stdio) has no TTY ⇒ zero prompts, safe defaults, never blocks. So migrate cells don't hang; still pass **`--yes`** for explicitness (guards a TTY-inheriting runner). Touches T005 + research.
- **A6 (fidelity) — the docs tier needs the full key-doc trio.** run-qa phase-0 `check_key_docs` requires `requirements/{01-PRD,02-EDD,03-TDD}.md`; a scaffold writes all three from templates, so `qa` passes — but `assertSurface` should confirm the **whole trio** installed (not just `01-PRD.md`), so a `qa`-green cell can't mask a missing EDD/TDD. Touches T006.

## Work breakdown

See [tasks.md](tasks.md) (generated in the Task step).
