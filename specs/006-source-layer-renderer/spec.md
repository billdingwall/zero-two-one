---
status: Done
feature: Source Layer & Stack-Parameterized Renderer
release: mvp-4
branch: 006-source-layer-renderer
created: 2026-07-17
---

# Feature Spec: Source Layer & Stack-Parameterized Renderer

*The first feature of [mvp-4 — AI-Led Init & Stack/Design Adapters](../../requirements/_releases/mvp-4.md), and the seam the rest of the release is built on. It realizes **Layer 1 (neutral core) + the Layer-2 rendering seam** of the three-layer model ([_notes/repo-refactor.md](../../requirements/_notes/repo-refactor.md) §3.1, TDD §9.1): a tool-neutral `templates/ASSISTANT-Template.md` **source**, a zero-dependency **renderer** that transforms it into the chosen stack's entrypoint, and a **stack-parameterized install surface** — `classes.js`/`sources.js` resolve which dirs and guiding docs install from the manifest `tools.stack` instead of hard-wiring `.claude/commands` + `CLAUDE.md`. Specs `007` (Antigravity), `008` (Kiro) and `009` (`021` CLI) — not yet drafted — plug into the seam this spec opens.*

## Why

The install engine (specs [001](../001-safe-install-engine/spec.md)/[002](../002-migrate-mode/spec.md)) is hard-wired to the `claude` stack. `classes.js FRAMEWORK_DIRS` unconditionally includes `.claude/commands`, and `sources.js userDocMappings` unconditionally instantiates `CLAUDE.md` — so a `--stack kiro` or `--stack antigravity` user still receives the Claude command surface and a `CLAUDE.md`, and no neutral entrypoint ships at all (repo-refactor §2.2 P2/P3). This was a deliberate FR-017 deferral to mvp-4; it is now the central refactor the release exists for.

The fix is the source-layer inversion promised in TDD §9.1: `CLAUDE.md` should be **one rendering** of a neutral source (`ASSISTANT-Template.md`), not the source itself — with `AGENTS.md` as the neutral default output name. Until that source exists the inversion is fictional and guidance-sync maintains the `claude` rendering directly, so drift risk grows every round (repo-refactor §2.1 W1). This spec creates the source, the renderer, and the parameterization seam — writing **only the chosen stack's Layer-2 surface** and leaving un-chosen stacks installing nothing. It is scoped to make the seam real and keep `claude` byte-identical; the Antigravity/Kiro adapters and the `021` CLI that ride on it are separate specs.

## Users & Context

- **Primary user:** a developer running `zero-two-one-init` (scaffold or migrate) who has chosen a stack other than `claude` — today they silently receive Claude wiring; after this spec they receive their stack's entrypoint and nothing from the others.
- **Secondary user (regression guard):** every existing `claude`-stack user, including this framework's own dogfood repo. Their installed tree must not change by a single byte.
- **Trigger:** the install/instantiate step of the engine (`scripts/init/` — `sources.js userDocMappings`, `classes.js FRAMEWORK_DIRS`, and the template-instantiation path in `apply.js`), driven by `bin/init.js`.
- **Builds on:** spec 001's ownership classes + template instantiation and manifest (`tools.stack`), and spec 002's migrate-mode stack detection. This spec replaces the hard-wired `claude` constants with a **stack-resolved** lookup and adds the renderer.
- **Constraint:** zero runtime dependencies — the renderer is `fs`/`path` string transforms only; YAML frontmatter is emitted as plain text (TDD §9.1).

## Clarifications

### Session 2026-07-17 (scoping)

- **Q: Does spec 006 render the Antigravity *skills* surface (`.agents/skills/021-<name>/SKILL.md`), or only the `AGENTS.md` entrypoint?**
  A: **Entrypoint only.** 006 renders `ASSISTANT-Template.md` → the chosen stack's *entrypoint* doc (`claude` → `CLAUDE.md`; `antigravity` → `AGENTS.md`). The command/skills surface per stack (Claude commands stay as-is; Antigravity `SKILL.md` tree; Kiro steering/agents) is owned by specs 007/008. This keeps 006 a clean seam: source + renderer + parameterized doc/dir resolution.
- **Q: Where does the active stack come from when the renderer runs?**
  A: From the manifest `tools.stack`, resolved once at the start of the install and defaulting to `claude` when absent. `--stack` flag handling and the interactive interview that *set* `tools.stack` are separate mvp-4 items; this spec **consumes** the recorded stack and requires only that a stack value can be passed in for testing.

### Session 2026-07-17 (clarify)

