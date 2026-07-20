# Project Backlog

## Current Phase: MVP Build (Phase 1)

*Backlog ordering is roadmap-driven until the Growth phase. From Growth onward, **user value** — from feedback collected in refinement rounds and `021-feedback` issues — is the primary signal, and items are **promoted into releases** ([_releases/](_releases/_INDEX.md)) and implemented as their own SSD specs. See the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md).*

## MVP Backlog

*A table (description · status · ownership · release), grouped by the release in the `Release` column. Ownership uses the AI role lenses — **Eng** (Lead Engineer / `CODE.md`), **PM** (Product / `PRODUCT.md`), **Design** (`DESIGN.md`). Open items are future SSD spec material — implemented on `NNN-feature-name` branches through the refinement gate.*

| Description | Status | Ownership | Release |
|---|---|---|---|
| Package-manifest sync exclusions; remove `sync-to-package.js` from `package/scripts/` (r1) | Done | Eng | mvp-2 |
| `06-REVIEW-Template.md` Related Docs + template-maintenance rule (r1) | Done | PM | mvp-2 |
| Dogfood `.zero-two-one.json`; `workflow-status.js` reads manifest `phase`; prototype dropped from inference (r5) | Done | Eng | mvp-2 |
| `requirements/_design/command-design.md` + `workflow-design.md` (r5) | Done | PM | mvp-2 |
| Claude Code integrations wiring (`/021-init`, `/021-status`) — root `.claude/commands/` dogfooded | Done | Eng | mvp-2 |
| Stakeholder sign-off demo: `021` CLI-experience walkthrough transcript (Planning sign-off milestone) | Done | PM | mvp-2 |
| **r6 structural migration** across docs/scripts/templates: 3-phase merge (Pre-build→Planning) + dogfood manifest `prebuild→planning` | Done | PM | mvp-2 |
| **r6 numbering swap** `04-BACKLOG`/`05-ROADMAP` across docs + templates (engine mapping lands mvp-3) | Done | PM | mvp-2 |
| **r6 guiding-files as roles/lenses** + `AGENTS.md` source→stack-rendered entrypoint + Wait-rule dedup (CODE.md §4) | Done | PM | mvp-2 |
| **r6 workflow sync-decomposition** + retained workflows + `release-launch.md`/`planning-to-mvp.md` | Done | PM | mvp-2 |
| **r6 skill renames** `generate-tasks`→`generate-backlog` + new `generate-prd`/`generate-edd` | Done | Eng | mvp-2 |
| **r7 A**: `bin/init.js` interim guards — arg gating (`--help`/`--version`, reject unknown/`-` flags), create-if-missing user docs, hook backup, `.claude/commands` install | Done | Eng | mvp-2 |
| **r7 B**: drop dangling `main` (both manifests); delete `.ai/context/001-dummy.*` + sync scaffold-only; add `LICENSE` (ISC); stop shipping `prototype/`; fill `author` | Done | Eng | mvp-2 |
| **r7 C**: fix `run-qa.sh` 3-phase mapping (r6 escaped defect); `workflow-status.js --json`; `"private": true`; `.gitignore` comment; tombstone `.021-updates/` | Done | Eng | mvp-2 |
| **r7 D**: CI (`.github/workflows/ci.yml`: test · init smoke · link check · sync-drift); `sync:package --check`; lint baseline (`node --check`/`sh -n`) + `.editorconfig` + `check-links.js` | Done | Eng | mvp-2 |
| **r7 E**: old-phase-label sweep (repo+package: `cli-walkthrough-demo.md`, history era-notes) + CI grep gate | Done | PM | mvp-2 |
| **r7 F**: README stack-availability labels (Antigravity/Kiro land mvp-4) | Done | PM | mvp-2 |
| **r7 H**: `CONTRIBUTING.md` (refinement loop + gate + local checks) | Done | PM | mvp-2 |
| Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing) | Done | Eng | mvp-3 |
| `--dry-run` classified action plan; `--force <path>` overwrite opt-in | Done | Eng | mvp-3 |
| Idempotent re-run (skip present-and-unmodified; complete missing pieces only) | Done | Eng | mvp-3 |
| Conflict-aware `pre-commit` install (plain-hook chaining; husky/lefthook detection) | Done | Eng | mvp-3 |
| `.zero-two-one.json` manifest write (full file-hash inventory) + `--upgrade` (scoped, TDD §7) | Done | Eng | mvp-3 |
| **r6 `init.js` mapping** uses `04-BACKLOG`/`05-ROADMAP` + `{planning,mvp,growth}` phase schema | Done | Eng | mvp-3 |
| **Workflow Manager (TDD §13)** — read-only `021-doctor` drift reporter first (no auto-apply); advisory, never blocks/auto-commits (r7) | Done | Eng | mvp-3 |
| **r7 G**: manifest as QA contract — `run-qa.sh`/pre-commit read phase/stack from `.zero-two-one.json` via `lib.js` (no output scraping) | Done | Eng | mvp-3 |
| **r7 G**: automated tests for `bin/init.js` + `hooks/pre-commit` on a non-empty fixture (moved from mvp-6; acceptance test = definition of done) | Done | Eng | mvp-3 |
| Migrate-mode detection + phase interview (`--phase` non-interactive); Growth entry scaffolds post-transition shape | Done | Eng | mvp-3 |
| Existing-doc import + duplicate resolution (archive / update-to-fit / leave-alongside) recorded in manifest | Done | Eng | mvp-3 |
| Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter, skip duplicate guidance | Done | Eng | mvp-3 |
| Migration acceptance test on a non-empty fixture repo (zero user-file overwrites) | Done | Eng | mvp-3 |
| Adapter interface seam: rendering + SSD paths resolved through the stack adapter layer (TDD §9) | Done | Eng | mvp-3 |
| Regenerate the framework's own `.zero-two-one.json` (`mode: source`, full hash inventory) | Done | Eng | mvp-3 |
| **r9**: package distribution fixes — stop shipping internal specs (P1: 128→90 tarball files); single-source `.claude/commands` (W2); `.DS_Store` hygiene | Done | Eng | mvp-3 |
| Source-layer generalization: `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` neutral default | Done | Eng | mvp-4 |
| `antigravity` stack: `AGENTS.md` rendering; `.agents/skills/021-<name>/SKILL.md`; MCP guidance; Spec Kit pairing | Done | Eng | mvp-4 |
| `kiro` stack: `.kiro/steering/021-*` + `.kiro/agents/021.json`; `kiro-specs` `status:` injection; engine-dispatch | Done | Eng | mvp-4 |
| **r9**: stack-parameterized install surface — `classes.js`/`sources.js` resolve dirs + guiding docs from manifest `tools.stack` (spec 006) | Done | Eng | mvp-4 |
| **r9**: the `021` CLI — single assistant-agnostic command surface (`021 status\|qa\|doctor\|spec …`) over existing scripts; adapters reference it (spec 009; replaces Makefile idea) | Done | Eng | mvp-4 |
| **r7 G**: programmatic-API decision — expose `scripts/speckit/lib.js` via `exports` (`zero-two-one/speckit`)? (TDD §14) | Done | Eng | mvp-4 |
| **r7 F**: remove README stack-availability caveats once `--stack antigravity\|kiro` is real | Done | PM | mvp-4 |
| `021-feedback` (TDD §10): `gh` / pre-filled issue URL to `billdingwall/zero-two-one`; issue template | Done | Eng | mvp-5 |
| `021-design` (TDD §11): design-system install / BYO over the §9.4 adapter | Done | Design | mvp-5 |
| `021-prototype` (TDD §12): optional prototype generation from key docs; wire prototype steps on first run | Done | Eng | mvp-5 |
| Stage-specific review-template selection wired into the refinement loop by manifest `phase` (`{planning,mvp,growth}`) — `reviewTemplateForPhase` (`lib.js`) surfaced via `021 status` | Done | PM | mvp-5 |
| End-to-end test (scaffold + migrate, all three stacks) — installs the packed tarball, asserts surface/manifest/gate/lifecycle (spec 013) | Done | Eng | mvp-6 |
| **r7 G**: CI publish pipeline — tag-triggered `npm publish --provenance` + pre-publish gate (dangling `main`/LICENSE/dummies/links/internal-specs); `sync --check` first (TDD §14) | Open | Eng | mvp-6 |
| Publish `zero-two-one` v1.1.x to the NPM registry via the pipeline (**after** mvp-3 safe-install + spec-013 e2e; name verified unclaimed) so the framework is installable in real repos | Open | Eng | mvp-6 |
| Field test: install the **published** package into three real repos (Claude+Spec Kit at Growth · Antigravity+Spec Kit · Kiro) | Open | PM | mvp-7 |
| Feedback loop live: `021-feedback` issues seeding the Growth backlog | Open | PM | mvp-7 |
| Pre-Growth review: full-work audit across all MVP releases (mvp-1…mvp-7); decision point for one more MVP spec if a gap surfaces | Open | PM | mvp-7 |

