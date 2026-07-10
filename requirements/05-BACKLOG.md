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
- [ ] Adapter interface seam in Init v2: instruction/skill/command rendering and SSD paths resolved through the stack adapter layer (TDD §9), shipping only the `claude` stack + `none` design binding in MVP.

## v2 / Growth Backlog

*Not MVP scope. Pulled into releases at the team's discretion once the Growth phase begins.*

### Stacks & Design Adapters (r3; TDD §9)

*Designed in r3 — absorbs former v2 items 1–4. Implemented per stack; pulled into Growth releases (or earlier at the team's discretion).*

**Source layer (prerequisite for both non-default stacks):**
- [ ] Generalize `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` as neutral default output; `claude` stack renders `CLAUDE.md` (behavior unchanged).

**`antigravity` stack (TDD §9.2/9.3 — pairs with GitHub Spec Kit):**
- [ ] `AGENTS.md` rendering; `skills/*.md` → `.agents/skills/021-<name>/SKILL.md` packaging; MCP registration guidance (`~/.gemini/config/mcp_config.json`).
- [ ] Spec Kit pairing validation: gate, `021-spec:context`, `021-spec:verify` run unchanged with Antigravity driving (Antigravity artifacts are session-only; Spec Kit holds the durable state).

**`kiro` stack (TDD §9.2/9.3 — assistant + SSD in one):**
- [ ] Steering rendering (`.kiro/steering/021-{product,tech,structure}.md` + frontmatter inclusion modes); `.kiro/agents/021.json` CLI agent (prompt/resources → guiding + key docs; lifecycle hooks).
- [ ] `kiro-specs` engine binding: `status:` frontmatter injection in `.kiro/specs/<feature>/requirements.md`; task progress from `tasks.md` checkboxes.
- [ ] Engine-dispatch layer in `scripts/speckit/*` (read engine from manifest; resolve spec paths and state per engine); gate + `021-spec:context`/`021-spec:verify` parity test against the Spec Kit baseline.

**Design-system adapter (TDD §9.4 — independent of stack):**
- [ ] `DESIGN.md` token-mapping section + `requirements/_design/tokens/` artifact convention; prototype consumes exported CSS variables.
- [ ] `material-3` binding: `md.sys.*` role mapping; Material Theme Builder export import (JSON/CSS vars); M3 Expressive implications surfaced.
- [ ] Design-system-selection workflow execution support (workflow shipped in r3: [design-system-selection.md](../workflow/specific-workflows/design-system-selection.md)).

**Init integration (TDD §7/§8):**
- [ ] Stack interview question + `--stack`/`--design` flags; manifest `tools.stack` + `tools.design` keys (assistant/ssd derived).
- [ ] Migrate-mode stack detection (`.claude/` → claude; `.agents/`/`AGENTS.md` → antigravity; `.kiro/` → kiro; `.specify/` confirms Spec Kit); conflict handling via interview.
- [ ] Acceptance matrix: init/migrate on **3 stacks × {none, material-3}** — gate green and `npm run 021-status`/`021-qa` working in all six cells; no framework file lands outside the `021-` namespace in shared directories.

### Other v2 items (carried over from the pre-r1 roadmap Phase 4)
1. Native MCP (Model Context Protocol) server support within the framework.
2. Additional templates (e.g. database schema, API design).
3. Issue-tracker integration (Linear, Jira) to sync spec statuses.

## Open Questions & Blockers

- ~~How should framework layers be formalized to stay tool-agnostic?~~ — **resolved in r3**: adapter architecture canonical in TDD §9; layer 2–3 invariant audit completed and de-binding applied ([r3-review.md](_refinement/r3-review.md) findings 5–6).
- ~~Install-manifest location (root vs `.ai/`)~~ — **resolved at r2 approval: repo root** (user-visible state, not a generated artifact).
- Antigravity 2.0 SDK: re-evaluate whether the `antigravity` stack could carry its own durable SSD state when artifact persistence is documented (currently paired with Spec Kit per TDD §9.3).

## Refinement Cycles

- **r1** (2026-07-10, Applied): full-repo review — package boundary, template drift, v2 features, MVP→Growth mechanics. See [_refinement/r1-review.md](_refinement/r1-review.md).
- **r2** (2026-07-10, Applied): safe install & migration into working projects (Claude Code + Spec Kit stack); r3 pre-scoped for multi-tool. See [_refinement/r2-review.md](_refinement/r2-review.md).
- **r3** (2026-07-10, Applied): three supported stacks (claude/antigravity/kiro) + pluggable design system (Material 3) + `021-` naming convention. See [_refinement/r3-review.md](_refinement/r3-review.md) and [_notes/r3-tool-research.md](_notes/r3-tool-research.md).

## Changelog
- **2026-07-10 (r3):** v2 items 1–4 restructured into the Stacks & Design Adapters group (per-stack tasks, TDD §9 contracts, 3×2 acceptance matrix); adapter-seam task added to MVP backlog; layering question resolved; Antigravity SDK watch item added. Per [_refinement/r3-update-backlog.md](_refinement/r3-update-backlog.md).
- **2026-07-10 (r2):** Added the Init v2 task group to the MVP backlog; tagged v2 items 2–3 as `[r3]` with Kiro/Antigravity named; marked item 4 partially delivered; resolved the manifest-location question (root). Per [_refinement/r2-update-backlog.md](_refinement/r2-update-backlog.md).
- **2026-07-10 (r1):** Populated the backlog stub: MVP tasks, v2/Growth items (explicitly out of MVP scope), open-questions register, refinement cycle log. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
