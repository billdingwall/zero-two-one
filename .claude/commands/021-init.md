Initialize this repository with the Zero Two One agentic product framework.

Run the following command to scaffold the framework:

```
npx zero-two-one-init
```

After initialization, complete these setup steps:

1. Review `README.md` and `workflow/workflows.md` to understand the 3-phase lifecycle.
2. Fill in `requirements/01-PRD.md` with the product vision, target users, and core features.
3. Fill in `requirements/03-TDD.md` with the technical architecture and stack decisions.
4. Fill in `requirements/05-ROADMAP.md` with phased milestones.
5. Update `CLAUDE.md` with project-specific context and the current lifecycle phase.
6. Update `DESIGN.md` with the project's design tokens (colors, typography, spacing).
7. Run `npm run 021-status` to verify the installation and check the detected lifecycle phase.

For Spec Kit integration (MVP Build onwards, Phase 1+):
```
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai claude
```

Record the current lifecycle phase in your memory and update it as the project progresses.
