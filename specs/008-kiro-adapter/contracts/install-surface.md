# Contract: Kiro Install Surface

*API + guarantees for Part A (the install adapter). Extends the [007 contract](../../007-antigravity-adapter/contracts/adapter-surface.md). Zero runtime dependencies.*

## `scripts/init/adapters.js`

- `kiro` removed from `RESERVED`; `getAdapter('kiro')` returns its entry (no throw).
- Kiro entry has **no `entrypoint`**, `surfaceDirs: []`, and three `surfaceRenders` (steering, agent-json, skill).
- **Guarantee:** `claude`/`antigravity` entries unchanged; `getAdapter(undefined|unknown)` still → `claude`; still pure data.

## `scripts/init/surface.js`

```js
renderSurface(sourceDir, 'kiro') → [{ dest, content }]   // steering + agent-json + skills, sorted by dest
```

- `kind:'steering'` → `{ dest: '.kiro/steering/<basename>', content: <source verbatim> }` (flat, keep filename).
- `kind:'agent-json'` → `{ dest: '.kiro/agents/021.json', content: <source verbatim> }`.
- `kind:'skill'` → unchanged from 007 (`.kiro/skills/021-<name>/SKILL.md`, source verbatim).
- **Guarantee:** deterministic, sorted by `dest`, writes nothing. `matchName` handles `021-*.md` / `021.json` / `*.md`. Non-kiro stacks are unaffected (their `surfaceRenders` unchanged).

## `scripts/init/classes.js` — entrypoint-optional

```js
userFiles(stack)         // [entrypoint.dest, ...honored, ...COMMON]  OR  [...COMMON] when no entrypoint
frameworkDirs(stack)     // frameworkSourceDirs ∪ renderToDirs  (renderToDirs('kiro') = 3 .kiro dirs)
classify(relPath, stack)
```

- **Guarantee (kiro):** `.kiro/steering/**`, `.kiro/agents/**`, `.kiro/skills/**` ⇒ `framework-owned`; those dirs ⇒ `null` under `claude`/`antigravity`. No `CLAUDE.md`/`AGENTS.md` classifies as a kiro entrypoint. `.kiro/specs/**` is **not** a framework install path (unmanaged by install).
- **Guarantee (regression):** `claude`/`antigravity` `frameworkDirs`/`userFiles`/`classify` byte-unchanged (entrypoint present → same branches).

## `scripts/init/sources.js` — entrypoint-optional

```js
userDocMappings(sourceDir, stack)   // render entrypoint mapping only when adapter.entrypoint exists
```

- **Guarantee (kiro):** returns the common guiding-doc + `requirements/*` instantiate mappings, **no** render mapping. `frameworkFiles` still walks only `frameworkSourceDirs` (never the `.kiro/*` render `toDir`s).

## `scripts/init/classify.js` — entrypoint-optional

- The entrypoint user-doc action and `honoredDest` resolution run only when `adapter.entrypoint` exists; kiro has none, so no entrypoint action is emitted.
- The rendered-surface loop (007) handles `.kiro/**` files exactly as it does `.agents/**` — content-hash state machine, framework-owned.

## `templates/kiro-steering/*` + `templates/kiro-agent/021.json` (new content)

- Steering templates carry their Kiro inclusion-mode frontmatter (`inclusion: always` for product/tech; `fileMatch` where scoped) and stable framework operating guidance.
- `021.json` references guiding docs (`prompt: file://`), key-doc globs (`resources`), lifecycle `hooks`, and `skill://` → `.kiro/skills/021-*`.
- **Guarantee:** both ship as Layer-1 templates (synced to `package/`); they are framework-owned once rendered into `.kiro/`.

## Invariants

1. **006/007 unchanged** — `claude` golden bar + `antigravity` `.agents/` surface byte-identical; `getAdapter('kiro')` no longer throws.
2. **3-stack neutral-core** — clean installs differ only in each stack's Layer-2 (`.claude/**`/`CLAUDE.md` · `.agents/**`/`AGENTS.md` · `.kiro/steering|agents|skills/**`); Layer-1 byte-identical (006 carve-outs).
3. **Un-chosen stacks install nothing** — no `.kiro/` under claude/antigravity; no claude/antigravity surface under kiro.
4. **Idempotent + `--upgrade`** — re-run is all `skip`; `--upgrade` refreshes only the recorded stack's surface.
