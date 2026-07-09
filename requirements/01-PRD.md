# Product Requirements Document (PRD): Zero Two One

## 1. Problem Statement
Many AI-assisted development projects fail due to a lack of structure. Without clear requirements, architectural boundaries, or defined phases, AI agents drift, hallucinate features, or implement code that breaks existing functionality. 

## 2. Product Vision
Zero Two One is an agentic product framework that acts as the operating system for AI-driven software development. It provides a structured, 4-phase lifecycle (Idea → Pre-build → MVP → Growth) anchored by a strict "refinement gate" that prevents implementation code from landing until the feature spec is approved.

## 3. Target Audience
- **Founders / PMs**: Defining the product vision and reviewing specs.
- **Developers**: Guiding the AI agents and reviewing architectural decisions.
- **AI Agents (e.g. Claude Code)**: The primary executors who read the framework's context and write the code.

## 4. Core Features
1. **Scaffolding CLI**: `npx zero-two-one-init` to instantly inject the framework into any repository.
2. **Key Documents**: PRD, TDD, EDD, Roadmap, and Backlog templates that serve as the project's source of truth.
3. **Refinement Gate**: A Git `pre-commit` hook that blocks implementation code unless the associated Spec Kit artifact is marked "Approved" or beyond.
4. **Agent Integration**: Pre-configured `CLAUDE.md`, `.claude/commands/`, and AI skills/tools to teach agents how to navigate the lifecycle.
5. **Dogfooding Architecture**: A dual-workspace structure where the framework can be refined using itself, while shipping a clean template to the npm package.

## 5. Success Metrics
- **Adoption**: Number of projects initialized using the CLI.
- **Agent Success Rate**: Reduction in "drift" or context-loss errors during AI-assisted development sessions.
- **Time to MVP**: Time taken from Phase 1 (Planning) to Phase 3 (MVP Release).
