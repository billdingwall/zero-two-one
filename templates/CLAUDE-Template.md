# AI Assistant Instructions

## Context
- The project is currently in the **Planning (Zero)** stage.
- Once the key docs in `requirements/` are filled out, we will move to **Phase 2: Pre-build**.

## AI Instructions
- Always rely on your internal memory first to understand the current phase and state of the project. Verify with `npm run status`.
- Respect the dual workflow: project-level changes happen via the refinement loop in `requirements/`, while feature-level implementation uses the Spec Kit workflow.
- Before implementing a feature, run `npm run spec:context` and load `.ai/context/NNN-feature-name.md`. Do not write implementation code unless the spec status is `Approved` or `Ready for Dev`.
- After generating code, run `npm run spec:verify` and follow `skills/verify-spec-compliance.md` before marking work complete.
- Do not assume domain specifics; adapt to the project as it is defined in the key documents.
