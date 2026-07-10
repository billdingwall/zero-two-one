# r3 Update Plan: 01-PRD.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 5 (product surface)
**Target doc:** [../01-PRD.md](../01-PRD.md)

## Intent

Make the pluggable tool stack a product capability: the framework's value is the lifecycle + refinement gate, not any single tool. Users choose their assistant, SSD engine, and design system at init (or migration), and the framework renders itself for that stack.

## Proposed Edits

### 1. New Core Feature 7 — Pluggable Tool Stack

The framework operates through three swappable adapter roles, recorded in `.zero-two-one.json` `tools`:
- **AI assistant** — default Claude Code (`CLAUDE.md` + `.claude/commands/`); alternatives Google Antigravity (`AGENTS.md` + `.agents/skills/`) and Kiro (steering files + CLI agent).
- **SSD engine** — default GitHub Spec Kit; alternative Kiro specs (`.kiro/specs/`). The refinement gate works identically across engines via the SSD state contract.
- **Design system** — default bespoke `DESIGN.md`; first pluggable option Google Material 3 (token-mapped theming with Theme Builder exports).

### 2. Amend Core Feature 1 (init modes)

The init interview gains tool selection (`--assistant`, `--ssd`, `--design` for non-interactive); migrate mode detects existing tool surfaces (`.kiro/`, `.agents/`, `AGENTS.md`, `.claude/`) and proposes matching adapters.

### 3. Amend Core Feature 4 (Agent Integration)

Generalize from Claude-specific wording to: "assistant instructions, commands/skills, and tool schemas rendered for the selected assistant by its adapter" — with Claude Code named as the default rendering.

### 4. Target Audience

Extend the AI Agents bullet beyond "e.g. Claude Code" to name the supported adapter families.

### 5. Success Metrics

Add: **Stack coverage** — number of projects running on a non-default adapter without framework forks.

## Cascade

- TDD carries the contracts ([r3-update-tdd.md](r3-update-tdd.md)); EDD gains the design-system-selection experience notes when that workflow ships (flagged, not edited this round).
- Changelog entry in the PRD.
