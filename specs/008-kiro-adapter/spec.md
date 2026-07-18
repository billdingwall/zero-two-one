---
status: Done
feature: Kiro Adapter & Engine Dispatch
release: mvp-4
branch: 008-kiro-adapter
created: 2026-07-18
---

# Feature Spec: Kiro Adapter & Engine Dispatch

*The third feature of [mvp-4 — AI-Led Init & Stack/Design Adapters](../../requirements/_releases/mvp-4.md), and the largest — it has **two halves**. (1) The **Kiro install adapter**: populate the reserved `kiro` registry slot ([spec 006](../006-source-layer-renderer/spec.md) made it throw) so `--stack kiro` installs `.kiro/steering/021-{product,tech,structure}.md` + `.kiro/agents/021.json`, extending the [spec 007](../007-antigravity-adapter/spec.md) `surfaceRenders` mechanism (`kind: 'steering'`/`'agent-json'`). (2) The **`kiro-specs` SSD engine dispatch**: `scripts/speckit/*` (and the pre-commit gate) resolve spec state from `.kiro/specs/<feature>/{requirements,design,tasks}.md` instead of `specs/NNN-*/spec.md`, dispatched on the manifest's `tools.ssd`. Spec 009 (the `021` CLI) is the last of the cut.*

## Why

`kiro` is the one supported stack with **zero** wiring: `getAdapter('kiro')` throws "not yet supported" (spec 006 analyze A5), and every `scripts/speckit/*` script assumes the `github-speckit` layout (`specs/NNN-*/spec.md` with `status:` frontmatter — `lib.js`). So a Kiro user can neither install the framework nor drive the spec lifecycle. This closes repo-refactor §2.2 P3/P4 for the `kiro` stack and delivers the third leg of the mvp-4 acceptance matrix.

Kiro also breaks two assumptions the `claude`/`antigravity` adapters share, which is why it is its own spec:

1. **No single `ASSISTANT-Template.md` entrypoint.** Kiro's instruction surface is a **three-file steering set** *rendered from the project's own key docs* — `PRODUCT.md → 021-product.md`, `CODE.md` + TDD constraints `→ 021-tech.md`, `workflow/workflows.md` structure `→ 021-structure.md` (TDD §9.2). These are framework-owned, `021-`-namespaced (so a user's own steering is never clobbered), and *derived*, not a template rendering — so the 006/007 `entrypoint: { template, dest }` model does not fit and must become optional.
2. **A different SSD engine.** Kiro's durable spec state lives in `.kiro/specs/<feature>/{requirements,design,tasks}.md` (EARS notation), with the gate-readable `status:` **injected into `requirements.md`** and task progress derived from `tasks.md` checkboxes (TDD §9.3). The manifest already records `tools.ssd = 'kiro-specs'` (`resolveTools`, `index.js:43`) — this spec makes the reader/writer/verify/context/gate scripts **honor** it via the spec 003 `manifestFacts` seam.

## Users & Context

- **Primary user:** a developer running `zero-two-one-init --stack kiro` (scaffold or migrate) — or whose repo has `.kiro/` so migrate detects `kiro`. After this spec they get a working `.kiro/` steering + agent surface **and** a lifecycle (`021-spec:*`, the pre-commit gate) that reads/writes their `.kiro/specs/` state.
- **Secondary user (regression guard):** every `claude`/`antigravity` user. The `github-speckit` path — `specs/NNN-*/spec.md`, the 006 golden bar, the 007 `.agents/` surface — must be unchanged; engine dispatch defaults to `github-speckit` when `tools.ssd` is absent.
- **Trigger (install):** the engine's apply step for a `tools.stack = kiro` run (the 006/007 `surfaceRenders` seam, extended). **Trigger (engine):** every `scripts/speckit/*` invocation (`021-spec:status|context|verify`, `021-status`, `021-doctor`) and the pre-commit gate, which now read `tools.ssd` first.
- **Builds on:** spec 006 registry + stack-parameterized surface; spec 007 `surface.js` rendered-surface mechanism (new `kind`s); spec 002 stack detection (`.kiro/` ⇒ `kiro`, `migrate/detect.js:133`); spec 003 `manifestFacts` (the read seam for `tools.ssd`); spec 004 `021-doctor` and spec 005 pre-commit gate (both read spec state through `lib.js`).
- **Constraint:** zero runtime dependencies — steering/agent rendering and the `.kiro/specs` reader are `fs`/`path`/`JSON` only; EARS/frontmatter emitted as plain text (TDD §9.1/§9.3).

## Clarifications

### Session 2026-07-18 (clarify)

- **Q: What should the `always`-injected steering (`021-{product,tech,structure}.md`) contain, given the agent's `resources` globs already surface the live key docs to Kiro?**
  A: **Framework operating guidance, rendered from stable templates** — how the 021 lifecycle works, the tech/constraint conventions (from `CODE.md`/TDD), the workflow structure. The project's own product/requirements reach Kiro via the agent `resources` globs (FR-003), **not** by embedding live-doc content in steering. This **reinterprets** TDD §9.2's `PRODUCT.md → 021-product.md` mapping as "summarize the guidance once into a template," not "embed the target's live content." Consequences: no staleness, clean ownership (steering is framework-owned like every other surface file, sourced from framework templates), and `kind:'steering'` is a simple template relocate — **no multi-source live-doc compose** (Open Q3 dissolved).
- **Q: How should the `kiro-specs` vs `github-speckit` engine dispatch be structured?**
  A: **A per-engine module behind a small interface** — `scripts/speckit/engines/{github-speckit,kiro-specs}.js`, each implementing `listSpecs`/`specPath`/`readStatus`/`writeStatus`/`countTasks`/`contextFor`; `lib.js` resolves the engine from `tools.ssd` and delegates. Unit-testable per engine; the obvious extension point for future SSD tools.
- **Q: How are the framework skills surfaced to Kiro (`skill://`)?**
  A: **Materialized under `.kiro/`** as a third rendered surface (reusing the spec 007 skill render into a `.kiro/` `toDir`), referenced by `skill://` from `021.json`. Kiro-native rather than pointing at the flat `skills/`.
- **Q: Keep the install adapter and the engine dispatch in one spec, or split?**
  A: **One spec 008.** The halves are tightly coupled (a kiro install whose lifecycle scripts don't read `.kiro/specs` is half-working, and vice versa) and share the `tools.stack`/`tools.ssd` manifest context. Tasks sequence install-first, then engine. The cut stays 006–009.

## User Scenarios (Acceptance)

1. **Kiro install renders steering + agent + skills** — *Given* `tools.stack = kiro`, *when* init installs, *then* `.kiro/steering/021-product.md`, `021-tech.md`, `021-structure.md` (each with its YAML inclusion-mode frontmatter), `.kiro/agents/021.json`, and the materialized `skill://` skills are written, and **no** `CLAUDE.md`/`.claude/`, **no** `AGENTS.md`/`.agents/` appear.
2. **`kiro` is no longer reserved** — *Given* `--stack kiro`, *when* the engine resolves the adapter, *then* it succeeds (no "not yet supported" throw) and the manifest records `tools.stack = kiro`, `tools.ssd = kiro-specs`.
3. **`claude`/`antigravity` unchanged** — *Given* either other stack, *when* init installs, *then* the tree is byte-identical to specs 006/007 (golden fixture + `.agents/` surface intact); no `.kiro/` path appears.
4. **Engine dispatch: read Kiro spec state** — *Given* `tools.ssd = kiro-specs`, *when* `021-spec:status`/the gate reads a feature's status, *then* it reads the `status:` injected in `.kiro/specs/<feature>/requirements.md` and derives task progress from `.kiro/specs/<feature>/tasks.md` — **not** `specs/NNN-*/spec.md`.
5. **Engine dispatch: default is `github-speckit`** — *Given* `tools.ssd` absent or `github-speckit`, *when* any `scripts/speckit/*` runs, *then* behavior is exactly today's (`specs/NNN-*/spec.md`) — pre-mvp-4 and `claude`/`antigravity` repos unaffected.
6. **Gate honors the Kiro engine** — *Given* a `kiro-specs` repo, *when* the pre-commit gate runs, *then* it blocks/permits implementation commits by reading the `.kiro/specs/<feature>` status, with the same semantics as the `github-speckit` gate.
7. **Steering is `021-`-namespaced and non-destructive** — *Given* a repo with pre-existing `.kiro/steering/*.md` of the user's own, *when* init installs, *then* only `021-`-prefixed steering files are written/owned; the user's steering is untouched (ownership model, spec 001).
8. **Migrate detects and installs Kiro** — *Given* a repo with `.kiro/` and no `--stack`, *when* migrate runs, *then* detection proposes `kiro` (spec 002) and the install writes the `.kiro/` surface through the shared pipeline.

## Functional Requirements

- **FR-001 — Populate the `kiro` adapter (un-reserve).** Remove `kiro` from `RESERVED` in `adapters.js` and add its entry. Kiro has **no `ASSISTANT-Template.md` entrypoint** — the `entrypoint` field becomes optional; the steering set is the instruction surface (FR-002). `getAdapter('kiro')` no longer throws.
- **FR-002 — Steering surface (`kind: 'steering'`).** *(clarified)* Render `.kiro/steering/021-{product,tech,structure}.md` from **stable framework templates** carrying operating guidance (product = how the 021 lifecycle/product docs work; tech = `CODE.md`/TDD conventions; structure = the workflow summary) — **not** from the target's live key docs, which reach Kiro via the agent `resources` globs (FR-003). Each dest carries the Kiro YAML inclusion-mode frontmatter (`always` for product/tech; `fileMatch` where scoped). Framework-owned, `021-`-namespaced, refreshed on `--upgrade`. Because the source is a stable template, `kind:'steering'` is a template **relocate** (ensure frontmatter → write to dest) — no live-doc compose, no staleness. Extends the spec 007 `surface.js` with a `steering` kind.
- **FR-003 — Agent surface (`kind: 'agent-json'`).** Render `.kiro/agents/021.json` — the Kiro CLI agent (`prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks`), invoked as `021` (TDD §9.2). Emitted as plain-text JSON (zero-dep). *(Name-collision with the spec 009 `bin/021` CLI is noted in Out of Scope — deferred to the 009 clarify per TDD §9.2.)*
- **FR-004 — `skill://` resources (materialized).** *(clarified)* Materialize the framework skills into a `.kiro/`-native location as a third rendered surface — reusing the spec 007 skill render (`skills/*.md` → a per-skill `.kiro/` dest) — and reference them by `skill://` from `021.json`. Framework-owned, `021-`-namespaced. (The exact `.kiro/` skills path + `skill://` URI form is settled in plan.)
- **FR-005 — Stack-aware ownership for `.kiro/`.** `.kiro/steering/021-*.md` and `.kiro/agents/**` classify as framework-owned under `kiro`, and are **outside the managed surface** under any other stack; the common user docs (`PRODUCT`/`CODE`/`DESIGN`/`README`) and `requirements/*` remain stack-invariant Layer-1. No `CLAUDE.md`/`AGENTS.md` entrypoint for kiro.
- **FR-006 — Un-chosen stacks install nothing (extended).** No `.kiro/` path is created/owned under `claude`/`antigravity`; no `.claude/`/`.agents/`/entrypoint under `kiro`. The neutral-core invariant now spans three stacks.
- **FR-007 — SSD engine abstraction (per-engine module).** *(clarified)* Introduce `scripts/speckit/engines/{github-speckit,kiro-specs}.js`, each implementing a small interface — `listSpecs`, `specPath`, `readStatus`, `writeStatus`, `countTasks`, `contextFor`. `lib.js` resolves the engine from `tools.ssd` and delegates; `github-speckit` → `specs/NNN-*/spec.md` (today's behavior, extracted verbatim); `kiro-specs` → `.kiro/specs/<feature>/{requirements,design,tasks}.md` with `status:` in `requirements.md` and task progress from `tasks.md`. The scripts above `lib.js` (`spec-status.js`, `verify-spec-compliance.js`, `fetch-speckit-context.js`, `doctor.js`) consume the seam unchanged in shape.
- **FR-008 — Gate honors the engine.** The pre-commit gate (spec 005) reads spec status through the FR-007 seam, so it blocks/permits `kiro-specs` implementation commits with the same semantics as `github-speckit`.
- **FR-009 — `github-speckit` regression bar.** With `tools.ssd` absent or `github-speckit`, every script and the gate behave **exactly** as today; the 006 golden fixture and 007 `.agents/` surface are untouched. Default resolution is `github-speckit`.
- **FR-010 — Migrate wire-through.** Spec 002 detection (`.kiro/` ⇒ `kiro`) resolves to a real `kiro` install + `kiro-specs` engine through this adapter (scaffold and migrate).
- **FR-011 — Zero runtime dependencies.** `fs`/`path`/`JSON` only; EARS/steering/agent JSON emitted as plain text. Manifest schema unchanged (`tools.stack`/`tools.ssd` already exist).
- **FR-012 — Package sync + acceptance matrix.** `sync-to-package.js` ships any new modules/templates; the 3-stack neutral-core invariant holds (only each stack's Layer-2 differs). `npm run sync:package -- --check` and `npm test` stay green.

## Key Entities

- **Kiro adapter entry** — `adapters.js`: no `entrypoint` (Open Q1); `surfaceRenders` with `kind: 'steering'` (3 descriptors, steering templates → `.kiro/steering/021-*.md`), `kind: 'agent-json'` (→ `.kiro/agents/021.json`), and the materialized skills (reusing the 007 skill render into a `.kiro/` `toDir`); the ownership `toDir`s `.kiro/steering` + `.kiro/agents` + the `.kiro/` skills dir.
- **Steering templates** — stable framework operating-guidance docs under `templates/` (product/tech/structure); the `kind:'steering'` transform ensures the Kiro inclusion-mode frontmatter and writes the `021-`-namespaced dest.
- **SSD engine module** — `scripts/speckit/engines/{github-speckit,kiro-specs}.js`, each implementing `listSpecs`/`specPath`/`readStatus`/`writeStatus`/`countTasks`/`contextFor`; `lib.js` resolves from `tools.ssd` and delegates. `github-speckit` (today's `specs/NNN-*/spec.md`) + `kiro-specs` (`.kiro/specs/<feature>/…`).
- **`tools.ssd`** — the manifest field (already `kiro-specs` for kiro via `resolveTools`) that selects the engine.

## Acceptance Criteria

- `kiro` install → `.kiro/steering/021-{product,tech,structure}.md` + `.kiro/agents/021.json` present; no `CLAUDE.md`/`.claude/`, no `AGENTS.md`/`.agents/`; manifest `tools.stack=kiro`, `tools.ssd=kiro-specs`.
- `getAdapter('kiro')` no longer throws; `claude`/`antigravity` installs byte-identical to specs 006/007.
- 3-stack cross-diff → only each stack's Layer-2 differs; Layer-1 byte-identical.
- `021-spec:status`/`verify`/`context` and the gate read `.kiro/specs/<feature>/` under `kiro-specs`, and `specs/NNN-*/spec.md` under `github-speckit` (default).
- Migrate on a `.kiro/` repo → proposes `kiro`, installs the surface, engine reads `.kiro/specs`.
- `npm test` / `npm run lint` / `npm run check:links` / `npm run sync:package -- --check` green.

## Out of Scope

- **The `021` CLI** (`bin/021`) — spec 009. This spec's steering/agent may reference lifecycle commands by their current npm-script names; re-pointing at `021 …` is 009's job. **The bare-`021` name collision** (this spec's `.kiro/agents/021.json` "invoked as `021`" vs 009's `bin/021`) is flagged in TDD §9.2 for the 009 clarify — 008 uses `021.json` as TDD specifies and does not decide the CLI bin name.
- **AI-led interactive walkthrough** / `--stack`/`--design` UX — separate mvp-4 item; this spec consumes a resolved `tools.stack`/`tools.ssd`.
- **Design-system adapter / `material-3`** — independent of the stack seam (TDD §9.4).
- **Authoring real Kiro spec *content*** (converting the framework's own `specs/` to EARS) — 008 delivers the *engine* that reads/writes `kiro-specs`, not a migration of existing specs. The dogfood repo stays `github-speckit`.
- **Steering auto-regeneration on key-doc change** — moot under the clarify outcome: steering renders from **stable framework templates** (not the live key docs), so there is no per-project staleness to chase. Steering refreshes like any framework-owned file on `--upgrade`.

## Dependencies & References

- [spec 006](../006-source-layer-renderer/spec.md) — registry + stack-parameterized surface + the golden bar.
- [spec 007](../007-antigravity-adapter/spec.md) — `surface.js` rendered-surface mechanism this extends (`kind: 'steering'`/`'agent-json'`), `frameworkSourceDirs`/render-`toDir` ownership split, optional-entrypoint precedent (`entrypoint.honored`).
- [spec 002](../002-migrate-mode/spec.md) — `.kiro/` ⇒ `kiro` detection (`migrate/detect.js:133`).
- [spec 003](../003-manifest-qa-contract/spec.md) — `manifestFacts` seam (reads `tools.ssd`).
- [spec 004](../004-workflow-doctor/spec.md) / [spec 005](../005-precommit-chaining/spec.md) — `021-doctor` + the pre-commit gate, both read spec state through `lib.js` (FR-007/008).
- TDD §9.2 (Kiro mapping: steering, `021.json`, `skill://`), §9.3 (`kiro-specs` engine contract), §6 (naming), §7 (`tools.ssd`).
- [_notes/repo-refactor.md](../../requirements/_notes/repo-refactor.md) §5.2 (spec cut — 008), §2.2 P3/P4.

## Open Questions

*Resolved in the 2026-07-18 clarify session (see Clarifications): steering = **framework guidance from stable templates** (not live key docs — so no staleness and `kind:'steering'` is a template relocate, dissolving the old "multi-source compose" question); engine dispatch = **per-engine module** (`engines/{github-speckit,kiro-specs}.js`) behind a small interface; `skill://` skills are **materialized under `.kiro/`**; **one spec** (install + engine). Confirmed by TDD §9.3: `kiro-specs` `writeStatus` injects/updates `status:` in `.kiro/specs/<feature>/requirements.md`, and task progress reads that feature's `tasks.md` checkboxes (matching `countTasks`).*

*Two implementation-structure details deferred to the plan step (not sign-off blockers):*

1. **Entrypoint-less stack expression.** `kiro` has no `ASSISTANT-Template.md` entrypoint (steering is the surface). Plan decides how `adapters.js`/`classes.js`/`classify.js` express an absent entrypoint (explicit `entrypoint: null` vs. omitting the field) so `userFiles`/`userDocMappings` skip the render mapping without special-casing — building on the 007 `entrypoint.honored` optionality.
2. **`.kiro/` paths.** The exact steering-template source location under `templates/`, the materialized-skills `.kiro/` path + `skill://` URI form, and the `021.json` schema — settled in plan/contracts.