## v2 / Growth Backlog

*Empty of committed rows (r5) — the v2 feature set is **defined in the Growth phase**, after MVP ships (mvp-7 exit gate), driven by user value from `021-feedback` and field-test findings. The three former "Other v2 items" (native MCP server support, additional templates, issue-tracker integration) were **dropped** at r5; re-propose from real usage if warranted.*

**Design-noted Growth candidates (r9, [_notes/repo-refactor.md](_notes/repo-refactor.md) §5.4):** deferred here deliberately, not scheduled — (a) **scoped/hydrated refinement-loop instances** (multi-tier `.workflow/` per initiative — the standards-audit is the design note); (b) **runtime write-guards** for non-git-hook assistants (Kiro `beforeFileWrite` etc. enforcing the same spec-status gate); (c) **`021-doctor` apply-mode** (TDD §13 increment 2 — corrective, not just advisory). Revisit when real multi-team/multi-assistant usage warrants.

**Descoped from mvp-4 (2026-07-19):** mvp-4 closed on its delivered scope (the stack-adapter cut, specs 006–009) rather than block further on these; re-propose as their own Growth-release specs if field-test/feedback usage warrants (standard v2 promotion path).
- **AI-led init walkthrough** (TDD §1) — the interactive, ask-don't-assume interview (stack/design/phase/per-conflict decisions) driving `bin/init.js` via flags. The mechanical engine and every flag the interview needs (`--stack`, `--design`, `--phase`, `--dup`, `--force`, `--yes`, `--dry-run`) already exist and are stable; only the guided, stack-rendered interview itself is undelivered — `/021-init` is currently a post-install checklist, not the interview.
- **`--design material-3` auto-binding at init** (TDD §9.4) — the binding *mechanism* (the `DESIGN.md` mapping skeleton, `requirements/_design/tokens/` scaffold, Material Theme Builder JSON/CSS-variable import) already shipped as `021-design` (spec 011, mvp-5). What remains is wiring `--design material-3` at `init`/`--upgrade` time to invoke that mechanism automatically, instead of requiring a manual `021 design set material-3` follow-up call.
- **3-stack × {none, material-3} acceptance matrix — the `{material-3}` column.** The `{none}` row is proven (the neutral-core invariant, `renderer.test.js` T006, all three stacks). The `{material-3}` column needs the init-time auto-binding above before it can be exercised end-to-end across all three stacks.

