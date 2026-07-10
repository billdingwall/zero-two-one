# Refinement Round: r3

## Review Meta Data
- **Date:** 2026-07-10
- **Status:** Draft — synthesis plans awaiting approval
- **Round:** 3
- **Reviewer:** William Dingwall (billdingwall) with Claude Code
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)
- **Research:** [_notes/r3-tool-research.md](../_notes/r3-tool-research.md) (Google Antigravity, Kiro IDE/CLI, Material Design 3)

## Scope

Pre-scoped by r2's open questions, expanded per user direction: make init/migration **tool-pluggable** — alternative AI assistants and SSD engines (first candidates: **Kiro** IDE/CLI and **Google Antigravity**) — and add a **pluggable design system** (first candidate: **Google Material Design 3**) to the same adapter architecture. All three plug into the `.zero-two-one.json` `tools` block landed in r2 (TDD §7). This round designs the adapter contracts; implementation timing is an open question below.

## Findings

### 1. The assistant-instructions doc is a universal primitive, but ours is hard-bound
Every candidate tool has a standing-instructions mechanism: Claude Code reads `CLAUDE.md`; Antigravity reads `AGENTS.md` (v1.20.3+, alongside `GEMINI.md`) at the project root; Kiro uses multi-file steering (`.kiro/steering/` with `product.md`, `tech.md`, `structure.md` defaults and frontmatter inclusion modes). Our template exists only as `CLAUDE-Template.md`, so no other assistant can be targeted. Notably, Kiro's default steering split maps almost 1:1 onto our guiding docs (PRODUCT.md → product.md, CODE.md/TDD → tech.md, structure → structure.md) — the framework's shape already fits; only the rendering is missing.

### 2. SSD engines differ in *state model*, and the gate only speaks Spec Kit
The refinement gate reads `status:` frontmatter (Spec Kit's model). Kiro specs (`.kiro/specs/<feature>/requirements.md` + `design.md` + `tasks.md`, EARS notation) carry **no status frontmatter** — progress is checkbox state in `tasks.md`. Antigravity has **no durable spec files at all** (task lists / implementation plans / walkthroughs are session artifacts with their own review gate). The r2 gate contract needs a per-engine state-mapping layer, and Antigravity cannot be an SSD engine today — it should be assistant-only, paired with a file-based SSD engine.

### 3. No design-system adapter surface exists
`DESIGN.md` is freeform. Material 3 offers a precise integration target: three token tiers (`md.ref` / `md.sys` / `md.comp`), theming by remapping `md.sys.*` roles, and Material Theme Builder exports (CSS variables, JSON, DSP) consumable by the prototype directly. Nothing in the framework can capture "this project uses M3" beyond prose, and the r1-envisioned design-system-selection workflow (backlog v2 item 1) has no defined artifact contract.

### 4. Layer 2–3 docs violate the tool-agnosticism invariant (audit)
Per the pre-r3 prerequisite audit: `workflow/workflows.md` §4 states the framework "heavily relies on Claude Code and GitHub SpecKit"; `spec-driven-delivery.md` is defined as "Deliver backlog features through GitHub Spec Kit"; `workflows.md` §2 hard-codes `CLAUDE.md` and `scripts/speckit/`; TDD §4 is titled "Claude Code Integration"; `key-docs-to-ssd.md` references "SpecKit branches". Under the architecture proposal's invariant (layers 2–3 name *roles*, layer 4 binds tools), these are violations. They're fixable with role-based language plus a single tool-binding reference (the manifest `tools` block).

### 5. The manifest `tools` block lacks a design key
r2 shipped `tools: { assistant, ssd }`. A design system is a third pluggable role; the block needs a `design` key (additive, no schema break).

## Proposed Changes

1.1 Introduce an **adapter architecture** (TDD): a tool-neutral source layer (`templates/ASSISTANT-Template.md` as the canonical instruction source; existing `skills/*.md`; key docs) plus per-tool **renderers** — `claude-code` (→ `CLAUDE.md` + `.claude/commands/`), `antigravity` (→ `AGENTS.md` + `.agents/skills/*/SKILL.md` packages + MCP registration), `kiro` (→ `.kiro/steering/{product,tech,structure}.md` with frontmatter + `.kiro/agents/zero-two-one.json` CLI agent whose `prompt`/`resources` load the guiding docs).

1.2 Adopt `AGENTS.md` as the **neutral default** instruction filename (emerging cross-tool convention); `CLAUDE.md` and steering files become tool-specific renderings of the same source.

2.1 Define the **SSD engine contract** (TDD): every engine must expose (a) durable, committed spec state the gate can read, (b) a context-bundle source for `spec:context`, (c) a verify surface for `spec:verify`. Bindings: `github-speckit` (native, `status:` frontmatter); `kiro-specs` (inject `status:` frontmatter into `.kiro/specs/<feature>/requirements.md` — Kiro tolerates extra frontmatter — with task progress read from `tasks.md` checkboxes); `antigravity` — **not an SSD engine** (assistant-only) until its SDK exposes durable artifact state.

3.1 Define the **design-system adapter contract** (TDD + DESIGN template): `DESIGN.md` gains a structured token-mapping section (project decisions expressed as system-token role assignments); exported token artifacts (e.g. Material Theme Builder JSON/CSS vars) live in `requirements/_design/tokens/` and are referenced, prototype consumes the CSS variables. Binding: `material-3` first; `none`/bespoke remains the default.

3.2 Add the **design-system-selection workflow** (`workflow/specific-workflows/design-system-selection.md`, per backlog v2 item 1): walk decisions, gaps, and implications (component availability, dynamic color, accessibility defaults, export targets for M3), then update `DESIGN.md`, EDD annotations, and the prototype theme.

4.1 **De-bind layers 2–3**: sweep `workflows.md`, `spec-driven-delivery.md`, `key-docs-to-ssd.md`, `product-lifecycle.md`, and TDD section titles to role-based language ("the AI assistant", "the SSD engine", "the design system") with defaults noted once; concrete bindings live only in `.zero-two-one.json` and the adapter sections.

5.1 Extend the manifest: `tools: { assistant, ssd, design }`; init's interview (r2 §8) gains tool-selection questions with `--assistant`, `--ssd`, `--design` flags for non-interactive runs. Migrate mode detects existing tool surfaces (`.kiro/`, `.agents/`, `AGENTS.md`, `.claude/`) and proposes the matching adapters.

## Open Questions Raised

- **Implementation timing:** r2 kept multi-tool out of MVP. Does the adapter implementation stay v2/Growth (recommended — MVP ships the default stack; r3 locks the design so Init v2 code is built adapter-shaped from the start), or does any slice (e.g. the neutral `AGENTS.md` rendering, which is nearly free) join MVP scope? → decide at plan approval.
- **Kiro steering vs single-file:** render our instructions as Kiro's three-file steering split (idiomatic) or a single `zero-two-one.md` steering file (simpler)? Plans assume the idiomatic split; confirm at approval.
- Antigravity 2.0 SDK artifact persistence — re-evaluate SSD eligibility when documented. → backlog watch item.

## Outcome

<!-- Filled in once the round's changes are applied: which docs were edited, version bumps, date closed -->

Pending. Synthesis plans: [r3-update-prd.md](r3-update-prd.md) · [r3-update-tdd.md](r3-update-tdd.md) · [r3-update-roadmap.md](r3-update-roadmap.md) · [r3-update-backlog.md](r3-update-backlog.md) · [r3-update-workflows.md](r3-update-workflows.md)
