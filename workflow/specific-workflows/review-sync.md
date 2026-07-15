# Review Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 1 → 2). Turns a round's review into per-doc update plans.*

**Goal:** Compare the `r{n}-review.md` feedback against the living key docs and produce one update plan per affected document.

## Steps
1. Read `r{n}-review.md` (and any inline `CHANGE:` notes queued in living docs) alongside the current key docs (`01-PRD`, `02-EDD`, `03-TDD`, `04-BACKLOG`, `05-ROADMAP`).
2. For each review item, identify which doc(s) it changes and why (the intent), following the cohesive-set rule: anything touching one of PRD/EDD/TDD is checked against all three.
3. Draft `r{n}-update-{doc}.md` for each affected doc — intent, proposed edits, and the cascade to other docs. **No living doc is edited in this step.**
4. Hand the plans to the human for approval (Refinement Loop step 2).

**Reads:** `r{n}-review.md`, key docs. **Writes:** `requirements/_refinement/r{n}-update-*.md`.
