# AI Coding Guidelines

This document outlines the coding standards, behavior constraints, and generation rules for LLMs (like Claude Code) operating within this repository.

## 1. Core Principles
* **Spec-Driven First:** Do not write code until a clear specification (`specs/NNN-feature-name/`) exists and is approved.
* **Lean & Local-First:** Prefer lightweight, flat-file architectures (Markdown, JSON) or local databases (SQLite) over complex distributed systems, especially in Phase 1-3.
* **Context is Key:** Always consult your memory and read `CLAUDE.md` at the start of a session to understand the current phase. Always verify file contents using read-only tools before making modifications.

## 2. Code Generation Rules
* **Modularity:** Keep functions small and single-purpose.
* **Comments & Documentation:** Explain *why* a complex decision was made, not *what* the code does (the code should be self-evident). Ensure all new files or directories have an `OVERVIEW.md` if they are structurally significant.
* **Artifact Integrity:** Do not directly edit build artifacts (e.g., in `dist/` or `build/`). Always trace back to the source files, modify them, and run the build process.

## 3. Workflow Constraints
* **Refinement Loop:** When updating project-level requirements, follow the refinement loop (Review -> Synthesize -> Update). Create `r{n}-review.md` and `r{n}-update-{doc}.md` in `requirements/_refinement/` before directly editing the PRD or TDD.
* **Pre-commit:** Always verify changes through testing and linting before submitting code.

## 4. Communication
* **Clarity over cleverness:** Use simple, understandable language in PRDs, commit messages, and code comments.
* **Ask for Clarification:** If a task is ambiguous or contradicts the PRD/TDD, halt execution and request user input.
