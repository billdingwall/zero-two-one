# The Refinement Loop (RLP)

**Goal:** Converge the living documents and prototype on the desired fidelity through structured review rounds. This is the project-level change-control loop.

The loop shape is constant; the per-step mechanics are documented in the named **sync** sub-workflows: [review-sync](review-sync.md), [requirements-sync](requirements-sync.md), [guidance-sync](guidance-sync.md), [prototype-sync](prototype-sync.md), [backlog-sync](backlog-sync.md), [release-sync](release-sync.md), and [roadmap-sync](roadmap-sync.md).

## The Process

1. **Review (`r{n}-review.md`)** — see [review-sync.md](review-sync.md)
   Capture raw feedback or analytics into a review document. Reviews are **stage-aware**: pick the template matching the manifest's lifecycle phase (3-phase, r6) from `templates/reviews/` — **Planning:** completing/refining key + guiding docs, roadmap definition, optional prototype reviews; **MVP:** code review and build testing; **Growth:** product review and user feedback (including `021-feedback` issues). `templates/06-REVIEW-Template.md` remains the generic fallback.
   *Note: Inline `CHANGE:` notes can also be added directly to living documents during this phase to automatically queue them for the current round.*

2. **Synthesize (`r{n}-update-{doc}.md`)**
   Draft an update plan for each affected living document. The human approves the plan **before** any document is edited.

3. **Apply & Cascade (Living Documents)**
   Apply updates in dependency order and log each in the document's changelog:
   - **PRD > EDD:** Update the PRD, then update the EDD to support the new business logic. ([requirements-sync](requirements-sync.md); guiding-file check via [guidance-sync](guidance-sync.md).)
   - **PRD + EDD > TDD:** Update the TDD to architecturally support the new features and UX.
   - **PRD + EDD + TDD > Backlog:** Update `04-BACKLOG.md` with new features, bugs, or enhancement tasks (backlog is the input — [backlog-sync](backlog-sync.md)).
   - **Backlog > Roadmap:** Group backlog items into releases on `05-ROADMAP.md`, the summary view over `_releases/` ([roadmap-sync](roadmap-sync.md); [release-sync](release-sync.md) for the release files).

4. **Constraint Check**
   If core principles changed, amend `CODE.md`.

   *Template maintenance:* whenever a guiding or key doc is added, renamed, or removed in a round, sweep `templates/` for affected references (especially "Related Docs" lines) and update them in the same round.

   *Growth-phase note:* once the product is in the Growth phase, the cascade in step 3 reads **Roadmap > Releases (`requirements/_releases/`) > Backlog** — reviews feed the backlog, and releases promote from it as SSD specs on the release branch (see [mvp-to-growth-transition.md](mvp-to-growth-transition.md)).

5. **Design & Prototype Update**
   Update `DESIGN.md` (or the Design System) to reflect the applied changes. **If a prototype exists** (added via `021-prototype`), update `prototype/` too; if none has been added, skip this — the prototype is optional (r5) and never blocks a round.

6. **Commit**
   Commit all affected docs together. `hooks/pre-commit` will ensure implementation isn't blocked by spec drifts if appropriate.
