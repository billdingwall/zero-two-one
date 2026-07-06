# The Refinement Loop (RLP)

**Goal:** Converge the living documents and prototype on the desired fidelity through structured review rounds. This is the project-level change-control loop.

## The Process

1. **Review (`r{n}-review.md`)**
   Capture raw feedback or analytics into a review document (`templates/05-REVIEW-Template.md`).
   *Note: Inline `CHANGE:` notes can also be added directly to living documents during this phase to automatically queue them for the current round.*

2. **Synthesize (`r{n}-update-{doc}.md`)**
   Draft an update plan for each affected living document. The human approves the plan **before** any document is edited.

3. **Apply & Cascade (Living Documents)**
   Apply updates in dependency order and log each in the document's changelog:
   - **PRD > EDD:** Update the PRD, then update the EDD to support the new business logic.
   - **PRD + EDD > TDD:** Update the TDD to architecturally support the new features and UX.
   - **PRD + EDD + TDD > Roadmap:** Re-sequence `03-ROADMAP.md`.
   - **Roadmap > Backlog:** Update `04-BACKLOG.md` with new features, bugs, or enhancement tasks.

4. **Constraint Check**
   If core principles changed, amend `CODE.md`.

5. **Design & Prototype Update**
   Update `DESIGN.md` (or the Design System) and the `prototype/` to reflect the applied changes.

6. **Commit**
   Commit all affected docs together. `hooks/pre-commit` will ensure implementation isn't blocked by spec drifts if appropriate.
