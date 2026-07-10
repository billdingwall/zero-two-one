# r3 Update Plan: 03-TDD.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r3
**Findings addressed:** 1, 2, 3, 4 (TDD §4 title), 5
**Target doc:** [../03-TDD.md](../03-TDD.md)
**Research basis:** [_notes/r3-tool-research.md](../_notes/r3-tool-research.md)

## Intent

Lock the adapter architecture: one tool-neutral source layer, per-tool renderers, and explicit contracts for the three pluggable roles. Everything keys off the `.zero-two-one.json` `tools` block from r2 (§7) — extended, not changed.

## Proposed Edits

### 1. Retitle and generalize §4 → "Assistant Integration (default: Claude Code)"

Current §4 ("Claude Code Integration") becomes the Claude adapter's binding inside a role-based section — fixing the layer-2 invariant violation. Content preserved as the default binding.

### 2. New §9 — Adapter Architecture & Contracts

**9.1 Source layer (tool-neutral):** `templates/ASSISTANT-Template.md` (renamed/generalized from `CLAUDE-Template.md`; `AGENTS.md` becomes the neutral default output name), `skills/*.md` prompts, key docs, and `skills/tools.json` schemas.

**9.2 Assistant adapter contract.** An adapter declares: instruction rendering (file name(s) + format), skill packaging, command surface, and tool registration. Bindings:

| Adapter | Instructions | Skills | Commands/hooks |
|---|---|---|---|
| `claude-code` (default) | `CLAUDE.md` | `skills/*.md` as-is | `.claude/commands/` |
| `antigravity` | `AGENTS.md` (project root; `GEMINI.md` honored) | `.agents/skills/<name>/SKILL.md` (+ `scripts/`, `references/`, `assets/`) | MCP via `~/.gemini/config/mcp_config.json`; artifact-review gate noted |
| `kiro` | `.kiro/steering/{product,tech,structure}.md` with YAML frontmatter inclusion modes (`always` for product/tech; `fileMatch` where scoped) | `skill://` resources | `.kiro/agents/zero-two-one.json` CLI agent: `prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks` |

Steering mapping: `PRODUCT.md` → `product.md`; `CODE.md` + TDD constraints → `tech.md`; `workflows.md` structure summary → `structure.md` (idiomatic three-file split — confirm vs single-file at approval).

**9.3 SSD engine contract.** Every engine must expose: (a) **durable committed spec state** readable by the gate, (b) a context source for `spec:context`, (c) a verify surface for `spec:verify`. Bindings:
- `github-speckit` (default): `specs/NNN-*/spec.md` `status:` frontmatter — native.
- `kiro-specs`: `.kiro/specs/<feature>/{requirements,design,tasks}.md`; adapter injects `status:` frontmatter into `requirements.md` (Kiro tolerates extra frontmatter); task progress derived from `tasks.md` checkboxes; `scripts/speckit/*` gain an engine-dispatch layer (read engine from manifest, resolve paths/state accordingly).
- `antigravity`: **not an SSD engine** — session artifacts (task lists, implementation plans, walkthroughs) are not durable spec state. Assistant-only; pair with a file-based engine. Re-evaluate against the 2.0 SDK.

**9.4 Design-system adapter contract.** `DESIGN.md` gains a structured **token mapping** section: project decisions expressed as system-token role assignments; exported artifacts in `requirements/_design/tokens/` (checked in), prototype consumes the CSS variables so a system swap re-themes without touching key docs. Bindings:
- `none` (default): bespoke `DESIGN.md` tokens, current behavior.
- `material-3`: roles map to `md.sys.*` tokens (color/typography/shape/elevation/motion tiers `md.ref`/`md.sys`/`md.comp`); Material Theme Builder exports (JSON/CSS variables/DSP) stored and referenced; M3 Expressive component/motion notes surfaced in the selection workflow.

### 3. Amend §7 — manifest `tools` block

`tools: { "assistant": "claude-code | antigravity | kiro", "ssd": "github-speckit | kiro-specs", "design": "none | material-3 | <system>" }` — additive `design` key, no schema break. Migrate-mode detection (§8) extended: existing `.kiro/`, `.agents/`, `AGENTS.md`, `.claude/` surfaces propose the matching adapter.

### 4. Amend §6 ownership table

Framework-owned paths become adapter-resolved (e.g. `.claude/commands/` for `claude-code`, `.kiro/steering/` + `.kiro/agents/` for `kiro`, `.agents/skills/` for `antigravity`). Ownership semantics unchanged.

## Constraints

Zero runtime dependencies holds — renderers are template transforms in `bin/init.js` (built-in `fs`/`path`; YAML frontmatter emitted as plain text).

## Cascade

- Workflow de-binding and the two new workflow docs — [r3-update-workflows.md](r3-update-workflows.md).
- Implementation tasks — [r3-update-backlog.md](r3-update-backlog.md).
- Changelog entry in the TDD.
