# Experience Design Document (EDD): Zero Two One

## 1. Overview
Zero Two One is primarily a Developer Experience (DX) product. The "interface" is a combination of the CLI, the directory structure, and the interaction loop with an AI agent.

## 2. Core Workflows

### Project Initialization
- **User Action**: Runs `npx zero-two-one-init`.
- **System Response**: Scaffolds the `requirements/`, `workflow/`, `skills/`, and `specs/` directories. Injects `.claude/commands/`. Installs the `pre-commit` hook.
- **Experience Goal**: Instant setup. The user immediately understands where to write their requirements.

### AI Agent Interaction
- **User Action**: Types `/status` (Claude Code) or runs `npm run status`.
- **System Response**: Reports the current lifecycle phase (e.g., "Planning") and highlights missing key documents.
- **Experience Goal**: The AI should act as a proactive project manager, guiding the user to complete the necessary prerequisites before writing code.

### Feature Implementation (Spec Kit)
- **User Action**: The AI attempts to commit code for a new feature.
- **System Response**: If the feature's spec in `specs/NNN-feature-name/spec.md` is not `Approved`, the `pre-commit` hook rejects the commit with a clear error message instructing the user to approve the spec first.
- **Experience Goal**: A rigid but helpful guardrail that forces human-in-the-loop validation of AI-generated plans.

## 3. Design Principles
1. **Text as UI**: Markdown files are the primary interface. They must be highly readable by both humans and LLMs.
2. **Invisible Enforcement**: The rules (like the refinement gate) should be invisible until violated, at which point they provide exact instructions for resolution.
3. **Agent-First**: Context files (`CLAUDE.md`, `.ai/context/`) must prioritize LLM token efficiency and semantic clarity.
