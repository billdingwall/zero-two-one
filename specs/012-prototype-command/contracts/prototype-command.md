# Contract: Optional Prototype Command (`021-prototype`)

*The observable behavior the [tasks](../tasks.md) verify. Three surfaces: the `scripts/prototype.js` CLI, the `021 prototype` dispatch, and the `/021-prototype` walkthrough.*

## C1 — `scripts/prototype.js` CLI

```
node scripts/prototype.js init [--force]
```

- **Requires the `init` verb.** Missing/unknown verb → usage to stderr, exit `1`; nothing written.
- **Non-destructive (FR-006):** if `prototype/` holds any file other than `_INDEX.md` and `--force` is absent → report "prototype already exists (use --force)" and exit `1`, **writing nothing**.
- **Scaffold (FR-002):** creates `prototype/` if absent, seeds `prototype/_INDEX.md` if absent, and writes:
  - `prototype/index.html` — semantic shell linking `styles.css` + `app.js`, with a marked spot for the assistant's screens.
  - `prototype/styles.css` — the theme reference (C-theme) + a few base component styles using `var(--…)`.
  - `prototype/app.js` — minimal.
- **Theme reference (FR-004):** `styles.css` begins with either
  - `@import '../requirements/_design/tokens/<vars>.css';` when `tools.design !== 'none'` **and** a tokens `*.css` file exists, or
  - an inline `:root { --… }` block read from the `DESIGN.md` frontmatter when `design: none` (or no tokens CSS file).
- **Writes only under `prototype/` (FR-005):** it does **not** touch `run-qa.sh`, `prototype-sync.md`, `workflow-status.js`, or the manifest.
- **Prints next steps (FR-003):** build the real screens from the PRD/EDD, consuming the design-system variables.
- Zero-dep; exit `0` on a successful scaffold.

## C2 — `021 prototype` dispatch (`bin/021.js`)

- `npx 021 prototype init [--force]` runs `scripts/prototype.js` with `['init', ...flags]` passed through and returns its exit code (spec-009 dispatch semantics).
- `npx 021 prototype` (no leaf) or `npx 021 prototype bogus` → usage + exit `1` (mirrors `design`/`spec`).
- The dispatcher holds **no** prototype logic (spec-009 invariant); `USAGE` lists the `prototype init` line.

## C3 — `/021-prototype` walkthrough (surface behavior)

The command surface (claude file; antigravity SKILL render; kiro via the `021` agent):

1. Confirm the team wants a prototype (opt-in; never required).
2. Run `npx 021 prototype init` (scaffold; `--force` to replace an existing one).
3. Read the PRD/EDD core scenarios and build the actual screens/flows under `prototype/`, consuming the design-system CSS variables.
4. Note the prototype now activates the QA tier / refinement step-5 sync (presence-detected) and is re-themed by `021-design`.

**Cross-stack identity (FR-001):** all stacks call the same `021 prototype` CLI; only the surface wrapper differs. kiro has no per-command skill (like `021-feedback`/`021-design`).

## Acceptance mapping

| Spec acceptance | Contract |
|---|---|
| Generate a prototype | C1 (scaffold), C3 (flesh out) |
| Consumes design-system variables | C1 (theme reference) |
| Re-themeable by `021-design` | C1 (`@import` the tokens file) |
| Activates optional steps (emergent) | C1 (writes a `.html`; nothing else touched) |
| Non-destructive | C1 (refuse without `--force`) |
| Optional, never a gate | C1/C2 (no gate added; absence unchanged) |
| Cross-stack, identical behavior | C2/C3 (one CLI, three wrappers) |
