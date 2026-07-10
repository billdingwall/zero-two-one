# r3 Update Plan: 05-BACKLOG.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 5 task breakdown
**Target doc:** [../05-BACKLOG.md](../05-BACKLOG.md)

## Intent

Convert the `[r3]`-tagged v2 items into a concrete, contract-referenced task group, and add the design-system role. One MVP-side task keeps Init v2 adapter-shaped.

## Proposed Edits

### 1. Add to `## MVP Backlog` (Init v2 group)

- [ ] Adapter interface seam in Init v2: resolve instruction/skill/command rendering and SSD paths through the adapter layer (TDD §9), shipping only default bindings in MVP.

### 2. Restructure `## v2 / Growth Backlog` items 2–4 into an **Adapters (r3)** group

Replacing the current tagged bullets with contract-referenced tasks:

**Assistant adapters (TDD §9.2):**
- [ ] Generalize `CLAUDE-Template.md` → `ASSISTANT-Template.md`; make `AGENTS.md` the neutral default output; `claude-code` renders `CLAUDE.md` (behavior unchanged).
- [ ] `antigravity` adapter: `AGENTS.md` rendering; `skills/*.md` → `.agents/skills/<name>/SKILL.md` packaging; MCP registration guidance (`~/.gemini/config/mcp_config.json`).
- [ ] `kiro` adapter: steering rendering (`.kiro/steering/{product,tech,structure}.md` + frontmatter inclusion modes); `.kiro/agents/zero-two-one.json` CLI agent (prompt/resources → guiding + key docs; lifecycle hooks).

**SSD engine adapters (TDD §9.3):**
- [ ] Engine-dispatch layer in `scripts/speckit/*` (read engine from manifest; resolve spec paths and state per engine).
- [ ] `kiro-specs` binding: `status:` frontmatter injection in `.kiro/specs/<feature>/requirements.md`; task progress from `tasks.md` checkboxes; gate + `spec:context`/`spec:verify` parity test against the Spec Kit baseline.

**Design-system adapter (TDD §9.4) — absorbs v2 item 1:**
- [ ] `DESIGN.md` token-mapping section + `requirements/_design/tokens/` artifact convention; prototype consumes exported CSS variables.
- [ ] `material-3` binding: `md.sys.*` role mapping; Material Theme Builder export import (JSON/CSS vars); M3 Expressive implications surfaced.
- [ ] Design-system-selection workflow implementation (per [r3-update-workflows.md](r3-update-workflows.md)).

**Init integration (TDD §7/§8):**
- [ ] Tool-selection interview + `--assistant`/`--ssd`/`--design` flags; manifest `tools.design` key.
- [ ] Migrate-mode tool detection (`.kiro/`, `.agents/`, `AGENTS.md`, `.claude/`) proposing matching adapters.
- [ ] Cross-stack acceptance matrix: init/migrate on {claude-code, antigravity, kiro} × {github-speckit, kiro-specs} × {none, material-3}, gate green in each supported cell.

### 3. Watch item under `## Open Questions & Blockers`

- Antigravity 2.0 SDK: re-evaluate SSD-engine eligibility when durable artifact persistence is documented (currently assistant-only per TDD §9.3).

### 4. Log the round

Add r3 to `## Refinement Cycles` with a link to [r3-review.md](r3-review.md) and the research note.

## Cascade

- Changelog entry in the backlog.
