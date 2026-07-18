# Research & Decisions: Antigravity Adapter

*Rolls up the 2026-07-18 clarify (4 behavioral decisions — see [spec.md](spec.md) Clarifications) and settles the 2 deferred plan-level structure decisions. Rejected alternatives recorded so 008 doesn't re-litigate.*

## R1 — Rendered-surface mechanism (deferred decision A) → declarative `surfaceRenders` + `surface.js`

**Decision.** `adapters.js` gains a declarative `surfaceRenders: RenderDescriptor[]`; the transform logic lives in a new `scripts/init/surface.js` (`renderSurface(sourceDir, stack)`). `classify` owns each `toDir`; `frameworkFiles` walks only real source dirs.

**Why.** The 006 `surfaceDirs` field conflates *source enumeration* (`frameworkFiles` walks it) with *dest ownership* (`classify` marks it). That works only when source path == dest path (claude's `.claude/commands`). Antigravity's `.agents/skills/` exists **only at the dest** — its files are transforms of `skills/*.md`. So the two roles must split, and the surface needs a *producer* (`renderSurface`) rather than a dir walk.

**Rejected alternatives.**
- *A `surfaceRenderer` function on the adapter entry.* Rejected: puts logic in what 006 established as pure-data (`adapters.js` "imports nothing"), and complicates the 008 extension pattern (a data table is easier to extend than scattered closures).
- *Overload `surfaceDirs` to mean "owned dest dir" and special-case `.agents/skills` in apply.* Rejected: breaks `frameworkFiles` (it would walk a source-absent dir) and hard-wires a stack name into the engine — the exact anti-pattern 006 removed.
- *A generic `surfaceMappings` of individual file mappings.* Rejected as too granular — the descriptor is per-`fromDir` (glob + kind), which is what both antigravity (skills, commands) and 008 (steering, agent-json) need.

**008 extension point.** Kiro adds `surfaceRenders` entries with `kind: 'steering'` (→ `.kiro/steering/021-*.md`) and `kind: 'agent-json'` (→ `.kiro/agents/021.json`); the mechanism and ownership already generalize.

## R2 — Lifecycle-command source & the frontmatter asymmetry (deferred decision B) → no neutral command source

**Decision.** The `021-init`/`021-status` `SKILL.md` content is sourced from the existing `.claude/commands/021-*.md` files (`kind:'command'`), with `SKILL.md` frontmatter **synthesized at render time**. No neutral command source is created; claude's `.claude/commands` verbatim copy is untouched.

**Why the asymmetry with skills.** The clarify chose "add frontmatter to sources" — clean for the 8 `skills/*.md` (not golden-pinned). But the command bodies live in `.claude/commands/021-*.md`, whose exact bytes are pinned by the 006 golden fixture (FR-010). Adding frontmatter there would break the bar. So commands are the **one** case where frontmatter is synthesized (name from the 021- filename, description from the first heading/non-empty line) rather than added at rest. This keeps the claude path 100% untouched — the golden bar is protected by construction, not by test luck.

**Rejected alternative.** *A neutral `commands/` source rendered to both `.claude/commands/*.md` (claude, frontmatter-stripped to hold golden) and `.agents/skills/*/SKILL.md` (antigravity).* Rejected for 007: it re-runs the 006 entrypoint-inversion for just two files, adds a stripping step whose only job is to reproduce the golden bytes, and widens the blast radius on the regression bar — all to remove a two-file read of `.claude/commands`. If a third stack later needs the commands too, promote to a neutral source then; YAGNI now.

## R3 — Entrypoint token map is minimal (FR-003)

**Finding.** `templates/ASSISTANT-Template.md` is already assistant-agnostic — 13 lines, heading `# AI Assistant Instructions`, and only framework npm-script references (`npm run 021-status`, `021-spec:*`) that are valid on every stack. A grep for `claude`/`Claude Code`/`CLAUDE.md` in the source returns nothing.

**Consequence.** `STACK_TOKENS.antigravity` stays essentially empty; the antigravity vs claude entrypoint difference is the **dest filename** (`AGENTS.md`/`GEMINI.md`), not the body. No source generalization is needed, so the golden bar is not even in play for the entrypoint. Scenario 2 ("reads as Antigravity, not Claude") is satisfied because the neutral body names no assistant. If a future round wants an Antigravity-branded line, it is a one-token addition — not a blocker for 007.

## R4 — `GEMINI.md` honored as entrypoint (clarify decision 3)

**Decision.** When `GEMINI.md` exists in the target, it is the entrypoint (create-if-missing, left untouched if present) and `AGENTS.md` is not written; otherwise `AGENTS.md`. Modeled as `entrypoint.honored: ['GEMINI.md']`, resolved from target state in `classify.js`.

**Why.** TDD §9.2 says "`AGENTS.md` (project root; `GEMINI.md` honored)". A Gemini user already keyed to `GEMINI.md` should not get a second, competing entrypoint. Create-if-missing semantics (spec 001) already give "leave the user's file alone" for free — `honored` just redirects the dest. Interacts cleanly with migrate: `GEMINI.md` is also an antigravity detection signal (via `AGENTS.md`/`.agents` in spec 002; `GEMINI.md` detection can be added if needed, tracked under FR-008).

## R5 — MCP guidance as a post-install note (clarify decision 4)

**Decision.** Emit the `~/.gemini/config/mcp_config.json` registration guidance as a console note (`reportStackNotes`, sibling to `reportHook`), sourced from `skills/tools.json`. Never write to `~/.gemini/`.

**Why.** The path is **user-global**, outside the target repo — writing it would violate the engine's "target-only" boundary and could clobber a user's existing Gemini config. A note matches how the hook-install strategy already surfaces environment actions the user must confirm.

## R6 — Frontmatter's effect on `claude` and the invariants

Adding `name`/`description` frontmatter to `skills/*.md`:
- **Golden bar:** unaffected — the 006 fixture pins only `CLAUDE.md` + `.claude/commands/021-*.md`; `skills/*.md` are not in it.
- **Neutral-core invariant:** holds — `skills/*.md` are Layer-1, byte-identical for both stacks (both get the frontmatter'd files).
- **claude consumption:** harmless — Claude reads the prompt bodies; leading YAML is ignored. `_INDEX.md` (an index) and `tools.json` (schemas) are **not** skills and get no frontmatter and no `SKILL.md`.
