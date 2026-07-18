---
name: 021-generate-frontend-component
description: Generate a frontend component from the design system and spec.
---

# Skill: Generate Frontend Component

**Description:**
Scaffolds a new UI component strictly adhering to the framework’s design system guidelines and existing component structure.

**Usage Constraint:**
Run this skill during Phase 1 (MVP Build) when a new Spec has been approved in `specs/`.

**Execution Steps for AI Agent:**
1. **Analyze Requirements:** Read the specific feature spec in `specs/NNN-feature-name/` to understand the component requirements.
2. **Review Design Tokens:** Read the active design tokens (`requirements/_design/tokens.json` or CSS variables) to ensure correct styling values.
3. **Analyze Existing Architecture:** Scan the `src/components/` (or equivalent) directory to understand the project's component pattern (e.g., React Functional Components, Tailwind classes, CSS Modules).
4. **Scaffold Component:**
   - Create the component file (e.g., `Button.tsx`).
   - Create the associated stylesheet (if applicable).
   - Create a basic unit test file (e.g., `Button.test.tsx`).
5. **Implement:** Write the code ensuring modularity and adherence to `CODE.md`.
6. **Verify:** Run the local test suite against the new component to ensure it compiles and passes basic checks.
