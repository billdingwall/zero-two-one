Adopt, switch, or remove a design system for this project — walking the Design-System Selection workflow (`workflow/specific-workflows/design-system-selection.md`) so the choice lands as structured tokens the rest of the framework consumes.

Drive the DSS steps with the user; the mechanical writes are done by `npx 021 design set <system>`.

## 1. Select

Ask the user which system to adopt:
- **`material-3`** — Google Material 3 (roles map to `md.sys.*` tokens).
- **bring-your-own** — a user-supplied token export mapped onto the framework's roles.
- **`none`** — bespoke tokens (the `DESIGN.md` frontmatter is the source of truth).

## 2. Assess (before committing)

Walk the trade-offs and note unresolved items in `04-BACKLOG.md`'s Open Questions:
- **Component availability** vs the EDD's core scenarios — what's provided vs custom.
- **Theming model** (e.g. M3 dynamic color, `md.sys.*` role remapping).
- **Accessibility defaults** the system guarantees (and where it doesn't).
- **Export targets** (web CSS variables, Android, Flutter, React) and tooling.
- **Licensing / brand** constraints.

## 3. Record the choice (mechanical)

```
npx 021 design set <system>
```

This records `tools.design` in `.zero-two-one.json`, scaffolds `requirements/_design/tokens/`, and writes a marker-bounded "Design System Mapping" section in `DESIGN.md` (creating `DESIGN.md` from the template if it's missing). The bespoke frontmatter tokens are preserved.

## 4. Map

Fill the mapping table's role → token assignments with the real values. Import the user's export (Material Theme Builder JSON / CSS variables, or their own) into `requirements/_design/tokens/` and reference it from `DESIGN.md` — artifacts are checked in, not regenerated ad hoc.

## 5. Cascade

- Write / update the tokens' **CSS-variables file** under `requirements/_design/tokens/`.
- If a `prototype/` exists, point it at those CSS variables so it re-themes (no prototype → nothing to do; `021-design` never generates one — that's `021-prototype`).
- Annotate the **EDD** where the system's constraints affect scenarios.

## 6. Record via a refinement round

Tell the user to land these living-doc changes (`DESIGN.md`, the EDD annotation, the manifest) through a **refinement round** with a matching changelog entry — a design-system change is deliberate, not an ad-hoc edit. Do not open or close the round automatically.
