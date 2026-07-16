# Prototype Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 5). Keeps an **existing** prototype aligned with the docs. Distinct from initial generation ([key-docs-to-prototype.md](key-docs-to-prototype.md)).*

**Goal:** When a project has a prototype, update it to reflect the round's applied changes; when it doesn't, skip — the prototype is optional (r5) and never blocks a round.

## Steps
1. Detect a prototype: `prototype/` holds more than its `_INDEX.md` scaffold (added via `021-prototype`). If absent → **skip** (N/A).
2. Apply the round's UX/visual changes to `prototype/`, consuming the `DESIGN.md` design-system CSS variables (so a later `021-design` swap re-themes it).
3. Keep the prototype consistent with the EDD core scenarios used for the Planning sign-off milestone.

**Reads:** key docs, `DESIGN.md`. **Writes:** `prototype/` (only if one exists).
