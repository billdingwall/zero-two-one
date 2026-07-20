---
status: Done
feature: End-to-End Test Harness (scaffold + migrate)
release: mvp-6
branch: 013-e2e-test
created: 2026-07-19
---

# Feature Spec: End-to-End Test Harness (scaffold + migrate)

*The first spec of [mvp-6 — Test, Review & Publish](../../requirements/_releases/mvp-6.md) (scope step 1), and the automated precondition for the human three-repo field test (step 2). Where mvp-3's suites unit-test `scripts/init/*` against in-memory/temp fixtures, this spec drives a **real install end-to-end the way a user receives it** — the CLI entry against a throwaway git repo, in both **scaffold** (fresh repo) and **migrate** (working repo) modes — then asserts the whole resulting project is coherent and its lifecycle commands run green. Grounded in the mvp-6 scope (r8) and TDD §5–§9 (package manifest, install surface, adapter + SSD-gate contracts).*

## Why

mvp-3 shipped thorough **unit** coverage of the install engine (`test/init/*.test.js`: engine, classify, manifest, renderer, adapters, hook) and per-stack render suites. Those call `initFramework(target, { sourceDir })` directly with fixtures — fast and precise, but they never exercise the path a real consumer takes: the **CLI binary** parsing its own args, writing to a real filesystem repo, wiring the pre-commit hook into whatever hook manager is present, and the resulting `021` command surface actually running. Integration gaps live exactly in those seams (bin arg parsing, husky/lefthook wiring, cross-file link integrity, the gate *actually* blocking a commit) and unit fixtures cannot see them.

mvp-6 gates publishing behind a field test in three real repos (step 2) and a full-work review (step 5). Sending a human to field-test an install that fails end-to-end is wasteful; this spec is the **automated confidence gate that runs first** — a repeatable harness that proves scaffold and migrate installs are coherent before any human (or the packed tarball) touches them.

## Users & Context

- **Primary user:** framework maintainers and CI — the e2e is the go/no-go signal that the whole install experience works before field-testing and publishing.
- **Trigger:** a test entry (`npm run test:e2e` and/or a `021 qa` e2e tier — [OPEN Q2]) run locally and in CI.
- **Builds on:** the mvp-3 unit suites (unit ↔ e2e split); the CLI install entry (`bin/init.js`, spec 001/002); the `021` CLI dispatcher (spec 009); the conflict-aware pre-commit gate (spec 005); the manifest-as-QA-contract parser (spec 003); the source-layer/stack renderer + adapters (specs 006–008).
- **Precedes:** the human field test (mvp-6 step 2, locally-packed tarball into three real repos) and the per-stack fresh-install smoke test (mvp-6 step 4). This spec is the automated floor those build on; the exact seam vs. the step-4 smoke test is [OPEN Q1].

## Clarifications

### Session 2026-07-19

*Four decisions asked, one defaulted (recommendation stated + accepted). Resolves all five Open Questions; spec advances Draft → In Review.*

- **Q1 — Artifact under test?**
  A: **Packed tarball.** The harness runs `npm pack` **once in test setup** and installs the resulting `.tgz` into each temp repo, so it exercises the **real shipped artifact** — catching packaging drift (files missing from the tarball, the spec-001–005 internal-spec-leak P1 regression) that a source-tree install hides. **Seam with mvp-6 step 4:** because this also installs the tarball per stack, the step-4 "fresh-install smoke test per stack" **folds into this harness** rather than being a second, divergent check — step 4's publish gate keeps only the tarball-*content* audit (no internal specs/dev files) as its distinct concern.
- **Q2 — Integration point?**
  A: **Standalone `npm run test:e2e`.** A dedicated script, wired into CI, kept **out** of the default `npm test` and `021 qa` so those stay fast — the e2e shells real installs + git and runs in its own slower lane.
- **Q3 — Stack scope of the automated e2e?**
  A: **All three stacks.** The harness is parametrized by `--stack` (claude, antigravity, kiro); **3 stacks × 2 modes = 6 installs**. Cross-stack coherence is the whole mvp-4 value, and the harness is cheap to parametrize; the human field test (step 2) then validates real-world usage rather than basic install coherence.
