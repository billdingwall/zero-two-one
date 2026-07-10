# Project Backlog

## Current Phase: Pre-build (Phase 2)

*Backlog ordering is roadmap-driven until the Growth phase. From Growth onward, **user value** — defined from user feedback collected in refinement rounds — is the primary prioritization signal. See the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md).*

## MVP Backlog

*Supports delivery of [04-ROADMAP.md](04-ROADMAP.md) Phases 2–3.*

- [x] Implement package-manifest sync exclusions; remove `sync-to-package.js` from `package/scripts/` (r1 finding 1.1 — done in r1 apply).
- [x] Update `06-REVIEW-Template.md` Related Docs and add the template-maintenance rule to the Refinement Loop (r1 finding 2.1 — done in r1 apply).
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry.
- [ ] End-to-end test of `npx zero-two-one-init` via Claude Code — scaffold mode (fresh repo) and migrate mode (working repo).
- [ ] Automated tests for `bin/init.js` and `hooks/pre-commit`.

### Init v2 — safe install & migration (r2; TDD §§6–8)

*Each item is future SSD spec material — implemented on `NNN-feature-name` branches through the refinement gate.*

- [ ] Ownership-based merge engine in `bin/init.js` (file classes per TDD §6; create-if-missing for user-owned files).
- [ ] `--dry-run` classified action plan and `--force <path>` overwrite opt-in.
- [ ] Idempotent re-run (skip present-and-unmodified; complete missing pieces only).
- [ ] Copy `.claude/commands/` into target, merge-safe (fixes r2 finding 1 / PRD Feature 4).
- [ ] Conflict-aware pre-commit install (plain-hook chaining; husky/lefthook detection).
- [ ] `.zero-two-one.json` install manifest at repo root (version, mode, phase, tools, file hashes) + `--upgrade` flow.
- [ ] Migrate-mode detection + lifecycle-phase interview (`--phase` flag for non-interactive); Growth entry scaffolds post-transition roadmap/backlog shape.
- [ ] Existing-doc import to `requirements/_notes/imported-docs.md` with template cross-links.
- [ ] Spec Kit reuse: detect `.specify/`/populated `specs/`, validate frontmatter against the gate, skip duplicate setup guidance.
- [ ] Migration acceptance test on a non-empty fixture repo (zero user-file overwrites).

## v2 / Growth Backlog

*Not MVP scope. Pulled into releases at the team's discretion once the Growth phase begins.*

From r1 finding 3:
1. **Design-system selection** — user picks a design system during setup; a dedicated workflow walks through decisions, gaps, and implications, then updates `DESIGN.md`, the EDD, and development requirements to utilize it.
2. **Pluggable spec-driven delivery tool** `[r3]` — default remains GitHub Spec Kit; allow alternatives (Kiro, Google Antigravity) to manage specs and the SSD process. Builds on the `.zero-two-one.json` `tools` block landing in r2 (TDD §7).
3. **Pluggable AI assistant** `[r3]` — support assistants other than Claude Code (Kiro CLI, Google Antigravity): `CLAUDE.md` becomes the tool's equivalent (`KIRO.md`, etc.) wired into that tool's project settings, functionally identical. Builds on the r2 manifest `tools` block.
4. **Configuration flow at init** — *partially delivered by r2* (phase interview + tool-stack recording in the manifest); remaining scope (full tool-selection interview) rolls into r3 (r1 finding 3.2; see [.021-updates/framework-architecture-proposal.md](../.021-updates/framework-architecture-proposal.md)).

Carried over from the pre-r1 roadmap Phase 4:
5. Native MCP (Model Context Protocol) server support within the framework.
6. Additional templates (e.g. database schema, API design).
7. Issue-tracker integration (Linear, Jira) to sync spec statuses.

## Open Questions & Blockers

- How should framework layers be formalized to stay tool-agnostic? → Layering model proposed in [.021-updates/framework-architecture-proposal.md](../.021-updates/framework-architecture-proposal.md); r2's install manifest + `tools` block is the first concrete step. Full audit of living docs against the "no tool names in layers 2–3" invariant still pending before r3 opens.
- ~~Install-manifest location (root vs `.ai/`)~~ — **resolved at r2 approval: repo root** (user-visible state, not a generated artifact).

## Refinement Cycles

- **r1** (2026-07-10, Applied): full-repo review — package boundary, template drift, v2 features, MVP→Growth mechanics. See [_refinement/r1-review.md](_refinement/r1-review.md).
- **r2** (2026-07-10, Applied): safe install & migration into working projects (Claude Code + Spec Kit stack); r3 pre-scoped for multi-tool. See [_refinement/r2-review.md](_refinement/r2-review.md).

## Changelog
- **2026-07-10 (r2):** Added the Init v2 task group to the MVP backlog; tagged v2 items 2–3 as `[r3]` with Kiro/Antigravity named; marked item 4 partially delivered; resolved the manifest-location question (root). Per [_refinement/r2-update-backlog.md](_refinement/r2-update-backlog.md).
- **2026-07-10 (r1):** Populated the backlog stub: MVP tasks, v2/Growth items (explicitly out of MVP scope), open-questions register, refinement cycle log. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
