---
status: Done
feature: Optional Prototype Command (021-prototype)
release: mvp-5
branch: 012-prototype-command
created: 2026-07-18
---

# Feature Spec: Optional Prototype Command (`021-prototype`)

*The third command feature of [mvp-5 — Lifecycle Commands](../../requirements/_releases/mvp-5.md), after [spec 010](../010-feedback-command/spec.md) (`021-feedback`) and [spec 011](../011-design-command/spec.md) (`021-design`). `021-prototype` generates the **opt-in** static prototype from the key docs + `DESIGN.md` tokens, consuming the design-system CSS variables so a later `021-design` swap re-themes it. On first generation the otherwise-inert prototype steps (Design build, Refinement Loop step 5, `021-qa` prototype tier) activate — by presence detection, not new wiring. Grounded in TDD §12 (Optional Prototype Command) and the key-docs-to-prototype / prototype-sync workflows.*

## Why

The prototype is an **opt-in artifact, not a lifecycle prerequisite** (r5): a project has none until a team wants one, and nothing gates on it. But the pieces to make it real — the `prototype/` scaffold, the QA tier that validates `prototype/*.html`, the refinement-step-5 sync, and the design-system CSS variables from `021-design` — all already exist *waiting for a prototype to exist*. There is no command to bring one into being. `021-prototype` closes that: one assistant command that scaffolds a themed static prototype (HTML/CSS/JS) consuming the design-system variables, which the assistant then fleshes out from the PRD/EDD scenarios. Because the QA/refinement/design steps are **presence-detected** (`prototype/` holding more than its `_INDEX.md` scaffold; `prototype/*.html`), generating the prototype *activates* them automatically — the "wire-in" is emergent, not a code change.

## Users & Context

- **Primary user:** a team that decides — typically in Planning (Phase 0) — that they want a visual prototype as the stakeholder contract; opt-in, never required.
- **Trigger:** the user invokes the stack-rendered command (`/021-prototype` on `claude`; the `021-prototype` skill on `antigravity`; steering + the `021` agent on `kiro` — TDD §9.2). The assistant drives the generation (reading the key docs, building the screens); the mechanical layer scaffolds the themed starter.
- **Builds on:** the `prototype/` dir + its `_INDEX.md` scaffold; `DESIGN.md` tokens and the design-system CSS variables produced by [spec 011](../011-design-command/spec.md) (`requirements/_design/tokens/`); the presence-detection already in `scripts/run-qa.sh` (`prototype/*.html`) and `prototype-sync.md` (more than `_INDEX.md`); the spec 006 renderer + spec 009 CLI; the [spec 010](../010-feedback-command/spec.md) LLM-drives-plus-thin-script pattern.
- **Interacts with `021-design` (spec 011):** the prototype's CSS references the design-system CSS variables, so `021-design set <system>` re-themes an existing prototype without touching the prototype's markup. When `design: none`, the bespoke `DESIGN.md` frontmatter tokens are the source.

## Clarifications

### Session 2026-07-18

- **Q: Mechanical split & subcommand verb?**
  A: **Thin script + `021 prototype init`.** A `scripts/prototype.js` behind `021 prototype init` scaffolds the themed static starter; the assistant fleshes out the screens from the PRD/EDD. `init` reads as "bring a prototype into being" and matches the framework's scaffolding verbs. Mirrors spec 010/011.
- **Q: How does the starter CSS consume the design-system variables?**
  A: **Link the tokens file, fall back to inline `:root`.** `styles.css` `@import`s the `requirements/_design/tokens/` CSS-variables file when a system is set (`material-3` / BYO); under `design: none` it inlines `:root` vars from the `DESIGN.md` frontmatter. This is the cleanest re-theme seam — a later `021-design` swap updates the tokens file and the prototype re-themes without markup changes.
- **Q: Overwrite protection?**
  A: **Refuse without `--force`.** When `prototype/` already holds content (more than its `_INDEX.md`), the command reports and stops; `--force` is the only override. Matches the non-destructive install ethos (TDD §6).
