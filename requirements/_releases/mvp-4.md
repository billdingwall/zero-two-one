# Release: mvp-4 — AI-Led Init & Stack/Design Adapters

- **Type:** MVP release
- **Status:** In Progress — the **adapter cut (specs 006–009) is Delivered** (2026-07-18); the AI-led walkthrough and design-system adapter remain before the Exit Gate is met.
- **Lifecycle Phase:** MVP Build (Phase 1)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Make init assistant-led and multi-stack: the interactive walkthrough over the mvp-3 engine, plus the three supported stacks and the pluggable design-system adapter (r3 "Stacks & Design Adapters", TDD §9).

## Scope

*Realizes the **three-layer model** (r9, [_notes/repo-refactor.md](../_notes/repo-refactor.md) §3): neutral core (Layer 1) installs identically for every stack; only the chosen stack's adapter surface (Layer 2) is written at init; un-chosen stacks install **nothing**. Sequenced as a spec cut, each through the full Spec Kit workflow.*

- [x] **Spec 006 — Source layer & stack-parameterized renderer** (r9): `templates/ASSISTANT-Template.md` neutral source; renderer transforms in the init engine; **`classes.js FRAMEWORK_DIRS` + `sources.js userDocMappings` resolve from the manifest `tools.stack`** instead of hard-wiring `.claude/commands` + `CLAUDE.md`. Regression bar: `claude` renders `CLAUDE.md` + `.claude/commands/021-*` **byte-identical to today**. `--upgrade` respects the recorded stack. *(Done 2026-07-18.)*
- [x] **Spec 007 — Antigravity adapter** (r9): `AGENTS.md` (root; `GEMINI.md` honored) entrypoint; `skills/*.md` → `.agents/skills/021-<name>/SKILL.md`; MCP registration guidance; wires through the migrate-mode `.agents/`/`AGENTS.md` detection already in spec 002. *(Done 2026-07-18. Steering ships both the library + lifecycle commands; frontmatter added to `skills/*.md` at rest.)*
- [x] **Spec 008 — Kiro adapter + engine dispatch** (r9): `.kiro/steering/021-{product,tech,structure}.md` rendering (TDD §9.2 mapping); `.kiro/agents/021.json`; `kiro-specs` engine dispatch in `scripts/speckit/*` reading `tools.ssd` via the spec-003 `manifestFacts` seam. *(Done 2026-07-18. Steering is stable-template operating guidance; engine dispatch via `scripts/speckit/engines/{github-speckit,kiro-specs}.js` behind a `docs` filename-map.)*
- [x] **Spec 009 — the `021` CLI** (r9): a single assistant-agnostic command surface (`021 status|qa|doctor|spec …`) dispatching over the existing scripts — Node built-ins only; adapters emit instructions referencing it. Replaces the Makefile idea (repo-refactor §1.2/§3.3); npm scripts stay as aliases. *(Done 2026-07-18. Bin name `021`; adapters reference `npx 021 …`; golden fixture re-baselined.)*
- [ ] AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview (stack, design, phase, conflicts). **← still pending.**
- [ ] Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` binding (Theme Builder import; M3 Expressive implications). **← still pending.**
- [~] Init integration: `--stack`/`--design` flags, migrate-mode stack detection, manifest `tools.stack`/`tools.design`. *(Stack side done: `--stack` flag, migrate stack detection (spec 002), manifest `tools.stack`/`tools.ssd`. `--design` flag + `tools.design` wiring pending with the design adapter.)*
- [~] **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021 status`/`021 qa` working in all six cells; no framework file outside the `021-` namespace in shared dirs. Reuses the mvp-3 fixture-repo test harness (r7). **Plus the neutral-core invariant (r9):** diff the installed tree across stacks — **only Layer-2 (adapter) paths may differ.** *(The `{none}` × 3-stack row is proven — the neutral-core invariant is an automated test (`renderer.test.js` T006, all three stacks; `021`-namespacing enforced by `classify`). The `{material-3}` column awaits the design adapter.)*
- [x] **README stack-availability labels removed** (r7): once `--stack antigravity|kiro` is real, drop the "lands at mvp-4" caveats from the README install prompts. *(Done — spec 009 FR-008.)*
- [x] **Programmatic API decision** (r7, audit §4): decide whether to expose `scripts/speckit/lib.js` via `exports` (`require('zero-two-one/speckit')`) for agent runtimes, alongside the `021` CLI shell bridge — decided with the adapter seam. (TDD §14.) *(Decided **yes** — spec 009 FR-009: `exports` map ships `./speckit`.)*

