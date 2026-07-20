---
status: Done
feature: CI Publish Pipeline & Pre-Publish Gate
release: mvp-6
branch: 014-publish-pipeline
created: 2026-07-20
---

# Feature Spec: CI Publish Pipeline & Pre-Publish Gate

*The second spec of [mvp-6 — Test & Publish](../../requirements/_releases/mvp-6.md) (scope step 2), building on [spec 013](../013-e2e-test/spec.md) (the e2e that proves the packed tarball installs). It makes publishing **one deliberate, gated CI act**: a tag push runs a **pre-publish gate** (encoding the r7/r9 package-hygiene findings as enforced checks) then `npm publish --provenance` from `package/`. It also splits the **shipped README** to be install-focused. Grounded in TDD §14 (Publish Pipeline) and the r9 pre-publish-gate deltas. The actual first publish (mvp-6 step 3) fires this pipeline and is a human, credentialed act — out of scope here.*

## Why

mvp-6 publishes `zero-two-one` to npm so it can be installed and field-tested in real repos (step 3). Publishing is a **one-way door** — a bad tarball on the public registry can't be un-shipped. Today the only path is `npm run publish:package` (a local `sync + cd package && npm publish`), with no provenance, no gate, and nothing stopping a regression (an internal `specs/00N-*` leak, a stray `.ai/context` bundle, a dangling `main`, a broken link) from shipping. The r7 audit and r9 review catalogued exactly these package-hygiene risks; this spec turns that catalogue into an **automated gate** that fails the build before anything reaches the registry, and moves publishing to **CI-only, tag-triggered, with provenance** so the shipped artifact is verifiable and the act is deliberate.

The current shipped README is byte-identical to the repo's contributor README — so npm users get a page written for contributors. The **install-focused README split** fixes that.

## Users & Context

- **Primary user:** framework maintainers releasing a version; and npm consumers, who get a provenance-verified package and an install-focused README.
- **Trigger:** a maintainer pushes a version tag (form per [OPEN Q4]); CI runs the gate and publishes. Local `publish:package` remains a documented manual fallback (TDD §14), not the primary path.
- **Builds on:** spec 013 (the e2e proving the tarball installs — the pre-publish *behavioral* confidence this pipeline complements with *hygiene* checks); the `package/` publish boundary + `sync-to-package.js` (`--check` drift guard); the existing `ci.yml` checks (`check-links`, `sync --check`); `LICENSE` (present); the `exports`/no-dangling-`main` state (spec 009).
- **Precedes:** mvp-6 step 3 (the actual publish, which fires this pipeline) and mvp-7 (field test against the published package).

## Clarifications

### Session 2026-07-20

*Three decisions asked, two defaulted (recommendation accepted). Resolves all five Open Questions; spec advances Draft → In Review.*

