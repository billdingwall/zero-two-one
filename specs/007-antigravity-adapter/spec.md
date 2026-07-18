---
status: Done
feature: Antigravity Adapter
release: mvp-4
branch: 007-antigravity-adapter
created: 2026-07-18
---

# Feature Spec: Antigravity Adapter

*The second feature of [mvp-4 — AI-Led Init & Stack/Design Adapters](../../requirements/_releases/mvp-4.md), riding on the seam [spec 006](../006-source-layer-renderer/spec.md) opened. Spec 006 stubbed the `antigravity` registry entry (`surfaceDirs: []`, empty `STACK_TOKENS.antigravity`) so the `AGENTS.md` entrypoint renders as an identity copy and no command/skill surface installs. This spec **populates that adapter**: an Antigravity-appropriate `AGENTS.md` render plus the `.agents/skills/021-<name>/SKILL.md` Layer-2 surface, so an `--stack antigravity` user gets real assistant wiring. Specs `008` (Kiro) and `009` (`021` CLI) remain separate.*

## Why

Spec 006 made the install surface stack-parameterized and proved the neutral-core invariant across `claude` and `antigravity` — but only for the **entrypoint**. Today an `antigravity` install produces an `AGENTS.md` that is a byte-identity render of the neutral source (still carrying `claude`-flavored phrasing, since `ASSISTANT-Template.md` was generalized *from* `CLAUDE-Template.md` and the `antigravity` token map is empty), and **no skills surface at all** — `surfaceDirs: []`. So Antigravity/Gemini users get a mislabeled entrypoint and zero discoverable commands (repo-refactor §2.2 P3/P4).

The framework's `skills/*.md` ship as the flat **source layer** (correct — TDD §9.1), but no stack consumes them natively until an adapter surfaces them. Claude surfaces them as `.claude/commands/021-*.md`; Antigravity's native convention is a per-skill directory `.agents/skills/021-<name>/SKILL.md` (TDD §9.2). Unlike Claude's verbatim command-dir copy, this is a **restructuring transform** (flat file → per-skill subdir with a `SKILL.md`), which the 006 `surfaceDirs` verbatim-copy mechanism does not cover. This spec adds that surface renderer, gives `AGENTS.md` an Antigravity-correct rendering, and wires the migrate-mode `.agents/`/`AGENTS.md` detection (already present in [spec 002](../002-migrate-mode/spec.md)) through to a real install — closing P3/P4 for the `antigravity` stack.

## Users & Context

- **Primary user:** a developer running `zero-two-one-init --stack antigravity` (scaffold or migrate) — or whose existing repo has `.agents/`/`AGENTS.md` so migrate detects `antigravity`. After this spec they receive an Antigravity-shaped `AGENTS.md` entrypoint and a `.agents/skills/021-*/SKILL.md` tree; they receive **nothing** from the `claude` or `kiro` surfaces (the neutral-core invariant holds).
- **Secondary user (regression guard):** every `claude`-stack user, including this framework's dogfood repo. Their installed tree must not change by a single byte — 006's golden fixture stays green and this spec adds `antigravity`-only paths.
- **Trigger:** the install/apply step of the engine (`scripts/init/` — the 006 render/surface seam in `apply.js`, `classes.js`, `sources.js`, `adapters.js`, `render.js`), driven by `bin/init.js`, for a run whose resolved `tools.stack = antigravity`.
- **Builds on:** spec 006's `adapters.js` registry, `render.js` entrypoint renderer, and stack-parameterized `classify`/`frameworkDirs`/`userDocMappings`; spec 002's stack detection (`.agents/`/`AGENTS.md` ⇒ `antigravity`, already in `migrate/detect.js:132`); spec 003's `manifestFacts` read seam for `tools.stack`.
- **Constraint:** zero runtime dependencies — the skills renderer and any `SKILL.md` frontmatter emission are `fs`/`path` string transforms only; frontmatter is plain text (TDD §9.1).

## Clarifications

### Session 2026-07-18 (clarify)

