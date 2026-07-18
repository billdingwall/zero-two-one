---
name: 021-check-framework-compliance
description: Check that work adheres to the Zero Two One framework rules and conventions.
---

# Skill: Check Framework Compliance

**Description:**
A diagnostic tool that reviews a specific file, directory, or the entire repository state to ensure it follows the parent framework's best practices.

**Usage Constraint:**
Can be run at any phase, but highly recommended before merging feature branches.

**Execution Steps for AI Agent:**
1. **Load Guidelines:** Read `CODE.md`, `CLAUDE.md`, and any files in `requirements/`.
2. **Scan Target:** Review the provided code or specification files provided by the user.
3. **Evaluate:**
   - **Spec-Driven:** Does the code have a corresponding approved spec in `specs/`?
   - **Lean Architecture:** Is the code overly complex or introducing unnecessary distributed dependencies when a local/flat-file approach would suffice?
   - **Artifact Integrity:** Is the user attempting to edit a build artifact (`dist/`) instead of source code?
   - **Modularity:** Are the functions/components single-purpose and well-documented?
4. **Report:** Output a markdown-formatted report detailing compliance passes, warnings, and required fixes. Provide actionable remediation steps.
