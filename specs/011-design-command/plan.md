# Implementation Plan: Design-System Install Command (`021-design`)

*The HOW for [spec.md](spec.md). A thin `scripts/design.js` (targeted manifest write of `tools.design` + `tokens/` scaffold + a marker-bounded `DESIGN.md` "Design System Mapping" section, zero-dep) behind a **`021 design set <system>`** dispatcher route, driven by a new **`.claude/commands/021-design.md`** walkthrough that carries the DSS judgement (assess/map values, artifact import, EDD annotation, prototype re-theme). Cross-stack render is free via the spec-007 `021-*.md` surface-render. Mirrors [spec 010](../010-feedback-command/spec.md).*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/design.js`), dispatched via `bin/021.js` (spec 009) |
| **Dependencies** | **None** (FR-012) — `fs`/`path` only. No CSS parser, no design-tooling SDK |
| **New files** | `scripts/design.js`; `.claude/commands/021-design.md` |
| **Changed** | `bin/021.js` (+`design` route + usage line); `scripts/_INDEX.md`; `test/…` (new + two expectation-list folds); `package/**` via `sync:package` |
| **Reuses** | `scripts/init/manifest.js` → `loadManifest`/`writeManifest`/`orderFields` (targeted `tools.design` write); `scripts/speckit/lib.js` → `repoRoot`; the spec-007 `.claude/commands` → surface render (cross-stack) |
| **Runtime-created (not install surface)** | `requirements/_design/tokens/` in the invoking project; the `DESIGN.md` mapping section |
| **Testing** | `node:test` — manifest write (`tools.design` set, other fields intact), `tokens/` scaffold, mapping-section replace-vs-append behind a marker, bespoke-frontmatter preserved, `none` collapse, dispatch route, cross-stack render |
| **Source of truth** | TDD §11 (Design-System Install Command), §9.4 (design adapter contract); the [DSS workflow](../../workflow/specific-workflows/design-system-selection.md) |

## Constraints check (must hold)

- **LLM drives, script executes** — `scripts/design.js` does the deterministic writes (manifest field, `tokens/` scaffold, the marker-bounded mapping-section skeleton); the `/021-design` surface carries the judgement (assess, the actual role→token values, importing the user's export, EDD annotation, prototype re-theme). Neither is end-to-end script-only.
- **Targeted manifest write, no rebuild** — `design.js` uses `loadManifest` → set `tools.design` (+ refresh `updatedAt`) → `writeManifest`; it does **not** call `buildManifest` (which would recompute `files{}`/hashes). Every other manifest field is left byte-stable.
- **Idempotent, deterministic `DESIGN.md` edit** — the "Design System Mapping" section is bounded by a stable marker and **regenerated** each run (FR-004). When no marker is present (e.g. the older bespoke `DESIGN.md`), the section is **appended** with its markers; the **bespoke frontmatter token block is never touched** (research R2).
- **Prototype optional** — the cascade writes/updates the CSS-variables file under `tokens/` and re-points an existing `prototype/`; **no-op when absent**; it never *generates* a prototype (spec 012). No dependency on spec 012 (FR-006).
- **Edits directly, surfaces the round** — `design.js` + the walkthrough apply the deterministic changes; the command **tells** the user to record them through a refinement round — it never auto-opens/closes one (FR-011).
- **Golden fixture holds** — a new `.claude/commands/021-design.md` doesn't re-baseline `claude-golden.json` (T004 byte-checks only its three pinned entries; research R4). Same as spec 010.
- **Zero dependencies** — built-ins only (FR-012).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | `DesignSelection` / `TokenMapping` shapes; the `tools.design` write; the mapping-section marker + skeleton per system; the dispatcher route row; file inventory + ownership |
| [contracts/design-command.md](contracts/design-command.md) | `scripts/design.js` CLI contract (`set <system>`, manifest write, `tokens/` scaffold, section replace/append, exit codes); the `021 design` dispatch contract; the `/021-design` walkthrough contract |
| [research.md](research.md) | Targeted-write vs `buildManifest`; the marker + append-when-absent decision (the bespoke-`DESIGN.md` case); the prototype-seam boundary; the BYO/`none`/`material-3` skeletons; golden safety; rejected alternatives |
| [quickstart.md](quickstart.md) | End-to-end: `021 design set material-3` → mapping section + `tools.design`; BYO; switch; remove → bespoke; prototype no-op; cross-stack render; `sync:package --check` |

## Approach

### A1. The mechanical script (`scripts/design.js`) — FR-002/004/005/007/012

```
node scripts/design.js set <system>            # system: none | material-3 | <byo-name>

root = repoRoot()
1. validate <system> (non-empty; free-form allowed for BYO)
2. manifest = loadManifest(root)  →  manifest.tools.design = system
   manifest.updatedAt = now       →  writeManifest(root, manifest)     (FR-007; targeted, no rebuild)
3. ensure requirements/_design/tokens/ exists (mkdir -p + a keep/_INDEX)  (FR-005 scaffold)
4. DESIGN.md "Design System Mapping" section:
     - find the marker-bounded region; REPLACE it with the system skeleton
       (material-3: md.sys.* role rows; byo: generic role rows; none: bespoke note)
     - if no marker present → APPEND the section (+ markers) after the body,
       leaving the frontmatter token block untouched                    (FR-004; research R2)
5. print next steps: assess, fill the mapping values, import the export into tokens/,
   annotate the EDD, re-theme prototype/ if present, record via a refinement round (FR-011)
```

- **Marker:** an HTML-comment pair, e.g. `<!-- 021-design:mapping start -->` … `<!-- 021-design:mapping end -->`, so the region is machine-replaceable and the user can see/keep it.
- **`none`:** collapse the mapping region to a one-line bespoke note; `tools.design: none`; the frontmatter tokens remain the source of truth (FR-010 remove).
- Zero-dep string assembly (FR-012).

### A2. Dispatcher route (`bin/021.js`) — FR-001 (surface reach)

Add a `design` case mirroring the `spec` leaf pattern (a sub-verb, `set`):
```js
case 'design': {
  if (rest[0] !== 'set') return null;              // usage on unknown/absent leaf
  return { runner: 'node', file: script('design.js'), lead: [], rest };  // design.js sees ['set', <system>]
}
```
…plus a `design set <system>   adopt/switch/remove a design system (records tools.design)` line in `USAGE`. No logic in the dispatcher (spec-009 invariant).

### A3. Command surface (`.claude/commands/021-design.md`) — FR-001/003/011, DSS

The walkthrough (assistant-driven judgement around the script):
1. **Select** — Material 3, bring-your-own, or `none`.
2. **Assess** — component availability vs the EDD, theming model, a11y defaults, export targets, licensing; unresolved → `04-BACKLOG.md` Open Questions.
3. Run `npx 021 design set <system>` (records `tools.design`, scaffolds `tokens/`, writes the mapping skeleton).
4. **Map** — fill the skeleton's role→token rows with the actual assignments; import the user's export file into `requirements/_design/tokens/` and reference it.
5. **Cascade** — write/update the CSS-variables file; if `prototype/` exists, point it at those variables; annotate affected EDD scenarios.
6. **Record** — tell the user to land the change through a refinement round with a changelog entry.

**Cross-stack (FR-001):** claude gets the file; antigravity auto-renders `.agents/skills/021-design/SKILL.md` (spec-007 `021-*.md` surface-render, no adapter change); kiro reaches it through the `021` agent's CLI wrapper — same as `021-feedback`/`021-init` (analyze parity with spec 010 A1).

### A4. Package sync + indexes — FR-012 / packaging

`scripts/design.js` + `.claude/commands/021-design.md` fall under already-synced trees; `scripts/_INDEX.md` gains the `design.js` row; `npm run sync:package -- --check` green.

## Testing strategy

`node:test` (in `test/design/design.test.js`):
- **Manifest write** — `set material-3` sets `tools.design: material-3` and refreshes `updatedAt` while every other field (version/phase/files/…) is byte-stable (FR-007).
- **Tokens scaffold** — `requirements/_design/tokens/` created on first use; idempotent on re-run (FR-005).
- **Mapping section** — on a template-shaped `DESIGN.md` the marked section is **replaced**; on a bespoke `DESIGN.md` with no marker the section is **appended** and the frontmatter block is untouched; a second run is idempotent (FR-004).
- **`none` collapse** — `set none` reduces the mapping region to the bespoke note and sets `tools.design: none` (FR-010).
- **Dispatch** — `021 design set material-3` routes to `design.js`; `021 design` / `021 design bogus` → usage + exit 1 (FR-001).
- **Cross-stack render** — claude install has `.claude/commands/021-design.md`; antigravity has `.agents/skills/021-design/SKILL.md`; kiro installs clean (FR-001).
- **Expectation-list folds** — add `021-design` to `surface.test.js` `EXPECTED_COMMANDS` and `dispatch.test.js` `SURFACES.claude` (same pattern as spec 010 A2/A3).
- **Regression** — full suite green; golden fixture unchanged (R4); `sync:package --check` no drift.

## Cross-artifact analysis (folded)

- **A1 — manifest write is safe (confirmed).** `writeManifest`→`orderFields` is a `FIELD_ORDER` whitelist including `updatedAt`/`tools`/`files`/`merged`/`hook`/`migrate`, so the targeted `tools.design` write drops no field and preserves order (T003 round-trips a `hook`+`merged` manifest to prove it).
- **A2 — `DESIGN.md` may be absent.** It is user-owned create-if-missing (`USER_FILES_COMMON`), so a project can invoke `021 design` with no `DESIGN.md`; `design.js` **creates it from `templates/DESIGN-Template.md`** before appending the mapping section (T010/T005).
- **A3 — scaffold hygiene.** The `tokens/` keep file is **link-free** so `check-links` stays clean; the dogfood run (T017) removes the created `tokens/` dir on restore.
- **A4 — parity confirmed.** kiro has no per-command skill (reached via the `021` agent — same as spec 010 A1); the golden fixture is untouched (research R4 = spec 010 A6). No change needed.
- **A5 — two usage sources.** `021 design`/`021 design bogus` → dispatcher usage; `021 design set` (no system) → `design.js` usage. T008 asserts both.
- **A6 — walkthrough-only scenarios.** Acceptance Scenario 4 (cascade re-theme / prototype no-op) and Scenario 7 (deliberate, recorded) are **C3 walkthrough behavior**, not mechanical — the script only scaffolds the CSS-vars location and prints next steps; the re-theme values and the refinement-round recording are assistant-driven. Their coverage is the contract (C3), intentionally not a `design.js` unit test.

## Work breakdown

See [tasks.md](tasks.md).
