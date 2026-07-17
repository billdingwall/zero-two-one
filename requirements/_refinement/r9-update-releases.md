---
status: Applied
round: 9
---

# r9 Update Plan: Release files (Groups C, D)

**Date:** 2026-07-16 · **Source:** [r9-review.md](r9-review.md) §C, §D · [_notes/repo-refactor.md](../_notes/repo-refactor.md) §5.2, §5.3
**Targets:** `requirements/_releases/mvp-4.md` · `requirements/_releases/mvp-6.md`

## Intent
Sharpen mvp-4 into the adapter release's explicit spec cut around the three-layer model, and extend the mvp-6 pre-publish gate with the r9 regression checks.

## Applied edits
### mvp-4 (Group C)
- Scope reframed around the **three-layer model** (neutral core / per-stack adapters at init / working-repo-only) with an explicit **spec cut**: **006** source layer + stack-parameterized renderer (regression bar: `claude` output byte-identical) · **007** Antigravity adapter · **008** Kiro adapter + `kiro-specs` engine dispatch (via the spec-003 `manifestFacts` seam) · **009** the `021` CLI.
- Acceptance matrix + exit gate gain the **neutral-core invariant** (diff the installed tree across stacks — only Layer-2 paths may differ); commands referenced as `021 …`; API decision reworded to the `021` CLI bridge.

### mvp-6 (Group D)
- Pre-publish gate (step 4) extended: **tarball-content audit** (no internal specs/dev files — the P1 regression check), **install-focused shipped README** (split decision at the publish spec), **per-stack fresh-install smoke test** from the packed tarball.

## Cascade
Roadmap mvp-4 row re-described ([r9-update-roadmap.md](r9-update-roadmap.md)); backlog mvp-4 rows updated ([r9-update-backlog.md](r9-update-backlog.md)).
