# Project Manifest

An outline of all the folders and documents in the Zero Two One project.

## Root Directory
- `CLAUDE.md`: AI Assistant Instructions and Project Guidelines
- `DESIGN.md`: Design Guidelines and System Tokens
- `README.md`: Project Overview and Getting Started

## `.github/`
GitHub-specific configurations and templates.
- `ISSUE_TEMPLATE/feature_prd.md`: Issue template for new feature PRDs.
- `ISSUE_TEMPLATE/bug_report.md`: Issue template for bug reports.

## `workflow/`
Documentation defining the overall project workflow, personas involved
- `workflows.md`: Canonical expanded workflow reference (Discovery, Design, Refinement, Speckit Implementation, QA, Release).
- `workflow-overview.md`: Concise overview of the two-workflow model.
- `project-manifest.md`: This file, outlining the project's folder and document structure.
- `specific-workflows/`: Sub-folder for specific workflows.
- `_personas/`: Personas for users, stakeholders, and contributors.

## `skills/`
AI prompts, skills, and tool definitions used for generating project artifacts and driving Speckit implementation.
- `tools.json`: Agent tool schemas (`fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status`).
- `fetch-speckit-context.md`: Pull the active feature's Spec Kit artifacts into AI-readable context bundles.
- `verify-spec-compliance.md`: Audit spec completeness and code adherence to spec definitions.
- `generate-frontend-component.md`: Scaffold UI components against approved specs and the design system.
- `generate-tasks.md`: Prompt for generating tasks.
- `generate-tdd.md`: Prompt for generating Technical Design Documents.
- `check-framework-compliance.md`: Diagnostic review against framework best practices.

## `scripts/`
Lifecycle automation (Node built-ins only, wired to npm scripts).
- `workflow-status.js`: Detects the current lifecycle phase.
- `run-qa.sh`: Phase-appropriate QA suite.
- `speckit/`: Spec status management, context bundle generation, compliance verification.

## `hooks/`
Git hooks installed by `zero-two-one-init`.
- `pre-commit`: The refinement gate — blocks implementation commits on feature branches until the spec is Approved/Ready for Dev.

## `.ai/`
Generated AI artifacts (gitignored).
- `context/`: Per-feature Speckit context bundles (`NNN-feature-name.md` + `.json`).

## `prototype/`
One cohesive prototype that aligns with the PRD and TDD.

## `requirements/`
The core documentation that defines the product.
- `01-PRD.md`: Product Requirements Document (What & why — modules, scenarios, data model, IA).
- `03-TDD.md`: Technical Design Document (Architecture overview + locked decisions).
- `04-ROADMAP.md`: Phased plan and milestone gates.
- `05-BACKLOG.md`: Planned backlog and project tracker.
- `_design/`: Holds design assets.
- `_notes/`: Unstructured research, analysis and background context.
- `_refinement/`: Tracks the refinement loop cycles.
  - `OVERVIEW.md`: Instructions for refinement.
  - `r{x}-review.md`: Refinement round review.

## `specs/`
Canonical specs, feature-level implementation details, and validation rules.

## `templates/`
Templates for creating standardized project documentation.
- `01-PRD-Template.md`: Template for PRD.
- `03-TDD-Template.md`: Template for TDD.
- `04-ROADMAP.md`: Template for Roadmap.
- `05-BACKLOG.md`: Template for Project Backlog.
- `06-REVIEW-Template.md`: Template for Refinement Reviews.
- `07-USER-PERSONA-Template.md`: Template for User Persona.
- `08-STAKEHOLDER-PERSONA-Template.md`: Template for Stakeholder Persona.
- `09-CONTRIBUTOR-PERSONA-Template.md`: Template for Contributor Persona.
