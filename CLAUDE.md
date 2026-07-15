# AI Assistant Instructions

## Installation

This framework can be installed via Claude Code or manually:

- **Claude Code**: Use the `/021-init` slash command to scaffold the framework into your project
- **Manual**: Run `npx zero-two-one-init` in your project directory
- **Global**: `npm install -g zero-two-one` then `zero-two-one-init`

Init is designed to be non-destructive on existing projects (migrate mode: user files are create-if-missing, existing docs are imported, `--force` is the only override). Recommended pattern on a working repo: `npx zero-two-one-init --dry-run` first, then run for real. See [`workflow/specific-workflows/init-and-migration.md`](workflow/specific-workflows/init-and-migration.md); until Init v2 ships, run only on a clean working tree.

After installation, use `/021-status` to check the current lifecycle phase at any time. When a `.zero-two-one.json` manifest is present, read it to learn the lifecycle phase and tool stack instead of inferring from directory contents.

---

This repository is built as a Zero Two One Agentic Starter Template using a phased lifecycle approach.

## 3-Phase Project Lifecycle

The product lifecycle is canonically defined in [`workflow/specific-workflows/product-lifecycle.md`](workflow/specific-workflows/product-lifecycle.md): **Planning → MVP Build → Growth** (r6 — the former Pre-build phase is merged into Planning, gated by a Planning sign-off milestone).

*This file (`CLAUDE.md`) is the `claude`-stack rendering of the neutral `AGENTS.md` assistant entrypoint; other stacks render their own (TDD §9). It is the master router — it holds the "Wait" rule (outline the plan and confirm before complex multi-file changes) that `CODE.md` §4 defers to.*

Your primary role as an AI assistant is to help the user navigate these phases by tracking the current state, reading the correct documents, and ensuring constraints are met. 

## Context

* **DOGFOODING**: You are currently operating in the root repository of the `zero-two-one` framework itself. We are using the framework's own rules to refine and build the framework.
* The project is in **Phase 1: Planning** (which now includes the former Pre-build refinement work; r6). The PRD, EDD, TDD, Roadmap, and Backlog for the framework itself have been drafted in `requirements/`.
* **Important Boundary**: Development happens in the root. The `package/` directory is a clean snapshot for NPM publishing. When we change the framework mechanics (templates, scripts, skills), we run `npm run sync:package` to update the package.

**Please update your memory to track that you are managing the zero-two-one framework development.**

## Documentation Structure

- **`requirements/`**: Contains the core documentation that defines the product (PRD, EDD, Technical Design, Roadmap).
- **`requirements/_refinement/`**: Tracks the refinement loop cycles during the Planning and Growth phases.
- **`requirements/_notes/`**: Holds unstructured research and background context.
- **`requirements/_design/`**: Holds design assets.
- **`requirements/_architecture/`**: Architecture diagrams, expanded data models, and decision records (ADRs) that back the TDD (created on first use; TDD §2 boundary).
- **`workflow/`**: Documentation defining the overall project workflow and personas involved. `workflow/workflows.md` is the canonical process reference (Discovery, Design, Refinement, Speckit Implementation, QA, Release).
- **`skills/`**: AI prompts used for generating project artifacts and specs, plus `tools.json` agent tool schemas.
- **`scripts/`**: Lifecycle automation — `npm run 021-status`, `021-spec:status`, `021-spec:context`, `021-spec:verify`, `021-qa`.
- **`.ai/context/`**: Generated Speckit context bundles (gitignored; rebuild with `npm run 021-spec:context`).

## AI Instructions
- Always rely on your internal memory first to understand the current phase and state of the project. If unsure, ask the user. Verify with `npm run 021-status`.
- Respect the dual workflow: project-level changes happen via the refinement loop in `requirements/`, while feature-level implementation uses the Spec Kit workflow.
- Before implementing a feature, run `npm run 021-spec:context` and load `.ai/context/NNN-feature-name.md`. Do not write implementation code unless the spec status is `Approved` or `Ready for Dev` — the pre-commit hook enforces this gate, and only the user can authorize the status change (`npm run 021-spec:status -- set <spec> Approved`).
- After generating code, run `npm run 021-spec:verify` and follow `skills/verify-spec-compliance.md` before marking work complete.
- Do not assume domain specifics; adapt to the project as it is defined in the key documents.
