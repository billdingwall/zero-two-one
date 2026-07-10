# MVP → Growth Transition (MGT)

**Goal:** Switch the project's planning model when it leaves Phase 3 (MVP Build) and enters Phase 4 (Growth). Before the transition, the roadmap drives everything and the backlog exists to support MVP delivery. After it, the backlog drives everything and the roadmap records releases pulled from it.

## Trigger

The Phase 3 exit gate passes: the MVP is launched and the QA suite is green (see the [Product Lifecycle](product-lifecycle.md)).

## Transition Steps

1. **Freeze the MVP roadmap.**
   In `04-ROADMAP.md`, the MVP Roadmap section becomes a historical record: check off completed items, close the phase headers, and add no new scope there.

2. **Activate the Releases section.**
   The `Releases (Growth)` section at the top of `04-ROADMAP.md` becomes the active planning surface. Upcoming work is expressed as named releases (`Release v1.x — <theme>`), each with a goal and its pulled backlog items.

3. **Flip the backlog.**
   Move all remaining v2/deferred items into the `v2 / Growth Backlog` in `05-BACKLOG.md`. Prioritization switches from roadmap-driven to **user value**, defined from user feedback collected through refinement rounds.

4. **Define releases by pulling.**
   The team pulls backlog items into a release at its discretion. Each release then flows through the existing [Review > Backlog > SSD](review-to-ssd.md) pipeline for delivery.

5. **Amend the refinement cascade.**
   In Growth, step 3 of the [Refinement Loop](refinement-loop.md) cascade reads **Roadmap > Releases > Backlog**: reviews feed the backlog, releases pull from it, and the roadmap records what was pulled.

## Ownership

The transition is a deliberate, human-approved step — typically its own refinement round — not an automatic flip. `scripts/workflow-status.js` reports the phase, but the team decides when the gate has genuinely passed.
