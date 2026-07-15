# Design-System Selection (DSS)

**Goal:** Let a project adopt (or switch) a design system deliberately — walking the decisions, gaps, and implications — and land the result as structured tokens the rest of the framework consumes. Independent of the tool stack; recorded as `tools.design` in `.zero-two-one.json`. Contract in TDD §9.4. First supported system: **Google Material 3**; `none` (bespoke `DESIGN.md`) is the default.

## The Process

1. **Select**
   The user names a design system (e.g. Material 3) or stays bespoke. Typically triggered during Planning (Phase 1) or by a refinement round; can also be chosen at init (`--design`).

2. **Assess**
   Walk the decisions, gaps, and implications before committing:
   - **Component availability** vs the EDD's core scenarios — what the system provides, what must be custom.
   - **Theming model** — e.g. M3 dynamic color and `md.sys.*` role remapping.
   - **Accessibility defaults** the system guarantees (and where it doesn't).
   - **Platform export targets** (web CSS variables, Android, Flutter, React) and tooling (e.g. Material Theme Builder).
   - Licensing/brand constraints.
   Unresolved items land in `04-BACKLOG.md`'s Open Questions register.

3. **Map**
   Express the project's design decisions as **system-token role assignments** in `DESIGN.md` (for M3: project roles → `md.sys.*` tokens). Import exported token artifacts (Theme Builder JSON / CSS variables) into `requirements/_design/tokens/` and reference them from `DESIGN.md` — artifacts are checked in, not regenerated ad hoc.

4. **Cascade**
   - Annotate the **EDD** with the system's constraints where scenarios are affected.
   - Re-theme **`prototype/`** from the exported CSS variables — a system swap re-themes the prototype without touching key docs.
   - Record `tools.design` in the manifest.

5. **Review**
   The changes land through a refinement round (`r{n}-review.md`) like any living-doc update, with the changelog entries to match.

## Switching or Removing a System

Because components consume tokens (never raw values) and artifacts live in `requirements/_design/tokens/`, switching systems repeats steps 2–4 with a new mapping; removing one reverts `DESIGN.md` to bespoke tokens. Either way the change is a refinement round, not an ad-hoc edit.
