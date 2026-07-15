# Product Lifecycle (PLC)

The Zero Two One framework operates across a **3-phase lifecycle** (r6), transitioning a product from ideation to continuous delivery. The former Pre-build phase is folded into Planning, gated by a Planning sign-off milestone.

## Phase 1: Planning (Zero)
**Goal:** Turn an idea into an agreed, refined written definition of the product — to the fidelity stakeholders can commit to. Absorbs the former Pre-build refinement work.
- **Key Artifacts:** `01-PRD.md`, `02-EDD.md`, `03-TDD.md` (one cohesive set — r4), `04-BACKLOG.md`, `05-ROADMAP.md`, and `DESIGN.md` are drafted and refined. `prototype/` is **optional** — added on demand via `021-prototype` (r5), not required to progress.
- **Workflow:** Discovery → Design → Refinement. Raw research is collected into `requirements/_notes/`, informing the core docs; the key docs are then iteratively refined through the Refinement Loop; a prototype, if added, is refined alongside them.
- **Review Focus:** completing and refining the key docs and the guiding/role docs (`CODE.md`, `PRODUCT.md`, `DESIGN.md`), roadmap definition, and (if present) prototype reviews.
- **Sign-off milestone (exit gate, r5/r6):** every core scenario is defined in the EDD and reviewable by stakeholders (in the docs, or the prototype if one was added); the architecture is locked into the TDD; roadmap releases are gated. A prototype is **not** a gate condition. Passing this milestone is the transition to MVP Build ([planning-to-mvp.md](planning-to-mvp.md)).

## Phase 2: MVP Build (One)
**Goal:** Deliver the first iteration of the product defined by the roadmap's MVP releases (`requirements/_releases/mvp-N.md`).
- **Key Artifacts:** `specs/NNN-feature/`, Implementation Code.
- **Workflow:** Spec-Driven Delivery (SSD). Features are specified, clarified, planned, tasked, and implemented; releases are launched via [release-launch.md](release-launch.md).
- **Review Focus:** code review and build testing.
- **Exit Gate:** MVP is launched. QA suite is green.

## Phase 3: Growth
**Goal:** Continuously improve the product based on user analytics and feedback.
- **Key Artifacts:** Living Core Docs (`01-PRD.md`, `02-EDD.md`, `03-TDD.md`), `04-BACKLOG.md`, `requirements/_releases/`.
- **Workflow:** Refinement Loop + Spec-Driven Delivery.
- **Entry:** The switch from MVP Build follows the [MVP → Growth Transition](mvp-to-growth-transition.md): the MVP Releases freeze as history, the Growth Releases section activates, and backlog prioritization switches to user value.
- **Review Focus:** product review and user-feedback gathering (including `021-feedback` issues).
- **Mechanics:** User feedback triggers refinement rounds that update the living documents and populate the `04-BACKLOG.md`. Growth releases — each tied to a release branch with a file in `requirements/_releases/` — promote backlog items at the team's discretion, which then feed into Spec-Driven Delivery as their own specs.
