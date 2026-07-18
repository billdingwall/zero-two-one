# Data Model: Kiro Adapter & Engine Dispatch

*Extends the [006](../006-source-layer-renderer/data-model.md) + [007](../007-antigravity-adapter/data-model.md) models. No manifest schema change — `tools.stack`/`tools.ssd` already carry `kiro`/`kiro-specs`. Additions: the **entrypoint-less adapter**, two **`surfaceRenders` kinds**, and the **SSD engine interface**.*

## 1. Kiro adapter entry (`adapters.js`)

`kiro` leaves `RESERVED`; its entry has **no `entrypoint`** (steering is the surface) and three `surfaceRenders`:

| Field | Value |
|---|---|
| `entrypoint` | *(omitted)* — an entrypoint-less stack (Open Q1 → omit, not `null`) |
| `surfaceDirs` | `[]` |
| `surfaceRenders` | steering (→ `.kiro/steering`), agent-json (→ `.kiro/agents`), skill (→ `.kiro/skills`) |

```js
kiro: {
  surfaceDirs: [],
  surfaceRenders: [
    { fromDir: 'templates/kiro-steering', match: '021-*.md', toDir: '.kiro/steering', kind: 'steering'   },
    { fromDir: 'templates/kiro-agent',    match: '021.json', toDir: '.kiro/agents',   kind: 'agent-json' },
    { fromDir: 'skills', match: '*.md', exclude: ['_INDEX.md'], toDir: '.kiro/skills', kind: 'skill' },
  ],
}
```

### Entrypoint-optional contract

`getAdapter(stack).entrypoint` may be `undefined`. All readers null-guard:

| Reader | Entrypoint present | Entrypoint absent (kiro) |
|---|---|---|
| `classes.userFiles(stack)` | `[dest, ...honored, ...COMMON]` | `[...COMMON]` |
| `sources.userDocMappings(stack)` | render mapping + instantiate mappings | instantiate mappings only |
| `classify.js` entrypoint resolution | resolve dest (honored-if-present) | skipped |

## 2. `surface.js` render kinds

| `kind` | Input | `dest` | `content` |
|---|---|---|---|
| `skill` (007) | `skills/<name>.md` | `<toDir>/021-<name>/SKILL.md` | source verbatim (frontmatter at rest) |
| `command` (007) | `.claude/commands/021-<name>.md` | `<toDir>/021-<name>/SKILL.md` | synthesized frontmatter + body |
| **`steering`** (008) | `templates/kiro-steering/021-<x>.md` | `<toDir>/021-<x>.md` | source verbatim (inclusion-mode frontmatter authored in the template) — flat relocate, **keep filename**, no subdir |
| **`agent-json`** (008) | `templates/kiro-agent/021.json` | `<toDir>/021.json` | source verbatim — flat relocate |

`steering`/`agent-json` are flat relocations (`dest = toDir/basename`); `skill`/`command` keep the per-item `021-<name>/SKILL.md` subdir shape. `renderDescriptor` dispatches on `kind`.

## 3. Framework-owned `.kiro/` dirs

`renderToDirs('kiro') = ['.kiro/steering', '.kiro/agents', '.kiro/skills']` — all framework-owned under `kiro`, `null` under any other stack (006/007 ownership split). *(analyze A3)* `.kiro/specs/` is **disjoint** from the install surface and is **not** a framework-owned install dir — it is user/engine spec state (Part B), created by the SSD workflow. `classify('.kiro/specs/**','kiro')` = `null`, so install never creates, refreshes, or clobbers a user's spec state, and the manifest `files` inventory never lists it.

*(analyze A4)* The steering/agent **templates** live under `templates/` (Layer-1), so they ship to **every** stack's `templates/` (byte-identical — required by the neutral-core invariant) **and** render to `.kiro/**` for `kiro` only. This is the same intended double-ship as 007's skills (analyze A4): a Layer-1 dir cannot vary by stack without breaking the invariant, so `claude`/`antigravity` carry the unused `templates/kiro-*` — harmless, and forced by the invariant.

## 4. SSD engine interface (`scripts/speckit/engines/*.js`)

