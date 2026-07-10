# Refinement Overview

Directory tracking the refinement loop cycles.

## Manifest

- `_INDEX.md`: This file, and instructions for refinement.
- `r{x}-review.md`: Refinement round review files (when created).
- `r{x}-update-{doc}.md`: Per-document synthesis plans for a round; the human approves these before living docs are edited.

## Current Round: r3 — supported tool stacks + pluggable design system

Synthesis plans awaiting approval. Three named stacks (stakeholder direction): `claude` = Claude Code + Spec Kit · `antigravity` = Antigravity + Spec Kit · `kiro` = Kiro assistant + Kiro specs; design system chosen independently (`none` / `material-3`). Research basis: [_notes/r3-tool-research.md](../_notes/r3-tool-research.md).

- [r3-review.md](r3-review.md) — stack model, adapter findings, layer-invariant audit, architecture-proposal drift review.
- [r3-update-prd.md](r3-update-prd.md) — supported stacks as Core Feature 7.
- [r3-update-tdd.md](r3-update-tdd.md) — §9 stack + design adapter contracts; §4 retitle; manifest `stack`/`design` keys.
- [r3-update-roadmap.md](r3-update-roadmap.md) — adapter-shaped Init v2 in MVP; stack implementation post-MVP (recommended).
- [r3-update-backlog.md](r3-update-backlog.md) — Stacks & Design Adapters task group; 3×2 acceptance matrix.
- [r3-update-workflows.md](r3-update-workflows.md) — de-bind layers 2–3; design-system-selection workflow; reconcile the architecture proposal.

## Closed Rounds

- **r2** (2026-07-10, Applied): [r2-review.md](r2-review.md) — safe install & migration into working projects (Claude Code + Spec Kit stack). Plans: [prd](r2-update-prd.md) · [tdd](r2-update-tdd.md) · [roadmap](r2-update-roadmap.md) · [backlog](r2-update-backlog.md) · [workflows](r2-update-workflows.md).
- **r1** (2026-07-10, Applied): [r1-review.md](r1-review.md) — package boundary, template drift, v2 features, MVP→Growth mechanics. Plans: [tdd](r1-update-tdd.md) · [roadmap](r1-update-roadmap.md) · [backlog](r1-update-backlog.md) · [workflows](r1-update-workflows.md).