## Exit Gate

The 3×2 acceptance matrix passes **and the neutral-core invariant holds** (only adapter paths differ across stacks); init/migrate works on all three stacks with either design binding; the `021` CLI drives all stacks; README stack caveats removed; the API-surface decision is recorded.

## Delivered

### Adapter cut — specs 006–009 (2026-07-18) ✅

The **three-layer neutral-core/adapter model** (r9 / repo-refactor §3) is realized across all three supported stacks. The install surface is fully stack-parameterized: neutral core (Layer 1) installs identically for every stack; only the chosen stack's Layer-2 adapter surface is written; un-chosen stacks install nothing.

- **006 — Source layer & renderer:** neutral `templates/ASSISTANT-Template.md`; `scripts/init/{adapters,render}.js`; `classes.js`/`sources.js` resolve the surface from `tools.stack`. `claude` output byte-identical (golden fixture).
- **007 — Antigravity:** `AGENTS.md` (or honored `GEMINI.md`) entrypoint + `.agents/skills/021-*/SKILL.md` via a rendered-surface mechanism (`scripts/init/surface.js`); MCP post-install note.
- **008 — Kiro:** entrypoint-less stack — `.kiro/steering/021-*.md` (stable-template operating guidance) + `.kiro/agents/021.json` + materialized `.kiro/skills`; **`kiro-specs` SSD engine dispatch** — `scripts/speckit/engines/{github-speckit,kiro-specs}.js` behind a `SpecEngine` interface; the gate honors it.
- **009 — the `021` CLI:** `bin/021.js` routing shell; all three stacks' rendered instructions reference `npx 021 …` (one contract, three renderings); `exports` programmatic API; README caveat removed.

**Proven guarantees:** the neutral-core invariant is an automated cross-stack test for all three stacks (only Layer-2 differs); `claude` byte-identical held through 006–008 and was intentionally, reviewably re-baselined at 009; `github-speckit` behavior unchanged by the engine dispatch; zero runtime dependencies throughout; 88 tests green.

### Remaining before the Exit Gate (release **not** yet closed)

- **AI-led init walkthrough** (interactive interview over the engine).
- **Design-system adapter** — `DESIGN.md` token-mapping + `material-3` binding — and with it the `--design` flag/`tools.design` wiring and the `{material-3}` column of the 3×2 acceptance matrix.

## Changelog
- **2026-07-18 (adapter cut delivered):** Specs 006–009 all `Done`; the stack-adapter three-layer model is live across `claude`/`antigravity`/`kiro`, plus the `021` CLI, README caveat removal, and the programmatic-API decision (`exports`). Release stays **In Progress** — the AI-led walkthrough + design-system/`material-3` adapter remain before the Exit Gate. Delivered on branch `mvp-4-stack-adapters` (commits `f830df3`/`9b991bb`/`039d2df`/`41d5d6c`).
- **2026-07-16 (r9):** Scope organized into the three-layer model + an explicit spec cut — **006** source layer/stack-parameterized renderer, **007** Antigravity adapter, **008** Kiro adapter + engine dispatch, **009** the `021` CLI (replaces the Makefile idea). Added the **neutral-core invariant** to the acceptance matrix + exit gate. Per [_refinement/r9-review.md](../_refinement/r9-review.md) (source: [_notes/repo-refactor.md](../_notes/repo-refactor.md)).
- **2026-07-15 (r7):** Added the programmatic-API decision (expose `lib.js` via `exports`?), README stack-caveat removal, and fixture-harness reuse from mvp-3. Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New release — absorbs the r4 mvp-3 "Stacks & Design Adapters" group + the AI-led walkthrough, sequenced after the Init v2 engine (mvp-3).
