# AI Assistant Instructions

## Installation

This framework can be installed via Claude Code or manually:

- **Claude Code**: Use the `/init` slash command to scaffold the framework into your project
- **Manual**: Run `npx zero-two-one-init` in your project directory
- **Global**: `npm install -g zero-two-one` then `zero-two-one-init`

Init is designed to be non-destructive on existing projects (migrate mode: user files are create-if-missing, existing docs are imported, `--force` is the only override). Recommended pattern on a working repo: `npx zero-two-one-init --dry-run` first, then run for real. See [`workflow/specific-workflows/init-and-migration.md`](workflow/specific-workflows/init-and-migration.md); until Init v2 ships, run only on a clean working tree.

After installation, use `/status` to check the current lifecycle phase at any time. When a `.zero-two-one.json` manifest is present, read it to learn the lifecycle phase and tool stack instead of inferring from directory contents.

---

This repository is built as a Zero Two One Agentic Starter Template using a phased lifecycle approach.

## 4-Phase Project Lifecycle

The product lifecycle is canonically defined in [`workflow/specific-workflows/product-lifecycle.md`](workflow/specific-workflows/product-lifecycle.md).

Your primary role as an AI assistant is to help the user navigate these phases by tracking the current state, reading the correct documents, and ensuring constraints are met. 

## Context

* **DOGFOODING**: You are currently operating in the root repository of the `zero-two-one` framework itself. We are using the framework's own rules to refine and build the framework.
* The project is transitioning into **Phase 2: Pre-build** (or actively refining Phase 2). The PRD, TDD, EDD, and Roadmap for the framework itself have been drafted in `requirements/`.
* **Important Boundary**: Development happens in the root. The `package/` directory is a clean snapshot for NPM publishing. When we change the framework mechanics (templates, scripts, skills), we run `npm run sync:package` to update the package.

**Please update your memory to track that you are managing the zero-two-one framework development.**

## Documentation Structure

- **`requirements/`**: Contains the core documentation that defines the product (PRD, EDD, Technical Design, Roadmap).
- **`requirements/_refinement/`**: Tracks the refinement loop cycles during the Pre-build and Growth phases.
- **`requirements/_notes/`**: Holds unstructured research and background context.
- **`requirements/_design/`**: Holds design assets.
- **`workflow/`**: Documentation defining the overall project workflow and personas involved. `workflow/workflows.md` is the canonical process reference (Discovery, Design, Refinement, Speckit Implementation, QA, Release).
- **`skills/`**: AI prompts used for generating project artifacts and specs, plus `tools.json` agent tool schemas.
- **`scripts/`**: Lifecycle automation — `npm run status`, `spec:status`, `spec:context`, `spec:verify`, `qa`.
- **`.ai/context/`**: Generated Speckit context bundles (gitignored; rebuild with `npm run spec:context`).

## AI Instructions
- Always rely on your internal memory first to understand the current phase and state of the project. If unsure, ask the user. Verify with `npm run status`.
- Respect the dual workflow: project-level changes happen via the refinement loop in `requirements/`, while feature-level implementation uses the Spec Kit workflow.
- Before implementing a feature, run `npm run spec:context` and load `.ai/context/NNN-feature-name.md`. Do not write implementation code unless the spec status is `Approved` or `Ready for Dev` — the pre-commit hook enforces this gate, and only the user can authorize the status change (`npm run spec:status -- set <spec> Approved`).
- After generating code, run `npm run spec:verify` and follow `skills/verify-spec-compliance.md` before marking work complete.
- Do not assume domain specifics; adapt to the project as it is defined in the key documents.
