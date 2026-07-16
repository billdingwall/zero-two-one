# r7 Update Plan: 05-ROADMAP.md (+ `_releases/` files)

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r7
**Audit items addressed:** group G (release re-scoping), F (stacks clarity), A5 (Init v2 unchanged)
**Target docs:** [../05-ROADMAP.md](../05-ROADMAP.md) · [../_releases/mvp-3.md](../_releases/mvp-3.md) · [../_releases/mvp-4.md](../_releases/mvp-4.md) · [../_releases/mvp-6.md](../_releases/mvp-6.md)
**References:** [_notes/full-repo-audit.md](../_notes/full-repo-audit.md) §5 · [r7-review.md](r7-review.md)

## Intent

Re-scope the releases per the approved architectural improvements: testing moves forward to gate the merge engine, mvp-4 gains the API decision, and mvp-6's publish step becomes a hardened CI pipeline. The roadmap table rows update to match the canonical release files.

## Proposed Edits

### 1. `_releases/mvp-3.md` — tests forward + QA contract + reporter-first (G1, G2, G3)

- **Scope additions:** automated tests for `bin/init.js` + `hooks/pre-commit` on a **non-empty fixture repo** (moved from mvp-6); manifest-as-QA-contract (single `lib.js` parser; `run-qa.sh` + hook read `.zero-two-one.json`); Workflow Manager **read-only reporter** (`021-doctor`-style drift report).
- **Exit gate amended:** the migration acceptance test ("zero user-file overwrites") is the merge engine's **definition of done** — gate does not pass without it green.

### 2. `_releases/mvp-4.md` — API decision + fixture reuse (G4, G1)

- Add decision item: programmatic `exports` surface (`zero-two-one/speckit` exposing `lib.js`) — decide with the adapter seam.
- Note the mvp-3 fixture harness is reused for the 3-stacks × {none, material-3} acceptance matrix.

### 3. `_releases/mvp-6.md` — publish hardening (G5)

- Publish step rewritten: **CI-only, tag-triggered `npm publish --provenance`**, with a pre-publish gate (dangling `main` / missing LICENSE / `.ai/context` dummies / sync drift all fail the pipeline). Manual `npm run publish:package` demoted to documented fallback or removed.
- Remove the init/hook test items now living in mvp-3 (keep e2e-via-Claude-Code + field test).

### 4. `05-ROADMAP.md` — table rows + stacks clarity (G, F)

- mvp-3 row description gains "+ fixture tests (exit gate), manifest QA contract, 021-doctor reporter"; mvp-6 row gains "CI publish pipeline (provenance)".
- MVP Releases intro: one clarity line that **all three stacks are MVP scope** (mvp-4) — matching the README labeling change (F1, executed in [r7-update-workflows.md](r7-update-workflows.md)).
- Changelog entry.

## Cascade

- Backlog rows mirror every move ([r7-update-backlog.md](r7-update-backlog.md)); TDD §14 documents the publish pipeline ([r7-update-tdd.md](r7-update-tdd.md)).
