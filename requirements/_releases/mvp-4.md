# Release: mvp-4 — AI-Led Init & Stack/Design Adapters

- **Type:** MVP release
- **Status:** Delivered — closed 2026-07-19 on the **adapter cut (specs 006–009)**; the AI-led walkthrough and init-time material-3 auto-binding were **descoped to the backlog** (see [04-BACKLOG.md](../04-BACKLOG.md) "Descoped from mvp-4").
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
- [x] **Design-system binding *mechanism*** (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` skeleton (Theme Builder JSON/CSS import). *(Delivered — not by this release, but by `021-design`, spec 011, mvp-5. The mechanism exists; only wiring it to auto-run at init time is descoped below.)*
- [→] **AI-led init walkthrough** (TDD §1): the interactive, ask-don't-assume interview driving the engine via flags. **Descoped to the backlog** (2026-07-19) — see [04-BACKLOG.md](../04-BACKLOG.md). The mechanical engine and every flag it needs already ship; only the guided interview is undelivered.
- [→] **`--design material-3` auto-binding at init**: wiring `--design material-3` to invoke the (now-shipped) `021-design` mechanism automatically at `init`/`--upgrade` time, rather than requiring a manual follow-up call. **Descoped to the backlog** (2026-07-19).
- [→] **Acceptance matrix — the `{material-3}` column** (r9 neutral-core invariant is proven for `{none}` across all 3 stacks; `renderer.test.js` T006). The `{material-3}` column needs the init-time auto-binding above. **Descoped to the backlog** (2026-07-19).
- [x] **README stack-availability labels removed** (r7): once `--stack antigravity|kiro` is real, drop the "lands at mvp-4" caveats from the README install prompts. *(Done — spec 009 FR-008.)*
- [x] **Programmatic API decision** (r7, audit §4): decide whether to expose `scripts/speckit/lib.js` via `exports` (`require('zero-two-one/speckit')`) for agent runtimes, alongside the `021` CLI shell bridge — decided with the adapter seam. (TDD §14.) *(Decided **yes** — spec 009 FR-009: `exports` map ships `./speckit`.)*

## Exit Gate

**Met on the delivered scope (2026-07-19):** the neutral-core invariant holds (only Layer-2 adapter paths differ across the three stacks, proven for the `{none}` design row); init/migrate works on all three stacks; the `021` CLI drives all stacks; README stack caveats removed; the API-surface decision is recorded. The original gate additionally required the full 3×2 (stacks × {none, material-3}) matrix and the AI-led interactive walkthrough — both **descoped to the backlog** (04-BACKLOG.md) rather than held as blockers, since the underlying material-3 binding mechanism now exists independently (`021-design`, mvp-5) and can be re-scoped as its own Growth-release spec once the init-time wiring is prioritized.

## Delivered

### Adapter cut — specs 006–009 (2026-07-18) ✅

The **three-layer neutral-core/adapter model** (r9 / repo-refactor §3) is realized across all three supported stacks. The install surface is fully stack-parameterized: neutral core (Layer 1) installs identically for every stack; only the chosen stack's Layer-2 adapter surface is written; un-chosen stacks install nothing.

- **006 — Source layer & renderer:** neutral `templates/ASSISTANT-Template.md`; `scripts/init/{adapters,render}.js`; `classes.js`/`sources.js` resolve the surface from `tools.stack`. `claude` output byte-identical (golden fixture).
- **007 — Antigravity:** `AGENTS.md` (or honored `GEMINI.md`) entrypoint + `.agents/skills/021-*/SKILL.md` via a rendered-surface mechanism (`scripts/init/surface.js`); MCP post-install note.
- **008 — Kiro:** entrypoint-less stack — `.kiro/steering/021-*.md` (stable-template operating guidance) + `.kiro/agents/021.json` + materialized `.kiro/skills`; **`kiro-specs` SSD engine dispatch** — `scripts/speckit/engines/{github-speckit,kiro-specs}.js` behind a `SpecEngine` interface; the gate honors it.
- **009 — the `021` CLI:** `bin/021.js` routing shell; all three stacks' rendered instructions reference `npx 021 …` (one contract, three renderings); `exports` programmatic API; README caveat removed.

**Proven guarantees:** the neutral-core invariant is an automated cross-stack test for all three stacks (only Layer-2 differs); `claude` byte-identical held through 006–008 and was intentionally, reviewably re-baselined at 009; `github-speckit` behavior unchanged by the engine dispatch; zero runtime dependencies throughout; 88 tests green.

### Descoped to the backlog (release closed 2026-07-19)

Rather than continue blocking the release, the two remaining items were moved to [04-BACKLOG.md](../04-BACKLOG.md)'s "Descoped from mvp-4" group for future re-proposal as Growth-release specs:

- **AI-led init walkthrough** (interactive interview over the engine) — undelivered; the engine + flags it needs are stable.
- **Design-system adapter — init-time `material-3` auto-binding** — the binding mechanism itself was **not actually missing at close**: it shipped independently as `021-design` (spec 011, mvp-5), which any project can already run post-init to adopt `material-3`. What's descoped is narrower than originally scoped — only wiring `--design material-3` to invoke that mechanism automatically during `init`/`--upgrade`, and the `{material-3}` acceptance-matrix column that depends on it.

## Changelog
- **2026-07-19 (release closed):** mvp-4 marked **Delivered** on the adapter-cut scope. The AI-led walkthrough and init-time material-3 auto-binding descoped to `04-BACKLOG.md` rather than held as blockers — the material-3 binding mechanism had, in the interim, shipped anyway via `021-design` (mvp-5, spec 011), narrowing the real gap to init-time wiring only. Exit Gate and Scope re-worded to match the delivered state.
- **2026-07-18 (adapter cut delivered):** Specs 006–009 all `Done`; the stack-adapter three-layer model is live across `claude`/`antigravity`/`kiro`, plus the `021` CLI, README caveat removal, and the programmatic-API decision (`exports`). Delivered on branch `mvp-4-stack-adapters` (commits `f830df3`/`9b991bb`/`039d2df`/`41d5d6c`).
- **2026-07-16 (r9):** Scope organized into the three-layer model + an explicit spec cut — **006** source layer/stack-parameterized renderer, **007** Antigravity adapter, **008** Kiro adapter + engine dispatch, **009** the `021` CLI (replaces the Makefile idea). Added the **neutral-core invariant** to the acceptance matrix + exit gate. Per [_refinement/r9-review.md](../_refinement/r9-review.md) (source: [_notes/repo-refactor.md](../_notes/repo-refactor.md)).
- **2026-07-15 (r7):** Added the programmatic-API decision (expose `lib.js` via `exports`?), README stack-caveat removal, and fixture-harness reuse from mvp-3. Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New release — absorbs the r4 mvp-3 "Stacks & Design Adapters" group + the AI-led walkthrough, sequenced after the Init v2 engine (mvp-3).
