# Proposal: Framework Layering & Tool-Agnostic Architecture

**Status:** Proposal — internal, not a living doc
**Origin:** r1 refinement round, finding 3 (`requirements/_refinement/r1-review.md`)
**Date:** 2026-07-10

## Problem

Zero Two One currently assumes a specific tool stack: Claude Code as the AI assistant, GitHub Spec Kit as the spec-driven delivery engine, and no opinion about design systems. Finding 3 identifies three v2 features (design-system selection, pluggable SSD tool, pluggable AI assistant) that all fail against today's structure because the framework's *layers* are implicit. This proposal makes them explicit so tools become swappable adapters rather than assumptions baked into docs.

## The Four Layers

| Layer | Contents | Owner | Tool-specific? |
|---|---|---|---|
| **1. Principles** | `CLAUDE.md` (assistant instructions), `CODE.md`, `PRODUCT.md`, `DESIGN.md` | Human + assistant | Partially — only the assistant-instructions doc |
| **2. Key Docs (what & why)** | `requirements/01-PRD.md` … `05-BACKLOG.md`, `_notes/`, `_design/`, `_refinement/` | Human via refinement loop | No |
| **3. Process (how)** | `workflow/` (lifecycle, RLP, SSD, transitions), `templates/` | Framework | No — but names tool adapters |
| **4. Execution (do)** | `specs/`, `scripts/`, `skills/`, `hooks/`, `.ai/context/` | Tools | Yes — this is the adapter layer |

The invariant: **layers 2 and 3 never reference a concrete tool by name**; they reference *roles* ("the AI assistant", "the SSD engine", "the design system"). Layer 4 binds roles to tools; layer 1 contains exactly one tool-bound file (the assistant instructions doc).

## Tool Adapters

### AI assistant (default: Claude Code)

- The assistant-instructions doc becomes a role: `templates/CLAUDE-Template.md` generalizes to an `ASSISTANT-Template.md` rendered as `CLAUDE.md`, `KIRO.md`, `AGENTS.md`, etc., at init time, with tool-specific wiring (e.g. Kiro project settings pointing at `KIRO.md`) handled by the adapter.
- Slash commands / hooks (`.claude/commands/`, `skills/tools.json`) get per-adapter equivalents; the adapter declares what it can automate and the workflow docs degrade gracefully to manual steps for anything it can't.

### SSD engine (default: GitHub Spec Kit)

- `workflow/specific-workflows/spec-driven-delivery.md` already defines the process; the Speckit-specific mechanics (spec frontmatter statuses, `scripts/speckit/`, the pre-commit gate) become the reference adapter.
- An adapter contract: any SSD tool must expose (a) spec lifecycle status readable by the gate, (b) a context-bundle equivalent for agents, (c) a verify/compliance check. Kiro's spec management would map onto these three.

### Design system (default: none / bespoke `DESIGN.md`)

- A **design-system selection workflow** (v2 feature 1): user names a system (e.g. Material, Tailwind-based, in-house); the workflow walks decisions, gaps, and implications, then rewrites `DESIGN.md` tokens to reference the system and annotates the EDD and TDD with its constraints (component availability, theming, accessibility defaults).
- The prototype scaffold consumes `DESIGN.md` only — so a system swap re-themes the prototype without touching layer 2 content.

## Configuration Flow (init-time interview)

`bin/init.js` (or the `/init` slash command) grows a short interview *before* scaffolding:

1. Which AI assistant? → picks the assistant adapter, names the instructions doc.
2. Which SSD engine? → installs the matching gate/scripts.
3. Design system? → seeds `DESIGN.md` accordingly or defers to Phase 2.
4. **Existing repo?** → see below.

Answers are recorded in a small `zero-two-one.config.json` (layer 4) so `workflow-status.js` and future tooling can resolve roles → tools without parsing docs.

## Init Into Existing Repositories

- Detect existing artifacts (a `README`, docs folders, an existing assistant-instructions file) and **merge, don't overwrite**: existing content is imported into `_notes/` and referenced from the drafted key docs rather than clobbered.
- The configuration flow asks which lifecycle phase the project is realistically in (an existing shipped product may enter directly at Growth), and scaffolds the roadmap/backlog in the corresponding shape (see the MVP→Growth transition workflow from r1).
- Non-destructive dry-run mode (`--dry-run`) listing what would be created/merged.

## What This Round Does vs. Defers

- **This round (r1):** record the layering here; keep living docs tool-bound as-is; add the v2 features to the backlog.
- **Deferred (v2):** the adapter contracts, `ASSISTANT-Template.md` generalization, config file, interview flow, and existing-repo merge logic — each should become its own spec via SSD when pulled from the backlog.

## Audit Note

Per the r1 open questions: a fresh audit of framework/project workflows against this layering (which docs violate the "no tool names in layers 2–3" invariant) is worth running before any v2 adapter work starts. The prior audits in this folder predate the layering model.
