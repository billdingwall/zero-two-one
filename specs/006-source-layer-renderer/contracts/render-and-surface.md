# Contract: stack-parameterized surface + entrypoint renderer

*The seam 006 opens. Two new modules (`adapters.js`, `render.js`) and stack-aware signatures on `classes.js`/`sources.js`. All effects are additive to the spec 001 pipeline; the `claude` output is byte-identical (FR-010).*

## API

```js
// scripts/init/adapters.js  (registry — imports nothing from classes/sources)
getAdapter(stack) → { entrypoint: { template, dest }, surfaceDirs: string[] }   // default 'claude'

// scripts/init/render.js
renderEntrypoint(templatePath, stack, opts?) → string   // opts.existing = current dest text, for preamble preservation

// scripts/init/classes.js   (stack threaded in)
FRAMEWORK_DIRS(stack) → string[]                 // [...LAYER1_DIRS, ...getAdapter(stack).surfaceDirs]
classify(relPath, stack)  → CLASS.* | null       // Layer-2 of a non-chosen stack → null

// scripts/init/sources.js   (stack threaded in)
frameworkFiles(sourceDir, stack)   → string[]
userDocMappings(sourceDir, stack)  → Array<{ template, dest, action: 'render' | 'instantiate' }>
```

### `getAdapter(stack)`
- Pure lookup over the registry; **absent/unknown** stack ⇒ `claude` (FR-007, back-compat for pre-mvp-4 manifests). **`kiro` (a known but unpopulated stack) throws** a clear "not yet supported — spec 008" error rather than mis-rendering a claude tree under a kiro manifest (analyze A5).

### `renderEntrypoint(templatePath, stack, opts?)`
- Reads `ASSISTANT-Template.md`, applies the stack transform, returns the entrypoint text. `fs`/`path` + string ops only (FR-011).
- **`claude` ⇒ byte-identical to today's `CLAUDE-Template.md` content** (the regression bar).
- **`antigravity` ⇒ `AGENTS.md`** text: same neutral body, stack-specific tokens (entrypoint filename, assistant references) resolved for Antigravity.
- When `opts.existing` contains a marked user-owned local section (the dogfood preamble), it is carried through unchanged (FR-003).

### `classify(relPath, stack)`
- Applies the [data-model §3](../data-model.md) table. Layer-1 paths classify identically for every stack; a non-chosen stack's `surfaceDirs/**` returns `null` (FR-009).

### `userDocMappings(sourceDir, stack)`
- The entrypoint mapping carries `action: 'render'` (→ `render.js`); every other guiding/`requirements` doc carries `action: 'instantiate'` (spec 001 copy, unchanged). Only mappings whose template exists in the source are returned.

## Guarantees (assertable)

1. **`claude` byte-identical** — rendered `CLAUDE.md` + `.claude/commands/021-*.md` equal the committed golden fixture (today's bytes); spec 001/002 tests green (the two `CLAUDE-Template.md` byte-compare assertions re-pointed to `renderEntrypoint(..., 'claude')`).
2. **`antigravity` entrypoint only** — `AGENTS.md` written at root; no `CLAUDE.md`, no `.claude/commands/` anywhere in the installed tree.
3. **Un-chosen stacks install nothing** — for any chosen stack, no non-chosen Layer-2 path is created, refreshed, or classified framework-owned.
4. **Neutral-core invariant** — two clean installs (`claude`, `antigravity`) differ **only** in Layer-2 paths; every Layer-1 path byte-identical.
5. **Stack-aware ownership** — `.claude/commands/**` is `framework-owned` under `claude` and `null` under `antigravity`; `AGENTS.md` is `user-owned` under `antigravity`.
6. **`--upgrade` honors the recorded stack** — refreshes only the manifest's `tools.stack` Layer-2 surface; never introduces another stack's entrypoint/command dir.
7. **Default `claude`** — `tools.stack` absent ⇒ `claude` surface (pre-mvp-4 repos unaffected).
8. **Zero deps** — text transforms only; manifest schema unchanged; `sync:package -- --check` clean with the new/removed templates.

## CLI surface

- No new user-facing flags in this spec. `--stack` already flows into `opts.stack` → `resolveTools()` (`index.js:39`); the interactive interview that sets it is a separate mvp-4 item. `--dry-run` plan output reflects the stack-scoped surface (only the chosen stack's Layer-2 paths appear).
