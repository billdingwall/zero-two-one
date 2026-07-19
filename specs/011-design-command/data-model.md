# Data Model: Design-System Install Command (`021-design`)

*The concrete shapes behind [spec.md](spec.md)'s Key Entities, plus the manifest write, the `DESIGN.md` mapping-section contract, the dispatcher route, and the file inventory. No new persistent store — `tools.design` in the manifest and the marker-bounded `DESIGN.md` section are the durable state.*

## Entities

### DesignSelection
The choice, applied per `021 design set <system>`.

| Field | Type | Source | Notes |
|---|---|---|---|
| `system` | `'none' \| 'material-3' \| '<byo-name>'` | CLI arg | free-form allowed for BYO; `none` reverts to bespoke |
| `artifacts` | string[] | user | export files the assistant imports into `requirements/_design/tokens/` |

### TokenMapping
The project-role → system-token assignments written into `DESIGN.md`'s marked section.

| Element | Behavior |
|---|---|
| Region | bounded by `<!-- 021-design:mapping start -->` … `<!-- 021-design:mapping end -->` |
| Write mode | **replace** the region if the marker is present; **append** it (with markers) if absent — never touching the frontmatter token block (research R2) |
| `material-3` skeleton | role rows scaffolding `md.sys.*` tokens (color/typography/shape/elevation/motion; tiers `md.ref`/`md.sys`/`md.comp`) |
| `<byo>` skeleton | generic project-role rows (no `md.sys.*` assumptions) |
| `none` | region collapsed to a one-line bespoke note; frontmatter tokens are the source of truth |

> The script writes the **skeleton**; the assistant fills the actual role→token values (judgement). Regenerating the skeleton each run keeps the edit idempotent and a switch/remove clean.

### `tools.design` (manifest)
The active system; the audit trail for `021-status`/`021-doctor` and later renders.

| Property | Value |
|---|---|
| Write path | `loadManifest(root)` → `manifest.tools.design = system` → refresh `updatedAt` → `writeManifest` (targeted; **not** `buildManifest`) |
| Values | `none` (default) \| `material-3` \| `<byo-name>` |
| Consistency | matches the init `--design` resolution (`scripts/init/index.js:44`) |

### Token artifacts
Exported files under `requirements/_design/tokens/` (runtime-created in the invoking project, **not** part of the install surface), referenced from `DESIGN.md`; the prototype consumes their CSS variables.

## `scripts/design.js` — argument surface

| Invocation | Meaning |
|---|---|
| `set <system>` (required) | validate; write `tools.design`; scaffold `tokens/`; replace/append the mapping section; print next steps |
| `set` (no system) | usage + exit 1 |

**Exit codes:** `0` success; `1` usage error (no `set` verb, or no system).

## Dispatcher route (`bin/021.js`, spec 009)

| Subcommand | Leaf | Runner | File | Rest |
|---|---|---|---|---|
| `design` | `set` | `node` | `scripts/design.js` | `['set', <system>]` pass-through |

Unknown/absent leaf → usage + exit 1 (mirrors the `spec` leaf handling). Plus a `design set <system>` line in `USAGE`.

## File inventory & ownership

| File | Kind | Ownership (TDD §6) | Manifest-tracked |
|---|---|---|---|
| `scripts/design.js` | new script | framework-owned (Layer-1) | yes |
| `.claude/commands/021-design.md` | new command surface (claude) | framework-owned Layer-2 | yes |
| `.agents/skills/021-design/SKILL.md` | rendered surface (antigravity) | framework-owned Layer-2 (rendered) | yes (antigravity installs only) |
| `bin/021.js` | +1 route, +1 usage line | framework-owned | (bin/ excluded from install surface) |
| `scripts/_INDEX.md` | index update | framework-owned | yes |
| `DESIGN.md` (project) | edited at runtime (user-owned doc) | **user-owned** — the command edits it because the user invoked it | n/a (not tracked as framework-owned) |
| `requirements/_design/tokens/**` | runtime-created project artifacts | project data | no (runtime, not install surface) |

The two new framework files sync into `package/**` (`npm run sync:package -- --check` green).