- **Q4 — Harness form & gate proof?**
  A: **`node --test` in `test/e2e/` + a real `git commit`.** Consistent with the existing suites (zero-dep, `child_process` to drive real `git` + the CLI). The pre-commit gate is proven by an **actual commit attempt** on an `NNN-feature-name` branch — blocked when the spec is unapproved, allowed once Approved — not by running the hook against a staged index.
- **Q5 — CI cadence? (defaulted)**
  A: **Run on every PR.** The e2e is the confidence gate, so catching install breakage early is the point; a zero-dep tarball install × 6 is cheap enough to afford on every PR. (Revisit only if CI runtime becomes a problem — the standalone-script split from Q2 keeps that door open.)

## User Scenarios (Acceptance)

1. **Scaffold mode, fresh repo** — *Given* an empty git repo, *when* the CLI install runs in scaffold mode, *then* the full install surface renders for the stack, `.zero-two-one.json` is written with `mode: scaffold` and a populated `files` inventory, the pre-commit hook is installed, and the `021` lifecycle commands (`status`, `qa`, `doctor`) run green.
2. **Migrate mode, working repo** — *Given* a repo that already holds guiding docs, a `specs/` dir, and an existing `pre-commit` hook, *when* the CLI install runs, *then* migrate mode is detected, existing user docs are **preserved (non-destructive)**, the manifest records `mode: migrate`, and the gate is chained into the existing hook **without clobbering it**.
3. **Gate actually enforces** — *Given* an installed repo on an `NNN-feature-name` branch, *when* an implementation file is committed while the matching spec is **not** `Approved`, *then* the commit is **blocked**; *when* the spec is `Approved`/`Ready for Dev`, *then* the commit is **allowed**. (Proven end-to-end, not by unit-calling the hook.)
4. **Lifecycle commands run green post-install** — *Given* a freshly installed repo, *when* `021 status`, `021 qa`, and `021 doctor` run, *then* each exits 0 with output consistent with the just-installed phase/stack (no drift, no dangling references).
5. **Cross-stack coverage** — *Given* the automated harness, *when* it installs each in-scope stack, *then* that stack's surface renders and its commands resolve. (Which stacks the *automated* e2e covers vs. what is deferred to the human field test is [OPEN Q3].)
6. **Clean teardown / hermetic** — *Given* a run, *when* it completes or fails, *then* it leaves no residue outside its temp workspace and does not depend on the developer's global git config or network.

## Functional Requirements

*All firm — the five Open Questions were resolved in the 2026-07-19 Clarify session (see Clarifications).*

