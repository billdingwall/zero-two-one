# Release: mvp-4 — AI-Led Init & Stack/Design Adapters

- **Type:** MVP release
- **Status:** Planned
- **Lifecycle Phase:** MVP Build (Phase 1)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Make init assistant-led and multi-stack: the interactive walkthrough over the mvp-3 engine, plus the three supported stacks and the pluggable design-system adapter (r3 "Stacks & Design Adapters", TDD §9).

## Scope

*Realizes the **three-layer model** (r9, [_notes/repo-refactor.md](../_notes/repo-refactor.md) §3): neutral core (Layer 1) installs identically for every stack; only the chosen stack's adapter surface (Layer 2) is written at init; un-chosen stacks install **nothing**. Sequenced as a spec cut, each through the full Spec Kit workflow.*

- [ ] **Spec 006 — Source layer & stack-parameterized renderer** (r9): `templates/ASSISTANT-Template.md` neutral source; renderer transforms in the init engine; **`classes.js FRAMEWORK_DIRS` + `sources.js userDocMappings` resolve from the manifest `tools.stack`** instead of hard-wiring `.claude/commands` + `CLAUDE.md`. Regression bar: `claude` renders `CLAUDE.md` + `.claude/commands/021-*` **byte-identical to today**. `--upgrade` respects the recorded stack.
- [ ] **Spec 007 — Antigravity adapter** (r9): `AGENTS.md` (root; `GEMINI.md` honored) entrypoint; `skills/*.md` → `.agents/skills/021-<name>/SKILL.md`; MCP registration guidance; wires through the migrate-mode `.agents/`/`AGENTS.md` detection already in spec 002.
- [ ] **Spec 008 — Kiro adapter + engine dispatch** (r9): `.kiro/steering/021-{product,tech,structure}.md` rendering (TDD §9.2 mapping); `.kiro/agents/021.json`; `kiro-specs` engine dispatch in `scripts/speckit/*` reading `tools.ssd` via the spec-003 `manifestFacts` seam.
- [ ] **Spec 009 — the `021` CLI** (r9): a single assistant-agnostic command surface (`021 status|qa|doctor|spec …`) dispatching over the existing scripts — Node built-ins only; adapters emit instructions referencing it. Replaces the Makefile idea (repo-refactor §1.2/§3.3); npm scripts stay as aliases.
- [ ] AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview (stack, design, phase, conflicts).
- [ ] Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` binding (Theme Builder import; M3 Expressive implications).
- [ ] Init integration: `--stack`/`--design` flags, migrate-mode stack detection, manifest `tools.stack`/`tools.design`.
- [ ] **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021 status`/`021 qa` working in all six cells; no framework file outside the `021-` namespace in shared dirs. Reuses the mvp-3 fixture-repo test harness (r7). **Plus the neutral-core invariant (r9):** diff the installed tree across stacks — **only Layer-2 (adapter) paths may differ.**
- [ ] **README stack-availability labels removed** (r7): once `--stack antigravity|kiro` is real, drop the "lands at mvp-4" caveats from the README install prompts.
- [ ] **Programmatic API decision** (r7, audit §4): decide whether to expose `scripts/speckit/lib.js` via `exports` (`require('zero-two-one/speckit')`) for agent runtimes, alongside the `021` CLI shell bridge — decided with the adapter seam. (TDD §14.)

## Exit Gate

The 3×2 acceptance matrix passes **and the neutral-core invariant holds** (only adapter paths differ across stacks); init/migrate works on all three stacks with either design binding; the `021` CLI drives all stacks; README stack caveats removed; the API-surface decision is recorded.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-16 (r9):** Scope organized into the three-layer model + an explicit spec cut — **006** source layer/stack-parameterized renderer, **007** Antigravity adapter, **008** Kiro adapter + engine dispatch, **009** the `021` CLI (replaces the Makefile idea). Added the **neutral-core invariant** to the acceptance matrix + exit gate. Per [_refinement/r9-review.md](../_refinement/r9-review.md) (source: [_notes/repo-refactor.md](../_notes/repo-refactor.md)).
- **2026-07-15 (r7):** Added the programmatic-API decision (expose `lib.js` via `exports`?), README stack-caveat removal, and fixture-harness reuse from mvp-3. Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New release — absorbs the r4 mvp-3 "Stacks & Design Adapters" group + the AI-led walkthrough, sequenced after the Init v2 engine (mvp-3).
