# Data Model: Antigravity Adapter

*Extends the [spec 006 data model](../006-source-layer-renderer/data-model.md). No manifest schema change — `tools.stack` already carries `antigravity`. The additions are the **adapter shape v2**, a **rendered-surface action**, and the **`SKILL.md`** artifact.*

## 1. StackAdapter shape v2 (`scripts/init/adapters.js`)

006 fields (`entrypoint.{template,dest}`, `surfaceDirs`) plus:

| Field | Type | Meaning |
|---|---|---|
| `entrypoint.honored` | string[] (optional) | Target files that, **if present**, are treated as the entrypoint instead of `dest` (FR-004). `antigravity` = `['GEMINI.md']`. Both `dest` and every `honored` path are user-owned (create-if-missing). |
| `surfaceRenders` | RenderDescriptor[] (optional) | Rendered Layer-2 surfaces — files **produced by a transform**, not copied from a source dir (FR-001). |

### RenderDescriptor

| Field | Type | Meaning |
|---|---|---|
| `fromDir` | string (source relpath) | Where the input files live in the source root (`skills`, `.claude/commands`). |
| `match` | pattern string | Which files under `fromDir` (`*.md`, `021-*.md`). *(analyze A6: interpreted by a built-in suffix/prefix mini-matcher in `surface.js`, **not** a glob dependency — holds the zero-dep constraint, FR-010.)* |
| `exclude` | string[] (optional) | Basenames to skip (`_INDEX.md`). |
| `toDir` | string (target relpath) | The framework-owned **dest** dir the surface writes into (`.agents/skills`). |
| `kind` | `'skill' \| 'command'` | Transform selector (see §3). 008 adds `'steering'`, `'agent-json'`. |

### The antigravity entry

```js
antigravity: {
  entrypoint: { template: 'ASSISTANT-Template.md', dest: 'AGENTS.md', honored: ['GEMINI.md'] },
  surfaceDirs: [],
  surfaceRenders: [
    { fromDir: 'skills',           match: '*.md', exclude: ['_INDEX.md'], toDir: '.agents/skills', kind: 'skill'   },
    { fromDir: '.claude/commands', match: '021-*.md',                     toDir: '.agents/skills', kind: 'command' },
  ],
}
```

`claude` is unchanged (no `honored`, no `surfaceRenders`) — its `.claude/commands` stays a verbatim `surfaceDirs` copy. `kiro` remains reserved (throws).

## 2. Framework dirs: source vs owned (`scripts/init/classes.js`)

`surfaceDirs` conflated two roles in 006 (source enumeration + dest ownership); they now split:

| Function | Set | Consumed by |
|---|---|---|
| `frameworkSourceDirs(stack)` | `LAYER1_DIRS ∪ adapter.surfaceDirs` | `sources.frameworkFiles` (walks real source dirs) **and** classify ownership |
| render `toDir`s | `adapter.surfaceRenders[].toDir` | classify ownership **only** (not walked — source-absent) |
| `frameworkDirs(stack)` (ownership) | `frameworkSourceDirs(stack) ∪ renderToDirs(stack)` | `classify()` |

For `claude`, `surfaceRenders` is empty ⇒ `frameworkDirs == frameworkSourceDirs == LAYER1 ∪ ['.claude/commands']` — **no change** (golden-safe).

## 3. The rendered-surface transform (`scripts/init/surface.js`)

`renderSurface(sourceDir, stack) → [{ dest, content }]`, sorted by `dest`:

| `kind` | Input | `dest` | `content` |
|---|---|---|---|
| `skill` | `skills/<name>.md` (frontmatter added at rest, FR-002) | `.agents/skills/021-<name>/SKILL.md` | the source file verbatim (relocate + rename) |
| `command` | `.claude/commands/021-<name>.md` (golden-pinned; no frontmatter) | `.agents/skills/021-<name>/SKILL.md` | **synthesized** `---\nname: 021-<name>\ndescription: <first heading/line>\n---\n` + body |

Naming (§6 convention): skills gain the `021-` prefix (`generate-prd` → `021-generate-prd`); commands are already `021-`-named.

**Both surfaces share `.agents/skills/` without collision** — skill names (`021-generate-*`, `021-verify-*`, …) and command names (`021-init`, `021-status`) are disjoint.

*(analyze A4)* **An antigravity install ships the skills content twice, by design:** the flat `skills/*.md` (Layer-1 **source**, in `LAYER1_DIRS` — must be byte-identical across stacks, so it ships for antigravity too or the neutral-core invariant breaks) **and** the rendered `.agents/skills/021-*/SKILL.md` (Layer-2 **native-discovery** surface). The flat copy is the shared source; the rendered copy is what Antigravity consumes. This is not duplication to eliminate — dropping the flat `skills/` for antigravity would make a Layer-1 dir differ across stacks and violate the invariant.

## 4. Plan action: rendered-surface (`scripts/init/classify.js`)

A loop parallel to the framework-file loop, class `FRAMEWORK`, same state machine — but keyed on **content hash**, not a source-file hash:

| Condition | Action |
|---|---|
| dest absent in target | `create` |
| present, no manifest baseline | `adopt` (never overwrite) |
| present, hash == manifest hash, `--upgrade` & content differs | `refresh` |
| present, hash == manifest hash | `skip` |
| present, hash != manifest hash | `conflict` (hand-modified) |
| in manifest, no longer produced | `orphan` (drops from inventory) |

`apply.js` writes `content` for `create`/`refresh`/`force`; the existing inventory loop (apply.js:78-83) hashes the written files from disk (framework-owned) into the manifest `files`.

## 5. Entrypoint dest resolution (FR-004)

`effectiveEntrypointDest(targetDir, stack)` = the first `entrypoint.honored` file that exists under `targetDir`, else `entrypoint.dest`. Resolved in `classify.js` when building the user-doc entrypoint action, so the plan carries the right dest and class:

| Target state (antigravity) | Effective dest | Action |
|---|---|---|
| `GEMINI.md` present | `GEMINI.md` | `skip` (user-owned, present — honored, untouched) |
| no `GEMINI.md` | `AGENTS.md` | `create` (rendered) if absent, else `skip` |

## 6. Artifacts touched

| Artifact | Change |
|---|---|
| `scripts/init/adapters.js` | antigravity `surfaceRenders` + `entrypoint.honored` (§1) |
| `scripts/init/surface.js` | **New** — `renderSurface` (§3) |
| `scripts/init/classes.js` | `frameworkSourceDirs` split; `frameworkDirs` = source ∪ render toDirs; `userFiles` includes `honored` (§2, §5) |
| `scripts/init/sources.js` | `frameworkFiles` walks `frameworkSourceDirs` (not render toDirs) |
| `scripts/init/classify.js` | rendered-surface loop (§4) + entrypoint dest resolution (§5) |
| `scripts/init/apply.js` | write the rendered surface |
| `scripts/init/index.js` | `reportStackNotes` — antigravity MCP note |
| `skills/*.md` (×8) | YAML `name`/`description` frontmatter added at rest (FR-002) |
| `.zero-two-one.json` `files` | dogfood repo is `claude` — unaffected by the antigravity surface; picks up the new `surface.js` module + frontmatter'd skills on regen |
