# Implementation Plan: Kiro Adapter & Engine Dispatch

*The HOW for [spec.md](spec.md). Two halves. **(A) Install adapter** — un-reserve `kiro`, render `.kiro/steering/021-*.md` + `.kiro/agents/021.json` + materialized `.kiro/` skills via the [spec 007](../007-antigravity-adapter/spec.md) `surface.js` (new `kind`s `steering`/`agent-json`, reused `kind:'skill'`), with an **entrypoint-less** stack. **(B) Engine dispatch** — a per-engine module behind a small interface, so `scripts/speckit/*` + the gate resolve spec state from `.kiro/specs/<feature>/…` under `tools.ssd = kiro-specs`, and exactly today's `specs/NNN-*/spec.md` under `github-speckit` (default). Reuses the 006/007 install pipeline and the spec 003 `manifestFacts` seam.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/init/`, `scripts/speckit/`, `bin/init.js`) + POSIX sh (`hooks/pre-commit`) |
| **Dependencies** | **None** — `fs`/`path`/`JSON` string transforms; steering/agent/EARS emitted as plain text (FR-011) |
| **New modules** | `scripts/speckit/engines/github-speckit.js` + `engines/kiro-specs.js` (SSD engine interface); steering/agent handling in `scripts/init/surface.js` |
| **New content** | steering templates `templates/kiro-steering/021-{product,tech,structure}.md`; agent template `templates/kiro-agent/021.json` |
| **Changed modules** | `adapters.js` (kiro entry, un-reserve), `classes.js`/`sources.js`/`classify.js` (entrypoint-optional), `surface.js` (`steering`/`agent-json` kinds), `speckit/lib.js` (engine dispatch + `manifestFacts.ssd`), the 4 speckit scripts (consume engine metadata), `hooks/pre-commit` (`.kiro/` in the exclude set), `sync-to-package.js` |
| **Reuses** | 006 registry + stack-parameterized surface + golden bar; 007 `surface.js` (`kind:'skill'`, `frameworkSourceDirs`/render-`toDir` split); 002 `.kiro/` detection; 003 `manifestFacts` |
| **Testing** | `node:test` — kiro install surface, 3-stack neutral-core invariant, engine dispatch (both engines) at the `lib.js` seam + the 4 scripts, gate on a `kiro-specs` fixture, `github-speckit` regression |
| **Source of truth** | TDD §9.2 (Kiro mapping), §9.3 (`kiro-specs` engine contract), §7 (`tools.ssd`) |

## Constraints check (must hold)

- **`github-speckit` regression bar** — with `tools.ssd` absent/`github-speckit`, every script + the gate behave exactly as today; the current `specs/NNN-*/spec.md` layout is the extracted `github-speckit` engine, unchanged in behavior (FR-009). The dogfood repo stays `github-speckit`.
- **006/007 install unchanged** — `claude` golden fixture + `antigravity` `.agents/` surface byte-identical; `kiro` adds only `.kiro/**` (FR-006).
- **3-stack neutral-core invariant** — clean installs differ only in each stack's Layer-2; Layer-1 byte-identical (006 carve-outs).
- **Zero dependencies** — `fs`/`path`/`JSON` only; steering/agent/status frontmatter emitted as plain text (FR-011).
- **No writes outside the target** — install writes only under the target; the engine reads/writes only `.kiro/specs` / `specs/` in the repo.
- **Additive to 001/003/005** — manifest schema unchanged (`tools.ssd` already present); `manifestFacts` gains a read-only `ssd` field; pipeline + gate semantics preserved.

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | Kiro adapter shape (entrypoint-less, `surfaceRenders` kinds); the SSD engine interface + `docs` name-map; the `.kiro/specs` layout |
| [contracts/install-surface.md](contracts/install-surface.md) | `adapters.js` kiro entry + `surface.js` `steering`/`agent-json` + entrypoint-optional `classes`/`sources`/`classify` |
| [contracts/engine-dispatch.md](contracts/engine-dispatch.md) | The `engines/*` interface, `lib.js` delegation, `manifestFacts.ssd`, and the per-consumer changes (+ the gate) |
| [research.md](research.md) | The 2 deferred decisions resolved + the engine-interface shape, `manifestFacts.ssd`, hook change, rejected alternatives |
| [quickstart.md](quickstart.md) | Per-stack + per-engine validation walkthrough |

## Part A — the install adapter

### A1. Un-reserve + entrypoint-less kiro (FR-001)

`adapters.js`: drop `kiro` from `RESERVED`; add its entry with **no `entrypoint`** (steering is the surface). Every `.entrypoint` access null-guards:

```js
kiro: {
  // no entrypoint — steering is the instruction surface
  surfaceDirs: [],
  surfaceRenders: [
    { fromDir: 'templates/kiro-steering', match: '021-*.md', toDir: '.kiro/steering', kind: 'steering' },
    { fromDir: 'templates/kiro-agent',    match: '021.json', toDir: '.kiro/agents',   kind: 'agent-json' },
    { fromDir: 'skills', match: '*.md', exclude: ['_INDEX.md'], toDir: '.kiro/skills', kind: 'skill' }, // reuse 007
  ],
}
```

- `classes.js userFiles(stack)` → `const ep = getAdapter(stack).entrypoint; return [...(ep ? [ep.dest, ...(ep.honored||[])] : []), ...COMMON]`.
- `sources.js userDocMappings(stack)` → entrypoint render mapping only when `ep` exists; kiro yields just the common guiding docs + requirements (Layer-1, stack-invariant).
- `classify.js` → null-guard the `entrypoint`/`honoredDest` resolution.