- **Q: Scaffold scope?**
  A: **Bare themed skeleton.** `index.html` (semantic shell + the design-system CSS link), `styles.css` (theme wiring + a few base component styles), `app.js` (minimal). The assistant builds the actual screens from the EDD. Deterministic, small, testable — the script never parses the EDD (keeps it zero-dep).
- **Q: Wire-in — purely emergent?**
  A: **Yes, purely emergent.** The command writes **only** under `prototype/`; the QA/refinement/design steps activate by presence detection (`prototype/*.html`; `prototype/` > `_INDEX.md`) with no edits to those steps.

## User Scenarios (Acceptance)

1. **Generate a prototype** — *Given* a project with key docs and a `prototype/` holding only `_INDEX.md`, *when* the user runs `021-prototype`, *then* a themed static starter (`index.html` + `styles.css` + `app.js`) is scaffolded under `prototype/` consuming the design-system CSS variables, and the assistant fleshes it out from the PRD/EDD.
2. **Consumes design-system variables** — *Given* a design system recorded (`tools.design: material-3` / BYO), *when* the prototype is generated, *then* its CSS references the `requirements/_design/tokens/` CSS variables so it is themed by that system; *given* `design: none`, *then* it consumes the bespoke `DESIGN.md` frontmatter tokens.
3. **Re-themeable by `021-design`** — *Given* an existing prototype, *when* `021-design` swaps the system, *then* the prototype re-themes from the updated CSS variables without its markup changing.
4. **Activates the optional steps (emergent)** — *Given* the prototype now holds more than its `_INDEX.md` scaffold, *when* `021-qa` runs **in Planning (Phase 0)** and the Refinement Loop runs, *then* the prototype QA tier (`prototype/*.html`, Phase-0-only) and step-5 prototype-sync activate — by presence detection, with no new wiring *(analyze A1: the run-qa prototype tier is Phase-0-scoped; prototype-sync and the `021-design` re-theme are phase-independent)*.
5. **Non-destructive** — *Given* a `prototype/` that already holds content, *when* the command runs without `--force`, *then* it does not overwrite the user's prototype (it reports and stops); `--force` is the only override.
6. **Optional, never a gate** — *Given* no prototype, *when* any lifecycle command runs, *then* nothing fails or is blocked on a missing prototype (`workflow-status.js` does not gate Planning on one; the QA tier reports an INFO skip).
7. **Cross-stack render** — *Given* a non-`claude` stack, *when* the framework is installed, *then* the prototype command is reachable in that stack's surface with identical behavior, because all stacks call the same `021` CLI (TDD §9.2).

## Functional Requirements

- **FR-001 — Stack-rendered command surface.** `021-prototype` is produced on each stack by the spec 006 renderer from a single source (claude command / antigravity SKILL / kiro via the `021` agent). Behavior is identical across renderings.
- **FR-002 — Mechanical layer: `021 prototype init`.** A thin `scripts/prototype.js`, dispatched via a `021 prototype init` subcommand (spec 009 pattern), scaffolds a **bare themed skeleton** under `prototype/`: `index.html` (semantic shell + the design-system CSS link), `styles.css` (theme wiring + a few base component styles), and `app.js` (minimal) *(clarified 2026-07-18)*. Zero-dep template/string assembly (`fs`/`path`); the script never parses the EDD.
- **FR-003 — Assistant-driven generation.** Around the scaffold, the assistant reads the PRD/EDD and builds out the actual screens/flows in `prototype/`, consuming the design-system CSS variables — the judgement lives with the LLM (the scaffold is the deterministic starting point).
- **FR-004 — Consume the design-system variables.** The starter CSS **`@import`s the `requirements/_design/tokens/` CSS-variables file** when a system is set (`material-3` / BYO), and **inlines `:root` vars from the `DESIGN.md` frontmatter** when `design: none` *(clarified 2026-07-18)*. This is the seam that lets `021-design` re-theme an existing prototype without touching its markup.
- **FR-005 — Emergent wire-in (presence detection).** Generating the prototype activates the otherwise-inert steps **by presence detection**, not by editing them: `scripts/run-qa.sh` already gates its prototype tier on `prototype/*.html` (**in Phase 0 / Planning only** — Phases 1–2 do not check it *(analyze A1)*), and `prototype-sync.md` (Refinement step 5, phase-independent) on `prototype/` holding more than its `_INDEX.md`. The command writes **only** under `prototype/`.
- **FR-006 — Non-destructive; `--force` overrides.** When `prototype/` already holds content (more than its `_INDEX.md` scaffold), the command reports and **stops** without writing; `--force` is the only override *(clarified 2026-07-18)*. Consistent with the framework's non-destructive install ethos (TDD §6).
- **FR-007 — Optional; never a gate.** No command, script, or gate depends on a prototype existing; `workflow-status.js` does not gate Planning on one, and the QA tier reports an INFO skip when absent (unchanged — this spec adds nothing that gates on the prototype).
- **FR-008 — Zero runtime dependencies.** Generation is template/string assembly via built-ins only — no bundler, no framework, no build step; the prototype is plain static HTML/CSS/JS.

