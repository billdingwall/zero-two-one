# Contract: Design-System Install Command (`021-design`)

*The observable behavior the [tasks](../tasks.md) verify. Three surfaces: the `scripts/design.js` CLI, the `021 design` dispatch, and the `/021-design` walkthrough.*

## C1 — `scripts/design.js` CLI

```
node scripts/design.js set <system>          # system: none | material-3 | <byo-name>
```

- **Requires the `set` verb and a system.** Missing either → usage to stderr, exit `1`; nothing is written.
- **Manifest write (FR-007):** `loadManifest(root)` → set `tools.design = <system>` → refresh `updatedAt` → `writeManifest`. Every other manifest field (`version`, `phase`, `files`, `merged`, …) is **byte-stable**; `buildManifest` is not called.
- **Tokens scaffold (FR-005):** `requirements/_design/tokens/` is created if absent (idempotent on re-run).
- **`DESIGN.md` mapping section (FR-004):**
  - If the `<!-- 021-design:mapping start -->`…`<!-- 021-design:mapping end -->` marker is present → **replace** the bounded region with the system skeleton.
  - If absent → **append** the section (with markers) after the doc body.
  - The **frontmatter token block is never modified**; a second run with the same system is idempotent.
  - `material-3` → `md.sys.*` role-row skeleton; `<byo>` → generic role rows; `none` → a one-line bespoke note (region collapsed).
- **Prints next steps (FR-011):** fill the mapping values, import the export into `tokens/`, annotate the EDD, re-theme `prototype/` if present, and record the change via a refinement round. It **does not** open/close a round.
- **Never** generates a prototype (that is spec 012); the cascade file work is the assistant's (C3).
- Zero-dep; exit `0` on success.

## C2 — `021 design` dispatch (`bin/021.js`)

- `npx 021 design set <system>` runs `scripts/design.js` with `['set', <system>]` passed through and returns its exit code (spec-009 dispatch semantics).
- `npx 021 design` (no leaf) or `npx 021 design bogus` → usage + exit `1` (mirrors the `spec` leaf handling).
- The dispatcher holds **no** design logic (spec-009 invariant); `USAGE` lists the `design set` line.

## C3 — `/021-design` walkthrough (surface behavior)

The command surface (claude file; antigravity SKILL render; kiro via the `021` agent) drives the DSS steps:

1. **Select** a system (Material 3 / BYO / `none`).
2. **Assess** — component gaps vs the EDD, theming model, a11y, export targets, licensing; unresolved → `04-BACKLOG.md`.
3. Run `npx 021 design set <system>` (the deterministic writes).
4. **Map** — fill the skeleton's role→token rows with real assignments; import the user's export into `requirements/_design/tokens/` and reference it.
5. **Cascade** — write/update the CSS-variables file; if `prototype/` exists, point it at those variables; annotate affected EDD scenarios. No-op on the prototype when absent.
6. **Record** — instruct the user to land the change through a refinement round with a changelog entry.

**Cross-stack identity (FR-001):** all stacks call the same `021 design` CLI; only the surface wrapper differs (verbatim command / rendered SKILL / agent-invoked). kiro has no per-command skill (like `021-feedback`/`021-init`).

## Acceptance mapping

| Spec acceptance | Contract |
|---|---|
| Adopt Material 3 → `md.sys.*` mapping + `tools.design: material-3` | C1 (section skeleton + manifest), C3 (fill values) |
| BYO → export mapped onto framework roles, no `md.sys.*` | C1 (byo skeleton), C3 |
| Import artifacts → `tokens/` + referenced | C1 (scaffold), C3 (import) |
| Cascade → re-theme prototype if present, else no-op | C1 (never generates), C3 (CSS-vars write) |
| Switch → mapping redone, `tools.design` updated | C1 (replace + write) |
| Remove → bespoke tokens, `tools.design: none` | C1 (`none` collapse) |
| Deliberate, recorded | C1/C3 (surface the round, no auto-run) |
| Cross-stack, identical behavior | C2/C3 (one CLI, three wrappers) |
