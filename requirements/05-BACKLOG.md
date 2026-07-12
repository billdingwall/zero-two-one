# Project Backlog

## Current Phase: Pre-build (Phase 2)

*Backlog ordering is roadmap-driven until the Growth phase. From Growth onward, **user value** — from feedback collected in refinement rounds and `021-feedback` issues — is the primary signal, and items are **promoted into releases** ([_releases/](_releases/_INDEX.md)) and implemented as their own SSD specs. See the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md).*

## MVP Backlog

*Grouped by release in engineering-dependency order (r5). Each unchecked item is future SSD spec material — implemented on `NNN-feature-name` branches through the refinement gate. All previously-deferred v2 work now lives here.*

### mvp-2 — Foundation & Design Docs (current)

- [x] Package-manifest sync exclusions; remove `sync-to-package.js` from `package/scripts/` (r1).
- [x] `06-REVIEW-Template.md` Related Docs + template-maintenance rule (r1).
- [x] Dogfood `.zero-two-one.json`; `workflow-status.js` reads manifest `phase`; prototype dropped from inference (r5).
- [x] `requirements/_design/command-design.md` + `workflow-design.md` (r5).
- [ ] Finalize Claude Code integrations wiring (`/021-init`, `/021-status`).
- [ ] Stakeholder sign-off demo: lightweight command-walkthrough / transcript of the `021` CLI experience, backing the Pre-build exit gate (EDD §3; r5 Q2).

### mvp-3 — Safe Install & Manifest (Init v2; TDD §§6–8)

- [ ] Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing for user-owned files).
- [ ] `--dry-run` classified action plan; `--force <path>` overwrite opt-in.
- [ ] Idempotent re-run (skip present-and-unmodified; complete missing pieces only).
- [ ] Conflict-aware `pre-commit` install (plain-hook chaining; husky/lefthook detection).
- [ ] `.zero-two-one.json` manifest write (full file-hash inventory) + `--upgrade` (scoped, TDD §7).
- [ ] Migrate-mode detection + phase interview (`--phase` non-interactive); Growth entry scaffolds post-transition shape.
- [ ] Existing-doc import + duplicate resolution (archive / update-to-fit / leave-alongside) recorded in the manifest.
- [ ] Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter, skip duplicate guidance.
- [ ] Migration acceptance test on a non-empty fixture repo (zero user-file overwrites).
- [ ] Adapter interface seam: rendering + SSD paths resolved through the stack adapter layer (TDD §9).
- [ ] Regenerate the framework's own `.zero-two-one.json` (`mode: source`, full hash inventory) — end-to-end manifest dogfooding, replacing the r5 hand-authored `files: {}` stub (r5 Q3).

### mvp-4 — AI-Led Init & Stack/Design Adapters (r3 group; TDD §9)

- [ ] AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview.
- [ ] Source-layer generalization: `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` neutral default; `claude` renders `CLAUDE.md` unchanged.
- [ ] `antigravity` stack: `AGENTS.md` rendering; `.agents/skills/021-<name>/SKILL.md`; MCP registration guidance; Spec Kit pairing validation (session-only artifacts; Spec Kit holds gate state).
- [ ] `kiro` stack: `.kiro/steering/021-*` + `.kiro/agents/021.json`; `kiro-specs` `status:` injection; task progress from `tasks.md`; engine-dispatch layer in `scripts/speckit/*`.
- [ ] Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` binding (Theme Builder import; M3 Expressive implications).
- [ ] Init integration: `--stack`/`--design` flags; migrate-mode stack detection; manifest `tools.stack`/`tools.design`.
- [ ] **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021-status`/`021-qa` in all six cells; no framework file outside the `021-` namespace in shared dirs.

### mvp-5 — Lifecycle Commands (r4 set + optional prototype)

- [ ] `021-feedback` (TDD §10): `gh` / pre-filled issue URL to `billdingwall/zero-two-one`; manifest context attached; `.github/ISSUE_TEMPLATE/021-feedback.yml`.
- [ ] `021-design` (TDD §11): design-system install / BYO over the §9.4 adapter and design-system-selection workflow.
- [ ] `021-prototype` (TDD §12): optional prototype generation from key docs + `DESIGN.md`; wire prototype steps into Design / Refinement step 5 / QA on first run.
- [ ] Stage-specific review-template selection wired into the refinement loop by manifest `phase` (templates shipped r4).

