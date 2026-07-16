# Experience Design Document (EDD): Zero Two One

## 1. Overview
Zero Two One is primarily a Developer Experience (DX) product. The "interface" is a combination of the CLI, the directory structure, and the interaction loop with an AI agent.

The EDD is one third of the cohesive **PRD/EDD/TDD set**: every framework surface that reads or references one of these docs includes all three, and the EDD participates in every refinement cascade (PRD > EDD > TDD).

## 2. Core Workflows

### Project Initialization

Init is a conversation, not a script: the assistant-led walkthrough (stack-rendered, e.g. `/021-init`) explains what will land where **before** anything is written, and the CLI executes (TDD §1). Two scenarios:

- **New project (scaffold)**: instant setup. The walkthrough confirms stack + design system and lands the full surface — `requirements/` key docs instantiated from templates, `workflow/`, `skills/`, `specs/`, stack command surface, and the `pre-commit` hook. The user immediately understands where to write their requirements.
- **Active project (migrate)**: the walkthrough interviews the user about the project's stack, existing structure, and lifecycle phase — detection proposes answers, the user confirms. Existing files are **never destroyed**: they may be added to, renamed, or updated, but existing content is never removed. When init finds an existing doc that duplicates a framework file, the user chooses per file: **archive** the old duplicate, **update it to fit the framework**, or **leave it alongside** the new file.
- **Merge-conflict handling**: the ownership rules (TDD §6) classify every path; conflicts are reported as a classified plan (the `--dry-run` view), never silently resolved. The walkthrough turns each conflict into an interactive question rather than an error.
- **Experience Goal**: setup feels guided and safe — the user always knows what will change, and nothing they wrote is ever lost.

### AI Agent Interaction
- **User Action**: Types `/021-status` (Claude Code) or runs `npm run 021-status`.
- **System Response**: Reports the current lifecycle phase (e.g., "Planning") and highlights missing key documents (PRD, EDD, and TDD checked as one set).
- **Experience Goal**: The AI should act as a proactive project manager, guiding the user to complete the necessary prerequisites before writing code.

Review rounds are **stage-aware**: the refinement loop presents a review template matched to the lifecycle phase (3-phase model) — Planning: completing and refining the key and guiding docs, roadmap definition, and (if one has been added) prototype reviews; MVP: code review and build testing; Growth: product review and user-feedback gathering.

### Feature Implementation (Spec Kit)
- **User Action**: The AI attempts to commit code for a new feature.
- **System Response**: If the feature's spec in `specs/NNN-feature-name/spec.md` is not `Approved`, the `pre-commit` hook rejects the commit with a clear error message instructing the user to approve the spec first.
- **Experience Goal**: A rigid but helpful guardrail that forces human-in-the-loop validation of AI-generated plans.

### Sending Feedback
- **User Action**: Runs `/021-feedback` (stack-rendered) with feedback text while working in their own repo.
- **System Response**: Files a GitHub issue in the zero-two-one repo — the text, a link to the user's repo, and manifest context (framework version, stack, lifecycle phase) — and confirms with the issue URL (TDD §10).
- **Experience Goal**: Zero-friction feedback from inside the working session; users see their input land somewhere actionable.

### Installing a Design System
- **User Action**: Runs `021-design`, naming their own design system or choosing a supported one (e.g. `material-3`).
- **System Response**: Walks the design-system-selection workflow — maps tokens into `DESIGN.md`, stores exported artifacts in `requirements/_design/tokens/`, updates component details and (if one exists) the prototype theme, records `tools.design` in the manifest (TDD §11).
- **Experience Goal**: Adopting or swapping a design system re-themes the project without touching the key docs.

### Adding a Prototype (optional)
- **User Action**: Runs `021-prototype` when the team wants a visual prototype to react to.
- **System Response**: Generates a static prototype in `prototype/` from the key docs (PRD/EDD + `DESIGN.md` tokens), then activates the prototype steps in the Design, Refinement, and QA workflows (TDD §12).
- **Experience Goal**: Teams that want a prototype get one on demand; teams that don't are never blocked by a missing one. The prototype is off the critical path until explicitly added.

## 3. The CLI Experience

The `021` command surface is a first-class interface:

- **Legible**: every command is `021-` namespaced, discoverable, and self-describing; output states the current phase, what was checked, and the next step.
- **Automatic by default**: commands map to the specific 021 workflows so the happy path needs no process knowledge.
- **Manual controls always available**: status checks, explicit state changes, verification, and context rebuilds let users inspect and manage the project at any point outside the automated flow.

| Command | Workflow | Kind |
|---|---|---|
| `021-init` (assistant) / `npx zero-two-one-init` | Init & migration | Automatic (walkthrough) |
| `021-status` | Product lifecycle | Manual status check |
| `021-spec:status` (+ `-- set`) | Spec-driven delivery | Manual inspect / explicit state change |
| `021-spec:context` | Spec-driven delivery | Manual context rebuild |
| `021-spec:verify` | Spec-driven delivery / QA | Manual verification |
| `021-qa` | QA | Manual verification |
| `021-feedback` (assistant) | Feedback loop | Automatic (files the issue) |
| `021-design` (assistant) | Design-system selection | Automatic (walkthrough) |
| `021-prototype` (assistant) | Prototype (optional) | On-demand (generates `prototype/`) |

Assistant-side names are stack-rendered per TDD §9.2 (`/021-*` commands for `claude`, skills for `antigravity`, steering/agent for `kiro`). The full command ↔ skill ↔ script mapping is maintained in [`requirements/_design/command-design.md`](_design/command-design.md); how hooks and workflows touch project files is in [`workflow-design.md`](_design/workflow-design.md).

## 4. Design Principles
1. **Text as UI**: Markdown files are the primary interface. They must be highly readable by both humans and LLMs.
2. **Invisible Enforcement**: The rules (like the refinement gate) should be invisible until violated, at which point they provide exact instructions for resolution.
3. **Agent-First**: Context files (the stack-rendered assistant entrypoint — `CLAUDE.md` for the `claude` stack, from the neutral `AGENTS.md` source — and `.ai/context/`) must prioritize LLM token efficiency and semantic clarity.
4. **Ask, don't assume**: when a `021` command needs more context, it asks an interactive question presenting a recommended option (marked as such), sensible alternatives, and a free-text write-in option. Applies to init walkthrough questions, phase/stack confirmation, conflict resolution, and any future command needing input.

## Changelog
- **2026-07-15 (r6):** Stage-aware review list collapsed to the 3-phase model (Idea + Pre-build → **Planning**); Agent-First principle notes the assistant entrypoint is stack-rendered from the neutral `AGENTS.md` source. Per [_refinement/r6-review.md](_refinement/r6-review.md).
- **2026-07-12 (r5):** Added the optional "Adding a Prototype" workflow (`021-prototype`); CLI table gains the prototype command and a pointer to `_design/command-design.md` + `workflow-design.md`; design-system workflow re-themes the prototype only if one exists. Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** First dedicated EDD round — init split into scaffold/migrate experiences with the interactive walkthrough, content-preservation invariant, and archive/update/leave-alongside options; new CLI Experience section (command ↔ workflow table); new workflows for `021-feedback` and `021-design`; stage-aware reviews; "Ask, don't assume" principle; cohesive-set statement; changelog added. Per [_refinement/r4-update-edd.md](_refinement/r4-update-edd.md).