- **FR-001 — Real end-to-end install.** The harness drives the **actual CLI entry** (not `initFramework()` directly) against a **real git repo in a temp workspace**, so bin arg parsing, filesystem writes, and hook wiring are all exercised.
- **FR-002 — Both install modes.** It covers **scaffold** (fresh repo) and **migrate** (pre-populated working repo) as distinct scenarios, asserting the manifest `mode` and the mode-specific behaviors (scaffold = full render; migrate = non-destructive import + hook chaining).
- **FR-003 — Post-install coherence assertions.** After install it asserts: the stack install surface exists, `.zero-two-one.json` parses and matches the install (via the spec 003 `lib.js` parser — no output-scraping), and `021 status/qa/doctor` exit green.
- **FR-004 — Gate enforcement proven end-to-end.** It exercises the pre-commit gate through a **real `git commit` attempt** on an `NNN-feature-name` branch — blocked when the spec is unapproved, allowed once Approved *(Q4)* — rather than invoking the hook function in isolation or against a staged index (that is mvp-3's `hook.test.js`).
- **FR-005 — Distinct from and complementary to the unit suites.** The e2e does not duplicate unit assertions; it targets the integration seams unit fixtures cannot reach. The unit suites stay in the fast `npm test`; the e2e is a separate lane *(FR-010)*.
- **FR-006 — Hermetic & repeatable.** Runs in an isolated temp workspace with a deterministic clock and a self-contained git identity; no network, no dependence on developer global config; full teardown on success or failure.
- **FR-007 — Zero new runtime dependencies; `node --test` form.** The harness is a **`node --test` suite in `test/e2e/`** *(Q4)* using Node built-ins only (`node:test`, `node:child_process`, `fs`, `path`) — consistent with the existing suites and the framework's zero-dep constraint. No shell-driver style.
- **FR-008 — Runs against the packed tarball.** The harness runs **`npm pack` once in setup** and installs the resulting `.tgz` into each temp repo *(Q1)*, so it tests the real shipped artifact. **This absorbs the mvp-6 step-4 per-stack fresh-install smoke test** — step 4 keeps only the tarball-*content* audit (no internal `specs/00N-*` or dev files) as its separate publish-gate concern; the two do not duplicate.
- **FR-009 — All three stacks.** The automated e2e is parametrized by `--stack` and asserts **`claude`, `antigravity`, and `kiro`** *(Q3)* — 3 stacks × 2 modes = 6 installs. Each stack's surface renders and its `021` commands resolve.
- **FR-010 — Integration point.** The harness is a **standalone `npm run test:e2e`** *(Q2)*, wired into CI (on every PR, *Q5*) and kept **out** of the default `npm test` / `021 qa` so those stay fast.

## Key Entities

- **E2e harness** — the test driver (location/runner per [OPEN Q4]) that provisions a temp git repo, runs the CLI install, and asserts the result.
- **Temp target repo** — the throwaway git workspace an install runs against; the scaffold fixture is empty, the migrate fixture is pre-populated (docs + `specs/` + existing hook).
- **Install artifact under test** — the CLI entry sourced from either the working tree or the packed tarball ([OPEN Q1]).
- **Coherence assertions** — install surface present, manifest correct (spec 003 parser), gate enforcing (real commit), lifecycle commands green.

## Acceptance Criteria

- A scaffold-mode install into a fresh temp repo produces the full stack surface + a valid `mode: scaffold` manifest, and `021 status/qa/doctor` exit 0.
- A migrate-mode install into a pre-populated temp repo preserves existing user docs, records `mode: migrate`, and chains the gate into the existing hook without clobbering it.
- A real commit of an implementation file on an `NNN-feature-name` branch is blocked when the spec is unapproved and allowed once Approved.
- The harness is hermetic (temp workspace, no network, deterministic) and tears down cleanly on pass or fail.
- The e2e runs as a standalone `npm run test:e2e` in CI (not the default `npm test`), adds no runtime dependency, and its assertions do not duplicate the mvp-3 unit suites.
- The harness installs from a `npm pack` tarball and covers all three stacks (claude/antigravity/kiro) × both modes = six installs.

## Out of Scope

- **Unit tests for `bin/init.js` + `hooks/pre-commit`** — already delivered as mvp-3's exit gate (`test/init/*.test.js`); this spec is the complementary end-to-end layer, not a re-do.
- **The human three-repo field test** — mvp-6 step 2 (locally-packed tarball into three real repos at different phases/stacks) is a separate scope item; this spec is its automated precondition.
- **The CI publish pipeline & pre-publish gate** — mvp-6 step 4 (TDD §14); the per-stack tarball smoke test there is related but separate ([OPEN Q1] documents the seam).
- **The pre-publish review** — mvp-6 step 5.
- **Performance/load testing** — correctness and coherence only.

## Dependencies & References

- mvp-6 release scope (steps 1–2, r8) — [requirements/_releases/mvp-6.md](../../requirements/_releases/mvp-6.md).
- TDD §5 (package manifest), §6–§7 (ownership/merge + manifest contract), §9 (adapter + SSD-gate contracts).
- Spec 001/002 (safe-install engine + migrate-mode) — the install paths under test.
- Spec 003 (manifest-as-QA-contract) — the `lib.js` parser the assertions read state through.
- Spec 005 (conflict-aware pre-commit chaining) — the gate the e2e proves end-to-end.
- Spec 009 (`021` CLI dispatcher) — the post-install lifecycle commands asserted green.
- `test/init/*.test.js` — the mvp-3 unit suites this layer complements (the unit ↔ e2e boundary).

## Open Questions

*All resolved in the 2026-07-19 Clarify session (see Clarifications) — spec is In Review. For the record: Q1 → **packed tarball** (absorbs the step-4 per-stack smoke test); Q2 → **standalone `npm run test:e2e`** (out of the fast default suites); Q3 → **all three stacks** × both modes = 6 installs; Q4 → **`node --test` in `test/e2e/` + a real `git commit`** to prove the gate; Q5 → **run on every PR**. No open items remain.*
