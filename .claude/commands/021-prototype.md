Scaffold and build the project's **optional** static prototype — a visual contract that aligns with the PRD/EDD and is themed by the design system. The prototype is opt-in; nothing in the lifecycle requires one.

## 1. Confirm intent

Check the team actually wants a prototype now (typically during Planning). If not, stop — a project runs fine without one.

## 2. Scaffold the themed starter (mechanical)

```
npx 021 prototype init
```

This creates `prototype/index.html`, `prototype/styles.css`, and `prototype/app.js` — a bare themed skeleton whose CSS consumes the design-system variables. If a design system is set (`021 design`), the CSS `@import`s the tokens under `requirements/_design/tokens/`; otherwise it inlines `:root` variables from `DESIGN.md`. If `prototype/` already holds a prototype, the command stops unless you pass `--force`.

## 3. Build the real screens

Read the PRD (`requirements/01-PRD.md`) and the EDD's core scenarios, then build out the actual screens and flows under `prototype/`, replacing the starter markup. Consume the design-system CSS variables (`var(--…)`) rather than hard-coded values — so the prototype stays re-themeable.

## 4. Note what this activates

Once `prototype/` holds real content:
- `021 qa` validates the prototype assets in Planning (Phase 0).
- The Refinement Loop's step-5 prototype-sync keeps it aligned with the docs.
- `021 design` re-themes it on a design-system swap — no markup changes needed.

Keep the prototype consistent with the EDD scenarios used for the Planning sign-off.
