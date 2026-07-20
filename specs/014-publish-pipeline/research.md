# Research: CI Publish Pipeline & Pre-Publish Gate

*Decisions and grounding, keyed to the Clarify answers (Q1–Q5) and the code/tarball as they actually are. Rejected alternatives at the end.*

## R1 — Trusted publishing (OIDC), and the first-publish path (Q1)

`npm publish --provenance` requires the workflow to run under `permissions: id-token: write`. **Trusted publishing** lets npm mint a short-lived credential from GitHub's OIDC token — **no `NPM_TOKEN` secret** to store or rotate — and produces the provenance attestation. The maintainer configures a trusted publisher (repo + workflow) in the `zero-two-one` package settings on npmjs.com.

**Chicken-and-egg for the first publish:** trusted publishing binds to a package that npm knows about. Two clean paths, documented in the workflow header:
1. **Pre-configure** the trusted publisher on npmjs before the first tag (npm supports configuring it for a not-yet-published name under the account/org), then the first tag publishes via CI like every other release; or
2. **Seed once** with the manual fallback (`npm run publish:package`, a one-time authenticated local publish), then all subsequent releases go through CI trusted publishing.

Either way this is **maintainer infra**, out of scope for the spec — the spec delivers a workflow that assumes trusted publishing is configured. (An automation-token variant was the alternative; rejected — a long-lived secret for a solo/small-team OSS package is more attack surface than OIDC.)

## R2 — Tarball inspection via `npm pack --json` (Q5, FR-004)

`cd package && npm pack --json --dry-run` prints a JSON array whose `[0].files` is `[{path, size, mode}]` — the exact file set that would ship. The gate parses this (zero-dep) as its single source of truth for the tarball-aware checks (`.ai/context` bundles, `specs/00N-*`/dev leaks, README presence/size). This is faithful to what `npm publish` ships, unlike scanning the repo tree (which can't see `files`-whitelist or `.npmignore` effects). Confirmed today: the file list is 108 entries, the only `.ai` entry is `.ai/context/.gitkeep` (0 B), and there are no `specs/`/`test/` paths — so **the current tree already passes; the gate is a regression guard**, exactly the r7/r9 intent.

## R3 — `check-links.js` reuse via subprocess (FR-003d)

`scripts/check-links.js` is a **script**, not a module — it walks Markdown, prints, and `process.exit(1)` on any broken link; it exports nothing. Rather than refactor it, the gate shells `node scripts/check-links.js` (cwd = repo root) and treats a non-zero exit as the broken-links failure. Zero-dep, reuses the exact existing check, no behavior duplication. (It already runs as its own `ci.yml` step too; the gate additionally binds it to the publish path.)

## R4 — README split keeps sync green (Q3, FR-006)

`sync-to-package.js` copies `filesToCopy` (currently incl. `README.md`) root → `package/`, and `preserveInPackage` (`package.json`, `node_modules`) is left untouched. To make `package/README.md` a **separately maintained** install-focused file: **remove `README.md` from `filesToCopy`** (sync stops overwriting it) **and add `README.md` to `preserveInPackage`** (so `--check` treats it as hand-maintained, not drift/orphan). Then author `package/README.md` for npm consumers. Root `README.md` (contributor-focused) is unchanged. Verified precondition: root and `package/README.md` are byte-identical today, so the split starts from a known state; after it, `sync:package --check` must stay green (a T-task asserts this).

## R5 — The gate must not ship (packaging hygiene)

`scripts/prepublish-gate.js` is dev-only tooling — it must be added to `sync-to-package.js`'s `scriptExclusions` (alongside `sync-to-package.js` and `check-links.js`), or it would ship in `package/scripts/` and the gate would flag *itself* as a dev-file. The workflow (`.github/workflows/publish.yml`) is already excluded via `githubExclusions: workflows`; `test/publish/**` is root-only (`test/` not in the package `files` whitelist).

## R6 — Parameterize the gate for testability (FR-005)

`prepublishGate({ root, packageDir })` defaults to the real repo (`repoRoot()` + `root/package`) but accepts overrides so `test/publish/gate.test.js` can point it at fixture dirs — each fixture is a minimal `package/` (a `package.json` + a seeded file set) plus a minimal repo root (LICENSE, a Markdown file). The `npm pack --json` call runs in the fixture `packageDir`, so injected files (`.ai/context/*.md`, `specs/099-*`) are seen exactly as they'd ship. This mirrors spec 013's parameterized-target approach.

## Rejected alternatives

- **Automation token (`NPM_TOKEN`).** Works for the first publish with no pre-config, but a long-lived secret is more attack surface and needs rotation; trusted publishing is npm's recommended provenance path. Rejected per Q1.
- **Inline gate as workflow steps.** Fast to write, but not runnable locally, not unit-testable, and duplicated if the fallback wants the same checks. Rejected per Q2 — a standalone script is testable + dogfoodable.
- **Sync-time README transform.** Deriving `package/README.md` from the root by stripping/injecting sections is a single source of truth but brittle (transform logic to maintain, surprising diffs). Rejected per Q3 — a separately-maintained file is explicit and the two audiences legitimately diverge.
- **Tarball size/count ceiling in the gate.** Brittle (legitimate growth trips it) and redundant — spec 013's e2e already proves the tarball installs and runs. Rejected per Q5.
- **Refactoring `check-links.js` into a module.** Unnecessary churn; the subprocess reuse is sufficient and keeps the existing script untouched. Rejected per R3.
