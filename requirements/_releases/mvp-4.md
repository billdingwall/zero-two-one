# Release: mvp-4 — AI-Led Init & Stack/Design Adapters

- **Type:** MVP release
- **Status:** Planned
- **Lifecycle Phase:** MVP Build (Phase 2)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Make init assistant-led and multi-stack: the interactive walkthrough over the mvp-3 engine, plus the three supported stacks and the pluggable design-system adapter (r3 "Stacks & Design Adapters", TDD §9).

## Scope

- [ ] AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview (stack, design, phase, conflicts).
- [ ] Source-layer generalization: `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` neutral default; `claude` renders `CLAUDE.md` unchanged.
- [ ] `antigravity` stack: `AGENTS.md` rendering; `.agents/skills/021-<name>/`; MCP registration guidance; Spec Kit pairing validation.
- [ ] `kiro` stack: `.kiro/steering/021-*` + `.kiro/agents/021.json`; `kiro-specs` engine binding; engine-dispatch layer in `scripts/speckit/*`.
- [ ] Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` binding (Theme Builder import; M3 Expressive implications).
- [ ] Init integration: `--stack`/`--design` flags, migrate-mode stack detection, manifest `tools.stack`/`tools.design`.
- [ ] **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021-status`/`021-qa` working in all six cells; no framework file outside the `021-` namespace in shared dirs. Reuses the mvp-3 fixture-repo test harness (r7).
- [ ] **README stack-availability labels removed** (r7): once `--stack antigravity|kiro` is real, drop the "lands at mvp-4" caveats from the README install prompts.
- [ ] **Programmatic API decision** (r7, audit §4): decide whether to expose `scripts/speckit/lib.js` via `exports` (`require('zero-two-one/speckit')`) for agent runtimes, alongside the `x_command` shell bridge — decided with the adapter seam. (TDD §14.)

## Exit Gate

The 3×2 acceptance matrix passes; init/migrate works on all three stacks with either design binding; README stack caveats removed; the API-surface decision is recorded.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-15 (r7):** Added the programmatic-API decision (expose `lib.js` via `exports`?), README stack-caveat removal, and fixture-harness reuse from mvp-3. Per [_refinement/r7-review.md](../_refinement/r7-review.md).
- **2026-07-12 (r5):** New release — absorbs the r4 mvp-3 "Stacks & Design Adapters" group + the AI-led walkthrough, sequenced after the Init v2 engine (mvp-3).