- **Q: What populates antigravity's `.agents/skills/021-*/SKILL.md` surface — the skill-prompt library, the lifecycle commands, or both?**
  A: **Both.** The 8 `skills/*.md` prompts (`generate-*`, `verify-spec-compliance`, `check-framework-compliance`, `fetch-speckit-context`) *and* the `021-init`/`021-status` lifecycle commands each render to `.agents/skills/021-<name>/SKILL.md`. (Antigravity has no native flat-`skills/` discovery, so surfacing the library is what makes the prompts usable; the lifecycle commands ride the same surface. This is richer than claude's current `.claude/commands/` — an acceptable asymmetry, since the neutral-core invariant constrains only Layer-1.)
- **Q: `skills/*.md` carry no YAML frontmatter, but Antigravity `SKILL.md` wants `name`/`description`. Where does the frontmatter come from?**
  A: **Add YAML frontmatter to the source files at rest** (`name`/`description` per skill); the renderer passes it through. This makes `skills/*.md` Antigravity-shaped as the neutral source. Constraint: claude's flat consumption must tolerate the frontmatter (it does — markdown readers ignore leading YAML), and it must **not** perturb the 006 golden fixture, which pins only `CLAUDE.md` + `.claude/commands/021-*.md` (not `skills/*.md`), so this is safe.
- **Q: How is an existing `GEMINI.md` handled (TDD §9.2 "AGENTS.md; GEMINI.md honored")?**
  A: **Honor `GEMINI.md` as the entrypoint when it exists** — if the target already has `GEMINI.md`, it is the create-if-missing entrypoint target (left as-is if present; rendered into it if absent-but-chosen), and `AGENTS.md` is **not** also written. Otherwise `AGENTS.md` is the entrypoint. This makes the antigravity entrypoint **dest conditional on target state** — a departure from 006's static `entrypoint.dest`, absorbed by the adapter/apply logic.
- **Q: How is the MCP registration guidance (`~/.gemini/config/mcp_config.json`) delivered, given the installer must not write to that user-global path?**
  A: **A post-install console note**, emitted like the existing hook-install notes (`reportHook` in `index.js`), sourced from `skills/tools.json`. Nothing is written to `~/.gemini/`; the entrypoint doc stays clean.

## User Scenarios (Acceptance)

1. **Antigravity skills surface renders (library + commands)** — *Given* `tools.stack = antigravity`, *when* init installs, *then* each of the 8 framework skill prompts **and** the `021-init`/`021-status` commands is written as `.agents/skills/021-<name>/SKILL.md` (021-namespaced per §6) with synthesized-at-rest `name`/`description` frontmatter, and no flat `.claude/commands/` tree appears.
2. **`AGENTS.md` reads as Antigravity, not Claude** — *Given* `tools.stack = antigravity`, *when* the entrypoint renders, *then* `AGENTS.md` refers to the Antigravity assistant and the `AGENTS.md` entrypoint filename (not "CLAUDE.md" / "Claude Code"), while the stack-neutral guidance (the master-router / "Wait" rule, lifecycle framing) is preserved. *(analyze A5: satisfied **by construction** — the neutral body names no assistant, research R3 — so it needs no dedicated test beyond T006's "`AGENTS.md` at root, no `CLAUDE.md`".)*
2b. **`GEMINI.md` is honored when present** — *Given* `tools.stack = antigravity` and the target already has a `GEMINI.md`, *when* init installs, *then* `GEMINI.md` is treated as the entrypoint (left unchanged as a user-owned file) and **no `AGENTS.md` is written**; *given* no `GEMINI.md`, *then* `AGENTS.md` is the entrypoint.
3. **`claude` still byte-identical** — *Given* `tools.stack = claude` (or absent), *when* init installs, *then* `CLAUDE.md` + `.claude/commands/021-*.md` remain byte-identical to the 006 golden fixture, and no `.agents/` path appears.
4. **Neutral-core invariant holds with the skills surface** — *Given* `claude` and `antigravity` installs into clean targets, *when* the trees are diffed, *then* they differ **only** in Layer-2 paths (`.claude/commands/**` + `CLAUDE.md` vs `.agents/skills/**` + `AGENTS.md`); every Layer-1 content path is byte-identical (same carve-outs as 006 Scenario 4: manifest, empty `.ai/context`, merged `package.json`/`.gitignore`).
5. **Ownership is stack-aware for `.agents/`** — *Given* `tools.stack = antigravity`, *when* the engine classifies paths, *then* `.agents/skills/**` is framework-owned (021-namespaced, refreshed on `--upgrade`) and `AGENTS.md` is user-owned (create-if-missing); under `claude` those `.agents/` paths are **outside the managed surface**.
6. **`--upgrade` refreshes only the Antigravity surface** — *Given* a manifest recording `tools.stack = antigravity`, *when* `--upgrade` runs, *then* it refreshes the `.agents/skills/021-*/SKILL.md` tree and `AGENTS.md`, and never introduces `CLAUDE.md` / `.claude/commands`.
7. **Migrate detects and installs Antigravity** — *Given* an existing repo containing `.agents/` or `AGENTS.md` and no `--stack`, *when* migrate runs, *then* detection proposes `antigravity` (spec 002) and the resulting install writes the `.agents/` surface — the detection is wired through to a real adapter, not a no-op.
8. **MCP registration is guided, not written** — *Given* an Antigravity install, *when* it completes, *then* the output includes guidance for registering the framework's MCP/tools (`~/.gemini/config/mcp_config.json`) **without** the installer writing to that user-global path.

## Functional Requirements

- **FR-001 — Antigravity skills surface renderer.** Render the framework's skills into the Antigravity convention `.agents/skills/021-<name>/SKILL.md` (TDD §9.2) — the surface carries **both** the 8 `skills/*.md` prompts **and** the `021-init`/`021-status` lifecycle commands *(clarified: "both")*, each as its own 021-namespaced `SKILL.md`. This is a **restructuring transform** (flat source file → per-skill 021-namespaced subdirectory containing `SKILL.md`), distinct from the `claude` verbatim `surfaceDirs` copy — so the adapter registry gains a way to express a *rendered* surface, not only a copied dir. The registry mechanism and the source of the lifecycle-command content (neutral command source vs. adapter-authored, holding claude's `.claude/commands/021-*.md` byte-identical to the 006 golden fixture either way) are settled in plan.
- **FR-002 — `SKILL.md` frontmatter from source.** Add YAML `name`/`description` frontmatter to each source skill (`skills/*.md`) at rest *(clarified: "add frontmatter to sources")*; the renderer passes it through into `SKILL.md`. `skills/*.md` remains the single neutral source (Layer-1, identical for every stack). Constraint: the added frontmatter must not perturb the 006 golden fixture (which pins only `CLAUDE.md` + `.claude/commands/021-*.md`, not `skills/*.md`), and claude's flat consumption tolerates it.
- **FR-003 — Antigravity entrypoint token map (near-empty).** `STACK_TOKENS.antigravity` may carry Antigravity-specific substitutions, but *(analyze A1)* the neutral `ASSISTANT-Template.md` carries **no** `claude`-only phrasing (research R3), so this is a **no-op in 007** — the map stays `{}` and the entrypoint difference is purely the dest filename (FR-004). **No implementation task**: satisfied by 006's identity render. Recorded as a requirement so 008/later rounds have the seam; any Antigravity-branded line added later must not change the rendered `claude` bytes (006 FR-010).
- **FR-004 — `GEMINI.md` honored as entrypoint when present.** *(clarified)* When the target already contains `GEMINI.md`, it is the entrypoint: left unchanged if present (user-owned, create-if-missing), rendered into if the chosen-but-absent case arises, and **`AGENTS.md` is not also written**. Otherwise `AGENTS.md` is the entrypoint. The antigravity entrypoint **dest is therefore resolved from target state**, not a static string — a departure from 006's fixed `entrypoint.dest` that the adapter/apply logic absorbs. *(analyze A2: `GEMINI.md` is honored **once the stack is antigravity**, but it is **not** a stack-detection signal — spec 002's `migrate/detect.js` keys on `.agents/`/`AGENTS.md` only, so a repo with **only** `GEMINI.md` must pass `--stack antigravity`. This boundary is intentional for 007; see Out of Scope.)*
- **FR-005 — Stack-aware ownership for `.agents/`.** The `antigravity` adapter's surface (`.agents/skills/**`) classifies as framework-owned under `antigravity` and is **outside the managed surface** under any other stack (extends 006 FR-004/FR-009). `AGENTS.md`/`GEMINI.md` (the resolved entrypoint) is user-owned (create-if-missing) under `antigravity`. Layer-1 dirs are unchanged for every stack.
- **FR-006 — Un-chosen stacks install nothing (extended).** For a non-`antigravity` install, no `.agents/` path is created, refreshed, or classified as framework-owned; for an `antigravity` install, no `.claude/commands/` or `CLAUDE.md` appears (the neutral-core invariant, now covering the skills surface).
- **FR-007 — `--upgrade` honors the recorded stack (extended).** Upgrade refreshes only the recorded stack's Layer-2 surface. On an `antigravity` manifest, the `.agents/skills/021-*/SKILL.md` tree and the resolved entrypoint refresh; no other stack's surface is touched.
- **FR-008 — Migrate wire-through.** The spec 002 detection (`.agents/`/`AGENTS.md` ⇒ `antigravity`) resolves to a real `antigravity` install through this adapter (scaffold and migrate paths both honor it). Existing user `.agents/` content follows the spec 001/002 ownership + duplicate-resolution rules (021-namespaced framework paths never clobber user files).
- **FR-009 — MCP registration guidance as a post-install note.** *(clarified)* Emit Antigravity MCP/tool registration guidance (referencing `~/.gemini/config/mcp_config.json`) as a **post-install console note**, in the manner of the existing hook-install notes (`reportHook` in `scripts/init/index.js`). The installer **must not** write to `~/.gemini/` or anywhere outside the target repo. Source of the tool schemas is the existing `skills/tools.json`.
- **FR-010 — Zero runtime dependencies.** `fs`/`path` only; no templating/YAML packages. `SKILL.md` frontmatter is emitted as plain text. Manifest schema unchanged (`tools.stack` already exists).
- **FR-011 — Package sync + manifest inventory.** `sync-to-package.js` ships any new modules/templates this spec adds (and the frontmatter'd `skills/*.md`); the `antigravity` install writes correct manifest `files` entries for the `.agents/` surface. `npm run sync:package -- --check` stays green.

## Key Entities

- **Antigravity adapter entry** — the populated `antigravity` record in `scripts/init/adapters.js`: `entrypoint` resolves to `AGENTS.md` (or `GEMINI.md` when present, FR-004); this spec adds the **rendered skills surface** binding (mechanism deferred to plan) so `.agents/skills/**` is the stack's Layer-2 framework-owned surface.
- **Skills surface renderer** — the `fs`/`path` transform from flat `skills/<name>.md` → `.agents/skills/021-<name>/SKILL.md` (analogous to `render.js`'s entrypoint transform; may live in `render.js` or a sibling module — settled in plan).
- **`STACK_TOKENS.antigravity`** — the entrypoint token map (currently `{}`) populated so `AGENTS.md` reads as Antigravity; the `claude` map stays empty to hold the byte bar.
- **`skills/tools.json`** — the existing agent tool schemas; the source for the MCP registration post-install note (FR-009).

## Acceptance Criteria

- `antigravity` install → `.agents/skills/021-*/SKILL.md` present for **all 8 skill prompts and the `021-init`/`021-status` commands**, each with `name`/`description` frontmatter; entrypoint (`AGENTS.md`, or `GEMINI.md` if present) refers to Antigravity (not Claude); no `CLAUDE.md`, no `.claude/commands/` anywhere in the tree.
- `claude` install → still byte-identical to the 006 golden fixture (the frontmatter added to `skills/*.md` does not perturb it); no `.agents/` path present.
- Cross-stack diff of two clean installs (`claude` vs `antigravity`) → differs **only** in Layer-2 paths; all Layer-1 paths byte-identical (006 carve-outs apply; the frontmatter'd `skills/*.md` are identical on both sides).
- `classify()` is stack-aware for `.agents/`: framework-owned under `antigravity`, unmanaged under `claude`; the resolved entrypoint (`AGENTS.md`/`GEMINI.md`) user-owned under `antigravity`.
- `GEMINI.md` present in the target → honored as the entrypoint; `AGENTS.md` not written.
- `--upgrade` on an `antigravity` manifest refreshes the `.agents/` surface and never adds `CLAUDE.md`/`.claude/commands`.
- Migrate on a repo with `.agents/`/`AGENTS.md` proposes `antigravity` and installs the `.agents/` surface.
- MCP registration guidance appears as a post-install note without the installer writing to `~/.gemini/`.
- `npm test` / `npm run lint` pass; no runtime dependency added; `npm run sync:package -- --check` clean.

## Out of Scope

- **Kiro adapter + engine dispatch** — `.kiro/steering/021-*.md`, `.kiro/agents/021.json`, `kiro-specs` dispatch — **spec 008**. `kiro` stays a reserved, throwing registry slot.
- **The `021` CLI** — `bin/021` dispatcher and the adapter-instruction references to `021 …` — **spec 009**. This spec's `SKILL.md`/`AGENTS.md` may reference lifecycle commands using the current npm-script names; re-pointing them at the `021` CLI is 009's job.
- **AI-led interactive walkthrough** and `--stack`/`--design` flag/interview UX — separate mvp-4 items; this spec consumes an already-resolved `tools.stack`.
- **Design-system adapter / `material-3`** — independent of the stack seam (TDD §9.4).
- **The full 3×2 acceptance matrix across all three stacks** — the release exit gate; this spec extends the invariant to the `antigravity` **skills** surface, not the whole matrix.
- **Antigravity's session artifacts** (task lists, implementation plans, walkthroughs) as durable state — by design they are *not* gate state; `github-speckit` holds the gate-readable spec `status:` (TDD §9.3). No SSD engine change here.
- **`scripts/`, `references/`, `assets/` per-skill subdirs** (TDD §9.2 parenthetical) — not populated by this spec; the surface is `SKILL.md` per skill. (A skill needing bundled assets is a later enhancement.)
- **`GEMINI.md` as a stack-detection signal** *(analyze A2)* — 007 honors `GEMINI.md` as an entrypoint but does not add it to `migrate/detect.js`'s antigravity signals (`.agents/`/`AGENTS.md`). A `GEMINI.md`-only repo must pass `--stack antigravity`; adding `GEMINI.md` detection is a one-line spec-002 follow-up if wanted.

## Dependencies & References

- [spec 006](../006-source-layer-renderer/spec.md) — the seam this extends: `adapters.js` registry (populates the `antigravity` skills surface), `render.js` (`STACK_TOKENS.antigravity`), stack-parameterized `classify`/`frameworkDirs`/`userDocMappings`, the golden-fixture `claude` bar (must stay green).
- [spec 002](../002-migrate-mode/spec.md) — stack detection (`.agents/`/`AGENTS.md` ⇒ `antigravity`, `migrate/detect.js:132`) and duplicate-resolution rules this wires through.
- [spec 001](../001-safe-install-engine/spec.md) — ownership classes, `apply.js` surface writing, manifest `files` inventory.
- [spec 003](../003-manifest-qa-contract/spec.md) — `manifestFacts` read seam for `tools.stack`.
- TDD §9.1 (source layer), §9.2 (Antigravity mapping: `AGENTS.md`/`GEMINI.md`, `.agents/skills/021-<name>/SKILL.md`, MCP via `~/.gemini/config/mcp_config.json`, artifact-review gate), §9.3 (Antigravity served by `github-speckit`), §6 (naming convention), §7 (manifest).
- [_notes/repo-refactor.md](../../requirements/_notes/repo-refactor.md) §1 (per-tool conventions cross-check), §2.2 P3/P4 (findings this closes), §5.2 (spec cut — 007).

## Open Questions

*Behavioral questions resolved in the 2026-07-18 clarify session (see Clarifications): surface = **both** the skill-prompt library and the lifecycle commands as `SKILL.md`; `SKILL.md` frontmatter is **added to the `skills/*.md` sources** at rest; `GEMINI.md` is **honored as the entrypoint when present** (else `AGENTS.md`); MCP guidance is a **post-install console note**. `_INDEX.md`/`tools.json` are not skills (index + schema source), so they do not become `SKILL.md`.*

*Two implementation-structure decisions are deferred to the plan step (not blockers for sign-off):*

1. **Rendered-surface mechanism.** How `adapters.js` expresses a *rendered* Layer-2 surface (flat source → `.agents/skills/021-<name>/SKILL.md`) versus the `claude` verbatim `surfaceDirs` copy — a `surfaceRenderer` descriptor, a declarative `surfaceMappings` list, or a dedicated skills-render module the apply pipeline dispatches on. Chosen for clean `classify()`/`frameworkDirs()` and an obvious 008 (Kiro `skill://` + steering) extension point.
2. **Lifecycle-command source.** The `021-init`/`021-status` content currently lives only in `.claude/commands/*.md` (claude Layer-2). To surface it for antigravity too, plan decides between a neutral command source rendered to both stacks (mirroring the 006 entrypoint inversion, holding claude's bytes to the golden fixture) versus adapter-authored antigravity `SKILL.md` for the two commands (minor duplication, trivially protects the golden bar). Interacts with the neutral-source generalization of `ASSISTANT-Template.md` (FR-003).
