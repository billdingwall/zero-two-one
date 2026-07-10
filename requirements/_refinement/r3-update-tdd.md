# r3 Update Plan: 03-TDD.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 4, 5 (TDD §4 title), 7
**Target doc:** [../03-TDD.md](../03-TDD.md)
**Research basis:** [_notes/r3-tool-research.md](../_notes/r3-tool-research.md)

## Intent

Lock the adapter architecture around the **three-stack model**: one tool-neutral source layer, per-stack renderers, and explicit contracts for the stack (assistant + SSD, chosen together) and the design system (chosen independently). Everything keys off the `.zero-two-one.json` `tools` block from r2 (§7) — extended additively.

## Proposed Edits

### 1. Retitle and generalize §4 → "Assistant Integration (default stack: `claude`)"

Current §4 ("Claude Code Integration") becomes the `claude` stack's binding inside a role-based section — fixing the layer-2 invariant violation. Content preserved as the default binding.

### 2. New §9 — Adapter Architecture & Contracts

**9.1 Source layer (tool-neutral):** `templates/ASSISTANT-Template.md` (generalized from `CLAUDE-Template.md`; `AGENTS.md` is the neutral default output name), `skills/*.md` prompts, key docs, and `skills/tools.json` schemas.

**9.2 Supported stacks.** A stack binds the assistant and SSD roles together; free pairing is out of scope (stakeholder direction, r3 finding 3):

| Stack | Instructions | Skills/commands | SSD engine |
|---|---|---|---|
| `claude` (default) | `CLAUDE.md` | `skills/*.md` as-is; `.claude/commands/` | `github-speckit` |
| `antigravity` | `AGENTS.md` (project root; `GEMINI.md` honored) | `.agents/skills/<name>/SKILL.md` (+ `scripts/`, `references/`, `assets/`); MCP via `~/.gemini/config/mcp_config.json`; artifact-review gate noted | `github-speckit` |
| `kiro` | `.kiro/steering/{product,tech,structure}.md` with YAML frontmatter inclusion modes (`always` for product/tech; `fileMatch` where scoped) | `skill://` resources; `.kiro/agents/zero-two-one.json` CLI agent (`prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks`) | `kiro-specs` |

Steering mapping for `kiro`: `PRODUCT.md` → `product.md`; `CODE.md` + TDD constraints → `tech.md`; `workflows.md` structure summary → `structure.md` (idiomatic three-file split — confirm vs single-file at approval).

**9.3 SSD engine contract.** Every engine must expose: (a) **durable committed spec state** readable by the gate, (b) a context source for `spec:context`, (c) a verify surface for `spec:verify`. Two bindings:
- `github-speckit`: `specs/NNN-*/spec.md` `status:` frontmatter — native. Serves the `claude` **and** `antigravity` stacks (Antigravity's task lists / implementation plans / walkthroughs are session artifacts, not durable spec state — Spec Kit holds the gate-readable state while Antigravity drives).
- `kiro-specs`: `.kiro/specs/<feature>/{requirements,design,tasks}.md`; adapter injects `status:` frontmatter into `requirements.md` (Kiro tolerates extra frontmatter); task progress derived from `tasks.md` checkboxes; `scripts/speckit/*` gain an engine-dispatch layer (read engine from manifest, resolve paths/state accordingly). Serves the `kiro` stack.

**9.4 Design-system adapter contract** (independent of stack). `DESIGN.md` gains a structured **token mapping** section: project decisions expressed as system-token role assignments; exported artifacts in `requirements/_design/tokens/` (checked in); prototype consumes the CSS variables so a system swap re-themes without touching key docs. Bindings:
- `none` (default): bespoke `DESIGN.md` tokens, current behavior.
- `material-3`: roles map to `md.sys.*` tokens (tiers `md.ref`/`md.sys`/`md.comp`; color/typography/shape/elevation/motion); Material Theme Builder exports (JSON/CSS variables/DSP) stored and referenced; M3 Expressive component/motion notes surfaced in the selection workflow.

### 3. Amend §7 — manifest `tools` block

```json
"tools": {
  "stack": "claude | antigravity | kiro",
  "assistant": "claude-code | antigravity | kiro",
  "ssd": "github-speckit | kiro-specs",
  "design": "none | material-3 | <system>"
}
```

`assistant`/`ssd` are **derived from `stack`** (kept for r2 compatibility and per-role tooling); `design` is chosen independently. Additive — no schema break.

### 4. Amend §8 — migrate-mode detection

Existing tool surfaces propose the matching stack: `.claude/` → `claude`; `.agents/` or `AGENTS.md` → `antigravity`; `.kiro/` → `kiro`; `.specify/`/populated `specs/` confirms `github-speckit`. Conflicting surfaces (e.g. both `.claude/` and `.kiro/`) → interview decides, detection lists what was found.

### 5. Amend §6 ownership table

Framework-owned paths become stack-resolved (`.claude/commands/` for `claude`; `.agents/skills/` for `antigravity`; `.kiro/steering/` + `.kiro/agents/` for `kiro`). Ownership semantics unchanged.

## Constraints

Zero runtime dependencies holds — renderers are template transforms in `bin/init.js` (built-in `fs`/`path`; YAML frontmatter emitted as plain text).

## Cascade

- Workflow de-binding, proposal reconciliation, and the new workflow doc — [r3-update-workflows.md](r3-update-workflows.md).
- Implementation tasks — [r3-update-backlog.md](r3-update-backlog.md).
- Changelog entry in the TDD.
