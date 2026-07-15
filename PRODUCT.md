# Zero-to-One Lifecycle Workflow

This document formalizes the step-by-step workflow for taking a product from an idea (Zero) to a launched MVP (One) and beyond. It is the **PM role lens** (distinct from the user/stakeholder/contributor persona documents in `workflow/_personas/`).

> The canonical, detailed lifecycle definition lives in [`workflow/specific-workflows/product-lifecycle.md`](workflow/specific-workflows/product-lifecycle.md). This file provides the operational checklist for each phase. **Lifecycle is 3-phase (r6):** Planning → MVP Build → Growth — the former Pre-build refinement work is folded into Planning.

## Workflow Execution

### 1. Planning (Zero — Planning & Refinement)
1. **Initialize Framework:** Run `npx zero-two-one-init` in a new (or existing) repo.
2. **Define Vision:** Fill out `requirements/01-PRD.md` with problem statement, target audience, and scope.
3. **Experience Design:** Draft `requirements/02-EDD.md` to define UX strategy, interaction architecture, and state definitions; establish UI guidelines in `DESIGN.md`.
4. **Draft Architecture:** Complete `requirements/03-TDD.md` with technical decisions and data models; baseline before build (decisions can still evolve through the Refinement Loop).
5. **Set Roadmap:** Outline initial milestones in `requirements/05-ROADMAP.md`.
6. **Prototype (optional):** Build static HTML/CSS/JS in `prototype/` via `021-prototype` to visualize the PRD; iterate through the refinement loop (`requirements/_refinement/`).
7. **Sign-off milestone:** Every core scenario is stakeholder-reviewable and the architecture is locked in the TDD — the gate into MVP Build.
8. **Update State:** Have the AI assistant record the transition to MVP (One) in the manifest and its memory.

### 2. MVP Build (One)
1. **Specify Features:** Use SpecKit (or manual creation) to write detailed, implementation-ready specs in `specs/NNN-feature-name/`.
2. **Implement:** Write code adhering to `CODE.md` to satisfy the specs.
3. **Validate:** Test against the Success Metrics defined in the PRD.
4. **Deploy:** Launch the MVP.
5. **Update State:** Have the AI assistant record the transition to Growth (Two) in the manifest and its memory.

### 3. Growth (Stabilize & Scale)
1. **Gather Feedback:** Collect user analytics and feedback.
2. **Refine:** Re-enter the Refinement Loop to plan improvements.
3. **Specify & Build:** Create new specs and implement features iteratively.
