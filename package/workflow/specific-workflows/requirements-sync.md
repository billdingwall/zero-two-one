# Requirements Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 3). Applies approved update plans to the key docs and cross-checks them.*

**Goal:** Apply the approved `r{n}-update-{doc}.md` plans to the living key docs in dependency order, then verify the set stays internally consistent.

## Steps
1. Apply in dependency order: **PRD → EDD → TDD → Backlog → Roadmap** (backlog is the input, roadmap the output).
2. Log each change in the target doc's Changelog with the round tag.
3. **Cohesion cross-check:** re-read PRD/EDD/TDD as one set — resolve any contradiction (phase names, feature scope, numbering, links) before the round closes.
4. Sweep for broken inbound links introduced by any rename in the round.

**Reads:** approved `r{n}-update-*.md`. **Writes:** `requirements/0N-*.md` (+ changelogs). **Feeds:** [guidance-sync](guidance-sync.md), [backlog-sync](backlog-sync.md), [roadmap-sync](roadmap-sync.md).
