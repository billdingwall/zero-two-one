# AI Assistant Instructions

This repository is built as a Zero Two One Agentic Starter Template using a phased lifecycle approach.

## 4-Phase Project Lifecycle

This project follows four distinct phases. Your goal as an AI assistant is to help the user navigate these phases by referencing the key documents. 
Current phase and next steps are traxked in the MEMORY.md

1. **Planning**: Define the product vision, fill in key docs, and initialize the guiding files (`CLAUDE.md`, `MEMORY.md`, `README.md`).
2. **Pre-build (Refinement)**: Install Github Speckit. Establish a `DESIGN.md` file and build a static prototype using the first spec. Enter a refinement loop (review -> synthesize -> update docs & prototype) until the project reaches the desired fidelity.
3. **MVP Build**: Create specs to deliver the roadmap phases based on the key docs and prototype, using Github Speckit for implementation.
4. **Growth**: Post-MVP phase focused on product-market fit. Use the refinement workflow for user feedback and analytics, and continue delivering enhancements using Speckit.

## Context

* The project is currently in the planning stage. 
* Once the key docs are filled out and the guiding files are updated with project specifics, we will move to **Phase 2: Pre-build**.


**Please refer to `MEMORY.md` for the definitions of the 4 project phases and to track the current active phase.** Update it along with this file and `README.md` as we progress through the lifecycle.

## Documentation Structure

- **`requirements/`**: Contains the core documentation that defines the product (PRD, Technical Design, Roadmap).
- **`requirements/_refinement/`**: Tracks the refinement loop cycles during the Pre-build and Growth phases.
- **`requirements/_notes/`**: Holds unstructured research and background context.
- **`requirements/_design/`**: Holds design assets.
- **`workflow/`**: Documentation defining the overall project workflow and personas involved.
- **`skills/`**: AI prompts used for generating project artifacts and specs.

## AI Instructions
- Always read `MEMORY.md` first to understand the current phase and state of the project.
- Respect the dual workflow: project-level changes happen via the refinement loop in `requirements/`, while feature-level implementation uses the Spec Kit workflow.
- Do not assume domain specifics; adapt to the project as it is defined in the key documents.
