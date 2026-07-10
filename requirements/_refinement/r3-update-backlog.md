# r3 Update Plan: 05-BACKLOG.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1–4, 7 task breakdown
**Target doc:** [../05-BACKLOG.md](../05-BACKLOG.md)

## Intent

Convert the `[r3]`-tagged v2 items into a concrete, contract-referenced task group organized by **stack**, and add the design-system role. One MVP-side task keeps Init v2 adapter-shaped.

## Proposed Edits

### 1. Add to `## MVP Backlog` (Init v2 group)

- [ ] Adapter interface seam in Init v2: instruction/skill/command rendering and SSD paths resolved through the stack adapter layer (TDD §9), shipping only the `claude` stack + `none` design binding in MVP.

### 2. Restructure `## v2 / Growth Backlog` items 2–4 into a **Stacks & Design Adapters (r3)** group

Replacing the current tagged bullets with contract-referenced tasks:

**Source layer (prerequisite for both stacks):**
- [ ] Generalize `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` as neutral default output; `claude` stack renders `CLAUDE.md` (behavior unchanged).

**`antigravity` stack (TDD §9.2/9.3 — pairs with GitHub Spec Kit):**
- [ ] `AGENTS.md` rendering; `skills/*.md` → `.agents/skills/<name>/SKILL.md` packaging; MCP registration guidance (`~/.gemini/config/mcp_config.json`).
- [ ] Spec Kit pairing validation: gate, `spec:context`, `spec:verify` run unchanged with Antigravity driving (Antigravity artifacts are session-only; Spec Kit holds the durable state).

**`kiro` stack (TDD §9.2/9.3 — assistant + SSD in one):**
- [ ] Steering rendering (`.kiro/steering/{product,tech,structure}.md` + frontmatter inclusion modes); `.kiro/agents/zero-two-one.json` CLI agent (prompt/resources → guiding + key docs; lifecycle hooks).
- [ ] `kiro-specs` engine binding: `status:` frontmatter injection in `.kiro/specs/<feature>/requirements.md`; task progress from `tasks.md` checkboxes.
- [ ] Engine-dispatch layer in `scripts/speckit/*` (read engine from manifest; resolve spec paths and state per engine); gate + `spec:context`/`spec:verify` parity test against the Spec Kit baseline.

**Design-system adapter (TDD §9.4 — independent of stack; absorbs v2 item 1):**
- [ ] `DESIGN.md` token-mapping section + `requirements/_design/tokens/` artifact convention; prototype consumes exported CSS variables.
- [ ] `material-3` binding: `md.sys.*` role mapping; Material Theme Builder export import (JSON/CSS vars); M3 Expressive implications surfaced.
- [ ] Design-system-selection workflow implementation (per [r3-update-workflows.md](r3-update-workflows.md)).

**Init integration (TDD §7/§8):**
- [ ] Stack interview question + `--stack`/`--design` flags; manifest `tools.stack` + `tools.design` keys (assistant/ssd derived).
- [ ] Migrate-mode stack detection (`.claude/` → claude; `.agents/`/`AGENTS.md` → antigravity; `.kiro/` → kiro; `.specify/` confirms Spec Kit); conflict handling via interview.
- [ ] Acceptance matrix: init/migrate on **3 stacks × {none, material-3}** — gate green and `npm run status`/`qa` working in all six cells.

### 3. Watch item under `## Open Questions & Blockers`

- Antigravity 2.0 SDK: re-evaluate whether the `antigravity` stack could carry its own durable SSD state when artifact persistence is documented (currently paired with Spec Kit per TDD §9.3).

### 4. Log the round

Add r3 to `## Refinement Cycles` with links to [r3-review.md](r3-review.md) and [_notes/r3-tool-research.md](../_notes/r3-tool-research.md).

## Cascade

- Changelog entry in the backlog.