## Open Questions & Blockers

- ~~How should framework layers be formalized to stay tool-agnostic?~~ — **resolved in r3** (TDD §9 adapter architecture).
- ~~Install-manifest location (root vs `.ai/`)~~ — **resolved at r2: repo root.**
- ~~`021-feedback` transport when `gh` is absent~~ — **resolved r4: pre-filled GitHub issue URL** (target `billdingwall/zero-two-one`, r5).
- ~~Do the carried v2 items move to MVP?~~ — **resolved r5: v2 emptied — items pulled into mvp releases or dropped; v2 defined in Growth.**
- ~~Phase source-of-truth drift (`021-status` vs docs)~~ — **resolved r5: dogfooded `.zero-two-one.json`; status reads the manifest.**
- ~~Prototype exit-gate unschedulable~~ — **resolved r5: prototype optional via `021-prototype`; not a gate condition.**
- ~~4-phase vs 3-phase; backlog/roadmap numbering~~ — **resolved r6: 3-phase (Planning·MVP·Growth); `04-BACKLOG`/`05-ROADMAP`.**
- ~~Is `zero-two-one` published to npm?~~ — **resolved r7: no — `npm view` returns 404 (name unclaimed); all package findings are pre-publish blockers.**
- Programmatic API surface: expose `scripts/speckit/lib.js` via `exports` (`require('zero-two-one/speckit')`), or CLI/content-only? — **deferred to mvp-4** (decide with the adapter seam; `main` removed now, TDD §14).
- Antigravity 2.0 SDK: re-evaluate whether the `antigravity` stack could carry its own durable SSD state when artifact persistence is documented (currently paired with Spec Kit per TDD §9.3).

## Refinement Cycles

