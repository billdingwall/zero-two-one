# Implementation Plan: Antigravity Adapter

*The HOW for [spec.md](spec.md). Populates the `antigravity` adapter that [spec 006](../006-source-layer-renderer/spec.md) stubbed. The entrypoint render is already done by 006 (the neutral source is assistant-agnostic, so `AGENTS.md` is an identity render differing only in dest filename); the real work is the **rendered skills surface** (`.agents/skills/021-<name>/SKILL.md`), the **`GEMINI.md`-conditional entrypoint**, `skills/*.md` **frontmatter**, the **MCP post-install note**, and the **migrate wire-through**. Reuses the spec 001 classify→apply→manifest pipeline; adds one new seam — a rendered Layer-2 surface — that 008 (Kiro) extends.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/init/` engine, `bin/init.js`) |
| **Dependencies** | **None** — `fs`/`path` string transforms; `SKILL.md` frontmatter emitted as plain text (FR-010) |
| **New modules** | `scripts/init/surface.js` — `renderSurface(sourceDir, stack) → [{ dest, content }]` (the rendered Layer-2 surface) |
| **Changed modules** | `adapters.js` (`surfaceRenders` + `entrypoint.honored`), `classes.js` (own the render `toDir`s; `userFiles` includes honored entrypoints), `sources.js` (`frameworkSourceDirs` for enumeration), `classify.js` (rendered-surface plan loop + `GEMINI.md` dest resolution), `apply.js` (write the rendered surface), `index.js` (MCP post-install note), `sync-to-package.js` |
| **New content** | YAML `name`/`description` frontmatter added to the 8 `skills/*.md` prompt files (FR-002) |
| **Reuses** | spec 001 classify→apply→manifest state machine (create/skip/refresh/conflict/adopt); spec 002 stack detection (`migrate/detect.js:132`); spec 006 `getAdapter`, `render.js`, stack-parameterized `classify` |
| **Testing** | `node:test` — antigravity surface render, `GEMINI.md` honoring, neutral-core invariant (incl. skills surface), `claude` golden-fixture still green, migrate wire-through |
| **Source of truth** | TDD §9.2 (Antigravity mapping), §9.1 (source layer); repo-refactor §2.2 P3/P4 |

## Constraints check (must hold)

- **`claude` byte-identical** — the 006 golden fixture (`CLAUDE.md` + `.claude/commands/021-*.md`) stays green. 007 never touches claude's render path or `.claude/commands`; the frontmatter added to `skills/*.md` is **not** in the golden set, so it cannot perturb the bar.
- **Neutral-core invariant (extended)** — `claude` vs `antigravity` clean installs differ **only** in Layer-2 paths (`.claude/commands/**` + `CLAUDE.md` vs `.agents/skills/**` + `AGENTS.md`). The frontmatter'd `skills/*.md` are Layer-1 — identical on both sides. Same carve-outs as 006 (manifest, empty `.ai/context`, merged `package.json`/`.gitignore`). *(analyze A4: antigravity therefore ships the skills content twice — flat `skills/*.md` as the Layer-1 source **and** rendered `.agents/skills/**` as the native surface; the flat copy must ship or a Layer-1 dir would differ across stacks. See data-model §3.)*
- **Un-chosen stacks install nothing** — no `.agents/` path created/refreshed/owned under `claude`; no `.claude/commands`/`CLAUDE.md` under `antigravity` (FR-006).
- **No writes outside the target repo** — the MCP note is console output only; nothing written to `~/.gemini/` (FR-009).
- **Zero dependencies** — text transforms only; frontmatter is hand-emitted YAML text (FR-010).
- **Additive to spec 001/006** — pipeline shape, ownership classes, manifest schema unchanged; 001/002/006 tests stay green.

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | Adapter shape v2 (`surfaceRenders`, `entrypoint.honored`); the rendered-surface action; the `SKILL.md` shape |
| [contracts/adapter-surface.md](contracts/adapter-surface.md) | `surface.js` API + `adapters.js` v2 + the `classes.js`/`classify.js`/`apply.js` changes & guarantees |
| [research.md](research.md) | The two deferred decisions resolved (surface mechanism; command source), the frontmatter-source asymmetry, minimal token map, rejected alternatives |
| [quickstart.md](quickstart.md) | Per-stack validation (install antigravity, assert the skills tree + GEMINI honoring, diff vs claude) |

## Approach

The pipeline keeps its shape. One new **surface kind** joins the existing two (verbatim framework-file copy; user-doc render/instantiate): a **rendered Layer-2 surface** whose files are *produced by a transform*, not enumerated from a source dir.

```
initFramework(targetDir, opts)
  stack = resolveTools(...).stack            // 'antigravity'
  adapter = getAdapter(stack)                // now carries surfaceRenders + entrypoint.honored

  plan = classifyAll({ sourceDir, targetDir, manifest, opts, stack })
     frameworkFiles(sourceDir, stack)        // frameworkSourceDirs: LAYER1 + surfaceDirs (NOT render toDirs)
     renderSurface(sourceDir, stack)         // NEW → [{dest, content}] for .agents/skills/021-*/SKILL.md
        → each classified FRAMEWORK, state machine keyed on content-hash vs manifest
     userDocMappings(sourceDir, stack)        // entrypoint dest resolved: GEMINI.md if present else AGENTS.md

  applyPlan(plan)
     framework-file copies      → unchanged (spec 001)
     rendered-surface writes     → NEW: mkdir + writeFile(content); recorded in manifest files inventory
     entrypoint render           → render.js (identity for antigravity), into the resolved dest
  reportStackNotes(stack)        → NEW: antigravity MCP registration console note (FR-009)
