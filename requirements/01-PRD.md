# Product Requirements Document (PRD): Zero Two One

## 1. Problem Statement
Many AI-assisted development projects fail due to a lack of structure. Without clear requirements, architectural boundaries, or defined phases, AI agents drift, hallucinate features, or implement code that breaks existing functionality. 

## 2. Product Vision
Zero Two One is an agentic product framework that acts as the operating system for AI-driven software development. It provides a structured, 4-phase lifecycle (Idea → Pre-build → MVP → Growth) anchored by a strict "refinement gate" that prevents implementation code from landing until the feature spec is approved.

## 3. Target Audience
- **Founders / PMs**: Defining the product vision and reviewing specs.
- **Developers**: Guiding the AI agents and reviewing architectural decisions.
- **AI Agents**: The primary executors who read the framework's context and write the code — via any supported stack (Claude Code, Google Antigravity, or Kiro).

## 4. Core Features
1. **Scaffolding & Migration CLI**: `npx zero-two-one-init` injects the framework into any repository, in two modes:
   - **Scaffold** — fresh/empty repositories receive the full framework surface; re-runs are idempotent.
   - **Migrate** — working projects get a non-destructive install: existing files are never overwritten (create-if-missing, `--force` is the only override), prior docs are imported and referenced rather than replaced, the project's real lifecycle phase is detected or asked (a shipped product enters at Growth), and an existing Spec Kit setup is reused instead of duplicated.
   - The init interview asks one **stack** question (`--stack claude|antigravity|kiro` non-interactive) plus the **design system** question (`--design none|material-3`); migrate mode detects existing tool surfaces (`.claude/`, `.agents/`, `AGENTS.md`, `.kiro/`, `.specify/`) and proposes the matching stack.
2. **Key Documents**: PRD, TDD, EDD, Roadmap, and Backlog templates that serve as the project's source of truth.
3. **Refinement Gate**: A Git `pre-commit` hook that blocks implementation code unless the associated Spec Kit artifact is marked "Approved" or beyond.
4. **Agent Integration**: Assistant instructions, commands/skills, and tool schemas rendered for the selected stack by its adapter — the `claude` stack's rendering (`CLAUDE.md` + `/021-*` commands) is the default.
5. **Dogfooding Architecture**: A dual-workspace structure where the framework can be refined using itself, while shipping a clean template to the npm package.
6. **Install Manifest & Upgrades**: A `.zero-two-one.json` manifest at the target repo root recording framework version, install mode, lifecycle phase, tool stack, and file inventory — the basis for safe re-runs, `--upgrade`, uninstall, and the stack adapters.
7. **Supported Tool Stacks**: The framework runs on one of three named stacks (recorded as `stack` in `.zero-two-one.json`, with derived `assistant`/`ssd` fields), plus an independent design-system role:

   | Stack | AI Assistant | SSD Engine |
   |---|---|---|
   | `claude` (default) | Claude Code (`CLAUDE.md` + `/021-*` commands) | GitHub Spec Kit |
   | `antigravity` | Google Antigravity (`AGENTS.md` + `021-*` skills) | GitHub Spec Kit |
   | `kiro` | Kiro IDE/CLI (`021-*` steering + `021` CLI agent) | Kiro specs (`.kiro/specs/`) |

   - The refinement gate works identically across stacks via the SSD state contract (TDD §9.3).
   - **Design system** (independent of stack): default bespoke `DESIGN.md`; first pluggable option Google Material 3 (token-mapped theming with Theme Builder exports).
   - **Framework naming convention**: every framework command — npm scripts (`021-status`, `021-qa`, `021-spec:*`) and assistant-side commands/skills/steering — follows the zero-two-one naming convention (`021-` namespace, recorded in `CODE.md`), avoiding conflicts with user projects and tool built-ins (e.g. Claude Code's own `/init`) by construction.

## 5. Success Metrics
- **Adoption**: Number of projects initialized using the CLI.
- **Migration Success**: Number of existing (non-empty) repositories initialized without manual repair; zero user files overwritten without explicit `--force`.
- **Stack Coverage**: Number of projects running on a non-default stack (or Material 3) without framework forks.
- **Agent Success Rate**: Reduction in "drift" or context-loss errors during AI-assisted development sessions.
- **Time to MVP**: Time taken from Phase 1 (Planning) to Phase 3 (MVP Release).

## Changelog
- **2026-07-10 (r3):** Added Core Feature 7 (Supported Tool Stacks: claude/antigravity/kiro + independent design-system role); stack/design questions in Feature 1; Feature 4 generalized to stack rendering; framework naming convention (`021-`); Stack Coverage metric. Per [_refinement/r3-update-prd.md](_refinement/r3-update-prd.md).
- **2026-07-10 (r2):** Core Feature 1 expanded to scaffold + migrate modes; Feature 4 wording corrected to match delivered behavior; added Feature 6 (install manifest) and the Migration Success metric. Per [_refinement/r2-update-prd.md](_refinement/r2-update-prd.md).
