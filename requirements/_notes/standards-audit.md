# Standards Audit: AI Environment & Refinement Loop Initialization

## Overview
This audit evaluates the zero-two-one repository and package against the latest research on standardizing AI coding environments across Claude Code, Kiro, and Google Antigravity. The goal is to provide a comprehensive analysis of the current state and a concrete plan for implementing the multi-tiered `.workflow/` state machine, deterministic refinement loop initialization, and platform-agnostic configuration structures.

---

## 1. Current State Analysis

**Repository & Package Structure:**
- The repository relies heavily on a massive `CLAUDE.md` at the root for overarching AI instructions, which is an anti-pattern for Kiro (which prefers `fileMatch` steering) and Antigravity (which prefers on-demand agent skills and minimal context).
- Workflows are grouped in a public `workflow/` folder with `workflows.md` acting as the canonical reference. Templates are stored in a top-level `templates/` directory.
- `scripts/` exists for npm lifecycle automation (e.g., `workflow-status.js`), but there is no standardized `Makefile` or agnostic POSIX interface for state transitions.
- The `.claude` and `.ai` directories exist but are sparse. `.kiro` and `.antigravity` configurations are missing, leading to fragmented or undefined behavior when accessed via those tools.
- Refinement loops currently happen loosely in `requirements/_refinement/` without explicit, programmatic boundaries (scope, file limits, tool constraints).
- The `package/` subdirectory mirrors this structure for NPM publishing, meaning any architectural changes must be synchronized there.

## 2. Concept Implementation Strategy

To align with the research, the framework must transition from a reactive, monolithic prompt structure to a deterministic, state-driven architecture isolated in `.workflow/` directories.

### Phase 1: The Unified Workflow Architecture (`.workflow/`)
We need to consolidate the scattered workflow elements into a hidden `.workflow/` directory. This acts as both the "database" (state) and "instruction manuals" (markdown loop definitions).

**Implementation for Repo & Package:**
1. **Migration:** Move `workflow/`, `templates/`, and related lifecycle scripts into a unified `.workflow/` directory at the root (and subsequently in `package/`).
2. **Directory Structure:**
   ```text
   .workflow/
   ├── templates/
   │   ├── refinement.template.md
   │   └── 021-lifecycle.template.md
   ├── scripts/
   │   ├── init-loop.sh
   │   ├── transition.js
   │   └── guard_review_status.js
   ├── state.json (Root level tracker)
   └── 021-lifecycle.md
   ```
3. **State Machine Interface:** Introduce a root `Makefile` exposing `wf-status`, `wf-transition`, and `wf-next`. This abstracts the state machine so Claude Code, Kiro, and Antigravity can interact with it uniformly without platform-specific custom commands.

### Phase 2: Refinement Loop Standardization (Scoping)
Currently, agents have global reach. We need to implement the multi-tiered initialization pattern to explicitly bound AI execution.

**Implementation for Repo & Package:**
1. **Hydration Engine:** Add `.workflow/scripts/init-loop.sh` to hydrate parameters (Loop Name, Scope Path, Target Files, Permissible Tools) into a concrete `refinement-loop.md`.
2. **Scaffold Targets:** Update the development workflow so that `requirements/_refinement/` or `initiatives/` are initialized with their own isolated `.workflow/` subdirectories containing a scoped `state.json` and a generated `refinement-loop.md`.
3. **Template Contract:** The `refinement.template.md` must clearly restrict agents to their `{{SCOPE_PATH}}` and enforce the three-step protocol (State Initialization -> Analysis & Gap Review -> Plan Update & Commit).

### Phase 3: Platform-Specific Configuration Layers
The repo must support all three platforms gracefully by wrapping the single `.workflow/` state machine in thin, declarative platform abstractions.

**Implementation for Repo & Package:**
1. **Claude Code (`.claude/`):**
   - Shrink the global `CLAUDE.md` to a minimal router.
   - Instruct Claude to execute `make wf-status` at the start of every session and strictly obey the `HUMAN_REVIEW_PENDING` gate.
   - Utilize `.claude/rules/*.md` for directory-specific context instead of a monolithic file.
2. **Kiro (`.kiro/`):**
   - Create `.kiro/steering/workflow_sync.md` (mode: `always`) commanding the agent to respect `.workflow/state.json`.
   - Add `.kiro/hooks/pre-save-check.json` triggering `guard_review_status.js` on `beforeFileWrite` to physically block execution when human review is required.
3. **Google Antigravity (`.antigravity/`):**
   - Create `.antigravity/hooks.json` mapping `pre_task_execution` to `make wf-status && node .workflow/scripts/assert_not_blocked.js`.
   - Define Agent Skills in `.antigravity/skills/` that dynamically mount requirements from the active loop state rather than flooding the global system prompt.

## 3. Rollout Plan (Next Steps)

1. **Scaffolding:** Create the `.workflow/` structure in the working repo and populate the `templates/` and `scripts/` subdirectories.
2. **Makefile Integration:** Add the universal `Makefile` to the repo root and verify state transitions work with the existing `.zero-two-one.json` or a new `state.json`.
3. **Platform Overlays:** Create the `.kiro` and `.antigravity` folders in the root repo. Trim `CLAUDE.md` down to reflect the new state machine protocol.
4. **Package Sync:** Once tested in the root repo, sync these structural changes to the `package/` folder and update the `sync-to-package.js` script to include the new `.workflow/`, `.kiro/`, and `.antigravity/` directories.
5. **NPM Init Update:** Update the `zero-two-one-init` script to scaffold this new multi-tiered architecture for end-users.