Kiro gets the common user docs (`CODE`/`PRODUCT`/`DESIGN`/`README` + `requirements/*`) — stack-invariant Layer-1 — and **no** `CLAUDE.md`/`AGENTS.md`.

### A2. `surface.js` new kinds (FR-002/003/004)

- **`kind:'steering'`** — flat relocate: `templates/kiro-steering/021-<x>.md` → `.kiro/steering/021-<x>.md` (keep filename, content passthrough — the template already carries the Kiro inclusion-mode frontmatter). *Not* the 007 skill shape (no `021-<name>/SKILL.md` subdir).
- **`kind:'agent-json'`** — relocate `templates/kiro-agent/021.json` → `.kiro/agents/021.json` (content passthrough; the template is authored with `prompt`/`resources`/`hooks` and `skill://` refs to the materialized skills).
- **`kind:'skill'`** — reused verbatim from 007, `toDir: '.kiro/skills'` → `.kiro/skills/021-<name>/SKILL.md`.

`renderDescriptor` dispatches on `kind`; steering/agent-json are simple relocations (dest = `toDir/basename`), skill keeps its subdir+SKILL.md mapping.

### A3. Steering + agent templates (new content)

Author `templates/kiro-steering/021-{product,tech,structure}.md` — stable framework operating guidance (product = the 021 lifecycle/how key docs work; tech = `CODE.md`/TDD conventions; structure = the `workflows.md` summary), each with its inclusion-mode frontmatter (`inclusion: always` for product/tech; `fileMatch` where scoped). Author `templates/kiro-agent/021.json` — the CLI agent (`prompt: file://` guiding docs, `resources` globs → key docs, `hooks`, `skill://` → `.kiro/skills/021-*`).

## Part B — the engine dispatch

### B1. The engine interface (`scripts/speckit/engines/*.js`) — FR-007

Each engine is a plain object:

```js
{
  id,                       // 'github-speckit' | 'kiro-specs'
  specsDir(root),           // 'specs' | '.kiro/specs'
  listSpecs(root),          // feature dir names
  specPath(name, root),     // the feature dir
  docs: { primary, plan, tasks },   // filenames: spec.md/plan.md/tasks.md | requirements.md/design.md/tasks.md
  contextFiles,             // ordered list for the context bundle
  requiredArtifacts,        // verify C1: ['plan.md','tasks.md'] | ['design.md','tasks.md']
  readStatus(name, root),   // github: spec.md frontmatter/inline · kiro: requirements.md frontmatter
  writeStatus(name, status, root),
}
```

`github-speckit.js` is today's `lib.js` logic extracted verbatim (the regression bar). `kiro-specs.js` reads `.kiro/specs/<feature>/requirements.md` for `status:` (inject/update there), `design.md` as the plan doc, `tasks.md` for progress.

### B2. `lib.js` delegation + `manifestFacts.ssd`

- `manifestFacts` gains `ssd: (manifest.tools && manifest.tools.ssd) || 'github-speckit'` (default preserves current behavior).
- `engineFor(root) = manifestFacts(root).ssd === 'kiro-specs' ? kiroSpecs : githubSpeckit`.
- `listSpecs`/`specPath`/`readStatus`/`writeStatus` become thin delegators to `engineFor(root)`. `resolveSpec` (uses `listSpecs`) works unchanged. `countTasks`/`extractCriteria` stay in `lib.js` (engine-agnostic text functions).

### B3. Consumer changes (shape unchanged)

- `spec-status.js` — delegates via `lib`; "spec.md missing" wording → `engine.docs.primary`.
- `fetch-speckit-context.js` — `FILE_ORDER` → `engine.contextFiles`; reads `specDir/engine.docs.primary` (criteria source) + `engine.docs.tasks`.
- `verify-spec-compliance.js` — `'spec.md'`/`'plan.md'`/`'tasks.md'` literals → `engine.docs.*`; C1 required set → `engine.requiredArtifacts`.
- `doctor.js` — `specPath/spec.md` → `engine.docs.primary`; `tasks.md` → `engine.docs.tasks`.
- `hooks/pre-commit` — add `.kiro/` to the implementation-exclude set (line 41) and `.kiro/specs/` to the spec-change Notice (line 25) so kiro spec/steering edits aren't treated as implementation; it still calls `verify-spec-compliance.js`, which now resolves the engine (FR-008).

## Package sync (FR-012)

`sync-to-package.js` ships `scripts/speckit/engines/*`, `scripts/init/surface.js` (already synced), and the new `templates/kiro-*` (under the synced `templates/`). `npm run sync:package -- --check` green.

## Testing strategy

- **kiro install** — `.kiro/steering/021-{product,tech,structure}.md` + `.kiro/agents/021.json` + `.kiro/skills/021-*/SKILL.md`; no `CLAUDE.md`/`.claude/`, no `AGENTS.md`/`.agents/`; manifest `stack=kiro`, `ssd=kiro-specs`; `getAdapter('kiro')` no longer throws.
- **3-stack neutral-core invariant** — extend the 006 T006 predicate with `.kiro/`.
- **engine dispatch** — a `kiro-specs` fixture (`.kiro/specs/<feature>/{requirements,design,tasks}.md` + a `ssd:kiro-specs` manifest): `readStatus`/`writeStatus` hit `requirements.md`; `listSpecs`/`countTasks`/context resolve `.kiro/specs`. A `github-speckit` fixture proves the default path is byte-unchanged.
- **gate** — implementation change on a `kiro-specs` repo with a non-gate-passing feature blocks; gate-passing permits.
- **regression** — full 001–007 suite green; the dogfood repo (`github-speckit`) unaffected.

## Work breakdown

See [tasks.md](tasks.md).