- **Q: Where should the StackAdapter registry (stack → entrypoint template+dest, surface dirs, Layer-2 paths) live?**
  A: **A new `scripts/init/adapters.js` module.** Both `classes.js` and `sources.js` import it (no require cycle), and it is the single obvious place for specs 007/008 to add their stack entry — keeping adapter *data* separate from ownership *logic* (`classes.js`).
- **Q: Where should the entrypoint renderer (`ASSISTANT-Template.md` → entrypoint doc transform) live?**
  A: **A new `scripts/init/render.js` module** that `bin/init.js` (and `apply.js`'s instantiation path) call. A called module honors TDD §9.1 ("transforms in `bin/init.js`") while staying unit-testable in isolation — which the golden-fixture regression (FR-010) needs.
- **Q: How does `CLAUDE-Template.md` relate to the neutral `ASSISTANT-Template.md` at rest?**
  A: **Drop `CLAUDE-Template.md` entirely; render `CLAUDE.md` directly from `ASSISTANT-Template.md` at install.** `ASSISTANT-Template.md` becomes the single source — the truest form of the §9.1 inversion, removing the two-files-in-sync drift W1 warns about. The byte-identical guarantee is held by a **golden fixture that pins today's `CLAUDE.md` bytes** as the reference, not by a committed intermediate template. *Note: this intentionally diverges from repo-refactor §4.4 / [r9-review](../../requirements/_refinement/r9-review.md) §47, which assumed `CLAUDE-Template.md` would be **re-derived** and kept; the clarify decision is to remove it instead. TDD §5's `CLAUDE-Template.md → CLAUDE.md` mapping row and spec 001 FR-017's reference are updated by this spec.*

## User Scenarios (Acceptance)

1. **`claude` byte-identical** — *Given* `tools.stack = claude` (or absent, defaulting to `claude`), *when* init installs, *then* the produced `CLAUDE.md` and `.claude/commands/021-*.md` are **byte-identical to today's output**, and no other stack's files appear.
2. **`antigravity` entrypoint renders** — *Given* `tools.stack = antigravity`, *when* init installs, *then* `AGENTS.md` is written at the target root (rendered from `ASSISTANT-Template.md`) and **no `CLAUDE.md` and no `.claude/commands/` are installed**.
3. **Un-chosen stacks install nothing** — *Given* any single chosen stack, *when* init installs, *then* the installed tree contains that stack's Layer-2 surface and **no Layer-2 path belonging to a non-chosen stack** (the neutral-core invariant, seen from one cell).
4. **Neutral core is stack-invariant** — *Given* two different stacks, *when* each installs into a clean target, *then* the two installed trees differ **only** in Layer-2 (adapter) paths; every Layer-1 *content* path (`requirements/` structure, `workflow/`, `skills/`, `templates/`, `scripts/`, `hooks/`) is byte-identical across the two. **Excluded from the byte-identical assertion**: `.zero-two-one.json` (records `tools.stack` + a per-stack `files` inventory — differs by design) and `.ai/context/` (provisioned as the same empty scaffold both sides) *(analyze A1)*; and the **merged** files `package.json`/`.gitignore`, which carry target-specific identity such as the project name *(analyze A7 — surfaced in implementation: `package.json` embeds `basename(targetDir)`)*.
5. **`--upgrade` respects the recorded stack** — *Given* a repo whose manifest records `tools.stack = antigravity`, *when* `--upgrade` runs, *then* it refreshes the Antigravity entrypoint and does **not** introduce `CLAUDE.md` / `.claude/commands`.
6. **Ownership classification is stack-aware** — *Given* `tools.stack = antigravity`, *when* the engine classifies paths, *then* `AGENTS.md` classifies as user-owned (create-if-missing) and `.claude/commands/**` is **outside the managed surface** (not framework-owned) for that stack — so a re-run neither creates nor refreshes it.
7. **Source drift is caught** — *Given* a change to `ASSISTANT-Template.md` that alters the rendered `claude` bytes, *when* the test suite runs, *then* the golden-fixture regression fails.

## Functional Requirements

- **FR-001 — Neutral source layer.** Add `templates/ASSISTANT-Template.md` as the tool-neutral assistant-entrypoint source (generalized from `CLAUDE-Template.md`; `AGENTS.md` is the neutral default output name — TDD §9.1). It ships in Layer 1 (installed identically for every stack as a template) and is the single input to the entrypoint renderer.
- **FR-002 — Entrypoint renderer.** Add `scripts/init/render.js` *(clarified)* — a unit-testable module invoked from the apply pipeline (`apply.js`'s render branch) *(analyze A6: the renderer runs inside `applyPlan`, not directly from the `bin/init.js` shell)* — that transforms `ASSISTANT-Template.md` into the chosen stack's **entrypoint** document: `claude` → `CLAUDE.md`, `antigravity` → `AGENTS.md`. `fs`/`path` string transforms only — no new dependency, no YAML/templating library; frontmatter emitted as plain text.
- **FR-003 — `CLAUDE-Template.md` removed; render directly.** Delete `templates/CLAUDE-Template.md` *(clarified)*; `ASSISTANT-Template.md` is the single source and `CLAUDE.md` is rendered directly from it at install (no intermediate per-stack template). This requires re-pointing **every** reference to the old copy mapping *(analyze A2 — the full set)*: the TDD §5 `CLAUDE-Template.md → CLAUDE.md` mapping row, spec 001 FR-017's reference, `templates/_INDEX.md` (+ package copy), and **three** touch points in `test/init/` — the framework-file-presence list (`engine.test.js:47`), the two byte-compare assertions (`engine.test.js:66,116`, → compare to renderer output), and the fixture seed (`fixtures.js:43`, → seed `ASSISTANT-Template.md`). The working repo's own root `CLAUDE.md` keeps its dogfooding preamble (the "you are in the framework's own repo" block) as a clearly-marked local, user-owned section the renderer preserves (repo-refactor §4.4).
- **FR-004 — Stack-parameterized framework dirs.** `classes.js FRAMEWORK_DIRS` resolves from the active `tools.stack` instead of unconditionally including `.claude/commands`. Only the chosen stack's command/surface dirs are framework-owned; other stacks' dirs are **outside the managed surface** for that install. Layer-1 dirs (`scripts`, `hooks`, `skills`, `workflow`, `templates`, `.github`) are unchanged for every stack.
- **FR-005 — Stack-parameterized user-doc mappings.** `sources.js userDocMappings` resolves the entrypoint doc from the active stack: `claude` maps `ASSISTANT-Template.md` → `CLAUDE.md`; `antigravity` → `AGENTS.md`. The non-entrypoint guiding docs (`CODE`, `PRODUCT`, `DESIGN`, `README`) and the `requirements/*` docs are stack-invariant.
- **FR-006 — Single stack-adapter registry.** The stack → surface bindings (entrypoint template+dest, command/skill dirs, which paths are Layer-2) live in **one new module, `scripts/init/adapters.js`** *(clarified)*, imported by both `classes.js` and `sources.js` (no require cycle), so 007/008 extend one table rather than editing scattered constants. `claude` and `antigravity` (entrypoint) are populated here; `kiro` is reserved for spec 008.
- **FR-007 — Active-stack resolution.** The engine resolves the active stack once per run from the manifest `tools.stack`, defaulting to `claude` when the field is absent (preserving current behavior for repos installed before mvp-4). The value can be supplied for tests; `--stack` interview/flag wiring is out of scope (separate mvp-4 item).
- **FR-008 — `--upgrade` honors the recorded stack.** Upgrade refreshes only the recorded stack's Layer-2 surface (plus Layer-1), never introducing another stack's entrypoint or command dir.
- **FR-009 — Un-chosen stacks install nothing.** For a given install, no Layer-2 path belonging to a non-chosen stack is created, refreshed, or classified as framework-owned.
- **FR-010 — `claude` regression bar.** With `tools.stack = claude` (or absent), the produced `CLAUDE.md` and `.claude/commands/021-*.md` are byte-identical to the pre-006 output, enforced by a committed golden-fixture test that **pins today's `CLAUDE.md` bytes** as the reference (not a committed intermediate template — FR-003).
- **FR-011 — Zero runtime dependencies.** `fs`/`path` only; no templating/YAML packages. The manifest schema is unchanged (`tools.stack` already exists — TDD §7).
- **FR-012 — Package sync.** `sync-to-package.js` ships `templates/ASSISTANT-Template.md` and `scripts/init/{adapters,render}.js`, and **stops shipping `templates/CLAUDE-Template.md`** (removed, FR-003); the manifest `files` inventory and `package/templates/_INDEX.md` drop the stale entry. `npm run sync:package -- --check` stays green.

## Key Entities

- **StackAdapter descriptor** — one entry per stack in `scripts/init/adapters.js` (FR-006): `{ entrypoint: { template, dest }, surfaceDirs: [...] }` *(analyze A4: the entrypoint dest + surfaceDirs fully determine the stack's Layer-2 path set — no separate `layer2Paths` field)*. `claude` = `{ entrypoint: ASSISTANT-Template.md → CLAUDE.md, surfaceDirs: ['.claude/commands'] }`; `antigravity` = `{ entrypoint: → AGENTS.md, surfaceDirs: [] (skills tree is spec 007) }`. The single source of truth `classes.js` and `sources.js` both consult.
- **ASSISTANT-Template.md** — the neutral entrypoint source (Layer 1), and the **only** entrypoint template (no per-stack `*-Template.md`; FR-003). Rendered per stack into the entrypoint doc.
- **Entrypoint renderer (`scripts/init/render.js`)** — the `fs`/`path` transform from `ASSISTANT-Template.md` to a stack's entrypoint doc; preserves user-owned local sections (FR-003).
- **Active stack** — resolved from manifest `tools.stack` (default `claude`); parameterizes the whole install surface for the run.

## Acceptance Criteria

- `claude` install (or stack absent) → `CLAUDE.md` + `.claude/commands/021-*.md` byte-identical to today; golden-fixture test passes; existing spec 001/002 tests still green.
- `antigravity` install → `AGENTS.md` present at root; no `CLAUDE.md`, no `.claude/commands/` anywhere in the installed tree.
- Cross-stack diff of two clean installs → differs **only** in Layer-2 paths; all Layer-1 paths byte-identical (the neutral-core invariant, scoped to the two stacks 006 can render).
- `classify()` is stack-aware: `.claude/commands/**` is framework-owned under `claude` and unmanaged under `antigravity`; `AGENTS.md` is user-owned under `antigravity`.
- `--upgrade` on an `antigravity` manifest refreshes `AGENTS.md` and never adds `CLAUDE.md`/`.claude/commands`.
- Active stack defaults to `claude` when `tools.stack` is absent (pre-mvp-4 repos unaffected).
- `npm test` / `npm run lint` pass; no runtime dependency added; `npm run sync:package -- --check` clean with the new/derived templates.

## Out of Scope

- **Antigravity skills surface** — `.agents/skills/021-<name>/SKILL.md` rendering, MCP registration guidance, migrate-mode wire-through — **spec 007** (to be drafted). This spec renders only the `AGENTS.md` entrypoint.
- **Kiro adapter + engine dispatch** — `.kiro/steering/021-*.md`, `.kiro/agents/021.json`, `kiro-specs` dispatch — **spec 008** (to be drafted). `kiro` is a reserved registry slot here, not populated.
- **The `021` CLI** — `bin/021` dispatcher and adapter instruction references — **spec 009** (to be drafted).
- **AI-led interactive walkthrough** and `--stack`/`--design` flag/interview UX — separate mvp-4 items; this spec consumes an already-resolved `tools.stack`.
- **Design-system adapter / `material-3`** — the design layer is independent of the stack seam (TDD §9.4); later mvp-4 item.
- **The full 3×2 acceptance matrix run and the release neutral-core invariant across all three stacks** — the release exit gate; 006 proves the invariant only across the stacks it can render (`claude`, `antigravity`).
- **Programmatic API decision** (`exports` of `lib.js`) — decided with the adapter seam but recorded as its own mvp-4 decision (TDD §14).

## Dependencies & References

- [spec 001](../001-safe-install-engine/spec.md) — `classes.js` (`FRAMEWORK_DIRS`, `classify`), `sources.js` (`userDocMappings`, `frameworkFiles`), `apply.js` instantiation, manifest `tools.stack`; **FR-017's `CLAUDE-Template.md → CLAUDE.md` reference is superseded** by FR-003 here.
- **Touched by the drop of `CLAUDE-Template.md`** (FR-003, analyze A2): TDD §5 mapping row; `templates/_INDEX.md` (+ package copy); `test/init/engine.test.js:47` (framework-file-presence list → `ASSISTANT-Template.md`), `:66`/`:116` (byte-compare → `render.js` output); `test/init/fixtures.js:43` (fixture seed → `ASSISTANT-Template.md`).
- [spec 002](../002-migrate-mode/spec.md) — migrate-mode stack detection feeds `tools.stack`.
- [spec 003](../003-manifest-qa-contract/spec.md) — `lib.js manifestFacts` is the read seam for `tools.stack`.
- TDD §9.1 (source layer, tool-neutral; `AGENTS.md` neutral default), §9.2 (per-stack entrypoints), §7 (manifest `tools`), §6 (ownership).
- [_notes/repo-refactor.md](../../requirements/_notes/repo-refactor.md) §3.1 (three-layer model), §5.2 (spec cut), §2.1 W1 / §2.2 P2–P4 (findings this closes).

## Open Questions

*Resolved in the 2026-07-17 clarify session: the StackAdapter registry lives in a new **`scripts/init/adapters.js`** (imported by both `classes.js` and `sources.js`); the entrypoint renderer lives in a new, unit-testable **`scripts/init/render.js`** called by `bin/init.js`/`apply.js`; **`CLAUDE-Template.md` is dropped** and `CLAUDE.md` is rendered directly from `ASSISTANT-Template.md` at install, with a golden fixture pinning today's bytes. No open items remain.*
