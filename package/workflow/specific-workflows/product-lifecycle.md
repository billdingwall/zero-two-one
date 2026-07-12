# Product Lifecycle (PLC)

The Zero Two One framework operates across a 4-phase lifecycle, transitioning a product from ideation to continuous delivery.

## Phase 1: Planning (Zero)
**Goal:** Turn an idea into an agreed written definition of the product.
- **Key Artifacts:** `01-PRD.md`, `02-EDD.md`, `03-TDD.md` (one cohesive set — r4), `04-ROADMAP.md` are drafted.
- **Workflow:** Discovery. Raw research is collected into `requirements/_notes/`, which informs the drafting of the core documents.
- **Review Focus (r4):** completing the key docs and the principle/guiding docs (`CODE.md`, `PRODUCT.md`, `DESIGN.md`).
- **Exit Gate:** PRD, EDD, TDD, and Roadmap are complete.

## Phase 2: Pre-build
**Goal:** Refine the written definition and the CLI/DX experience to the fidelity stakeholders can commit to; optionally make it visible through a design system and prototype.
- **Key Artifacts:** `DESIGN.md`; the EDD deepens from its Phase 1 draft. `prototype/` is **optional** — added on demand via `021-prototype` (r5), not required to progress.
- **Workflow:** Design & Refinement. The key docs are iteratively refined through the Refinement Loop; if a prototype has been added, it is refined alongside them.
- **Review Focus (r4):** refining the key docs, roadmap definition, and (if present) prototype reviews.
- **Exit Gate (r5):** Every core scenario is defined in the EDD and reviewable by stakeholders (in the docs, or in the prototype if one was added); architecture is locked into the TDD; roadmap releases are gated. A prototype is **not** a gate condition.

## Phase 3: MVP Build (One)
**Goal:** Deliver the first iteration of the product defined by the roadmap's MVP releases (`requirements/_releases/mvp-N.md`).
- **Key Artifacts:** `specs/NNN-feature/`, Implementation Code.
- **Workflow:** Spec-Driven Delivery (SSD). Features are specified, clarified, planned, tasked, and implemented.
- **Review Focus (r4):** code review and build testing.
- **Exit Gate:** MVP is launched. QA suite is green.

## Phase 4: Growth
**Goal:** Continuously improve the product based on user analytics and feedback.
- **Key Artifacts:** Living Core Docs (`01-PRD.md`, `02-EDD.md`, `03-TDD.md`), `05-BACKLOG.md`, `requirements/_releases/`.
- **Workflow:** Refinement Loop + Spec-Driven Delivery.
- **Entry:** The switch from Phase 3 follows the [MVP → Growth Transition](mvp-to-growth-transition.md): the MVP Releases freeze as history, the Growth Releases section activates, and backlog prioritization switches to user value.
- **Review Focus (r4):** product review and user-feedback gathering (including `021-feedback` issues).
- **Mechanics:** User feedback triggers refinement rounds that update the living documents and populate the `05-BACKLOG.md`. Growth releases — each tied to a release branch with a file in `requirements/_releases/` — promote backlog items at the team's discretion, which then feed into Spec-Driven Delivery as their own specs.
