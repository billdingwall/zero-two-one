# Refinement Round: r3

## Review Meta Data
- **Date:** 2026-07-10
- **Status:** Draft — synthesis plans awaiting approval
- **Round:** 3
- **Reviewer:** William Dingwall (billdingwall) with Claude Code
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)
- **Research:** [_notes/r3-tool-research.md](../_notes/r3-tool-research.md) (Google Antigravity, Kiro IDE/CLI, Material Design 3)

## Scope

Pre-scoped by r2's open questions, expanded per user direction: make init/migration **tool-pluggable** and add a **pluggable design system** to the same adapter architecture, all plugging into the `.zero-two-one.json` `tools` block landed in r2 (TDD §7).

**Stakeholder direction (this round):** the framework supports **three named stacks**, not free assistant × SSD pairing:

| Stack | AI Assistant | SSD Engine |
|---|---|---|
| `claude` (default) | Claude Code | GitHub Spec Kit |
| `antigravity` | Google Antigravity | GitHub Spec Kit |
| `kiro` | Kiro (IDE + CLI) | Kiro specs |

The design system is an **independent role** (any stack × `none` / `material-3`). This round designs the adapter contracts; implementation timing is an open question below.

**Stakeholder direction (this round, addition):** all framework commands — terminal (npm scripts) and coding-assistant namespace (slash commands, skills, agents, steering files) — follow a **zero-two-one naming convention** built on the `021-` namespace, to avoid conflicts with user projects and tool built-ins. This is a framework-wide convention (a core principle, recorded in `CODE.md`), not a one-off rename: anything the framework installs into a shared namespace carries it, including future commands.

## Findings

### 1. The assistant-instructions doc is a universal primitive, but ours is hard-bound
Every candidate tool has a standing-instructions mechanism: Claude Code reads `CLAUDE.md`; Antigravity reads `AGENTS.md` (v1.20.3+, alongside `GEMINI.md`) at the project root; Kiro uses multi-file steering (`.kiro/steering/` with `product.md`, `tech.md`, `structure.md` defaults and frontmatter inclusion modes). Our template exists only as `CLAUDE-Template.md`, so no other assistant can be targeted. Notably, Kiro's default steering split maps almost 1:1 onto our guiding docs (PRODUCT.md → product.md, CODE.md/TDD → tech.md, structure → structure.md) — the framework's shape already fits; only the rendering is missing.

