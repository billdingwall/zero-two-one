# Product Requirements Document (PRD): Zero Two One

## 1. Problem Statement
Many AI-assisted development projects fail due to a lack of structure. Without clear requirements, architectural boundaries, or defined phases, AI agents drift, hallucinate features, or implement code that breaks existing functionality.

Even structured projects decay: documents become stale and misaligned — requirements start to contradict the roadmap and backlog — and managing all these docs, requirements, and tasks becomes daunting because it is typically spread across multiple disconnected tools. Misaligned documents mislead AI agents just as badly as missing ones.

## 2. Product Vision
Zero Two One is an agentic product framework that acts as the operating system for AI-driven software development. It provides a structured, 4-phase lifecycle (Idea → Pre-build → MVP → Growth) anchored by a strict "refinement gate" that prevents implementation code from landing until the feature spec is approved.

It gives teams a comprehensive, flexible structure that manages **all product-lifecycle artifacts in one repository and keeps them in sync**. The framework ships basic tooling to bootstrap design while supporting bring-your-own design systems, and offers three supported AI-assistant + spec-driven-delivery pairings (`claude` default · `antigravity` · `kiro`) with room for more. The goal: a structured framework with the flexibility to plug in the tools that work best for each team.

## 3. Target Audience
- **Founders / PMs**: Defining the product vision and reviewing specs.
- **Developers**: Guiding the AI agents and reviewing architectural decisions.
- **AI Agents**: The primary executors who read the framework's context and write the code — via any supported stack (Claude Code, Google Antigravity, or Kiro).

## 4. Core Features
1. **Scaffolding & Migration (AI-led)**: init is an **assistant-led interactive walkthrough** (stack-rendered, e.g. `/021-init`) backed by the mechanical CLI (`npx zero-two-one-init`). The walkthrough interviews the user — stack, existing structure, lifecycle phase, per-conflict decisions — and drives the script; **an LLM is the framework's core dependency, including setup**. It injects the framework into any repository in two modes:
   - **Scaffold** — fresh/empty repositories receive the full framework surface; re-runs are idempotent.
   - **Migrate** — working projects get a non-destructive install: existing files are never overwritten (create-if-missing, `--force` is the only override), prior docs are imported and referenced rather than replaced, the project's real lifecycle phase is detected or asked (a shipped product enters at Growth), and an existing Spec Kit setup is reused instead of duplicated.
   - The init interview asks one **stack** question (`--stack claude|antigravity|kiro` non-interactive) plus the **design system** question (`--design none|material-3`); migrate mode detects existing tool surfaces (`.claude/`, `.agents/`, `AGENTS.md`, `.kiro/`, `.specify/`) and proposes the matching stack.
2. **Key Documents**: PRD, EDD, TDD, Roadmap, and Backlog templates that serve as the project's source of truth. The PRD, EDD, and TDD are treated as **one cohesive set** — every framework surface (workflows, skills, scripts, status checks) that reads or references one includes all three. Installing into a target repo creates `requirements/` with the key docs instantiated from the templates (TDD §5).
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
   - **Design system** (independent of stack): default bespoke `DESIGN.md`; first pluggable option Google Material 3 (token-mapped theming with Theme Builder exports). Users install their own design system via the `021-design` command, which updates the project's visual-design and component details (`DESIGN.md` token mapping, `requirements/_design/tokens/`, prototype) per the design-system-selection workflow.
   - **Framework naming convention**: every framework command — npm scripts (`021-status`, `021-qa`, `021-spec:*`) and assistant-side commands/skills/steering — follows the zero-two-one naming convention (`021-` namespace, recorded in `CODE.md`), avoiding conflicts with user projects and tool built-ins (e.g. Claude Code's own `/init`) by construction.

8. **Feedback Loop**: `/021-feedback` (stack-rendered) lets any project using the package file feedback directly as a GitHub issue in the zero-two-one repo — feedback text, a link to the user's repo, plus manifest context (framework version, stack, lifecycle phase). Feeds the post-MVP backlog (TDD §10).
9. **Optional Prototype**: the static prototype is **not required**. A dedicated `021-prototype` command generates a prototype in `prototype/` from the key docs (PRD/EDD + `DESIGN.md` tokens) on demand, and only then wires prototype steps into the Design, Refinement, and QA workflows (TDD §12). Until it is run, a project carries no prototype dependency — lifecycle progression never blocks on one.

## 5. Success Metrics

*Given the zero-dependency, local-first posture (TDD §3), the framework ships no telemetry; metrics are read from external or observational sources, noted per line.*
- **Adoption** *(npm download stats)*: Projects initialized using the CLI.
- **Migration Success** *(field-test observation)*: Existing (non-empty) repositories initialized without manual repair; **zero user files overwritten** without explicit `--force` — the hard, non-negotiable target.
- **Stack Coverage** *(field-test observation)*: Projects running on a non-default stack (or Material 3) without framework forks.
- **Agent Success Rate** *(qualitative)*: Observed reduction in "drift" / context-loss during AI-assisted sessions — assessed narratively, not instrumented.
- **Time to MVP** *(manifest `installedAt` → launch)*: Elapsed time from Planning to MVP release.
- **Feedback Volume** *(GitHub issue count)*: Issues filed via `/021-feedback` from user repos — signal that the loop works and the backlog is user-driven.

## Changelog
- **2026-07-12 (r5):** Added Feature 9 (Optional Prototype via `021-prototype`); Success Metrics reframed with explicit measurement sources (no telemetry) and Migration Success flagged as the hard target. Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** Problem statement gains artifact drift/staleness; vision expanded (artifact sync, BYO design system, three pairings); Feature 1 reframed as AI-led init walkthrough (LLM as core dependency); Feature 2 states the cohesive PRD/EDD/TDD set + install guarantee; Feature 7 gains `021-design`; new Feature 8 (Feedback Loop); Feedback Volume metric. Per [_refinement/r4-update-prd.md](_refinement/r4-update-prd.md).
- **2026-07-10 (r3):** Added Core Feature 7 (Supported Tool Stacks: claude/antigravity/kiro + independent design-system role); stack/design questions in Feature 1; Feature 4 generalized to stack rendering; framework naming convention (`021-`); Stack Coverage metric. Per [_refinement/r3-update-prd.md](_refinement/r3-update-prd.md).
- **2026-07-10 (r2):** Core Feature 1 expanded to scaffold + migrate modes; Feature 4 wording corrected to match delivered behavior; added Feature 6 (install manifest) and the Migration Success metric. Per [_refinement/r2-update-prd.md](_refinement/r2-update-prd.md).
