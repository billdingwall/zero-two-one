# [Project Name]

> **Note**: Update this README with a description of your project.

This project is built using the **Zero Two One** agentic product framework, which guides development from idea (0) to MVP (1) and beyond.

## How it works

Development follows a 3-phase lifecycle:
1. **Planning**: Define and refine the product — `requirements/01-PRD.md`, `02-EDD.md`, `03-TDD.md`, `04-BACKLOG.md`, `05-ROADMAP.md`, `DESIGN.md`, and an optional `prototype/` — through review rounds, gated by a sign-off milestone.
2. **MVP Build**: Implement features using Spec Kit branches.
3. **Growth**: Continuously refine and ship enhancements.

### The Refinement Gate
No implementation code can land until the corresponding feature spec is approved. The installed `pre-commit` hook enforces this.

## Tooling
- `npm run 021-status` — Detect current lifecycle phase
- `npm run 021-qa` — Run phase-appropriate tests
- `npm run 021-spec:status -- list` — View all feature specs and gate status
- `npm run 021-spec:context` — Build AI context bundles
- `npm run 021-spec:verify` — Audit spec compliance

## AI Integration
This project is configured for AI agent collaboration. Provide this context to your agent:
- Read `CLAUDE.md` and `CODE.md` for rules
- Use `/021-init` and `/021-status` slash commands (if using Claude Code)
- Check `workflow/workflows.md` for canonical processes