### 2. SSD engines differ in *state model*, and the gate only speaks Spec Kit
The refinement gate reads `status:` frontmatter (Spec Kit's model). Kiro specs (`.kiro/specs/<feature>/requirements.md` + `design.md` + `tasks.md`, EARS notation) carry **no status frontmatter** — progress is checkbox state in `tasks.md`. Antigravity has **no durable spec files at all** (task lists / implementation plans / walkthroughs are session artifacts with their own review gate) — which is exactly why the Antigravity stack pairs with GitHub Spec Kit for SSD. The r2 gate contract needs a per-engine state-mapping layer with two bindings: `github-speckit` (native) and `kiro-specs` (mapped).

### 3. Stacks, not free pairing (stakeholder direction)
Supporting arbitrary assistant × SSD combinations would multiply the acceptance surface for no user benefit. The three stacks above are the supported product surface: selecting the stack sets both roles; only the design system is chosen independently. This collapses the acceptance matrix from 3×2×2 to **3 stacks × 2 design options**, and makes the Antigravity + Spec Kit pairing (assistant drives, Spec Kit holds durable spec state for the gate) a first-class configuration rather than a fallback.

### 4. No design-system adapter surface exists
`DESIGN.md` is freeform. Material 3 offers a precise integration target: three token tiers (`md.ref` / `md.sys` / `md.comp`), theming by remapping `md.sys.*` roles, and Material Theme Builder exports (CSS variables, JSON, DSP) consumable by the prototype directly. Nothing in the framework can capture "this project uses M3" beyond prose, and the r1-envisioned design-system-selection workflow (backlog v2 item 1) has no defined artifact contract.

### 5. Layer 2–3 docs violate the tool-agnosticism invariant (audit)
Per the pre-r3 prerequisite audit: `workflow/workflows.md` §4 states the framework "heavily relies on Claude Code and GitHub SpecKit"; `spec-driven-delivery.md` is defined as "Deliver backlog features through GitHub Spec Kit"; `workflows.md` §2 hard-codes `CLAUDE.md` and `scripts/speckit/`; TDD §4 is titled "Claude Code Integration"; `key-docs-to-ssd.md` references "SpecKit branches". Under the layering invariant (layers 2–3 name *roles*, layer 4 binds tools), these are violations — fixable with role-based language plus a single normative binding point (the manifest `tools` block).

### 6. The architecture proposal has drifted from decided reality (proposal review)
[.021-updates/framework-architecture-proposal.md](../../.021-updates/framework-architecture-proposal.md) reviewed against r2/r3 state. Its layering model, invariant, SSD contract (status/context/verify), design-system adapter, and existing-repo merge sections are sound and now adopted. Four points are stale:
1. It assumes a single-file `KIRO.md` — Kiro actually uses `.kiro/steering/` multi-file steering (research finding 1).
2. It names the config file `zero-two-one.config.json` — r2 shipped **`.zero-two-one.json`** at the repo root.
3. Its interview asks "which assistant?" and "which SSD engine?" independently — superseded by the stack model (finding 3).
4. It omits Google Antigravity entirely.

### 7. The manifest `tools` block lacks stack + design expression
r2 shipped `tools: { assistant, ssd }`. Needed: a `stack` concept (assistant implies SSD) and a `design` key. Additive change — keep `assistant`/`ssd` fields (derived from the stack) so r2 consumers don't break.

### 8. Framework command names are conflict-prone (stakeholder direction)
Concrete collisions exist today: the framework's `/init` slash command shadows **Claude Code's built-in `/init`** command; the npm scripts `status` and `qa` are common names in user `package.json` files — and under r2's merge rule (add only if name not taken), a collision means the framework script **silently never gets wired**; Kiro's default steering filenames (`product.md`, `tech.md`, `structure.md`) would clobber a Kiro user's existing steering on migrate. Every stack's command surface needs a collision-proof namespace.

## Proposed Changes

1.1 Introduce an **adapter architecture** (TDD §9): a tool-neutral source layer (`templates/ASSISTANT-Template.md` as the canonical instruction source; existing `skills/*.md`; key docs) plus per-stack **renderers** — `claude` (→ `CLAUDE.md` + `.claude/commands/`), `antigravity` (→ `AGENTS.md` + `.agents/skills/*/SKILL.md` packages + MCP registration), `kiro` (→ `.kiro/steering/{product,tech,structure}.md` with frontmatter + `.kiro/agents/zero-two-one.json` CLI agent).

1.2 Adopt `AGENTS.md` as the **neutral default** instruction filename (emerging cross-tool convention); `CLAUDE.md` and steering files become stack-specific renderings of the same source.

2.1 Define the **SSD engine contract** (TDD): durable committed spec state readable by the gate + context source for `spec:context` + verify surface for `spec:verify`. Two bindings: `github-speckit` (native `status:` frontmatter; serves the `claude` and `antigravity` stacks) and `kiro-specs` (inject `status:` frontmatter into `.kiro/specs/<feature>/requirements.md`; task progress from `tasks.md` checkboxes; serves the `kiro` stack).

3.1 Encode the **three-stack model** (finding 3) in the PRD, TDD, and init: the interview asks for the *stack* (one question), the manifest records `stack` plus derived `assistant`/`ssd`, and migrate mode detects existing tool surfaces (`.kiro/`, `.agents/`, `AGENTS.md`, `.claude/`, `.specify/`) to propose the matching stack.

4.1 Define the **design-system adapter contract** (TDD + DESIGN template): `DESIGN.md` gains a structured token-mapping section; exported token artifacts (e.g. Material Theme Builder JSON/CSS vars) live in `requirements/_design/tokens/`; prototype consumes the CSS variables. Bindings: `none` (default) and `material-3`. Independent of stack choice.

4.2 Add the **design-system-selection workflow** (`workflow/specific-workflows/design-system-selection.md`, per backlog v2 item 1): walk decisions, gaps, and implications (component availability, dynamic color, accessibility defaults, export targets for M3), then update `DESIGN.md`, EDD annotations, and the prototype theme.

5.1 **De-bind layers 2–3** (finding 5): sweep `workflows.md`, `spec-driven-delivery.md`, `key-docs-to-ssd.md`, `init-and-migration.md`, and TDD section titles to role/stack-based language with defaults noted once; concrete bindings live only in `.zero-two-one.json` and TDD §9.

6.1 **Reconcile the architecture proposal** (finding 6): correct the Kiro steering model and manifest filename, replace the independent assistant/SSD interview with the stack question, add Antigravity, note the `021-` command namespace, and mark the adopted sections as canonical-in-TDD-§9 so the internal doc stops drifting.

8.1 **Adopt the zero-two-one naming convention** (finding 8) as a core principle, recorded in `CODE.md` and enforced through TDD §6 ownership:

*The convention:* every framework-owned name installed into a namespace shared with the user or a tool follows `021-<name>` — lowercase kebab-case after the prefix, `:` reserved for subcommand grouping in npm scripts (`021-spec:status`), the bare `021` allowed only where a tool requires a single identifier (the Kiro CLI agent). Names the framework fully owns in their own right (the `zero-two-one-init` bin, the `.zero-two-one.json` manifest, this repo's `.021-updates/`) already satisfy the convention and are unchanged. **All future framework commands, skills, and installed artifacts must follow it.**

*Applied to the current surface, across all stacks:*
- npm scripts: `status`/`qa`/`spec:status`/`spec:context`/`spec:verify` → `021-status`, `021-qa`, `021-spec:status`, `021-spec:context`, `021-spec:verify`.
- `claude` stack: `.claude/commands/021-init.md`, `021-status.md` → `/021-init`, `/021-status` (also resolves the built-in `/init` shadowing).
- `antigravity` stack: skill packages named `.agents/skills/021-<name>/`.
- `kiro` stack: steering rendered as `.kiro/steering/021-{product,tech,structure}.md`; CLI agent `.kiro/agents/021.json` (invoked as `021`).
- The rename is mechanical and cheap — apply it to the dogfooding repo and package at r3 apply time (scripts/commands are gate-exempt tooling surface), so docs and reality don't drift; init-time collision handling remains as the r2 merge rule, now with collision-improbable names.

## Open Questions Raised

- **Implementation timing:** r2 kept multi-tool out of MVP. Does adapter implementation stay v2/Growth (recommended — MVP ships the `claude` stack; r3 locks the design so Init v2 code is built adapter-shaped from the start), or does any slice (e.g. the neutral `AGENTS.md` rendering, which is nearly free) join MVP scope? → decide at plan approval.
- **Kiro steering vs single-file:** render our instructions as Kiro's three-file steering split (idiomatic; plans assume this) or a single steering file (simpler)? → confirm at approval.
- Antigravity 2.0 SDK artifact persistence — re-evaluate whether an `antigravity` stack variant could carry its own SSD state when documented. → backlog watch item.

## Outcome

<!-- Filled in once the round's changes are applied: which docs were edited, version bumps, date closed -->

Pending. Synthesis plans: [r3-update-prd.md](r3-update-prd.md) · [r3-update-tdd.md](r3-update-tdd.md) · [r3-update-roadmap.md](r3-update-roadmap.md) · [r3-update-backlog.md](r3-update-backlog.md) · [r3-update-workflows.md](r3-update-workflows.md)
