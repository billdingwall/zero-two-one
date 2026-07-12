# Refinement Overview

Directory tracking the refinement loop cycles.

## Manifest

- `_INDEX.md`: This file, and instructions for refinement.
- `r{x}-review.md`: Refinement round review files (when created).
- `r{x}-update-{doc}.md`: Per-document synthesis plans for a round; the human approves these before living docs are edited.

## Current Round

None open. The next round should use the stage-matched review template from `templates/reviews/` (Pre-build).

## Closed Rounds

- **r5** (2026-07-12, **Closed**): [r5-review.md](r5-review.md) — `/harden-docs` alignment audit + team answers. Six engineering-ordered MVP releases (mvp-1…mvp-6); dogfooded `.zero-two-one.json` + `workflow-status.js` manifest-read (phase drift resolved); optional `021-prototype` (prototype off the critical path); publish gated behind safe-install; v2/Growth backlog emptied; new `requirements/_design/command-design.md` + `workflow-design.md`; feedback repo slug resolved; success metrics reframed. Re-audit came back clean (no showstoppers/orphans/scope creep). Close-out: Q2 (mvp-2 CLI walkthrough demo) + Q3 (`mode: source` + mvp-3 manifest regen) applied; constraint check amended `CODE.md` §1 (optional prototype); RLP steps 4–6 complete.
- **r4** (2026-07-12, Applied): [r4-review.md](r4-review.md) — vision-alignment round, 18 findings. PRD/EDD/TDD as one cohesive set; AI-led init walkthrough (LLM as core dependency); MVP releases + `requirements/_releases/`; v2 stack/design work promoted to MVP; `021-feedback` + `021-design`; stage-specific review templates; README install prompts. Plans: [prd](r4-update-prd.md) · [edd](r4-update-edd.md) *(first EDD round)* · [tdd](r4-update-tdd.md) · [roadmap](r4-update-roadmap.md) · [backlog](r4-update-backlog.md) · [workflows](r4-update-workflows.md).

- **r3** (2026-07-10, Applied): [r3-review.md](r3-review.md) — three supported stacks (`claude`/`antigravity`/`kiro`), pluggable design system (`none`/`material-3`), `021-` naming convention, layer de-binding, proposal reconciliation. Research: [_notes/r3-tool-research.md](../_notes/r3-tool-research.md). Plans: [prd](r3-update-prd.md) · [tdd](r3-update-tdd.md) · [roadmap](r3-update-roadmap.md) · [backlog](r3-update-backlog.md) · [workflows](r3-update-workflows.md).

- **r2** (2026-07-10, Applied): [r2-review.md](r2-review.md) — safe install & migration into working projects (Claude Code + Spec Kit stack). Plans: [prd](r2-update-prd.md) · [tdd](r2-update-tdd.md) · [roadmap](r2-update-roadmap.md) · [backlog](r2-update-backlog.md) · [workflows](r2-update-workflows.md).
- **r1** (2026-07-10, Applied): [r1-review.md](r1-review.md) — package boundary, template drift, v2 features, MVP→Growth mechanics. Plans: [tdd](r1-update-tdd.md) · [roadmap](r1-update-roadmap.md) · [backlog](r1-update-backlog.md) · [workflows](r1-update-workflows.md).
