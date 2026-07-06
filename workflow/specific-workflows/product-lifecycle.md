# Product Lifecycle (PLC)

The Zero Two One framework operates across a 4-phase lifecycle, transitioning a product from ideation to continuous delivery.

## Phase 1: Planning (Zero)
**Goal:** Turn an idea into an agreed written definition of the product.
- **Key Artifacts:** `01-PRD.md`, `03-TDD.md`, `04-ROADMAP.md` are drafted. *(Note: `02-EDD.md` is introduced in Phase 2.)*
- **Workflow:** Discovery. Raw research is collected into `requirements/_notes/`, which informs the drafting of the core documents.
- **Exit Gate:** PRD, TDD, and Roadmap are complete.

## Phase 2: Pre-build
**Goal:** Make the written definition visible through design systems and a static prototype that stakeholders can react to.
- **Key Artifacts:** `02-EDD.md`, `DESIGN.md`, `prototype/`.
- **Workflow:** Design & Refinement. The static HTML/CSS/JS prototype is built and iteratively refined through the Refinement Loop.
- **Exit Gate:** Stakeholders can review every core scenario in the prototype. Architecture is locked into the TDD; roadmap milestones are gated.

## Phase 3: MVP Build (One)
**Goal:** Deliver the first iteration of the product defined by the roadmap features.
- **Key Artifacts:** `specs/NNN-feature/`, Implementation Code.
- **Workflow:** Spec-Driven Delivery (SSD). Features are specified, clarified, planned, tasked, and implemented.
- **Exit Gate:** MVP is launched. QA suite is green.

## Phase 4: Growth
**Goal:** Continuously improve the product based on user analytics and feedback.
- **Key Artifacts:** Living Core Docs (`01-PRD.md`, `02-EDD.md`, `03-TDD.md`), `05-BACKLOG.md`.
- **Workflow:** Refinement Loop + Spec-Driven Delivery.
- **Mechanics:** User feedback triggers refinement rounds that update the living documents and populate the `05-BACKLOG.md`. The backlog items then feed into Spec-Driven Delivery for continuous implementation.
