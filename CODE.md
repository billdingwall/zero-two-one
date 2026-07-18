# AI Coding Guidelines

This document outlines the coding standards, behavior constraints, and generation rules for LLMs (like Claude Code) operating within this repository. It is the **Lead Engineer role lens** (distinct from the persona documents in `workflow/_personas/`).

## 1. Core Principles
* **Spec-Driven First:** Do not write code until a clear specification (`specs/NNN-feature-name/`) exists and is approved. Prototype code is not managed through Speckit—it is **optional** (r5) and generated on demand by the `021-prototype` command/skill, which reads the PRD/EDD and `DESIGN.md` to build and keep the prototype in sync. A project has no prototype until that command runs, and no gate depends on one (TDD §12).
* **Context is Key:** Always consult your memory and read `CLAUDE.md` at the start of a session to understand the current phase. Always verify file contents using read-only tools before making modifications.

## 2. Code Generation Rules
* **Framework Naming Convention:** Every framework-owned name installed into a namespace shared with the user or a tool follows `021-<name>` — lowercase kebab-case after the prefix, `:` reserved for npm subcommand grouping (e.g. `021-spec:status`), bare `021` only where a tool requires a single identifier. This applies to npm scripts, slash commands, skills, steering files, agents, and any future framework additions; standalone names the framework fully owns (`zero-two-one-init`, `.zero-two-one.json`) already comply. See TDD §6 for structural enforcement.
* **Modularity:** Keep functions small and single-purpose.
* **Comments & Documentation:** Explain *why* a complex decision was made, not *what* the code does (the code should be self-evident). Ensure all new files or directories have an `_INDEX.md` if they are structurally significant.
* **Artifact Integrity:** Do not directly edit build artifacts (e.g., in `dist/` or `build/`). Always trace back to the source files, modify them, and run the build process.

## 3. Workflow Constraints
* **Refinement Loop:** When updating project-level requirements, follow the refinement loop (Review -> Synthesize -> Update). Create `r{n}-review.md` and `r{n}-update-{doc}.md` in `requirements/_refinement/`. Deliverables through GitHub Speckit should be tracked and versioned in the `specs/` directory following the naming convention `specs/NNN-feature-name/`.
* **Pre-commit:** Always verify changes through testing and linting before submitting code. Locally: `npm run lint` (`node --check` + `sh -n`, zero-dependency), `npm test`, `npm run check:links`, and `npx 021 qa`; CI runs the same plus an init smoke test and a package sync-drift check ([`.github/workflows/ci.yml`](.github/workflows/ci.yml), r7).

## 4. Communication
* **Clarity over cleverness:** Use simple, understandable language in PRDs, commit messages, and code comments.
* **Ask for Clarification (the "Wait" rule):** If a task is ambiguous or contradicts the PRD/TDD, halt execution and request user input. This is the code-specific instance of the **"Wait" rule** defined in the assistant entrypoint (`CLAUDE.md` / `AGENTS.md`) — outline the plan and confirm before complex multi-file changes; this section defers to that rule rather than restating it (r6).
