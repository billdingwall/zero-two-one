# Project Backlog

## Current Phase: Planning (Phase 1)

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
| Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing) | Open | Eng | mvp-3 |
| `--dry-run` classified action plan; `--force <path>` overwrite opt-in | Open | Eng | mvp-3 |
| Idempotent re-run (skip present-and-unmodified; complete missing pieces only) | Open | Eng | mvp-3 |
| Conflict-aware `pre-commit` install (plain-hook chaining; husky/lefthook detection) | Open | Eng | mvp-3 |
| `.zero-two-one.json` manifest write (full file-hash inventory) + `--upgrade` (scoped, TDD §7) | Open | Eng | mvp-3 |
| **r6 `init.js` mapping** uses `04-BACKLOG`/`05-ROADMAP` + `{planning,mvp,growth}` phase schema | Open | Eng | mvp-3 |
| **Workflow Manager (TDD §13)** — read-only `021-doctor` drift reporter first (no auto-apply); advisory, never blocks/auto-commits (r7) | Open | Eng | mvp-3 |
| **r7 G**: manifest as QA contract — `run-qa.sh`/pre-commit read phase/stack from `.zero-two-one.json` via `lib.js` (no output scraping) | Open | Eng | mvp-3 |
| **r7 G**: automated tests for `bin/init.js` + `hooks/pre-commit` on a non-empty fixture (moved from mvp-6; acceptance test = definition of done) | Open | Eng | mvp-3 |
| Migrate-mode detection + phase interview (`--phase` non-interactive); Growth entry scaffolds post-transition shape | Open | Eng | mvp-3 |
| Existing-doc import + duplicate resolution (archive / update-to-fit / leave-alongside) recorded in manifest | Open | Eng | mvp-3 |
| Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter, skip duplicate guidance | Open | Eng | mvp-3 |
| Migration acceptance test on a non-empty fixture repo (zero user-file overwrites) | Open | Eng | mvp-3 |
| Adapter interface seam: rendering + SSD paths resolved through the stack adapter layer (TDD §9) | Open | Eng | mvp-3 |
| Regenerate the framework's own `.zero-two-one.json` (`mode: source`, full hash inventory) | Open | Eng | mvp-3 |
| AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview | Open | Eng | mvp-4 |
| Source-layer generalization: `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` neutral default | Open | Eng | mvp-4 |
| `antigravity` stack: `AGENTS.md` rendering; `.agents/skills/021-<name>/SKILL.md`; MCP guidance; Spec Kit pairing | Open | Eng | mvp-4 |
| `kiro` stack: `.kiro/steering/021-*` + `.kiro/agents/021.json`; `kiro-specs` `status:` injection; engine-dispatch | Open | Eng | mvp-4 |
| Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `_design/tokens/`; `material-3` binding | Open | Design | mvp-4 |
| Init integration: `--stack`/`--design` flags; migrate-mode stack detection; manifest `tools.*` | Open | Eng | mvp-4 |
| **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021-status`/`021-qa` in all six cells (reuses mvp-3 fixture harness) | Open | Eng | mvp-4 |
| **r7 G**: programmatic-API decision — expose `scripts/speckit/lib.js` via `exports` (`zero-two-one/speckit`)? (TDD §14) | Open | Eng | mvp-4 |
| **r7 F**: remove README stack-availability caveats once `--stack antigravity\|kiro` is real | Open | PM | mvp-4 |
| `021-feedback` (TDD §10): `gh` / pre-filled issue URL to `billdingwall/zero-two-one`; issue template | Open | Eng | mvp-5 |
| `021-design` (TDD §11): design-system install / BYO over the §9.4 adapter | Open | Design | mvp-5 |
| `021-prototype` (TDD §12): optional prototype generation from key docs; wire prototype steps on first run | Open | Eng | mvp-5 |
| Stage-specific review-template selection wired into the refinement loop by manifest `phase` (`{planning,mvp,growth}`) | Open | PM | mvp-5 |
| End-to-end test via Claude Code — scaffold and migrate modes | Open | Eng | mvp-6 |
| **r7 G**: CI publish pipeline — tag-triggered `npm publish --provenance` + pre-publish gate (dangling `main`/LICENSE/dummies/links); `sync --check` first (TDD §14) | Open | Eng | mvp-6 |
| Publish `zero-two-one` v1.1.x to the NPM registry via the pipeline (**after** mvp-3 safe-install; name verified unclaimed) | Open | Eng | mvp-6 |
| Field test: init into three real repos (Claude+Spec Kit at Growth · Antigravity+Spec Kit · Kiro) | Open | PM | mvp-6 |
| Feedback loop live: `021-feedback` issues seeding the Growth backlog | Open | PM | mvp-6 |

## v2 / Growth Backlog

*Empty (r5). All previously-listed v2 work was pulled into the MVP releases above. The v2 feature set is **defined in the Growth phase**, after MVP ships (mvp-6 exit gate) — driven by user value from `021-feedback` and field-test findings. The three former "Other v2 items" (native MCP server support, additional templates, issue-tracker integration) were **dropped** at r5; re-propose them here from real usage if warranted.*

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
- **2026-07-15 (r7):** Added r7 in-round fix rows (A–F, H, Done under mvp-2); moved init/hook tests mvp-6→mvp-3; added mvp-3 QA-contract + read-only Workflow-Manager reporter rows, mvp-4 API-decision row, mvp-6 CI-publish-pipeline row; closed the npm-published question; added the r7 cycle row. Per [_refinement/r7-review.md](_refinement/r7-review.md).
- **2026-07-15 (r6):** Renamed `05-BACKLOG.md` → **`04-BACKLOG.md`**; converted the release-grouped checklists to a **table** (description·status·ownership·release); added the r6 structural-migration items + the Workflow-Manager (mvp-3) item; phase header → Planning (3-phase); closed the 4-vs-3 / numbering open question; added the r6 refinement-cycle row. Per [_refinement/r6-review.md](_refinement/r6-review.md).
- **2026-07-12 (r5):** Backlog regrouped by the six MVP releases in dependency order; v2/Growth backlog emptied (items pulled to MVP or dropped); added manifest dogfood, status-script fix, design docs, and `021-prototype`; feedback repo slug resolved; six open questions closed. Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** Stacks & Design Adapters promoted from v2 into MVP; new r4 Features group; two questions resolved at approval; r4 cycle row. Per [_refinement/r4-update-backlog.md](_refinement/r4-update-backlog.md).
- **2026-07-10 (r3):** v2 items 1–4 restructured into the Stacks & Design Adapters group; adapter-seam task added; layering question resolved; Antigravity SDK watch item added. Per [_refinement/r3-update-backlog.md](_refinement/r3-update-backlog.md).
- **2026-07-10 (r2):** Added the Init v2 task group; tagged v2 items with Kiro/Antigravity; resolved the manifest-location question. Per [_refinement/r2-update-backlog.md](_refinement/r2-update-backlog.md).
- **2026-07-10 (r1):** Populated the backlog stub. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
