# AI Assistant Instructions

This repository is built as a Zero Two One Agentic Starter Template using a phased lifecycle approach.

## 4-Phase Project Lifecycle

The product lifecycle is canonically defined in [`workflow/specific-workflows/product-lifecycle.md`](workflow/specific-workflows/product-lifecycle.md).

Your primary role as an AI assistant is to help the user navigate these phases by tracking the current state, reading the correct documents, and ensuring constraints are met. 

## Context

* The project is currently in the planning stage. 
* Once the key docs are filled out and the guiding files are updated with project specifics, we will move to **Phase 2: Pre-build**.

**Please update your memory to track the current active phase as we progress through the lifecycle.** Update this file and `README.md` with project specifics.

## Documentation Structure

- **`requirements/`**: Contains the core documentation that defines the product (PRD, EDD, Technical Design, Roadmap).
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
