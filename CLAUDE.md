# AI Assistant Instructions

This repository is built as a Zero Two One Agentic Starter Template using a phased lifecycle approach.

## 4-Phase Project Lifecycle

This project follows four distinct phases. Your goal as an AI assistant is to help the user navigate these phases by referencing the key documents. 
Current phase and next steps are tracked via your own internal memory system.
Always recall the current active phase at the start of a session. Do not begin work until you have read the current state from memory.

1. **Planning**: Define the product vision, fill in key docs, and initialize the guiding files (`CLAUDE.md`, `README.md`).
2. **Pre-build (Refinement)**: Install Github Speckit. Establish an Experience Design Document (`EDD.md`) and a machine-readable `DESIGN.md` in the root, and build a static prototype using the first spec. Enter a refinement loop (review -> synthesize -> update docs & prototype) until the project reaches the desired fidelity.
3. **MVP Build**: Create specs to deliver the roadmap phases based on the key docs and prototype, using Github Speckit for implementation.
4. **Growth**: Post-MVP phase focused on product-market fit. Use the refinement workflow for user feedback and analytics, and continue delivering enhancements using Speckit.

## Context

* The project is currently in the planning stage. 
* Once the key docs are filled out and the guiding files are updated with project specifics, we will move to **Phase 2: Pre-build**.

**Please update your memory to track the current active phase as we progress through the lifecycle.** Update this file and `README.md` with project specifics.

## Documentation Structure

- **`requirements/`**: Contains the core documentation that defines the product (PRD, Technical Design, Roadmap).
- **`requirements/_refinement/`**: Tracks the refinement loop cycles during the Pre-build and Growth phases.
- **`requirements/_notes/`**: Holds unstructured research and background context.
- **`requirements/_design/`**: Holds design assets.
- **`workflow/`**: Documentation defining the overall project workflow and personas involved. `workflow/workflows.md` is the canonical process reference (Discovery, Design, Refinement, Speckit Implementation, QA, Release).
- **`skills/`**: AI prompts used for generating project artifacts and specs, plus `tools.json` agent tool schemas.
- **`scripts/`**: Lifecycle automation — `npm run status`, `spec:status`, `spec:context`, `spec:verify`, `qa`.
- **`.ai/context/`**: Generated Speckit context bundles (gitignored; rebuild with `npm run spec:context`).

## AI Instructions
- Always rely on your internal memory first to understand the current phase and state of the project. If unsure, ask the user. Verify with `npm run status`.
- Respect the dual workflow: project-level changes happen via the refinement loop in `requirements/`, while feature-level implementation uses the Spec Kit workflow.
- Before implementing a feature, run `npm run spec:context` and load `.ai/context/NNN-feature-name.md`. Do not write implementation code unless the spec status is `Approved` or `Ready for Dev` — the pre-commit hook enforces this gate, and only the user can authorize the status change (`npm run spec:status -- set <spec> Approved`).
- After generating code, run `npm run spec:verify` and follow `skills/verify-spec-compliance.md` before marking work complete.
- Do not assume domain specifics; adapt to the project as it is defined in the key documents.
