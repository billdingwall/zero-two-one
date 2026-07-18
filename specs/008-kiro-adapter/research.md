# Research & Decisions: Kiro Adapter & Engine Dispatch

*Rolls up the 2026-07-18 clarify (4 behavioral decisions — see [spec.md](spec.md) Clarifications) and settles the 2 deferred plan-level decisions. Rejected alternatives recorded so future engines/adapters don't re-litigate.*

## R1 — Entrypoint-less stack (deferred decision 1) → omit the field

**Decision.** `kiro`'s adapter entry **omits** `entrypoint` (rather than `entrypoint: null`). Every reader null-guards `getAdapter(stack).entrypoint`.

**Why.** `undefined` is the natural "absent" in JS — `adapter.entrypoint && …` guards read cleanly, and omitting keeps the registry honest (an entry with `entrypoint: null` invites "why is it null?"). The 007 `entrypoint.honored` already made the entrypoint shape flexible; this makes the whole field optional. `userFiles`/`userDocMappings`/`classify` gain a single `if (entrypoint)` guard each — no per-stack special-casing.

**Rejected.** `entrypoint: null` (more explicit but adds a null to thread through the same guards); a synthetic "steering entrypoint" (conflates the user-owned create-if-missing entrypoint with framework-owned steering — wrong ownership).

## R2 — Steering renders from templates, not live docs (clarify decision 1)

**Decision.** Steering is authored as **stable framework templates** (`templates/kiro-steering/021-*.md`) carrying operating guidance; `kind:'steering'` is a flat relocate into `.kiro/steering/`. The project's live docs reach Kiro via the agent `resources` globs, not by embedding.

**Why.** Rendering steering from the target's live `PRODUCT.md`/`CODE.md`/`workflows.md` would (a) produce near-empty steering at scaffold (those docs start as templates), (b) go stale between `--upgrade`s, and (c) create a framework-owned file whose content derives from user-owned docs — an ownership inversion. Template-sourced steering is stable, deterministic, framework-owned like every other surface file, and still useful: it tells Kiro *how a 021 project operates*, while `resources` supply *what this project is*. This is the clarified reinterpretation of TDD §9.2's mapping ("summarize once", not "embed live content"), and it **dissolves** the old "multi-source compose for tech = CODE + TDD" question — the tech-steering template is authored directly.

## R3 — Engine dispatch: per-engine module (clarify decision 2)

**Decision.** `scripts/speckit/engines/{github-speckit,kiro-specs}.js` implement a small `SpecEngine` interface (`specsDir`/`listSpecs`/`specPath`/`docs`/`contextFiles`/`requiredArtifacts`/`readStatus`/`writeStatus`); `lib.js engineFor(root)` resolves from `manifestFacts().ssd` and delegates.

**Why.** Inline `if (ssd === 'kiro-specs')` branches would scatter across every `lib.js` function *and* every consumer script (each reads filenames like `spec.md`/`tasks.md`). A module + a `docs` filename-map centralizes the difference in one place; consumers read `engine.docs.*` and stay engine-agnostic. `github-speckit.js` is the current logic **extracted verbatim** — so the regression bar is "did the extraction change any bytes of behavior," which the existing 003/004/005 suites already guard.

**Rejected.** Inline branches (scatters + fragile); a full plugin/registry abstraction (over-built for two engines — a two-key `engineFor` map suffices).

## R4 — `manifestFacts` gains `ssd` (implementation finding)

`manifestFacts` today returns `{ phase, phaseNum, phaseLabel, stack, mode, source }` — **no `ssd`**. The engine dispatch needs it, so `manifestFacts` gains `ssd: (manifest.tools?.ssd) || 'github-speckit'`. Additive, read-only, defaults to the current engine — pre-mvp-4 and `claude`/`antigravity` repos are unaffected. This is the natural extension of the spec 003 seam (it already reads `tools.stack`).

## R5 — `skill://` skills materialized under `.kiro/` (clarify decision 3)

**Decision.** Reuse the 007 `kind:'skill'` render with `toDir: '.kiro/skills'` → `.kiro/skills/021-<name>/SKILL.md`; `021.json` references them by `skill://`. Kiro-native, and it reuses the exact 007 transform (the frontmatter'd `skills/*.md` already exist). The `.kiro/skills` content is framework-owned Layer-2, so — like antigravity — kiro ships the skills content twice (flat `skills/*` Layer-1 source, required identical across stacks by the invariant, + the `.kiro/skills` native surface). Intended, per 007 analyze A4.

## R6 — The pre-commit gate honors the engine (FR-008)

The gate (`hooks/pre-commit`) is POSIX sh and can't `require` the engine, but it already shells `verify-spec-compliance.js`, which now resolves the engine — so the *gating decision* is engine-correct for free. The only shell change is the **path filter**: `.kiro/` joins the implementation-exclude set (kiro spec/steering/agent edits are docs, not implementation) and `.kiro/specs/` the spec-change Notice. Without it, a kiro user editing `.kiro/specs/**` would trip the "implementation on a feature branch" check. `github-speckit` repos are unaffected (their exclude set already covers `specs/`).

## R7 — Scope kept to one spec (clarify decision 4)

Install + engine ship together; tasks sequence Part A (install) then Part B (engine), because a kiro install is only *usable* once the lifecycle scripts read its `.kiro/specs`. The dogfood repo stays `github-speckit` (008 delivers the *engine*, not an EARS migration of the framework's own specs — Out of Scope).
