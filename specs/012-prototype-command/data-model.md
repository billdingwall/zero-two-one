# Data Model: Optional Prototype Command (`021-prototype`)

*The concrete shapes behind [spec.md](spec.md)'s Key Entities, plus the scaffold file set, the design-system CSS reference, the presence/overwrite rule, the dispatcher route, and the file inventory. No new persistent store — the `prototype/` files are the durable artifact; nothing in the manifest changes.*

## Entities

### Prototype starter (the scaffold)
The bare themed skeleton `021 prototype init` writes under `prototype/`.

| File | Content |
|---|---|
| `prototype/index.html` | semantic HTML shell (header/main/footer), `<link rel="stylesheet" href="styles.css">`, `<script src="app.js">`; a comment marking where the assistant adds screens |
| `prototype/styles.css` | the **theme reference** (below) + a few base component styles using `var(--…)` |
| `prototype/app.js` | minimal (a load hook / comment); no framework |
| `prototype/_INDEX.md` | the scaffold marker (seeded if absent); does **not** count toward the presence threshold |

### Design-system variable reference (`styles.css` top)
The re-theme seam to `021-design` (spec 011).

| Condition | `styles.css` emits |
|---|---|
| `tools.design !== 'none'` **and** a `requirements/_design/tokens/*.css` vars file exists | `@import '../requirements/_design/tokens/<vars>.css';` — the prototype is themed by the active system; a `021-design` swap re-themes it |
| `design: none` (or no tokens CSS file) | an inline `:root { --… }` block read from the `DESIGN.md` frontmatter (minimal parse of `colors:`/`spacing:`/`radii:`), + a comment pointing at `DESIGN.md` |

### Presence signal / overwrite rule
| Concept | Rule |
|---|---|
| Presence threshold | `prototype/` holds a file other than `_INDEX.md` |
| `init` (no `--force`) with content present | report + exit 1; **write nothing** (FR-006) |
| `init --force` | overwrite the three starter files |
| Emergent activation | once a `.html` exists, `run-qa.sh`'s prototype tier (`ls prototype/*.html`) and `prototype-sync.md` (`> _INDEX.md`) activate — no edits to those files |

## `scripts/prototype.js` — argument surface

| Invocation | Meaning |
|---|---|
| `init` | scaffold the starter (refuse if a prototype already exists) |
| `init --force` | scaffold, overwriting an existing starter |
| (no verb / unknown verb) | usage + exit 1 |

**Exit codes:** `0` success; `1` usage error, or refuse-without-`--force` over an existing prototype.

## Dispatcher route (`bin/021.js`, spec 009)

| Subcommand | Leaf | Runner | File | Rest |
|---|---|---|---|---|
| `prototype` | `init` | `node` | `scripts/prototype.js` | `['init', ...flags]` pass-through (incl. `--force`) |

Unknown/absent leaf → usage + exit 1 (mirrors `design`/`spec`). Plus a `prototype init [--force]` line in `USAGE`.

## File inventory & ownership

| File | Kind | Ownership (TDD §6) | Manifest-tracked |
|---|---|---|---|
| `scripts/prototype.js` | new script | framework-owned (Layer-1) | yes |
| `.claude/commands/021-prototype.md` | new command surface (claude) | framework-owned Layer-2 | yes |
| `.agents/skills/021-prototype/SKILL.md` | rendered surface (antigravity) | framework-owned Layer-2 (rendered) | yes (antigravity installs only) |
| `bin/021.js` | +1 route, +1 usage line | framework-owned | (bin/ excluded from install surface) |
| `scripts/_INDEX.md` | index update | framework-owned | yes |
| `prototype/{index.html,styles.css,app.js,_INDEX.md}` | runtime-created project artifacts | project data | no (runtime, not install surface — init does not create `prototype/`) |

The two new framework files sync into `package/**` (`npm run sync:package -- --check` green). `run-qa.sh`, `prototype-sync.md`, and `workflow-status.js` are **unchanged** (emergent wire-in).
