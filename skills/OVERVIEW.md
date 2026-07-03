# Skills Overview

AI prompts, skills, and tool definitions used for generating project artifacts and driving the Speckit implementation workflow.

## Manifest

### Tool definitions
- `tools.json`: JSON tool schemas (Anthropic tool-use format) for agent runtimes — `fetch_speckit_context`, `verify_spec_compliance`, `sync_design_tokens`, `set_spec_status`. Each maps to a CLI in `scripts/`.

### Speckit implementation skills
- `fetch-speckit-context.md`: Pull the active feature's Spec Kit artifacts into AI-readable context bundles before implementing.
- `verify-spec-compliance.md`: Audit spec completeness and validate that generated code adheres to the spec definitions.

### Design skills
- `sync-design-tokens.md`: Ingest Figma token exports into the token architecture (`requirements/_design/tokens/`).
- `generate-frontend-component.md`: Scaffold UI components against an approved spec and the design tokens.

### Document generation skills
- `generate-tdd.md`: Prompt for generating Technical Design Documents.
- `generate-tasks.md`: Prompt for generating tasks.

### Governance skills
- `check-framework-compliance.md`: Diagnostic review of repo state against framework best practices.