### mvp-6 — Test, Publish & Field Launch

- [ ] Automated tests for `bin/init.js` and `hooks/pre-commit`.
- [ ] End-to-end test via Claude Code — scaffold and migrate modes.
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry (**after** mvp-3 safe-install lands).
- [ ] Field test: init into three real repos (Claude+Spec Kit at Growth · Antigravity+Spec Kit · Kiro), different phases.
- [ ] Feedback loop live: `021-feedback` issues seeding the Growth backlog.

## v2 / Growth Backlog

*Empty (r5). All previously-listed v2 work was pulled into the MVP releases above. The v2 feature set is **defined in the Growth phase**, after MVP ships (mvp-6 exit gate) — driven by user value from `021-feedback` and field-test findings. The three former "Other v2 items" (native MCP server support, additional templates, issue-tracker integration) were **dropped** at r5; re-propose them here from real usage if warranted.*

## Open Questions & Blockers

- ~~How should framework layers be formalized to stay tool-agnostic?~~ — **resolved in r3** (TDD §9 adapter architecture).
- ~~Install-manifest location (root vs `.ai/`)~~ — **resolved at r2: repo root.**
- ~~`021-feedback` transport when `gh` is absent~~ — **resolved r4: pre-filled GitHub issue URL** (target `billdingwall/zero-two-one`, r5).
- ~~Do the carried v2 items move to MVP?~~ — **resolved r5: v2 emptied — items pulled into mvp releases or dropped; v2 defined in Growth.**
- ~~Phase source-of-truth drift (`021-status` vs docs)~~ — **resolved r5: dogfooded `.zero-two-one.json`; status reads the manifest.**
- ~~Prototype exit-gate unschedulable~~ — **resolved r5: prototype optional via `021-prototype`; not a gate condition.**
- Antigravity 2.0 SDK: re-evaluate whether the `antigravity` stack could carry its own durable SSD state when artifact persistence is documented (currently paired with Spec Kit per TDD §9.3).

## Refinement Cycles

- **r1** (2026-07-10, Applied): full-repo review — package boundary, template drift, v2 features, MVP→Growth mechanics. [_refinement/r1-review.md](_refinement/r1-review.md).
- **r2** (2026-07-10, Applied): safe install & migration (Claude Code + Spec Kit stack). [_refinement/r2-review.md](_refinement/r2-review.md).
- **r3** (2026-07-10, Applied): three supported stacks + pluggable design system + `021-` naming. [_refinement/r3-review.md](_refinement/r3-review.md).
- **r4** (2026-07-12, Applied): cohesive PRD/EDD/TDD set, AI-led init, releases model, `021-feedback` + `021-design`, v2→MVP promotion. [_refinement/r4-review.md](_refinement/r4-review.md).
- **r5** (2026-07-12, Applied): `/harden-docs` alignment fixes — six engineering-ordered MVP releases, manifest dogfood + status fix, optional `021-prototype`, publish gated behind safe-install, v2 emptied, CLI/workflow design docs. [_refinement/r5-review.md](_refinement/r5-review.md).

## Changelog
- **2026-07-12 (r5):** Backlog regrouped by the six MVP releases in dependency order; v2/Growth backlog emptied (items pulled to MVP or dropped); added manifest dogfood, status-script fix, design docs, and `021-prototype`; feedback repo slug resolved; six open questions closed. Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** Stacks & Design Adapters promoted from v2 into MVP; new r4 Features group; two questions resolved at approval; r4 cycle row. Per [_refinement/r4-update-backlog.md](_refinement/r4-update-backlog.md).
- **2026-07-10 (r3):** v2 items 1–4 restructured into the Stacks & Design Adapters group; adapter-seam task added; layering question resolved; Antigravity SDK watch item added. Per [_refinement/r3-update-backlog.md](_refinement/r3-update-backlog.md).
- **2026-07-10 (r2):** Added the Init v2 task group; tagged v2 items with Kiro/Antigravity; resolved the manifest-location question. Per [_refinement/r2-update-backlog.md](_refinement/r2-update-backlog.md).
- **2026-07-10 (r1):** Populated the backlog stub. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
