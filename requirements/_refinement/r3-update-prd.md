# r3 Update Plan: 01-PRD.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 4, 7, 8 (product surface)
**Target doc:** [../01-PRD.md](../01-PRD.md)

## Intent

Make the pluggable tool stack a product capability: the framework's value is the lifecycle + refinement gate, not any single tool. Users choose one of **three supported stacks** plus an independent design system; the framework renders itself for that combination.

## Proposed Edits

### 1. New Core Feature 7 — Supported Tool Stacks

The framework runs on one of three named stacks (recorded as `stack` in `.zero-two-one.json`, with derived `assistant`/`ssd` fields), plus an independent design-system role:

| Stack | AI Assistant | SSD Engine |
|---|---|---|
| `claude` (default) | Claude Code (`CLAUDE.md` + `/021-*` commands) | GitHub Spec Kit |
| `antigravity` | Google Antigravity (`AGENTS.md` + `021-*` skills) | GitHub Spec Kit |
| `kiro` | Kiro IDE/CLI (`021-*` steering + `021` CLI agent) | Kiro specs (`.kiro/specs/`) |

- The refinement gate works identically across stacks via the SSD state contract (TDD §9.3).
- **Design system** (independent of stack): default bespoke `DESIGN.md`; first pluggable option Google Material 3 (token-mapped theming with Theme Builder exports).
- **`021-` command namespace** (finding 8): every framework command — npm scripts (`021-status`, `021-qa`, `021-spec:*`) and assistant-side commands/skills/steering — is namespaced to avoid conflicts with user projects and tool built-ins (e.g. Claude Code's own `/init`).

### 2. Amend Core Feature 1 (init modes)

The init interview gains **one stack question** (`--stack claude|antigravity|kiro` for non-interactive) plus the design question (`--design none|material-3`); migrate mode detects existing tool surfaces (`.kiro/`, `.agents/`, `AGENTS.md`, `.claude/`, `.specify/`) and proposes the matching stack.

### 3. Amend Core Feature 4 (Agent Integration)

Generalize from Claude-specific wording to: "assistant instructions, commands/skills, and tool schemas rendered for the selected stack by its adapter" — with the `claude` stack named as the default rendering.

### 4. Target Audience

Extend the AI Agents bullet beyond "e.g. Claude Code" to name the three supported stacks.

### 5. Success Metrics

Add: **Stack coverage** — number of projects running on a non-default stack (or Material 3) without framework forks.

## Cascade

- TDD carries the contracts ([r3-update-tdd.md](r3-update-tdd.md)); EDD gains the design-system-selection experience notes when that workflow ships (flagged, not edited this round).
- Changelog entry in the PRD.