- **r1** (2026-07-10, Applied): full-repo review — package boundary, template drift, v2 features, MVP→Growth mechanics. [_refinement/r1-review.md](_refinement/r1-review.md).
- **r2** (2026-07-10, Applied): safe install & migration (Claude Code + Spec Kit stack). [_refinement/r2-review.md](_refinement/r2-review.md).
- **r3** (2026-07-10, Applied): three supported stacks + pluggable design system + `021-` naming. [_refinement/r3-review.md](_refinement/r3-review.md).
- **r4** (2026-07-12, Applied): cohesive PRD/EDD/TDD set, AI-led init, releases model, `021-feedback` + `021-design`, v2→MVP promotion. [_refinement/r4-review.md](_refinement/r4-review.md).
- **r5** (2026-07-12, Applied): `/harden-docs` alignment fixes — six engineering-ordered MVP releases, manifest dogfood + status fix, optional `021-prototype`, publish gated behind safe-install, v2 emptied, CLI/workflow design docs. [_refinement/r5-review.md](_refinement/r5-review.md).
- **r6** (2026-07-15, Applied): structural overhaul — 3-phase lifecycle, `04-BACKLOG`/`05-ROADMAP` swap, table-format key docs, guiding files as roles/lenses, workflow sync-decomposition, `_architecture/` + Workflow-Manager, skill renames. [_refinement/r6-review.md](_refinement/r6-review.md).
- **r7** (2026-07-15, Applied): repo/package hardening audit — interim `init.js` safety, manifest/distribution hygiene (LICENSE, drop `main`/dummies/`prototype/`), `run-qa.sh` 3-phase fix + `--json`, CI + sync-drift + lint/link checks, phase-label sweep, three-stacks-at-MVP clarity, release re-scoping (tests→mvp-3, publish pipeline→mvp-6), CONTRIBUTING. [_refinement/r7-review.md](_refinement/r7-review.md).

## Changelog
- **2026-07-19:** mvp-4 closed with the adapter cut (specs 006–009) as its delivered scope. Removed the 4 remaining `Open`/mvp-4 rows from the MVP Backlog table (AI-led init walkthrough, design-system adapter, init `--design` integration, the {material-3} acceptance-matrix column) and re-homed them as 3 descoped items under v2/Growth Backlog, with a corrected note that the material-3 binding *mechanism* already shipped via `021-design` (mvp-5) — only init-time auto-invocation remains.
- **2026-07-16 (r9):** Closed the 15 delivered mvp-3 rows (Open→Done — the standing `021-doctor` advisory); phase header → MVP Build (Phase 1); added the r9 package-fix Done row, mvp-4 stack-parameterized-surface + `021`-CLI rows, neutral-core invariant on the acceptance-matrix row; recorded r9 Growth candidates (scoped loops, runtime write-guards, doctor apply-mode). Per [_refinement/r9-review.md](_refinement/r9-review.md).
- **2026-07-15 (r7):** Added r7 in-round fix rows (A–F, H, Done under mvp-2); moved init/hook tests mvp-6→mvp-3; added mvp-3 QA-contract + read-only Workflow-Manager reporter rows, mvp-4 API-decision row, mvp-6 CI-publish-pipeline row; closed the npm-published question; added the r7 cycle row. Per [_refinement/r7-review.md](_refinement/r7-review.md).
- **2026-07-15 (r6):** Renamed `05-BACKLOG.md` → **`04-BACKLOG.md`**; converted the release-grouped checklists to a **table** (description·status·ownership·release); added the r6 structural-migration items + the Workflow-Manager (mvp-3) item; phase header → Planning (3-phase); closed the 4-vs-3 / numbering open question; added the r6 refinement-cycle row. Per [_refinement/r6-review.md](_refinement/r6-review.md).
- **2026-07-12 (r5):** Backlog regrouped by the six MVP releases in dependency order; v2/Growth backlog emptied (items pulled to MVP or dropped); added manifest dogfood, status-script fix, design docs, and `021-prototype`; feedback repo slug resolved; six open questions closed. Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** Stacks & Design Adapters promoted from v2 into MVP; new r4 Features group; two questions resolved at approval; r4 cycle row. Per [_refinement/r4-update-backlog.md](_refinement/r4-update-backlog.md).
- **2026-07-10 (r3):** v2 items 1–4 restructured into the Stacks & Design Adapters group; adapter-seam task added; layering question resolved; Antigravity SDK watch item added. Per [_refinement/r3-update-backlog.md](_refinement/r3-update-backlog.md).
- **2026-07-10 (r2):** Added the Init v2 task group; tagged v2 items with Kiro/Antigravity; resolved the manifest-location question. Per [_refinement/r2-update-backlog.md](_refinement/r2-update-backlog.md).
- **2026-07-10 (r1):** Populated the backlog stub. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
