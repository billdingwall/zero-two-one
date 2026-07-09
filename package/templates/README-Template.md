# [Project Name]

> **Note**: Update this README with a description of your project.

This project is built using the **Zero Two One** agentic product framework, which guides development from idea (0) to MVP (1) and beyond.

## How it works

Development follows a 4-phase lifecycle:
1. **Planning**: Define the product in `requirements/01-PRD.md` and `03-TDD.md`.
2. **Pre-build**: Design and refine the experience in `requirements/02-EDD.md` and `prototype/`.
3. **MVP Build**: Implement features using Spec Kit branches.
4. **Growth**: Continuously refine and ship enhancements.

### The Refinement Gate
No implementation code can land until the corresponding feature spec is approved. The installed `pre-commit` hook enforces this.

## Tooling
- `npm run status` — Detect current lifecycle phase
- `npm run qa` — Run phase-appropriate tests
- `npm run spec:status -- list` — View all feature specs and gate status
- `npm run spec:context` — Build AI context bundles
- `npm run spec:verify` — Audit spec compliance

## AI Integration
This project is configured for AI agent collaboration. Provide this context to your agent:
- Read `CLAUDE.md` and `CODE.md` for rules
- Use `/init` and `/status` slash commands (if using Claude Code)
- Check `workflow/workflows.md` for canonical processes