## Key Entities

- **Prototype starter** — the scaffolded `prototype/{index.html,styles.css,app.js}`; the deterministic themed skeleton the assistant fleshes out.
- **Design-system variable reference** — the CSS link from the prototype to `requirements/_design/tokens/` (or `DESIGN.md` bespoke tokens); the re-theme seam to `021-design`.
- **Presence signal** — `prototype/` holding more than `_INDEX.md` (and `prototype/*.html`); the emergent activator of the QA/refinement/design steps.

## Acceptance Criteria

- `021-prototype` on a bare `prototype/` scaffolds `index.html`/`styles.css`/`app.js` consuming the design-system CSS variables.
- The starter CSS references the `tokens/` CSS variables when a system is set, and the `DESIGN.md` bespoke tokens under `none`.
- With a prototype present, `021-qa`'s prototype tier and the refinement step-5 sync activate (presence-detected); with none, both cleanly skip.
- Running the command over an existing prototype without `--force` does not overwrite it; `--force` overrides.
- No lifecycle command fails on a missing prototype.
- The command renders on all three stacks with identical behavior.
- `npm test` / `npm run lint` pass; no runtime dependency added; the prototype is plain static HTML/CSS/JS.

## Out of Scope

- **The full prototype content** — the actual screens/flows are assistant-generated per project from the PRD/EDD; this spec ships the themed scaffold + the command, not a project's UI.
- **A build system / framework** — the prototype is static HTML/CSS/JS with no bundler, transpiler, or dependency; that constraint is deliberate (FR-008).
- **Hosting / deployment** — generating and previewing locally only; no deploy pipeline.
- **Design-system selection** — that is `021-design` (spec 011); `021-prototype` only *consumes* the variables it produces.
- **Gating any phase on the prototype** — explicitly not (r5); the prototype never becomes a lifecycle prerequisite.
- **Other mvp-5 work** — stage-specific review-template wiring is a separate spec.

## Dependencies & References

- TDD §12 (Optional Prototype Command).
- `workflow/specific-workflows/key-docs-to-prototype.md` (generation) and `prototype-sync.md` (Refinement step 5 update).
- `prototype/_INDEX.md` — the scaffold whose presence-threshold signals a real prototype.
- `scripts/run-qa.sh` — the existing prototype QA tier (`prototype/*.html`), activated by presence.
- Spec 011 (`021-design`) — the design-system CSS variables the prototype consumes; the re-theme seam.
- Spec 006 (renderer) / TDD §9.2 — cross-stack command rendering.
- Spec 009 (`021` CLI dispatcher) — the assistant-agnostic mechanical entry.
- Spec 010 (`021-feedback`) — the LLM-drives-plus-thin-script command pattern this mirrors.

## Open Questions

*Resolved in the 2026-07-18 clarify session: (1) a thin `scripts/prototype.js` behind **`021 prototype init`** scaffolds the starter; (2) it **refuses without `--force`** over an existing prototype; (3) the starter CSS **`@import`s the `requirements/_design/tokens/` CSS-variables file** when a system is set and **inlines `:root` from `DESIGN.md`** under `none` (the spec-011 re-theme seam); (4) wire-in is **purely emergent** — the command writes only under `prototype/`; (5) the scaffold is a **bare themed skeleton** (index.html/styles.css/app.js), the assistant builds the screens. No open items remain.*
