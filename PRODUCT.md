# Zero-to-One Lifecycle Workflow

This document formalizes the step-by-step workflow for taking a product from an idea (Zero) to a launched MVP (One) and beyond.

## Workflow Execution

### 1. Planning (Zero)
1. **Initialize Framework:** Run `npx init <package-name>` in an empty repo.
2. **Define Vision:** Fill out `requirements/01-PRD.md` with problem statement, target audience, and scope.
3. **Draft Architecture:** Complete `requirements/03-TDD.md` with technical decisions and data models.
4. **Set Roadmap:** Outline initial milestones in `requirements/04-ROADMAP.md`.
5. **Update State:** Have the AI assistant record the transition to Phase 2 in its memory.

### 2. Pre-build (Refinement)
1. **Design System:** Establish basic UI guidelines in `DESIGN.md`.
2. **Prototype:** Build static HTML/CSS/JS in `prototype/` to visualize the PRD.
3. **Iterate:** Use the refinement loop (`requirements/_refinement/`) to gather feedback, update docs, and tweak the prototype until stakeholders approve.
4. **Lock Decisions:** Finalize architecture in TDD.
5. **Update State:** Have the AI assistant record the transition to Phase 3 in its memory.

### 3. MVP Build (One)
1. **Specify Features:** Use SpecKit (or manual creation) to write detailed, implementation-ready specs in `specs/NNN-feature-name/`.
2. **Implement:** Write code adhering to `AI_CODING_GUIDELINES.md` to satisfy the specs.
3. **Validate:** Test against the Success Metrics defined in the PRD.
4. **Deploy:** Launch the MVP.
5. **Update State:** Have the AI assistant record the transition to Phase 4 in its memory.

### 4. Growth (Stabilize & Scale)
1. **Gather Feedback:** Collect user analytics and feedback.
2. **Refine:** Re-enter the Phase 2 Refinement Loop to plan improvements.
3. **Specify & Build:** Create new specs and implement features iteratively.