```

`classify()` gains the render `toDir`s (`.agents/skills`) as framework-owned **dest** dirs so the state machine, `--upgrade` refresh, and un-chosen-stack exclusion all work for free — but `frameworkFiles` walks only real **source** dirs, so it never tries to enumerate the (source-absent) `.agents/skills`.

## The rendered-surface seam (FR-001) — decision A

`adapters.js` stays declarative; a new `surface.js` holds the transform. The antigravity entry:

```js
antigravity: {
  entrypoint: { template: 'ASSISTANT-Template.md', dest: 'AGENTS.md', honored: ['GEMINI.md'] },
  surfaceDirs: [],                                  // no verbatim-copy dirs
  surfaceRenders: [                                  // NEW — rendered Layer-2 surface
    { fromDir: 'skills',          match: '*.md', exclude: ['_INDEX.md'], toDir: '.agents/skills', kind: 'skill' },
    { fromDir: '.claude/commands', match: '021-*.md',                    toDir: '.agents/skills', kind: 'command' },
  ],
}
```

`surface.js`:

```js
renderSurface(sourceDir, stack) → [{ dest, content }]
  for each render in getAdapter(stack).surfaceRenders:
    for each source file matched under render.fromDir:
      name = basename → 021-<name>            // already 021- for commands; prefix for skills
      dest = `${render.toDir}/${name}/SKILL.md`
      content = kind==='skill'   ? readFile (frontmatter already in source)         // FR-002
              : kind==='command' ? synthesizeFrontmatter(name, body) + body         // golden-pinned source, see research
```

`classify.js` gets a **rendered-surface loop** parallel to the framework-file loop: it runs the same create/skip/refresh/conflict/adopt state machine, but the "source hash" is `sha256(content)` from `renderSurface` (not a source file). `apply.js` writes the `{dest, content}` for create/refresh/force and the existing manifest-inventory loop hashes them from disk (they are framework-owned).

## The `GEMINI.md`-conditional entrypoint (FR-004) — decision from clarify

- `adapters.js`: `entrypoint.honored: ['GEMINI.md']`.
- `classes.js userFiles(stack)` = `[entrypoint.dest, ...(entrypoint.honored||[]), ...USER_FILES_COMMON]` → both `AGENTS.md` and `GEMINI.md` are user-owned under antigravity.
- `classify.js`: resolve the entrypoint's **effective dest** from target state — first `honored` file that exists in `targetDir`, else `entrypoint.dest`. Create-if-missing then does the right thing: `GEMINI.md` present → SKIP (honored, untouched); absent → `AGENTS.md` CREATE (rendered).

## Skills frontmatter (FR-002) & the command asymmetry — decision B

- The 8 `skills/*.md` prompt files each gain YAML `name: 021-<name>` / `description:` frontmatter **at rest** (per clarify). `kind:'skill'` render is then a relocate-and-rename (content passes through).
- The 2 lifecycle commands source from `.claude/commands/021-*.md`, whose bytes are **golden-pinned** (006 FR-010) and therefore cannot gain frontmatter. `kind:'command'` **synthesizes** the `SKILL.md` frontmatter at render time (name from filename, description from the first heading/line). See [research.md](research.md) R2 for why this asymmetry is correct and minimal. No neutral command source is introduced — claude's `.claude/commands` verbatim copy is untouched.

## The entrypoint token map (FR-003) — minimal by design

The neutral `ASSISTANT-Template.md` carries **no** claude-specific literals (heading is `# AI Assistant Instructions`; it references only framework npm scripts valid for every stack). So `STACK_TOKENS.antigravity` stays essentially empty — the antigravity/claude entrypoint difference is the **dest filename**, not the body. The token map remains the extension point (008/Kiro may use it), but 007 adds little or nothing to it; no source generalization is required to hold the golden bar.

## MCP post-install note (FR-009)

`index.js` gains a `reportStackNotes(stack, log)` step after apply (sibling to `reportHook`): for `antigravity`, print registration guidance derived from `skills/tools.json` and referencing `~/.gemini/config/mcp_config.json`. Console only — no file writes outside the target.

## Package sync (FR-011)

`sync-to-package.js` ships `scripts/init/surface.js` and the frontmatter'd `skills/*.md` (already under the synced `skills/` dir). `npm run sync:package -- --check` stays green; the dogfood manifest regenerates with the new module.

## Testing strategy

`node:test` fixtures (temp source + target, per stack):
- **antigravity surface** — install → `.agents/skills/021-<name>/SKILL.md` exists for all 8 skills + `021-init`/`021-status`; each has `name`/`description` frontmatter; no `.claude/commands/`, no `CLAUDE.md`.
- **`GEMINI.md` honoring** — target seeded with `GEMINI.md` → left unchanged, no `AGENTS.md`; without it → `AGENTS.md` written.
- **`claude` golden** — 006 golden fixture still byte-identical (regression guard for the frontmatter change + the new seam).
- **neutral-core invariant** — `claude` vs `antigravity` trees differ only in Layer-2; the frontmatter'd `skills/*.md` identical on both sides.
- **classify stack-awareness** — `.agents/skills/**` framework-owned under antigravity, `null` under claude; `AGENTS.md`/`GEMINI.md` user-owned under antigravity.
- **`--upgrade`** on an antigravity manifest refreshes the `.agents/` surface; never adds claude paths.
- **migrate** — a target with `.agents/`/`AGENTS.md` and no `--stack` → detects antigravity → installs the `.agents/` surface.
- **MCP note** — antigravity install emits the note; nothing written to `~/.gemini/`.

## Work breakdown

See [tasks.md](tasks.md).