- **Q1 — Provenance auth?**
  A: **Trusted publishing (OIDC).** The workflow authenticates via GitHub OIDC (`permissions: id-token: write`) and publishes with `--provenance` — **no stored `NPM_TOKEN`**. The maintainer configures a trusted publisher for `zero-two-one` on npmjs.com. **First-publish path:** either pre-configure the trusted publisher, or seed the package once via the manual `publish:package` fallback, after which CI handles every subsequent release. (This setup is the maintainer's — out of scope.)
- **Q2 — Gate form? (defaulted)**
  A: **Standalone `scripts/prepublish-gate.js`.** Zero-dep, unit-testable, dogfoodable, run in CI **and** locally via an npm script — matches the framework's testable-mechanical-layer pattern (specs 010–012). Not inline workflow steps.
- **Q3 — README split mechanism?**
  A: **Separately maintained `package/README.md`.** Author an install-focused `package/README.md`; **exclude `README.md` from the sync** so the repo root README stays contributor-focused and the two evolve independently. `sync-to-package.js` gets `README.md` in its exclusion set so `sync:package --check` stays green.
- **Q4 — Trigger form?**
  A: **Version tag push `v*.*.*`** (per TDD §14). `on: push: tags: ['v*.*.*']`; the maintainer controls timing by tagging.
- **Q5 — Gate scope? (defaulted)**
  A: **The FR-003 set is complete** as the r7/r9 encoding (dangling `main`, missing `LICENSE`, `.ai/context` bundle, broken links, `specs/00N-*`/dev-file leak). **No tarball size/count ceiling** (brittle, and spec 013's e2e already proves the tarball installs). One light addition: the gate asserts the shipped `package/README.md` **exists and is non-trivial** (guards the Q3 split from silently regressing to empty/missing).

## User Scenarios (Acceptance)

1. **Clean release publishes** — *Given* a tagged commit whose `package/` is in sync and whose tarball is hygienic, *when* the publish workflow runs, *then* the pre-publish gate passes and `npm publish --provenance` ships the package from `package/` with a provenance attestation.
2. **Gate blocks a spec/dev leak** — *Given* a tarball that would include an internal feature spec (`specs/00N-*`) or a dev-only file, *when* the gate runs, *then* it **fails the build** and nothing publishes.
3. **Gate blocks package drift** — *Given* `package/` out of sync with root, *when* the pipeline runs, *then* `sync:package --check` fails the build before publish.
4. **Gate blocks hygiene regressions** — *Given* a dangling `main`, a missing `LICENSE`, a `.ai/context` generated bundle in the tarball, or an unresolved Markdown link, *when* the gate runs, *then* it fails with a specific message naming the offending check.
5. **Gate runs locally too** — *Given* a maintainer about to cut a release, *when* they run the gate locally (an npm script), *then* they get the same pass/fail verdict as CI, before tagging.
6. **Install-focused shipped README** — *Given* the published package, *when* a consumer views it on npm, *then* the README is install/getting-started oriented (not the contributor README), while the repo root README stays contributor-focused.
7. **Manual fallback intact** — *Given* CI is unavailable, *when* a maintainer runs the documented `publish:package` fallback, *then* it still works (sync + publish), as a deliberate exception.

## Functional Requirements

*All firm — the five Open Questions were resolved in the 2026-07-20 Clarify session (see Clarifications).*

- **FR-001 — Tag-triggered CI publish workflow.** A new `.github/workflows/publish.yml` triggers on **`push: tags: ['v*.*.*']`** *(Q4)*. It runs `npm run sync:package -- --check`, then the pre-publish gate *(FR-003)*, then `npm publish --provenance` from `package/`. `.github/workflows/` is dev-only (dropped from the package by `sync-to-package.js` `githubExclusions`), so the workflow never ships.
- **FR-002 — Provenance publish via trusted publishing.** The workflow declares `permissions: id-token: write` and publishes with `--provenance` via **npm trusted publishing (OIDC) — no stored `NPM_TOKEN`** *(Q1)*, so the tarball carries a verifiable provenance attestation. Configuring the trusted publisher on npmjs is the maintainer's (out of scope).
- **FR-003 — Pre-publish gate: hygiene checks.** A standalone **`scripts/prepublish-gate.js`** *(Q2)* fails (non-zero, naming the offending check) on any of: (a) a dangling `main` in either manifest; (b) a missing `LICENSE` (root or `package/`); (c) any `.ai/context` **generated bundle** in the tarball (the empty-scaffold `.gitkeep` is allowed); (d) unresolved Markdown links; (e) any internal feature spec (`specs/00N-*`) or dev-only file in the packed tarball (the r9 P1 regression check); (f) a missing or trivial shipped `package/README.md` *(Q5 — guards the FR-006 split)*.
- **FR-004 — Gate is tarball-aware.** Checks (c)/(e)/(f) inspect the **actual packed tarball contents** (`npm pack --json`/file list from `package/`), not just the repo tree — so they catch what would really ship.
- **FR-005 — Gate runs in CI and locally.** The gate is invocable as an npm script (e.g. `npm run prepublish:check`) with identical behavior in CI and on a maintainer's machine (Scenario 5), and is wired into `publish.yml` ahead of `npm publish`.
- **FR-006 — Install-focused shipped README (separate source).** The shipped **`package/README.md`** is a **separately maintained**, install/getting-started-oriented file; the repo root `README.md` stays contributor-focused. `README.md` is added to `sync-to-package.js`'s exclusion set so sync no longer overwrites the package README, and `sync:package --check` stays green *(Q3)*.
- **FR-007 — Manual fallback preserved.** `npm run publish:package` remains as a documented fallback (TDD §14) — the pipeline does not remove it (though it should ideally run the gate too; see plan).
- **FR-008 — Zero runtime dependencies.** The gate is Node built-ins only (consistent with the framework); the workflow uses standard `actions/*` only.

## Key Entities

- **Publish workflow** — the tag-triggered `.github/workflows/*.yml`: sync-check → gate → provenance publish from `package/`.
- **Pre-publish gate** — the hygiene checker (form per [OPEN Q2]) over the packed tarball + manifests; the enforced encoding of the r7/r9 findings.
- **Shipped README** — the install-focused `package/README.md`; distinct from the contributor root README ([OPEN Q3]).
- **Packed tarball** — `npm pack` output from `package/`; the artifact the gate inspects and the workflow publishes.

## Acceptance Criteria

- A tag push runs the workflow: `sync --check` → gate → `npm publish --provenance` from `package/`.
- The gate fails (with a named reason) on a dangling `main`, missing `LICENSE`, a `.ai/context` bundle, a broken link, or a `specs/00N-*`/dev-file leak in the tarball — and passes on today's clean tree.
- The gate is runnable locally via an npm script with the same verdict as CI.
- The shipped `package/README.md` is install-focused; the root README is contributor-focused; `sync:package --check` stays green.
- `npm run publish:package` still works as the documented fallback.
- No runtime dependency added; the workflow + gate ship nothing into the tarball.

## Out of Scope

- **The actual first publish** (mvp-6 step 3) — firing the pipeline is a human, credentialed act; this spec builds and dry-runs it.
- **npm account / credential setup** — configuring trusted publishing or the automation-token secret on npmjs/GitHub is the maintainer's; the spec assumes it exists.
- **The field test / feedback / review** — mvp-7.
- **Versioning automation** (changesets, auto-bump) — the maintainer sets the version + tag; no auto-versioning here.
- **The e2e/tarball-install behavioral proof** — spec 013 already covers that; this spec is hygiene + provenance + delivery.

## Dependencies & References

- TDD §14 (Publish Pipeline — CI-only, tag-triggered, provenance, pre-publish gate).
- mvp-6 release scope step 2 (r8/r9/2026-07-20 split) — [requirements/_releases/mvp-6.md](../../requirements/_releases/mvp-6.md).
- Spec 013 (e2e) — the behavioral pre-publish confidence this complements.
- `scripts/sync-to-package.js` — the `package/` boundary + `--check` drift guard (+ `githubExclusions` that keep workflows out of the package).
- `scripts/check-links.js` — the Markdown link check reused by the gate.
- r7 audit / r9 review — the package-hygiene findings this gate enforces.

## Open Questions

*All resolved in the 2026-07-20 Clarify session (see Clarifications) — spec is In Review. For the record: Q1 → **trusted publishing (OIDC), no secret**; Q2 → **standalone `scripts/prepublish-gate.js`**; Q3 → **separately maintained `package/README.md`** (sync excludes `README.md`); Q4 → **tag push `v*.*.*`**; Q5 → **FR-003 set complete** + a shipped-README-non-trivial check, no size ceiling. No open items remain.*
