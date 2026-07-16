# Refinement Review Round: r7 — Planning Stage

## Review Meta Data
- **Date:** 2026-07-15
- **Status:** Applied (2026-07-15) — approved and cascaded (RLP steps 3–6)
- **Round:** 7
- **Reviewer:** William Dingwall (billdingwall) + Staff-Engineer repo/package audit
- **Lifecycle Phase:** Planning (Phase 1)
- **Source:** [_notes/full-repo-audit.md](../_notes/full-repo-audit.md) — Repository & Package Technical Audit at `ace5b19`, with stakeholder resolutions folded in (all weaknesses accepted, **all §5 recommendations approved**, §4 clarifications answered).
- **Primary reference (read in full before drafting update plans):** [_notes/full-repo-audit.md](../_notes/full-repo-audit.md) — Part A (package), Part B (repo), §4 resolutions, §5 approved recommendations.
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Backlog](../04-BACKLOG.md) · [Roadmap](../05-ROADMAP.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md) · [README](../../README.md)

## Review Focus: Hardening Round — Audit Findings → Fixes & Release Scope

*A quality/hardening round driven by the technical audit. Every weakness and tech-debt item was accepted and every strategic recommendation approved (audit §4–§5). This review preps them for updates and implementation: quick code/config fixes and doc alignment land in-round (like r5/r6 tooling fixes); engine-level work is scoped into the mvp releases. Registry state verified: `zero-two-one` is **unpublished** (npm 404) — all package findings are pre-publish blockers, giving this round a hard deadline of mvp-6.*

## Project Updates

*Numbered A/B/C… groups become the per-doc/per-surface update plans in step 2 (synthesize). Each item carries its audit source and its landing spot: **(r7)** = fix in this round · **(mvp-N)** = scoped into that release's file + backlog.*

### A. Package safety — `bin/init.js` interim hardening *(audit Pkg-Weak 1, 5, 6, 8; Pkg-Rec 1, 2, 4, 5)*

Interim fixes to the shipped v1 init so the package honors its documented non-destructive contract *before* the full mvp-3 merge engine replaces it:

1. **Gate the CLI** (r7): minimal arg parsing — reject unknown `--flags`, add `--help`/`--version`, refuse target dirs whose name starts with `-`. Kills the reproduced `--help/`-scaffold footgun.
2. **Create-if-missing guards** (r7): `fs.existsSync` checks before copying guiding files (`CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`) and `requirements/0N-*.md`, so user-owned docs are never silently clobbered on re-run.
3. **Hook backup** (r7): back up an existing `.git/hooks/pre-commit` → `pre-commit.backup` before install (full conflict-aware chaining stays mvp-3).
4. **Install `.claude/` merge-safe** (r7): add `.claude` to init's copy surface per TDD §4 (existing user commands win, skips reported) — resolves the doc-vs-code drift; the slash commands currently ship but never install.
5. Full ownership engine, `--dry-run`/`--force`, idempotent re-run, conflict-aware hook chaining remain **mvp-3** scope (unchanged — these interim guards do not replace Init v2).

### B. Package manifest & distribution hygiene *(audit Pkg-Weak 2, 3, 4; §4 prototype resolution; Pkg-Rec 3)*

1. **Remove dangling `"main": "index.js"`** from both `package.json` files (r7). Programmatic `exports` decision deferred to mvp-4 (see Open Questions).
2. **Delete `package/.ai/context/001-dummy.{md,json}`** and prevent recurrence — sync should not carry generated context bundles into the package (r7).
3. **Add a `LICENSE` file (ISC)** at root, include in `package/` `files` (r7).
4. **Stop shipping `prototype/`** (§4 resolution: vestigial): remove from `package/package.json` `files` and from init's copy surface — `021-prototype` generates the directory (incl. `_INDEX.md`) on demand (r7; TDD §5 Package Manifest + §12 updated to match).
5. **Fill `author`**; note the unpinned Spec Kit install guidance (`git+https://github.com/github/spec-kit.git`) — pin or version-tag the recommendation (r7, docs).

### C. Repo tooling fixes *(audit Repo-Weak 2, 4; Repo-Rec 1, 3, 4; r6 escaped defect)*

1. **Fix `scripts/run-qa.sh` for the 3-phase model** (r7): Planning=1 docs tier · MVP Build=2 full code QA (tests/a11y/spec-compliance) · Growth=3 full QA + feedback checks. This is the r6 regression — currently full QA never runs in MVP Build.
2. **`workflow-status.js --json`** (r7): machine-readable output; `run-qa.sh` consumes it instead of `grep|awk` scraping — removes the fragile output contract.
3. **`"private": true`** on the root `package.json` (r7).
4. **Fix stale root `.gitignore` comment** (`spec:context` → `021-spec:context`) (r7).
5. **Fold or tombstone `.021-updates/`** (r7): migrate still-relevant content into `requirements/_notes/` (with `_INDEX.md` entries) or add a tombstone `_INDEX.md` marking it archived.

### D. CI & mechanical enforcement *(audit Repo-Weak 1, 3; Repo-Rec 2; DX: no lint/link-check)*

