---
status: Applied
round: 9
---

# r9 Update Plan: Workflow docs (Group B)

**Date:** 2026-07-16 · **Source:** [r9-review.md](r9-review.md) §B · [_notes/repo-refactor.md](../_notes/repo-refactor.md) §3.2
**Targets:** `workflow/specific-workflows/review-sync.md`

## Intent
Formalize refinement-round state as YAML frontmatter (the audit's "human-review gate" idea, adapted to existing machinery) so tooling reads round state instead of parsing prose — no new state store.

## Applied edits
1. **review-sync.md** — added a "Round state" note: every `r{n}-review.md`/`r{n}-update-*.md` carries `status: Draft | Pending approval | Applied | Closed` (+ `round: N`) frontmatter; `021-doctor` may flag a round whose review is `Applied`/`Closed` while an update plan still says `Pending approval` (advisory; TDD §13). Rounds before r9 are not retrofitted.
2. **Dogfood:** r9's own review + the six update plans carry the frontmatter.

## Cascade
The `021-doctor` round-state check (advisory) is a small tooling follow-up — a candidate first mvp-4 tooling task or a standalone increment; not required to land the convention. No other workflow doc changed (the loop shape is unchanged).
