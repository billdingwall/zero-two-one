# Project Roadmap: Zero Two One

## Phase 1: Planning (Completed)
- Define the 4-phase lifecycle concept.
- Establish the `requirements/` and `workflow/` directory structures.

## Phase 2: Pre-build (Current)
- Implement the `npx zero-two-one-init` CLI scaffolder.
- Build the `pre-commit` refinement gate bash script.
- **Decouple the architecture**: Establish the `package/` boundary for clean NPM publishing and dogfooding (Done).
- Finalize Claude Code integrations (`/init`, `/status`).

## Phase 3: MVP Build (Next)
- Publish `zero-two-one` v1.1.x to the NPM registry.
- Test the framework end-to-end on a brand new, empty repository using Claude Code.
- Implement automated testing for the `init.js` script and `pre-commit` hook.

## Phase 4: Growth (Future)
- Add support for MCP (Model Context Protocol) servers natively within the framework.
- Create more specific templates (e.g., Database Schema template, API Design template).
- Integrate with issue trackers (Linear, Jira) to sync spec statuses.
