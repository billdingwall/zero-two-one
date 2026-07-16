# Backlog Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 3). Turns key-doc changes and review items into backlog rows.*

**Goal:** Keep `04-BACKLOG.md` — the input side of the data flow — current as the table (description · status · ownership · release).

## Steps
1. From the updated key docs and the round's review, derive new/changed work items.
2. Add or update rows in the `04-BACKLOG.md` table: set **description**, **status** (Open / In Progress / Done), **ownership** (role lens — Eng / PM / Design), and the **release** it belongs to.
3. Close resolved Open Questions; add a Refinement Cycle row and Changelog entry for the round.
4. Ordering is roadmap-driven until Growth; from Growth on, prioritize by user value (see [mvp-to-growth-transition.md](mvp-to-growth-transition.md)).

**Reads:** key docs, `r{n}-review.md`. **Writes:** `requirements/04-BACKLOG.md`. **Feeds:** [roadmap-sync](roadmap-sync.md), [release-sync](release-sync.md).