```
SpecEngine = {
  id: 'github-speckit' | 'kiro-specs',
  specsDir(root),                       // 'specs' | '.kiro/specs'
  listSpecs(root),                      // feature dir names (github: NNN-*; kiro: <feature>)
  specPath(name, root),                 // the feature dir
  docs: { primary, plan, tasks },       // filename map (below)
  contextFiles: string[],               // ordered docs for the context bundle
  requiredArtifacts: string[],          // verify C1 required-once-gate-passing
  optionalArtifacts: string[],          // verify C2 warn-only set (analyze A2)
  readStatus(name, root) -> string|null,
  writeStatus(name, status, root) -> void,
}
```

*(analyze A2)* `optionalArtifacts` parameterizes verify's C2 warn-only check (`github`: `['data-model.md','contracts']`; `kiro`: `[]`), so a `kiro-specs` repo doesn't spuriously warn about github-only artifacts. `resolveSpec` (in `lib.js`, engine-agnostic) keeps its **github-`NNN-`-shaped** branch/numeric-id heuristic; under `kiro-specs`, features resolve by **explicit name** (the `\d{3}` id/branch shortcuts simply don't match Kiro's feature-named dirs — acceptable degradation, documented).

### `docs` filename map

| Role | `github-speckit` | `kiro-specs` |
|---|---|---|
| `primary` (status + acceptance criteria) | `spec.md` | `requirements.md` |
| `plan` | `plan.md` | `design.md` |
| `tasks` | `tasks.md` | `tasks.md` |
| `contextFiles` | `spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md` (+ `contracts/`, `checklists/`) | `requirements.md, design.md, tasks.md` |
| `requiredArtifacts` | `['plan.md','tasks.md']` | `['design.md','tasks.md']` |
| `optionalArtifacts` (C2 warn) | `['data-model.md','contracts']` | `[]` |

`countTasks`/`extractCriteria` stay engine-agnostic in `lib.js` (they take text; the engine supplies the path via `docs`).

## 5. `kiro-specs` layout & status

```
.kiro/specs/<feature>/
  requirements.md   # EARS; status: injected/updated in YAML frontmatter (Kiro tolerates extra keys)
  design.md         # the "how" (plan analogue)
  tasks.md          # checkbox tasks — countTasks reads these
```

`readStatus` reads `status:` from `requirements.md` frontmatter; `writeStatus` injects/updates it there (same frontmatter logic as the github engine, retargeted). `listSpecs` enumerates `.kiro/specs/*/` dirs (no `NNN-` filter — Kiro uses feature names).

## 6. `manifestFacts` addition (`lib.js`)

`manifestFacts(root)` gains a read-only `ssd` field: `(manifest.tools && manifest.tools.ssd) || 'github-speckit'`. `engineFor(root)` selects the engine from it. *(analyze A5)* The default `github-speckit` must hold on **both** the manifest branch (`ssd` key absent) **and** the `inferFacts` branch (no manifest at all — `inferFacts` should carry `ssd: 'github-speckit'` for consistency); `engineFor` treats anything `!== 'kiro-specs'` as `github-speckit`, so an absent/undefined `ssd` is safe either way. This preserves pre-mvp-4 and `claude`/`antigravity` behavior.

## 7. Artifacts touched

| Artifact | Change |
|---|---|
| `scripts/init/adapters.js` | kiro entry; un-reserve (`RESERVED` loses `kiro`) |
| `scripts/init/surface.js` | `steering` + `agent-json` kinds |
| `scripts/init/{classes,sources,classify}.js` | entrypoint-optional null-guards |
| `templates/kiro-steering/021-{product,tech,structure}.md`, `templates/kiro-agent/021.json` | **New** content |
| `scripts/speckit/engines/{github-speckit,kiro-specs}.js` | **New** engine modules |
| `scripts/speckit/lib.js` | `engineFor` + delegation; `manifestFacts.ssd` |
| `scripts/speckit/{spec-status,verify-spec-compliance,fetch-speckit-context,doctor}.js` | consume `engine.docs`/`contextFiles`/`requiredArtifacts` |
| `hooks/pre-commit` | `.kiro/` in the implementation-exclude set |
| `.zero-two-one.json` | dogfood repo stays `claude`/`github-speckit` — regenerate picks up new modules only |
