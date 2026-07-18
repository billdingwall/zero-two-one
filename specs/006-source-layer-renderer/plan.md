# Implementation Plan: Source Layer & Stack-Parameterized Renderer

*The HOW for [spec.md](spec.md). Opens the Layer-2 seam the mvp-4 cut rides on: a neutral `ASSISTANT-Template.md` source, a `render.js` transform, and a `scripts/init/adapters.js` registry that makes `classes.js`/`sources.js` resolve the install surface from `tools.stack`. Reuses the spec 001 classify→apply→manifest pipeline unchanged in shape; the active stack is already resolved by `resolveTools()` (`scripts/init/index.js:39`).*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/init/` engine, `bin/init.js`) |
| **Dependencies** | **None** — `fs`/`path` string transforms; frontmatter emitted as plain text (FR-011) |
| **New modules** | `scripts/init/adapters.js` (registry), `scripts/init/render.js` (entrypoint renderer) *(both clarified 2026-07-17)* |
| **Changed modules** | `classes.js` (`FRAMEWORK_DIRS`/`classify` take a stack), `sources.js` (`frameworkFiles`/`userDocMappings` take a stack), `classify.js` (thread stack into the plan), `sync-to-package.js` |
| **New content** | `templates/ASSISTANT-Template.md` (neutral source) |
| **Removed** | `templates/CLAUDE-Template.md` (rendered directly now, FR-003) |
| **Reuses** | spec 001 classify→apply→manifest pipeline; `resolveTools()` (already yields `stack`); spec 003 `manifestFacts` for reads |
| **Testing** | `node:test` fixtures per stack; a golden-fixture regression pinning today's `CLAUDE.md` + `.claude/commands/021-*.md` bytes |
| **Source of truth** | TDD §9.1 (source layer, stack-parameterized surface); repo-refactor §3.1 (three-layer model) |

## Constraints check (must hold)

- **`claude` byte-identical** — rendered `CLAUDE.md` + `.claude/commands/021-*.md` match pre-006 bytes; the golden fixture is the invariant (FR-010).
- **Neutral-core invariant** — two clean installs differ **only** in Layer-2 paths; every Layer-1 path byte-identical (Scenario 4).
- **Un-chosen stacks install nothing** — no non-chosen Layer-2 path created or classified framework-owned (FR-009).
- **Zero dependencies** — text transforms only; no YAML/templating library (FR-011).
- **Default `claude`** — `tools.stack` absent ⇒ `claude`; pre-mvp-4 repos unaffected (FR-007; already true in `resolveTools`).
- **Additive to spec 001** — pipeline shape, ownership classes, and manifest schema unchanged; existing 001/002 tests stay green (except the two `CLAUDE-Template.md` byte-compare assertions, re-pointed to renderer output — FR-003).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The StackAdapter registry shape, the three layers as path sets, the entrypoint-render action |
| [contracts/render-and-surface.md](contracts/render-and-surface.md) | `adapters.js` + `render.js` + stack-parameterized `classes.js`/`sources.js` API & guarantees |
| [research.md](research.md) | Decisions & rationale (rolls up the clarify) + rejected alternatives |
| [quickstart.md](quickstart.md) | Per-stack validation walkthrough (install, diff the tree, assert bytes) |

## Approach

The pipeline is unchanged in shape — `classifyAll` builds a plan, `applyPlan` executes it, `buildManifest` records it. Two things change: **the plan is now stack-scoped**, and **the entrypoint doc is rendered, not copied**.

```
initFramework(targetDir, opts)
  tools = resolveTools(opts, prev)          // already yields tools.stack (index.js:39)
  stack = tools.stack                        // 'claude' | 'antigravity' | 'kiro'
  adapter = adapters.get(stack)              // NEW registry lookup

  plan = classifyAll({ sourceDir, targetDir, manifest: prev, opts, stack })   // stack threaded
     frameworkFiles(sourceDir, stack)        // FRAMEWORK_DIRS(stack): Layer-1 dirs + adapter.surfaceDirs
     userDocMappings(sourceDir, stack)       // entrypoint = adapter.entrypoint (RENDER); other docs = COPY

  applyPlan(plan)
     for each RENDER action → render.js(ASSISTANT-Template.md, stack) → dest   // NEW
     for each COPY/instantiate action → unchanged (spec 001)

  buildManifest({ ..., tools })              // tools.stack persisted (already)
