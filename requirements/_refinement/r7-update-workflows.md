# r7 Update Plan: Code, Config, CI & Doc-Surface Fixes

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r7
**Audit items addressed:** execution of groups A, B, C, D, E, F, H (the in-round fixes)
**Target surfaces:** `bin/init.js` · `package.json` (root + `package/`) · `LICENSE` (new) · `package/.ai/context/` · `scripts/run-qa.sh` · `scripts/workflow-status.js` · `scripts/sync-to-package.js` · `.github/workflows/ci.yml` (new) · `.gitignore` · `.021-updates/` · `requirements/_design/cli-walkthrough-demo.md` (+ label sweep) · `README.md` + `package/README.md` · `CONTRIBUTING.md` (new) · `requirements/_refinement/_INDEX.md` (era note)
**References:** [_notes/full-repo-audit.md](../_notes/full-repo-audit.md) · [r7-review.md](r7-review.md)

## Intent

Execute the approved in-round fixes. Everything here is tooling/config/doc-surface work (precedent: r5/r6 changed `workflow-status.js` in-round); the engine-level work stays in mvp-3/4/6 per [r7-update-roadmap.md](r7-update-roadmap.md). Order matters: code fixes → CI → sweep → sync.

## Proposed Edits

### 1. `bin/init.js` interim hardening (A1–A4)

- Arg parsing: `--help` (usage + exit 0), `--version` (from `package.json`), reject unknown `--flags` (exit 1 with usage), reject target dirs starting with `-`.
- Create-if-missing guards on guiding files + `requirements/0N-*.md` (skip + report when present).
- `.git/hooks/pre-commit` → back up existing hook to `pre-commit.backup` before copy.
- Add `.claude` to the copy surface, merge-safe (existing user command files win; skips reported).

### 2. Manifests, LICENSE, shipped artifacts (B1–B5, C3)

- Remove `"main"` from both `package.json` files; add `"private": true` to root; fill `author` in both.
- Create `LICENSE` (ISC, current year, author) at root; add `"LICENSE"` to `package/package.json` `files`; sync copies it.
- Delete `package/.ai/context/001-dummy.{md,json}`; amend `sync-to-package.js` to copy `.ai/` as scaffold-only (`context/.gitkeep`, never generated bundles).
- Remove `prototype/` from `package/package.json` `files` and from `bin/init.js` `dirsToCopy`; delete `package/prototype/` (generated on demand by `021-prototype`, TDD §12).
- README Spec Kit guidance: pin/tag the `specify-cli` install source.

### 3. Status/QA tooling (C1, C2, C4)

- `workflow-status.js`: add `--json` (`{phase, status, source}`).
- `run-qa.sh`: rewrite phase dispatch for the 3-phase model — 1 Planning (docs tier: cohesive-set present) · 2 MVP Build (full: tests, a11y, spec compliance) · 3 Growth (full + feedback checks); consume `workflow-status.js --json` (parse with `node -e`, staying built-ins-only); drop the `1.5` legacy branch.
- Fix root `.gitignore` comment → `021-spec:context`.

### 4. CI + drift guard + lint baseline (D1–D3)

- `sync-to-package.js --check`: run sync into a temp compare (or post-sync `git diff --exit-code -- package/`), non-zero on drift; also compares root `.claude/commands/` vs `package/.claude/commands/` (closes the preserved-not-synced divergence).
- New `.github/workflows/ci.yml`: on push/PR — `npm test` · init smoke (`node bin/init.js` into `$RUNNER_TEMP` fixture; assert guiding files + no overwrite on re-run) · Markdown link check · `sync:package --check` · old-phase-label grep gate (E2).
- Lint baseline (**assumption: built-ins-only, no devDependencies** — confirm): CI step running `node --check` over `bin/ scripts/` and `sh -n` over `hooks/pre-commit scripts/run-qa.sh`; add `.editorconfig`.

### 5. Old-phase-label sweep (E1–E2)

- Sweep remaining 4-phase-era labels in repo + package: `requirements/_design/cli-walkthrough-demo.md` ("4-phase", "Phase 3(+)" old-model refs), any `_releases/`/docs remnants; `.021-updates/` handled by folding (below).
- History policy (**assumption: annotate, don't rewrite** — confirm): `_refinement/r1–r6` files untouched; add an era note to [`_refinement/_INDEX.md`](_INDEX.md): *"r1–r5 predate the r6 3-phase migration — phase numbers in those records reflect the 4-phase model of their time."*
- CI grep gate (in 4) keeps the class dead.

### 6. `.021-updates/` fold + stacks clarity + CONTRIBUTING (C5, F1, H1)

- Move still-relevant `.021-updates/*.md` into `requirements/_notes/` with `_INDEX.md` entries; delete the directory (or leave a tombstone `_INDEX.md` if any file must stay for link stability).
- `README.md` + `package/README.md`: label the Antigravity/Kiro install prompts "lands at mvp-4 (`--stack` not yet implemented — Claude Code available today)"; roadmap clarity line per [r7-update-roadmap.md](r7-update-roadmap.md).
- New `CONTRIBUTING.md`: contribution flow via the refinement loop + spec gate; link issue templates to it.

### 7. Verify & sync

- Run: `npm test`, `npm run 021-status` (+ `--json`), `npm run 021-qa` (Planning tier), init smoke into a scratch dir (flag rejection + re-run no-overwrite), `sync:package` then `--check` clean.
- `npm run sync:package`; changelog entries where touched docs carry one.

## Cascade

- Companion to [r7-update-tdd.md](r7-update-tdd.md) (contracts), [r7-update-roadmap.md](r7-update-roadmap.md) / [r7-update-backlog.md](r7-update-backlog.md) (scope rows).
- RLP step 4 (constraint check): `CODE.md` §3 "testing and linting" becomes satisfiable via the CI baseline — add one line pointing at it. Step 5: no prototype — N/A.
