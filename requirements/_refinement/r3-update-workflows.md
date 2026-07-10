# r3 Update Plan: Workflows, Templates & De-binding

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 3.2, 4 (invariant audit)
**Target docs:** `workflow/workflows.md`, `workflow/specific-workflows/spec-driven-delivery.md`, `workflow/specific-workflows/key-docs-to-ssd.md`, `workflow/specific-workflows/init-and-migration.md`, `workflow/specific-workflows/design-system-selection.md` (new), `templates/DESIGN-Template.md`, `.021-updates/framework-architecture-proposal.md`

## Intent

Two jobs: (a) cure the layer-2/3 invariant violations found in the audit — process docs name *roles*, the manifest names *tools*; (b) add the design-system-selection workflow that v2 item 1 has been waiting for.

## Proposed Edits

### 1. De-bind layers 2–3 (finding 4)

- `workflows.md` §4: "relies on **Claude Code** and **GitHub SpecKit**" → "relies on the project's configured **AI assistant** and **SSD engine** (defaults: Claude Code, GitHub Spec Kit — see `.zero-two-one.json`)". §2 table rows for `CLAUDE.md` and `scripts/speckit/` get role-based descriptions with defaults noted.
- `spec-driven-delivery.md`: goal restated against "the SSD engine"; Spec Kit becomes the documented default binding with a pointer to TDD §9.3 for alternatives.
- `key-docs-to-ssd.md`: "SpecKit branches" → "SSD feature branches (`NNN-feature-name`)".
- `init-and-migration.md`: add the tool-selection step (interview/flags) and adapter-aware surface table; migrate-mode detection list gains `.kiro/`, `.agents/`, `AGENTS.md`.
- Rule of thumb added to `workflows.md`: process docs may name a default in parentheses; only the manifest and TDD §9 bind tools normatively.

### 2. New `workflow/specific-workflows/design-system-selection.md` (finding 3.2)

The dedicated workflow r1 asked for:
1. **Select** — user names a system (first supported: Material 3) or stays bespoke.
2. **Assess** — walk decisions/gaps/implications: component availability vs EDD scenarios, theming model (e.g. M3 dynamic color), accessibility defaults, platform export targets, licensing.
3. **Map** — express project decisions as system-token roles in `DESIGN.md`; import exported token artifacts (e.g. Theme Builder JSON/CSS vars) into `requirements/_design/tokens/`.
4. **Cascade** — annotate the EDD with system constraints; re-theme `prototype/` from the exported CSS variables; record `tools.design` in the manifest.
5. **Review** — changes land through a refinement round like any living-doc update.

### 3. `templates/DESIGN-Template.md`

Add the token-mapping skeleton (role → token assignment table + artifact reference block) so new projects start compatible with the adapter, bespoke or not.

### 4. `.021-updates/framework-architecture-proposal.md`

Mark the proposal's adapter sections as **adopted in r3** (pointer to TDD §9) so the internal doc doesn't drift from the now-canonical TDD.

## Cascade

- `npm run sync:package` after apply; template-maintenance rule sweep (r1) for renamed/added templates.
- Changelog entries where the touched docs carry one.
