# r3 Update Plan: 03-TDD.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 4, 5 (TDD §4 title), 7, 8 (command namespace)
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

All command surfaces are **`021-` namespaced** (finding 8) to avoid collisions with user projects and tool built-ins:

| Stack | Instructions | Skills/commands (021-namespaced) | SSD engine |
|---|---|---|---|
| `claude` (default) | `CLAUDE.md` | `skills/*.md` as-is; `.claude/commands/021-init.md`, `021-status.md` → `/021-init`, `/021-status` | `github-speckit` |
| `antigravity` | `AGENTS.md` (project root; `GEMINI.md` honored) | `.agents/skills/021-<name>/SKILL.md` (+ `scripts/`, `references/`, `assets/`); MCP via `~/.gemini/config/mcp_config.json`; artifact-review gate noted | `github-speckit` |
| `kiro` | `.kiro/steering/021-{product,tech,structure}.md` with YAML frontmatter inclusion modes (`always` for product/tech; `fileMatch` where scoped) | `skill://` resources; `.kiro/agents/021.json` CLI agent, invoked as `021` (`prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks`) | `kiro-specs` |

Steering mapping for `kiro`: `PRODUCT.md` → `021-product.md`; `CODE.md` + TDD constraints → `021-tech.md`; `workflows.md` structure summary → `021-structure.md` (idiomatic three-file split with namespaced filenames so existing user steering is never clobbered — confirm vs single-file at approval).

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

Framework-owned paths become stack-resolved and 021-scoped (`.claude/commands/021-*` for `claude`; `.agents/skills/021-*` for `antigravity`; `.kiro/steering/021-*` + `.kiro/agents/021.json` for `kiro`) — the framework only ever owns files inside its namespace, so user files in the same directories are untouchable by definition. Ownership semantics unchanged.

### 6. Framework naming convention (finding 8) — applies at r3 apply time

All framework-owned names follow the **zero-two-one naming convention** (constitution rule in `CODE.md`, per [r3-update-workflows.md](r3-update-workflows.md) §1b): `021-<name>`, lowercase kebab-case after the prefix, `:` for npm subcommand grouping, bare `021` only where a tool requires a single identifier. Lifecycle npm scripts rename accordingly: `021-status`, `021-qa`, `021-spec:status`, `021-spec:context`, `021-spec:verify` (`zero-two-one-init` bin and `.zero-two-one.json` manifest already comply — unchanged). `bin/init.js` `lifecycleScripts`, the dogfooding repo's own `package.json` (root + package), `.claude/commands/` filenames, and all doc references update together. This also resolves the `/init` shadowing of Claude Code's built-in command, and makes r2's add-only-if-name-free merge rule collision-improbable in practice. TDD §6 ownership enforces it structurally: the framework only owns files inside its namespace in shared directories.

## Constraints

Zero runtime dependencies holds — renderers are template transforms in `bin/init.js` (built-in `fs`/`path`; YAML frontmatter emitted as plain text).

## Cascade

- Workflow de-binding, proposal reconciliation, and the new workflow doc — [r3-update-workflows.md](r3-update-workflows.md).
- Implementation tasks — [r3-update-backlog.md](r3-update-backlog.md).
- Changelog entry in the TDD.
