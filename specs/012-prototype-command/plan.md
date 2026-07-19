# Implementation Plan: Optional Prototype Command (`021-prototype`)

*The HOW for [spec.md](spec.md). A thin `scripts/prototype.js` (scaffold a bare themed `prototype/{index.html,styles.css,app.js}` skeleton, zero-dep) behind a **`021 prototype init [--force]`** dispatcher route, driven by a `.claude/commands/021-prototype.md` walkthrough that fleshes the screens out from the PRD/EDD. The starter CSS `@import`s the spec-011 design-system tokens (or inlines `:root` under `none`). Wire-in is **emergent** — no edits to `run-qa.sh` / `prototype-sync.md` / `workflow-status.js`. Mirrors [spec 010](../010-feedback-command/spec.md) / [spec 011](../011-design-command/spec.md).*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/prototype.js`), dispatched via `bin/021.js` (spec 009) |
| **Dependencies** | **None** (FR-008) — `fs`/`path` only. No bundler, no framework; the prototype is plain static HTML/CSS/JS |
| **New files** | `scripts/prototype.js`; `.claude/commands/021-prototype.md` |
| **Changed** | `bin/021.js` (+`prototype` route + usage line); `scripts/_INDEX.md`; `test/…` (new + two expectation-list folds); `package/**` via `sync:package` |
| **Reuses** | `scripts/init/manifest.js` → `loadManifest` (resolve `tools.design`); `scripts/speckit/lib.js` → `repoRoot`; the spec-007 `.claude/commands` → surface render (cross-stack) |
| **Runtime-created (not install surface)** | `prototype/{index.html,styles.css,app.js}` (+ `_INDEX.md`) in the invoking project — **init does not create `prototype/`** |
| **Unchanged (emergent wire-in)** | `scripts/run-qa.sh` (prototype tier already gates on `prototype/*.html`); `prototype-sync.md` (gates on `> _INDEX.md`); `workflow-status.js` (does not gate on a prototype) |
| **Testing** | `node:test` — scaffold writes the three files; CSS `@import`s tokens when a system is set vs inline `:root` under `none`; non-destructive refuse-without-`--force`; `--force` overrides; presence flips the run-qa tier; dispatch route; cross-stack render |
| **Source of truth** | TDD §12 (Optional Prototype Command); key-docs-to-prototype / prototype-sync workflows |

## Constraints check (must hold)

- **LLM drives, script executes** — `scripts/prototype.js` scaffolds the deterministic themed skeleton; the `/021-prototype` surface reads the PRD/EDD and builds the real screens. The script **never parses the EDD** (keeps it zero-dep).
- **Emergent wire-in** (FR-005) — the command writes **only** under `prototype/`. It does **not** edit `run-qa.sh`, `prototype-sync.md`, or `workflow-status.js`; those already presence-detect (`prototype/*.html`; `> _INDEX.md`). Verified: `run-qa.sh:64` gates the tier on `ls prototype/*.html`.
- **`prototype/` is runtime-created** — init does not scaffold it (no `prototype` reference in `scripts/init/**`), so `prototype.js` `mkdir -p prototype/` and seeds `_INDEX.md`; the presence threshold is "content beyond `_INDEX.md`".
- **Non-destructive** (FR-006) — refuse when `prototype/` holds content beyond `_INDEX.md` unless `--force`; report and exit non-zero, writing nothing.
- **Optional; never a gate** (FR-007) — nothing new depends on the prototype; the absence path is unchanged (run-qa INFO skip).
- **Design-system seam** (FR-004) — the CSS references the spec-011 tokens: `@import` `requirements/_design/tokens/<vars>.css` when `tools.design !== none` and that file exists; else inline `:root` from `DESIGN.md` frontmatter. A later `021-design` swap re-themes without markup changes.
- **Golden fixture holds** — a new `.claude/commands/021-prototype.md` doesn't re-baseline `claude-golden.json` (T004 byte-checks only its three pinned entries; research R4). Same as specs 010/011.
- **Zero dependencies** — built-ins only (FR-008).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | The scaffold file set + templates; the design-system CSS-reference decision; the presence/overwrite rule; the dispatcher route; file inventory + ownership |
| [contracts/prototype-command.md](contracts/prototype-command.md) | `scripts/prototype.js` CLI contract (`init [--force]`, presence check, the three files, CSS seam, exit codes); the `021 prototype` dispatch; the `/021-prototype` walkthrough |
| [research.md](research.md) | `prototype/` is not installed → mkdir; the CSS-seam mechanism (`@import` vs inline `:root`, minimal `DESIGN.md` frontmatter read); emergent-wire-in verification; overwrite threshold; golden safety; rejected alternatives |
| [quickstart.md](quickstart.md) | End-to-end: `021 prototype init` on a bare `prototype/`; themed by `material-3` vs `none`; refuse-without-`--force`; run-qa tier flips; cross-stack; `sync:package --check` |

## Approach

### A1. The mechanical script (`scripts/prototype.js`) — FR-002/004/006/008

```
node scripts/prototype.js init [--force]

root = repoRoot();  proto = root/prototype
1. presence = files under proto/ excluding _INDEX.md
   if presence.length && !force → report "prototype already exists (use --force)"; exit 1   (FR-006)
2. mkdir -p proto/ ; ensure proto/_INDEX.md exists (seed the scaffold)
3. design = loadManifest(root)?.tools.design || 'none'
   tokensCss = root/requirements/_design/tokens/<vars>.css
   themeRef  = (design !== 'none' && exists(tokensCss)) ? "@import '../requirements/_design/tokens/<vars>.css';"
             : inlineRootFromDesignFrontmatter(root/DESIGN.md)                                 (FR-004)
4. write proto/index.html   (semantic shell + <link rel=stylesheet href="styles.css">)
   write proto/styles.css   (themeRef + a few base component styles using var(--…))
   write proto/app.js       (minimal)
5. print next steps: build the real screens from the PRD/EDD, consuming the design-system vars   (FR-003)
```

- **`inlineRootFromDesignFrontmatter`** — a minimal, zero-dep read of the `DESIGN.md` frontmatter's simple maps (`colors:`, `spacing:`, `radii:`) into a `:root { --color-primary: …; … }` block, with a comment pointing at `DESIGN.md`; degrades gracefully on unfamiliar frontmatter (research R2). The assistant refines values.
- **Presence threshold** — `_INDEX.md` is the scaffold, so it does not count as "content"; anything else does (research R3).
- Zero-dep string assembly (FR-008).

### A2. Dispatcher route (`bin/021.js`) — FR-001

Add a `prototype` case mirroring the spec-011 `design` leaf pattern:
```js
case 'prototype': {
  if (rest[0] !== 'init') return null;             // usage on unknown/absent leaf
  return { runner: 'node', file: script('prototype.js'), lead: [], rest };  // sees ['init', ...flags]
}
```
…plus a `prototype init [--force]   scaffold the optional static prototype (themed by the design system)` line in `USAGE`. No logic in the dispatcher (spec-009 invariant). `--force` rides through `rest`.

### A3. Command surface (`.claude/commands/021-prototype.md`) — FR-001/003

The walkthrough:
1. Confirm the team wants a prototype (opt-in).
2. Run `npx 021 prototype init` (scaffolds the themed skeleton; `--force` if replacing).
3. Read the PRD/EDD core scenarios and build out the actual screens/flows under `prototype/`, consuming the design-system CSS variables.
4. Note that the prototype now activates the QA/refinement/design steps (presence-detected) and is re-themed by `021-design`.

**Cross-stack (FR-001):** claude gets the file; antigravity auto-renders `.agents/skills/021-prototype/SKILL.md` (spec-007 `021-*.md` surface-render, no adapter change); kiro reaches it via the `021` agent — same as `021-feedback`/`021-design`.

### A4. Package sync + indexes — FR-008 / packaging

`scripts/prototype.js` + `.claude/commands/021-prototype.md` fall under already-synced trees; `scripts/_INDEX.md` gains the `prototype.js` row; `npm run sync:package -- --check` green.

## Testing strategy

`node:test` (in `test/prototype/prototype.test.js`):
- **Scaffold** — `init` on a bare `prototype/` (only `_INDEX.md`, or absent) writes `index.html`/`styles.css`/`app.js`; `index.html` links `styles.css` (FR-002).
- **Design-system seam** — with `tools.design: material-3` and a tokens CSS file present, `styles.css` `@import`s it; with `design: none`, `styles.css` inlines a `:root` block (no `@import`) (FR-004).
- **Non-destructive** — with content beyond `_INDEX.md`, `init` without `--force` writes nothing and exits 1; `--force` overwrites (FR-006).
- **Presence flips run-qa** — after `init`, `ls prototype/*.html` succeeds (the emergent activator); asserting the tier's own gate condition (FR-005). *(the run-qa tier itself is unchanged)*
- **Dispatch** — `021 prototype init` routes to `prototype.js`; `021 prototype` / `021 prototype bogus` → usage + exit 1 (FR-001).
- **Cross-stack render** — claude has `.claude/commands/021-prototype.md`; antigravity has `.agents/skills/021-prototype/SKILL.md`; kiro installs clean (FR-001).
- **Expectation-list folds** — add `021-prototype` to `surface.test.js` `EXPECTED_COMMANDS` and `dispatch.test.js` `SURFACES.claude` (specs 010/011 pattern).
- **Regression** — full suite green; golden fixture unchanged (R4); `sync:package --check` no drift.

## Cross-artifact analysis (folded)

- **A1 — the run-qa prototype tier is Phase 0 only.** `run-qa.sh` checks `prototype/*.html` **only** in the Phase-0 (Planning) branch; Phases 1–2 don't check it. So the emergent run-qa activation is Planning-scoped (consistent with the prototype being a Planning artifact); `prototype-sync.md` (any refinement round) and the `021-design` re-theme are phase-independent. Spec FR-005 / Scenario 4 / quickstart scoped accordingly.
- **A2 — inline `:root` is best-effort; key names vary.** The template frontmatter uses `radii:`, the dogfood doc uses `rounded:`, and `typography:` is nested in both. The parse targets the reliably-flat maps (`colors:`/`spacing:`), does **not** hardcode `radii:`, skips nested maps, and adds a "refine in DESIGN.md" comment; the assistant completes it. T005 asserts non-exhaustively (a `colors:`-derived var present).
- **A3 — the `@import` couples the prototype to the repo layout.** `prototype/styles.css` `@import`s `../requirements/_design/tokens/…` (outside `prototype/`). This is required for the re-theme seam (referencing the canonical tokens file), so it is the intended design; standalone deployment of `prototype/` alone would need inlining — acceptable, since hosting/deployment is Out of Scope.
- **A4 — golden + kiro parity confirmed.** `scripts/prototype.js` is Layer-1, the command is Layer-2; `claude-golden.json` untouched (R5). kiro has no per-command skill (reached via the `021` agent — specs 010/011 pattern), asserted in T010.
- **A5 — expectation-list folds present.** `surface.test.js` `EXPECTED_COMMANDS` (T016) and `dispatch.test.js` `SURFACES.claude` (T013) both gain `021-prototype` — additive, nothing pre-existing breaks.
- **A6 — dogfood is Phase 1.** The dogfood T018 must not assert the prototype QA tier via `021 qa` (Phase 1 skips it); it exercises `prototype.js` directly in a scratch copy and confirms the repo's own `prototype/` stays `_INDEX`-only.

## Work breakdown

See [tasks.md](tasks.md).
