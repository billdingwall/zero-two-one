# Release: mvp-4 — AI-Led Init & Stack/Design Adapters

- **Type:** MVP release
- **Status:** Planned
- **Lifecycle Phase:** MVP Build (Phase 3)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [04-ROADMAP.md](../04-ROADMAP.md) · [05-BACKLOG.md](../05-BACKLOG.md)

## Goal

Make init assistant-led and multi-stack: the interactive walkthrough over the mvp-3 engine, plus the three supported stacks and the pluggable design-system adapter (r3 "Stacks & Design Adapters", TDD §9).

## Scope

- [ ] AI-led init walkthrough (TDD §1) driving the engine via flags; ask-don't-assume interview (stack, design, phase, conflicts).
- [ ] Source-layer generalization: `CLAUDE-Template.md` → `ASSISTANT-Template.md`; `AGENTS.md` neutral default; `claude` renders `CLAUDE.md` unchanged.
- [ ] `antigravity` stack: `AGENTS.md` rendering; `.agents/skills/021-<name>/`; MCP registration guidance; Spec Kit pairing validation.
- [ ] `kiro` stack: `.kiro/steering/021-*` + `.kiro/agents/021.json`; `kiro-specs` engine binding; engine-dispatch layer in `scripts/speckit/*`.
- [ ] Design-system adapter (TDD §9.4): `DESIGN.md` token-mapping + `requirements/_design/tokens/`; `material-3` binding (Theme Builder import; M3 Expressive implications).
- [ ] Init integration: `--stack`/`--design` flags, migrate-mode stack detection, manifest `tools.stack`/`tools.design`.
- [ ] **Acceptance matrix: 3 stacks × {none, material-3}** — gate green + `021-status`/`021-qa` working in all six cells; no framework file outside the `021-` namespace in shared dirs.

## Exit Gate

The 3×2 acceptance matrix passes; init/migrate works on all three stacks with either design binding.

## Delivered

*Summary written at release close.*

## Changelog
- **2026-07-12 (r5):** New release — absorbs the r4 mvp-3 "Stacks & Design Adapters" group + the AI-led walkthrough, sequenced after the Init v2 engine (mvp-3).
