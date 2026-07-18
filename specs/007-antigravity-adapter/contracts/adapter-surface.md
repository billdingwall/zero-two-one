# Contract: Antigravity Surface Rendering & Ownership

*The API surface and guarantees for the rendered Layer-2 seam. Extends the [spec 006 contract](../../006-source-layer-renderer/contracts/render-and-surface.md). Zero runtime dependencies throughout.*

## `scripts/init/adapters.js` (extended)

```js
// antigravity entry gains:
entrypoint: { template, dest, honored?: string[] }   // honored = ['GEMINI.md']
surfaceRenders?: RenderDescriptor[]                   // rendered Layer-2 surfaces
// RenderDescriptor = { fromDir, match, exclude?, toDir, kind }
```

- **Guarantee:** `claude`/`kiro` entries are unchanged; `getAdapter` behavior (default claude, throw on kiro) is unchanged (006).
- **Guarantee:** still pure data — no functions, no imports from `classes`/`sources`/`surface` (no cycle).

## `scripts/init/surface.js` (new)

```js
renderSurface(sourceDir, stack) → Array<{ dest, content }>   // sorted by dest; [] if no surfaceRenders
```

- **Input:** the source root and active stack. Reads `getAdapter(stack).surfaceRenders`.
- **Output:** one entry per matched source file — `dest` is target-relative (`.agents/skills/021-<name>/SKILL.md`), `content` is the fully-rendered `SKILL.md` text.
- **`kind:'skill'`** — content is the source file verbatim (frontmatter already present at rest). Name → `021-<basename>`.
- **`kind:'command'`** — content is synthesized `---\nname:\ndescription:\n---\n` + source body. Source (`.claude/commands/021-*.md`) is **read-only** and never modified (protects the 006 golden bar).
- **Guarantee:** deterministic and idempotent — same inputs → byte-identical `content`. No writes (pure producer). `fs`/`path` only.
- **Guarantee:** returns `[]` for any stack without `surfaceRenders` (claude), so callers are stack-agnostic.

## `scripts/init/classes.js` (extended)

```js
frameworkSourceDirs(stack) → string[]   // LAYER1_DIRS ∪ adapter.surfaceDirs   (walked + owned)
frameworkDirs(stack)       → string[]   // frameworkSourceDirs ∪ render toDirs  (owned)
userFiles(stack)           → string[]   // [entrypoint.dest, ...entrypoint.honored?, ...COMMON]
classify(relPath, stack)   → CLASS | null
```

- **Guarantee (claude):** `frameworkDirs('claude') === frameworkSourceDirs('claude')` (no `surfaceRenders`) — identical to 006; `.claude/commands/**` framework-owned, byte-for-byte behavior preserved.
- **Guarantee (antigravity):** `.agents/skills/**` ⇒ `framework-owned`; `AGENTS.md` **and** `GEMINI.md` ⇒ `user-owned`; `.claude/commands/**` ⇒ `null` (unmanaged).
- **Guarantee (cross-stack):** a render `toDir` for a non-chosen stack ⇒ `null` (un-chosen stacks install nothing, FR-006).

## `scripts/init/sources.js` (changed)

```js
frameworkFiles(sourceDir, stack) → string[]   // walks frameworkSourceDirs only — never render toDirs
```

- **Guarantee:** never enumerates a source-absent render `toDir` (e.g. `.agents/skills` does not exist in the source); those files come from `renderSurface`.

## `scripts/init/classify.js` (extended)

- Adds a **rendered-surface loop**: for each `{dest, content}` from `renderSurface(sourceDir, stack)`, run the create/skip/refresh/conflict/adopt/orphan state machine against `manifest.files[dest]`, keyed on `sha256(content)` as the "source hash". Class `FRAMEWORK`. Carries `content` on the action for apply.
- **Entrypoint dest resolution:** the user-doc entrypoint action's `dest` = `effectiveEntrypointDest(targetDir, stack)` (honored-if-present, else `dest`).
- **Guarantee:** orphan detection spans both framework-file and rendered-surface paths (a manifest entry produced by neither is an orphan).

## `scripts/init/apply.js` (extended)

- Writes rendered-surface actions: `mkdir -p dirname(dest)` + `writeFile(dest, content)` for `create`/`refresh`/`force`; `skip`/`conflict`/`adopt`/`orphan` write nothing.
- The existing manifest-inventory loop hashes written framework-owned files from disk — rendered-surface files included.
- **Guarantee:** no file outside `targetDir` is written (MCP config is a console note, not a write).

## `scripts/init/index.js` (extended)

```js
reportStackNotes(stack, log)   // after applyPlan, sibling to reportHook
```

- For `antigravity`: prints MCP/tool registration guidance (from `skills/tools.json`) referencing `~/.gemini/config/mcp_config.json`.
- **Guarantee:** console output only; writes nothing to `~/.gemini/` or outside the target repo (FR-009).

## Migrate path (analyze A3)

The rendered surface flows through the **shared** `classifyAll`→`applyPlan` pipeline that migrate-mode already calls (spec 002 `migrateFramework`) — the `.agents/skills/**` files are **framework-owned** and `021-`-namespaced, so they take the ordinary create/skip/conflict/adopt path and **need no `migrate/duplicates.js` branch**. (Contrast 006, where the *entrypoint* render is *user-owned* and did need a duplicate-resolution render branch — the surface files are framework-owned, so they don't.) T011 guards that migrate reaches the surface; no migrate-specific surface code is added beyond confirming the stack is threaded (already true since 006's A5 guard).

## Invariants (spec-level)

1. **`claude` golden bar** — `CLAUDE.md` + `.claude/commands/021-*.md` byte-identical to the 006 fixture. 007 touches neither claude's render path nor `.claude/commands`; `skills/*.md` frontmatter is outside the golden set.
2. **Neutral-core invariant** — `claude` vs `antigravity` trees differ only in Layer-2 (`.claude/commands/**`+`CLAUDE.md` vs `.agents/skills/**`+`AGENTS.md`); Layer-1 (incl. frontmatter'd `skills/*.md`) byte-identical. Carve-outs per 006.
3. **Idempotent re-run** — a second install with an unchanged manifest is all `skip`; `--upgrade` refreshes only the recorded stack's surface.
4. **Un-chosen stacks install nothing** — proven per-cell and cross-cell.
