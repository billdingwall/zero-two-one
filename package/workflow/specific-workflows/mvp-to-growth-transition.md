# MVP → Growth Transition (MGT)

**Goal:** Switch the project's planning model when it leaves Phase 3 (MVP Build) and enters Phase 4 (Growth). Before the transition, the roadmap drives everything and the backlog exists to support MVP delivery. After it, the backlog drives everything and the roadmap records releases pulled from it.

## Trigger

The Phase 3 exit gate passes: the MVP is launched and the QA suite is green (see the [Product Lifecycle](product-lifecycle.md)).

## Transition Steps

1. **Freeze the MVP Releases.**
   In `04-ROADMAP.md`, the MVP Releases section becomes a historical record of how the product got here: check off completed items, close the release headers, write the **Delivered** summary in each `requirements/_releases/mvp-N.md` file, and add no new scope there.

2. **Activate the Releases section.**
   The `Releases (Growth)` section at the top of `04-ROADMAP.md` becomes the active planning surface. Upcoming work is expressed as named releases (`Release v1.x — <theme>`), each **tied to a specific release branch**, with a dedicated file in `requirements/_releases/` (from `templates/10-RELEASE-Template.md`) created at release open and a Delivered summary written at close. The roadmap keeps the summary and link; detail lives in the release file.

3. **Flip the backlog.**
   Move all remaining v2/deferred items into the `v2 / Growth Backlog` in `05-BACKLOG.md`. Prioritization switches from roadmap-driven to **user value**, defined from user feedback collected through refinement rounds and `021-feedback` issues.

4. **Define releases by promoting.**
   The team **promotes** backlog items into a release at its discretion. Each promoted item is implemented as its own SSD spec (`NNN-feature-name` branch off the release branch) through the existing [Review > Backlog > SSD](review-to-ssd.md) pipeline and the refinement gate.

5. **Amend the refinement cascade.**
   In Growth, step 3 of the [Refinement Loop](refinement-loop.md) cascade reads **Roadmap > Releases (`_releases/`) > Backlog**: reviews feed the backlog, releases promote from it, and the roadmap records what was promoted and delivered.

## Ownership

The transition is a deliberate, human-approved step — typically its own refinement round — not an automatic flip. `scripts/workflow-status.js` reports the phase, but the team decides when the gate has genuinely passed.
