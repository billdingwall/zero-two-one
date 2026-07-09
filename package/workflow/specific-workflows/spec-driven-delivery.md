# Spec-Driven Delivery (SSD)

**Goal:** Deliver backlog features through GitHub Spec Kit, with the refinement gate ensuring no code is written against an unapproved spec.

## 1. Specification Pipeline (per feature)

1. **Specify:** Describe the feature in natural language → `specs/NNN-feature-name/spec.md` (Status: Draft).
2. **Clarify:** Resolve underspecified areas through QA rounds (Status: In Review).
3. **Plan:** Generate `plan.md`, `research.md`, `data-model.md`, and `contracts/`.
4. **Task:** Generate a dependency-ordered `tasks.md`.
5. **Approval:** A human must explicitly approve the spec (`npm run spec:status -- set NNN Approved`). **This opens the Refinement Gate.**
6. **Implement:** Execute `tasks.md` (Status: In Progress).
7. **Verify & QA:** Run `npm run spec:verify` and `npm run qa` (Status: Done).

## 2. The Refinement Gate

`hooks/pre-commit` blocks any commit of implementation files on an `NNN-feature-name` branch unless the matching spec exists and its status is `Approved` or `Ready for Dev`.

## 3. Implementation Loop (Agent-Executed)

1. **Context Generation:** Run `npm run spec:context` to generate the `.ai/context/NNN-feature-name.md` bundle. This seamlessly injects `CODE.md`, `PRODUCT.md`, and `05-BACKLOG.md`.
2. **Execution:** Work through `tasks.md`.
3. **Verification:** Run `npm run spec:verify` after meaningful units of work to ensure spec compliance.
