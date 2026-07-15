# Skills Overview

AI prompts, skills, and tool definitions used for generating project artifacts and driving the Speckit implementation workflow.

## Manifest

### Tool definitions
- `tools.json`: JSON tool schemas (Anthropic tool-use format) for agent runtimes — `fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status`. Each maps to a CLI in `scripts/`.

### Speckit implementation skills
- `fetch-speckit-context.md`: Pull the active feature's Spec Kit artifacts into AI-readable context bundles before implementing.
- `verify-spec-compliance.md`: Audit spec completeness and validate that generated code adheres to the spec definitions.

### Design skills
- `generate-frontend-component.md`: Scaffold UI components against an approved spec and the design system.

### Document generation skills (one generator per key doc — r6)
- `generate-prd.md`: Prompt for drafting a PRD from the EDD + TDD (gap-fills an existing draft).
- `generate-edd.md`: Prompt for drafting an EDD from the PRD + TDD (gap-fills an existing draft).
- `generate-tdd.md`: Prompt for generating a Technical Design Document from the PRD + EDD.
- `generate-backlog.md`: Prompt for generating a dependency-ordered Epic/Task breakdown for the `04-BACKLOG` table (renamed from `generate-tasks.md`, r6).

### Governance skills
- `check-framework-compliance.md`: Diagnostic review of repo state against framework best practices.