1. **Minimal GitHub Actions workflow** (r7): `npm test` · init smoke test into a temp fixture dir · Markdown link checker · **sync-drift check** (`sync:package && git diff --exit-code package/`).
2. **`sync:package --check` mode** (r7): non-zero exit on drift, used by CI; also closes the `package/.claude/` silent-divergence gap (preserved-not-synced — was hand-copied twice in r6).
3. **Lint/format baseline** (r7): minimal ESLint (or `node --check` pass) + EditorConfig so `CODE.md §3`'s "testing and linting" instruction is followable; Markdown link checking covered by CI item 1.

### E. Old-phase-label sweep — repo & package wide *(§4 resolution: fix everywhere)*

1. Sweep **all remaining 4-phase-era labels** from docs *and* implementations — repo and package: `requirements/_design/cli-walkthrough-demo.md` ("Phase 3", "4-phase"), any `_releases/` remnants, `.021-updates/` (or archive per C5), and any "Phase 2/3/4" old-model references (r7). Historical `_refinement/r1–r6` files: add a one-line era note in [`_refinement/_INDEX.md`](_INDEX.md) rather than rewriting signed round records — *confirm at approval*.
2. Verify with a repo-wide grep gate in the CI link-check step (D1) so the class of drift stays dead (r7).

### F. Stack clarity — three stacks are MVP *(§4 resolution)*

1. **Requirements/docs clarity now** (r7): `package/README.md` + root `README.md` three install prompts labeled so Antigravity/Kiro readers know those stacks land at mvp-4 (`--stack` not yet implemented); PRD F7/TDD §9 statements confirmed as MVP-launch scope.
2. **Implementation unchanged**: Claude Code, Antigravity, and Kiro all supported as part of MVP — mvp-4 per the roadmap; mvp-6 field test exercises all three. No re-sequencing needed, only doc honesty pre-mvp-4.

### G. Release re-scoping — approved architectural improvements *(audit Arch-Rec 1, 2, 3, 4, 5; Repo-Weak on test ordering)*

Roadmap/backlog/release-file updates:

1. **Pull init + hook automated tests forward: mvp-6 → mvp-3 exit gate** (Arch-Rec 1). The migration acceptance test ("zero user-file overwrites on a non-empty fixture") becomes the merge engine's definition of done; the fixture harness is reused for mvp-4's 3-stacks × design matrix.
2. **Manifest as the QA contract** (Arch-Rec 2, mvp-3): once the manifest write lands, `run-qa.sh` + `hooks/pre-commit` read phase/stack from `.zero-two-one.json` via one parser (in `scripts/speckit/lib.js`), permanently eliminating output-scraping.
3. **Workflow Manager ships read-only first** (Arch-Rec 3, mvp-3): drift *detection* with proposed diffs (`021-doctor`-style report) before any auto-editing — TDD §13 amended to state the reporter-first delivery.
4. **Programmatic API decision at mvp-4** (Arch-Rec 4): whether `scripts/speckit/lib.js` is exposed via `exports` for agent runtimes (vs `x_command` shell bridge only) — added to mvp-4 scope as a decision item.
5. **Publish hardening at mvp-6** (Arch-Rec 5): CI-only, tag-triggered `npm publish --provenance`; pre-publish gate failing on dangling `main`, missing LICENSE, or `.ai/context` dummies — this audit's package findings encoded as the release pipeline's own checks.

### H. Governance / meta *(audit Repo-Weak 6, 7)*

1. **CONTRIBUTING.md** (+ optional CODEOWNERS) (r7): minimal contribution flow referencing the refinement loop and the gate; issue templates point at the triage flow (full `021-feedback.yml` stays mvp-5).
2. **Bus factor** noted: no doc action — CI + tests (D, G1) are the mitigation.

## Persona Feedback

*Stakeholder direction (William, 2026-07-15): all audit weaknesses and tech debt accepted for fixing per recommendations and best practices; **all strategic recommendations approved**. Nothing is published to npm yet (verified 404) — treat every package defect as a pre-publish blocker, with the interim init hardening (group A) landing now rather than waiting for Init v2. Three stacks (Claude Code, Antigravity, Kiro) confirmed as MVP scope. Old phase labels are migration leftovers — fix across the whole repo and package.*

## Open Questions for this round

- **`main`/API intent** (audit §4, unresolved): remove `main` now (B1 — decided); the real question — expose `lib.js` as a supported programmatic surface (`require('zero-two-one/speckit')`)? Default: decide at **mvp-4** with the adapter seam (G4).
- **E1 history policy detail:** for `_refinement/r1–r6` round records, is the era-note-in-`_INDEX.md` approach acceptable, or should the historical files themselves be rewritten? (Recommend: annotate, don't rewrite — the round files are the audit trail.)
- **D3 lint depth:** zero-dependency constraint applies to the *package*; does the stakeholder want dev-time tooling (ESLint) as a devDependency at root, or built-ins-only checks (`node --check`, shell `sh -n`) to keep the root dependency-free too? (Recommend: built-ins-only to match the repo's posture; CI supplies the heavier checks.)

---

*Next (RLP step 2 — Synthesize): on approval of this review, draft per-surface update plans — `r7-update-tdd.md` (TDD §4/§5/§7/§12/§13 amendments), `r7-update-roadmap.md` + `r7-update-backlog.md` (G re-scoping: tests → mvp-3, API decision → mvp-4, publish hardening → mvp-6, groups A–F as tracked items), and `r7-update-workflows.md` (code/config fixes A–F, CI workflow, sweep, sync `package/`). PRD/EDD expected untouched this round (no product-scope change — confirm during synthesis). No living doc or code is edited until the plans are approved.*