```

`classify(relPath, stack)` becomes stack-aware: `adapter.surfaceDirs` are framework-owned; **another stack's surface dirs are outside the managed surface** (return `null`) so they're never created or refreshed (FR-009, Scenario 6). Layer-1 dirs classify identically for every stack.

## The adapter registry (FR-006)

`scripts/init/adapters.js` — one object, the single source both `classes.js` and `sources.js` import:

```js
const ADAPTERS = {
  claude:      { entrypoint: { template: 'ASSISTANT-Template.md', dest: 'CLAUDE.md' }, surfaceDirs: ['.claude/commands'] },
  antigravity: { entrypoint: { template: 'ASSISTANT-Template.md', dest: 'AGENTS.md' }, surfaceDirs: [] },  // skills tree = spec 007
  // kiro: reserved for spec 008
};
function getAdapter(stack) { return ADAPTERS[stack] || ADAPTERS.claude; }  // default claude (FR-007)
```

`classes.js`/`sources.js` import `getAdapter`; no require cycle (adapters.js imports nothing from them). Layer-1 dirs (`scripts`, `hooks`, `skills`, `workflow`, `templates`, `.github`) stay in `classes.js` as the stack-invariant base; `FRAMEWORK_DIRS(stack) = [...LAYER1_DIRS, ...getAdapter(stack).surfaceDirs]`.

## The renderer (FR-002)

`scripts/init/render.js` — `renderEntrypoint(templatePath, stack) → string`:

- Reads `ASSISTANT-Template.md`, applies the stack's transform, returns the entrypoint doc text. `fs`/`path` + string ops only.
- For `claude` the transform must reproduce **today's `CLAUDE-Template.md` bytes exactly** (the regression bar) — so the neutral source is authored such that the `claude` rendering is byte-for-byte the current template (see research R3: the transform is near-identity for `claude`; any stack-specific tokens resolve to the current text).
- Preserves a user-owned **local section** (the dogfood preamble) when re-rendering over an existing entrypoint (FR-003) — the marked block is carried through untouched, consistent with the ownership model.
- `apply.js` gains a `render` branch: entrypoint mappings are rendered via `render.js`; all other user docs keep the existing `instantiate` (copy) path.

## Source authoring & the `claude` byte bar (FR-003/010)

1. Create `templates/ASSISTANT-Template.md` from the **current** `CLAUDE-Template.md` content, generalized so the `claude` render is byte-identical and the `antigravity` render swaps only the stack-specific lines (entrypoint filename, assistant-name references).
2. Delete `templates/CLAUDE-Template.md`.
3. Re-point everything that referenced the old copy mapping: TDD §5 mapping row, spec 001 FR-017 note, `templates/_INDEX.md` (+ package copy), and the `test/init/` assertions comparing `CLAUDE.md` to `CLAUDE-Template.md` bytes → compare to `renderEntrypoint(..., 'claude')`.
4. Commit a golden fixture: the exact expected `CLAUDE.md` bytes (today's) + the `.claude/commands/021-*.md` set; the test renders `claude` and asserts equality.

## Package sync (FR-012)

`sync-to-package.js` copies `templates/ASSISTANT-Template.md` and `scripts/init/{adapters,render}.js`, and no longer ships `templates/CLAUDE-Template.md`; the manifest `files` inventory and `package/templates/_INDEX.md` drop the stale entry. `npm run sync:package -- --check` clean.

## Testing strategy

`node:test` fixtures (temp source + target dirs, per stack):
- **`claude`**: golden-fixture equality for `CLAUDE.md` + `.claude/commands/021-*.md`; existing 001/002 tests green (with the two byte-compare assertions re-pointed).
- **`antigravity`**: `AGENTS.md` rendered at root; **no** `CLAUDE.md`, **no** `.claude/commands/` in the tree.
- **Neutral-core invariant**: install `claude` and `antigravity` into two clean targets; diff the trees — only Layer-2 paths differ; every Layer-1 path byte-identical.
- **`classify()` stack-awareness**: `.claude/commands/**` framework-owned under `claude`, `null` under `antigravity`; `AGENTS.md` user-owned under `antigravity`.
- **`--upgrade`** on an `antigravity` manifest refreshes `AGENTS.md`, never adds `CLAUDE.md`/`.claude/commands`.
- **default**: `tools.stack` absent ⇒ `claude` surface.

## Work breakdown

See [tasks.md](tasks.md).
