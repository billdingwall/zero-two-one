# Standards Audit: Cross-Platform AI Config & Workflow Standardization

> This audit evaluates the zero-two-one repository and NPM package against research on standardizing AI coding environments across Claude Code, Kiro, and Google Antigravity. It covers the current state, a gap analysis, and a concrete implementation blueprint for the `.workflow/` state machine, deterministic refinement-loop initialization, and platform-agnostic configuration layers.

---

## 1. Research Summary

The three research documents ("AI config report," "AI structure notes," "Standardizing the refinement init") converge on a single architectural thesis:

1. **A hidden `.workflow/` directory** acts as the deterministic state machine. `state.json` is the database; `*.md` files are the instruction manuals.
2. **Parameterized workflow templates** (`refinement.template.md`) get hydrated via a shell script (`init-loop.sh`) with explicit Name, Scope Path, Target Files, and Permissible Tools — creating scoped, isolated refinement-loop instances.
3. **Multi-tiered initialization** allows the same refinement template to be instantiated at project root, team-planning, or initiative/feature scope levels — each with its own `.workflow/state.json`.
4. **Platform-agnostic state transitions** via `Makefile` targets (`wf-status`, `wf-transition`, `wf-next`) so Claude Code, Kiro, and Antigravity interact with identical POSIX commands.
5. **Thin platform overlays** — each tool gets a minimal adapter (`.claude/rules/`, `.kiro/steering/`, `.agents/`) that reads from the shared `.workflow/` state rather than defining its own logic.

### Cross-Platform Configuration Mapping

| Component | Claude Code | Kiro | Google Antigravity |
|-----------|------------|------|-------------------|
| **Skills** | `.claude/skills/*/SKILL.md` | `.kiro/skills/*/SKILL.md` | `.agents/skills/*/SKILL.md` |
| **Agents** | `.claude/agents/*.agent.md` | `.kiro/agents/*.json` | Antigravity SDK (programmatic) |
| **Workflows** | `.claude/workflows/*.js` | Hooks & Specs (event-driven) | `.agents/hooks.json` (lifecycle hooks) |
| **Core Rules** | `CLAUDE.md` (root) | `.kiro/steering/*.md` (mode: `always`) | Workspace Settings (minimal) |
| **Scoped Rules** | `.claude/rules/*.md` | `.kiro/steering/*.md` (mode: `fileMatch`/`auto`) | Inside Agent Skills (on-demand) |
| **Settings** | `.claude/settings.json` | `.kiro/` configurations | `.agents/` configurations |
| **Local Settings** | `.claude/settings.local.json` (gitignored) | `~/.kiro/` (home dir) | Global App Config |

---

## 2. Current State Inventory

### 2.1 What Exists Today

| Concern | Current Location | Format | Notes |
|---------|-----------------|--------|-------|
| AI entry point | `CLAUDE.md` (root) | Monolithic markdown | Claude-only; ~53 lines mixing install instructions, context, routing, and rules |
| Scoped rules | `.claude/commands/021-init.md`, `021-status.md` | Markdown w/ YAML frontmatter | Only two Claude slash commands; no `.claude/rules/` or `.claude/agents/` |
| AI context bundles | `.ai/context/` | Gitignored, generated | Platform-neutral name but only referenced from `CLAUDE.md` |
| Lifecycle state | `.zero-two-one.json` | JSON manifest | Tracks phase, cycle count, directory map, script map — **no explicit `status` field for gating** |
| Workflow docs | `workflow/workflows.md` + `workflow/specific-workflows/` | Public markdown | 6 canonical workflows; not hidden, not parameterized |
| Refinement loop | `skills/refinement-loop.md` | Skill prompt | Prose instructions for the AI; no scoping (files, tools, path restrictions) |
| Document templates | `templates/*.md` | `{{PLACEHOLDER}}` syntax | Used by `scripts/init/021-templates.js` for document generation only |
| Lifecycle scripts | `scripts/workflow-status.js`, `scripts/speckit/*.js` | Node.js CommonJS | Invoked via `npm run 021-*`; no Makefile or POSIX wrapper |
| Git hooks | `hooks/pre-commit` | Bash | Spec-Kit gate only |
| Package sync | `scripts/sync-to-package.js` | Node.js | Syncs `scripts/`, `skills/`, `templates/`, `workflow/`, `hooks/`, `bin/`, `.claude/commands/` |
| Kiro config | **Does not exist** | — | No `.kiro/` directory anywhere |
| Antigravity config | **Does not exist** | — | No `.agents/` directory anywhere |
| `.workflow/` state machine | **Does not exist** | — | No `state.json`, no `init-loop.sh`, no template hydration |

### 2.2 Repository Structure (Abridged)

```
zero-two-one/                          (root — development workspace)
├── .021-updates/release-notes/        v0.4.0, v0.5.0, v0.6.0
├── .ai/context/                       (empty, gitignored)
├── .claude/commands/                   021-init.md, 021-status.md
├── .github/                           FUNDING.yml
├── bin/init.js                        CLI shim → scripts/init/021-init.js
├── hooks/pre-commit                   Spec-Kit gate
├── requirements/                      01-PRD … 05-ROADMAP, _refinement/ (6 cycles), _notes/, _design/, _architecture/adr/
├── scripts/                           workflow-status.js, init/, speckit/, run-qa.sh, check-links.js, sync-to-package.js
├── skills/                            refinement-loop.md, generate-spec.md, verify-spec-compliance.md, tools.json
├── specs/                             _INDEX.md only
├── templates/                         15 document templates + reviews/
├── workflow/                          workflows.md, specific-workflows/ (6 files), _personas/ (3 files)
├── package/                           NPM publish snapshot (mirrors root framework files)
├── .zero-two-one.json                 Project manifest
├── CLAUDE.md                          AI entry point
├── CODE.md, PRODUCT.md, DESIGN.md     Quick-reference docs
├── package.json                       Root dev workspace (private)
└── CONTRIBUTING.md, LICENSE, README.md
```

---

## 3. Gap Analysis

### 3.1 Structural Gaps

| Gap | Severity | Description |
|-----|----------|-------------|
| **No `.workflow/` directory** | 🔴 Critical | The entire state-machine architecture from the research is absent. Workflow definitions live in a public `workflow/` directory with no state tracking, no gating, and no parameterization. |
| **No refinement-loop scoping** | 🔴 Critical | `skills/refinement-loop.md` is a flat prose prompt. It has no `{{SCOPE_PATH}}`, no target-file boundaries, no tool restrictions. An agent executing it has unrestricted repo access. |
| **No `state.json` pattern** | 🔴 Critical | `.zero-two-one.json` tracks lifecycle phase but has no `status` field for gating (`IN_PROGRESS`, `HUMAN_REVIEW_PENDING`, `COMPLETED`), no `assigned_agent` field, and no transition history array. |
| **No Makefile interface** | 🟡 High | All automation is Node.js via `npm run`. This works for Claude Code (bash access) but is not the minimal POSIX contract the research prescribes. Kiro hooks and Antigravity pre-task hooks expect shell commands, not npm scripts. |
| **No Kiro configuration** | 🟡 High | No `.kiro/steering/`, `.kiro/hooks/`, or `.kiro/agents/` exist. A Kiro user opening this repo gets zero framework guidance. |
| **No Antigravity configuration** | 🟡 High | No `.agents/skills/`, `.agents/hooks.json`, or workspace settings exist. Antigravity subagents cannot discover the framework. |
| **Monolithic `CLAUDE.md`** | 🟡 High | Mixes installation instructions, dogfooding context, documentation structure, and AI behavioral rules in one file. The research recommends a minimal router that defers to scoped rules and the `.workflow/` state machine. |
| **No workflow template hydration** | 🟡 High | `templates/` contains document templates (PRD, EDD, etc.) but no workflow templates. The `{{PLACEHOLDER}}` engine in `021-templates.js` only handles document generation during init — it cannot instantiate scoped refinement loops at runtime. |
| **No human-review gate in state** | 🟡 High | The pre-commit hook gates on spec status, but there is no equivalent gate for the refinement loop. An agent can modify `requirements/` documents without a `HUMAN_REVIEW_PENDING` check. |
| **Init script doesn't scaffold `.workflow/`** | 🟠 Medium | `021-init.js` creates `workflow/`, `skills/`, `templates/`, etc., but not `.workflow/` with `state.json` and `templates/`. |
| **Init script doesn't scaffold `.kiro/` or `.agents/`** | 🟠 Medium | Only `.claude/commands/` and `.ai/context/` are created. |
| **Package sync doesn't include platform dirs** | 🟠 Medium | `sync-to-package.js` syncs `.claude/commands/` but would not sync `.kiro/` or `.agents/` since they don't exist yet. |

### 3.2 Conceptual Gaps

| Concept from Research | Current State | Required Change |
|----------------------|---------------|-----------------|
| State Machine (database) | `.zero-two-one.json` serves as manifest, not state machine | Introduce `.workflow/state.json` as the active execution state; keep `.zero-two-one.json` as the static project manifest |
| Instruction Manuals (`.workflow/*.md`) | `workflow/workflows.md` is public reference prose | Create hidden `.workflow/` copies that are agent-executable (deterministic steps, explicit triggers) |
| Template Hydration (`init-loop.sh`) | No equivalent | Add `.workflow/scripts/init-loop.sh` and `.workflow/templates/refinement.template.md` |
| Multi-tiered scoping | Refinement happens globally in `requirements/_refinement/` | Support scoped refinement at project root, team-planning, and initiative levels |
| Platform Adapters | Only Claude Code | Add Kiro steering + hooks, Antigravity/generic agent skills + hooks |
| POSIX Interface (`Makefile`) | `npm run` only | Add root `Makefile` wrapping the npm scripts, plus new `wf-*` targets |
| Human Review Gate | Spec-Kit pre-commit hook only | Extend state machine with `HUMAN_REVIEW_PENDING` status; add guard scripts |
| Agent Exit/Resume Loop | No explicit protocol | Define in `.workflow/` — agents must `wf-transition` before stopping, next agent reads `wf-status` on startup |

---

## 4. Implementation Blueprint

### 4.1 Target Directory Structure (NPM Package)

This is what the package should scaffold when a user runs `npx zero-two-one-init`:

```
project-root/
├── .workflow/                          # NEW — Hidden state machine
│   ├── state.json                      # Active execution state (phase, status, agent, history)
│   ├── 021-lifecycle.md                # Agent-executable lifecycle definition
│   ├── refinement-loop.md              # Hydrated instance (project-level, from template)
│   ├── templates/                      # Parameterized workflow blueprints
│   │   ├── refinement.template.md      # Scoped refinement process template
│   │   └── 021-lifecycle.template.md   # Lifecycle definition template
│   └── scripts/                        # Workflow automation
│       ├── init-loop.sh                # Hydration engine (Name, Path, Files, Tools)
│       ├── transition.js               # State transition logic
│       ├── evaluate-next.js            # Calculate next steps from state
│       └── guard-review-status.js      # Block writes during HUMAN_REVIEW_PENDING
│
├── .claude/                            # Claude Code adapter (existing, expanded)
│   ├── commands/
│   │   ├── 021-init.md
│   │   └── 021-status.md
│   └── rules/                          # NEW — Scoped rules
│       └── workflow-gate.md            # Reads .workflow/state.json, enforces gates
│
├── .kiro/                              # NEW — Kiro adapter
│   ├── steering/
│   │   ├── workflow-sync.md            # mode: always — reads .workflow/state.json
│   │   └── coding-standards.md         # mode: fileMatch src/** — loads CODE.md rules
│   └── hooks/
│       └── pre-save-check.json         # beforeFileWrite → guard-review-status.js
│
├── .agents/                            # NEW — Platform-neutral agent adapter
│   ├── skills/
│   │   └── refinement-loop/
│   │       └── SKILL.md                # On-demand skill wrapping the refinement process
│   └── AGENTS.md                       # NEW — Platform-neutral AI entry point
│
├── Makefile                            # NEW — Universal POSIX interface
├── CLAUDE.md                           # Slimmed to router → .agents/AGENTS.md
├── .zero-two-one.json                  # Static project manifest (unchanged purpose)
├── requirements/                       # Unchanged
├── workflow/                           # Kept as public reference docs (human-readable)
├── skills/                             # Kept for AI skill prompts
├── specs/                              # Unchanged
├── templates/                          # Document templates (unchanged)
├── scripts/                            # Existing npm lifecycle scripts (unchanged)
└── hooks/                              # Existing git hooks (unchanged)
```

### 4.2 Key New File Specifications

#### `.workflow/state.json`

```json
{
  "loop_name": "Project Root Refinement",
  "scope": ".",
  "active_definition": ".workflow/refinement-loop.md",
  "current_step": "State Initialization",
  "status": "IN_PROGRESS",
  "assigned_agent": null,
  "last_updated": "2026-07-16T00:00:00Z",
  "history": []
}
```

**Relationship to `.zero-two-one.json`**: The manifest remains the static identity of the project (name, stack, version, directory map). The `state.json` is the *runtime* execution state that agents read/write during active work sessions. They are separate concerns.

#### `.workflow/templates/refinement.template.md`

```markdown
# Refinement Process: {{LOOP_NAME}}
**Level / Scope:** {{SCOPE_PATH}}

## 1. Execution Boundaries
- **Target Directory:** Strictly restricted to reading and writing within `{{SCOPE_PATH}}`.
- **Monitored Source Files:**
{{TARGET_FILES}}
- **Permissible Tool Suite:**
{{PERMISSIBLE_TOOLS}}

## 2. Refinement Protocol
### Step 1: State Initialization
- Execute `make wf-status PATH={{SCOPE_PATH}}` to ingest the active context pointer.
- Inspect the current target files list to ensure alignment.

### Step 2: Analysis & Gap Review
- Evaluate the source documents against the project requirements and templates.
- Identify missing definitions, edge cases, or breaking dependencies.

### Step 3: Plan Update & Commit
- Document modification proposals in `{{SCOPE_PATH}}/.workflow/plan.md`.
- Present changes to the human reviewer by shifting state to `HUMAN_REVIEW_PENDING`.
```

#### `.workflow/scripts/init-loop.sh`

```bash
#!/bin/bash
# Usage: ./init-loop.sh <Name> <Path> <Files_List> <Tools_List>

LOOP_NAME=$1
SCOPE_PATH=$2
TARGET_FILES=$3
PERMISSIBLE_TOOLS=$4

mkdir -p "$SCOPE_PATH/.workflow"

sed -e "s|{{LOOP_NAME}}|$LOOP_NAME|g" \
    -e "s|{{SCOPE_PATH}}|$SCOPE_PATH|g" \
    -e "s|{{TARGET_FILES}}|$TARGET_FILES|g" \
    -e "s|{{PERMISSIBLE_TOOLS}}|$PERMISSIBLE_TOOLS|g" \
    .workflow/templates/refinement.template.md > "$SCOPE_PATH/.workflow/refinement-loop.md"

cat <<EOF > "$SCOPE_PATH/.workflow/state.json"
{
  "loop_name": "${LOOP_NAME}",
  "scope": "${SCOPE_PATH}",
  "active_definition": "${SCOPE_PATH}/.workflow/refinement-loop.md",
  "current_step": "State Initialization",
  "status": "IN_PROGRESS",
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✓ Successfully initialized ${LOOP_NAME} at ${SCOPE_PATH}"
```

#### `Makefile` (root)

```makefile
.PHONY: wf-status wf-transition wf-next wf-init status qa

# Show current workflow state (optionally scoped)
# Usage: make wf-status [PATH=.]
wf-status:
	@cat $(or $(PATH),.)/. workflow/state.json 2>/dev/null || echo "No .workflow/state.json at $(or $(PATH),.)"

# Transition state
# Usage: make wf-transition STEP=<step> STATUS=<status>
wf-transition:
	@node .workflow/scripts/transition.js "$(STEP)" "$(STATUS)"

# Evaluate next steps
wf-next:
	@node .workflow/scripts/evaluate-next.js

# Initialize a scoped refinement loop
# Usage: make wf-init NAME="Auth Refinement" PATH=initiatives/feat-auth FILES="specs.md" TOOLS="Read, Write"
wf-init:
	@./.workflow/scripts/init-loop.sh "$(NAME)" "$(PATH)" "$(FILES)" "$(TOOLS)"

# Existing npm convenience aliases
status:
	@npm run 021-status

qa:
	@npm run 021-qa
```

#### `.agents/AGENTS.md` (Platform-Neutral Entry Point)

```markdown
# AI Assistant Instructions

## Workflow Protocol
You are operating within an explicit, state-locked lifecycle.
Every time you initiate a session or complete an action, you MUST execute `make wf-status`.

### Architectural Gates
- If `status` is `HUMAN_REVIEW_PENDING`, you are FORBIDDEN from modifying source files.
  You may only answer questions or refine documentation in `.workflow/`.
- To request a human review, execute:
  `make wf-transition STEP=<current> STATUS=HUMAN_REVIEW_PENDING`

### Lifecycle Execution
- Before running modifications, execute `make wf-next` to verify target alignment.
- Read `.workflow/state.json` to determine which `active_definition` governs your current scope.
- Follow the steps in the referenced `.workflow/*.md` file exactly.
```

#### Slimmed `CLAUDE.md` (Router)

```markdown
# Claude Code Entry Point

Read `.agents/AGENTS.md` for the full AI assistant protocol.

## Quick Reference
- `make wf-status` — Check current workflow state
- `npm run 021-status` — Check lifecycle phase
- `npm run 021-qa` — Run QA suite

## Claude-Specific
- Use `/021-init` to scaffold the framework
- Use `/021-status` to check phase
- Respect the "Wait" rule: outline plans and confirm before complex multi-file changes (CODE.md §4)
```

#### `.kiro/steering/workflow-sync.md`

```markdown
---
name: workflow-sync
activation: always
---
You are an execution worker bound to `.workflow/state.json`.
Evaluate the workspace state at the beginning of your reasoning loop.
If the status field is `HUMAN_REVIEW_PENDING`, halt automation and prompt the user for manual validation.
Read `.agents/AGENTS.md` for the full protocol.
```

#### `.kiro/hooks/pre-save-check.json`

```json
{
  "event": "beforeFileWrite",
  "include": "requirements/**/*",
  "command": "node .workflow/scripts/guard-review-status.js"
}
```

### 4.3 Changes to Existing Files

#### `scripts/init/021-init.js` — Additions

The init script must be extended to scaffold these new directories and files:

```
NEW directories to create:
  .workflow/
  .workflow/templates/
  .workflow/scripts/
  .claude/rules/
  .kiro/steering/
  .kiro/hooks/
  .agents/
  .agents/skills/
  .agents/skills/refinement-loop/

NEW files to copy (framework-owned, always overwritten):
  .workflow/templates/refinement.template.md
  .workflow/templates/021-lifecycle.template.md
  .workflow/scripts/init-loop.sh
  .workflow/scripts/transition.js
  .workflow/scripts/evaluate-next.js
  .workflow/scripts/guard-review-status.js
  .claude/rules/workflow-gate.md
  .kiro/steering/workflow-sync.md
  .kiro/hooks/pre-save-check.json
  .agents/AGENTS.md
  .agents/skills/refinement-loop/SKILL.md
  Makefile

NEW files to generate (create-if-missing):
  .workflow/state.json (hydrated with project name from init prompts)
  .workflow/refinement-loop.md (hydrated from template for project root scope)
  .workflow/021-lifecycle.md (hydrated from template)
```

#### `scripts/sync-to-package.js` — Additions

Add to the `SYNC_DIRS` array:

```javascript
const SYNC_DIRS = [
  'scripts',
  'skills',
  'templates',
  'workflow',
  'hooks',
  'bin',
  '.claude/commands',
  '.claude/rules',       // NEW
  '.kiro',               // NEW
  '.agents',             // NEW
  '.workflow/templates',  // NEW — templates only, not state
  '.workflow/scripts',    // NEW — scripts only, not state
];
```

> **Important:** `.workflow/state.json` and hydrated instance files are project-specific and must NOT be synced to the package. Only the templates and scripts are framework-owned.

#### `package.json` (root) — Additions

```json
{
  "scripts": {
    "wf-status": "cat .workflow/state.json",
    "wf-transition": "node .workflow/scripts/transition.js",
    "wf-next": "node .workflow/scripts/evaluate-next.js"
  }
}
```

---

## 5. Working Repo Dogfood Plan

The working repo at `/Users/williamdingwall/Sites/zero-two-one` is dogfooding the framework. After implementing the package changes, the working repo needs:

### 5.1 Scaffold `.workflow/` at Root

```bash
make wf-init \
  NAME="Project Root Refinement" \
  PATH="." \
  FILES="  - requirements/01-PRD.md\n  - requirements/02-EDD.md\n  - requirements/03-TDD.md\n  - requirements/04-BACKLOG.md\n  - requirements/05-ROADMAP.md\n  - CLAUDE.md\n  - PRODUCT.md\n  - CODE.md\n  - DESIGN.md" \
  TOOLS="  - Read, Write, Grep, Bash, npm run 021-*"
```

### 5.2 Migrate State

Seed `.workflow/state.json` from `.zero-two-one.json`:

```json
{
  "loop_name": "Project Root Refinement",
  "scope": ".",
  "active_definition": ".workflow/refinement-loop.md",
  "current_step": "Analysis & Gap Review",
  "status": "IN_PROGRESS",
  "assigned_agent": null,
  "last_updated": "2026-07-16T00:00:00Z",
  "history": [
    {
      "timestamp": "2025-06-15T00:00:00Z",
      "cycles_completed": 6,
      "summary": "Migrated from .zero-two-one.json — 6 refinement cycles completed during Planning phase"
    }
  ]
}
```

### 5.3 Platform Configs

- Slim `CLAUDE.md` to ~15-line router → `.agents/AGENTS.md`
- Create `.kiro/steering/workflow-sync.md` (always-on)
- Create `.kiro/steering/coding-standards.md` (`fileMatch: scripts/**`)
- Create `.agents/AGENTS.md` (platform-neutral, full protocol)

### 5.4 Keep `workflow/` as Public Documentation

| Directory | Audience | Purpose | Mutable by Agents? |
|-----------|----------|---------|---------------------|
| `workflow/` | Humans | Reference prose for understanding processes | No (framework-owned) |
| `.workflow/` | AI agents, scripts | Executable state machine with parameterized instances | Yes (`state.json`, hydrated loop files) |

---

## 6. Execution Sequence

### Phase A: Package Foundation (do first)

1. Create `.workflow/templates/refinement.template.md` in package
2. Create `.workflow/scripts/init-loop.sh` in package
3. Create `.workflow/scripts/transition.js` in package
4. Create `.workflow/scripts/evaluate-next.js` in package
5. Create `.workflow/scripts/guard-review-status.js` in package
6. Create `.agents/AGENTS.md` in package (extract from `CLAUDE.md` template)
7. Create `.claude/rules/workflow-gate.md` in package
8. Create `.kiro/steering/workflow-sync.md` in package
9. Create `.kiro/hooks/pre-save-check.json` in package
10. Create `.agents/skills/refinement-loop/SKILL.md` in package
11. Create `Makefile` in package
12. Update `scripts/init/021-init.js` to scaffold all new directories and files
13. Update `templates/CLAUDE-Template.md` to be a slim router
14. Update `scripts/sync-to-package.js` to include new directories

### Phase B: Working Repo Dogfood (do second)

1. Run `npm run sync:package` (or manually scaffold since we're building in root)
2. Create `.workflow/` at repo root with `state.json` seeded from `.zero-two-one.json`
3. Hydrate `refinement-loop.md` at root scope
4. Slim `CLAUDE.md` to router
5. Create `.agents/AGENTS.md` with full protocol
6. Create `.kiro/` config
7. Add `Makefile` at root
8. Test: `make wf-status` → should print `state.json`
9. Test: `make wf-init NAME="Test" PATH="test-scope" FILES="test.md" TOOLS="Read"`
10. Clean up test scope
11. Run `npm run 021-qa` to verify nothing broke
12. Run `npm run sync:package` to push changes to package

### Phase C: Verification

1. `make wf-status` works from root
2. `init-loop.sh` creates scoped `.workflow/` directories correctly
3. `guard-review-status.js` blocks writes when `HUMAN_REVIEW_PENDING`
4. Init script scaffolds all new directories on a fresh project
5. `.kiro/steering/` files are syntactically valid
6. `.agents/AGENTS.md` is platform-neutral (no Claude-specific instructions)
7. `sync-to-package.js` copies new directories but NOT `state.json`

---

## 7. Design Decisions & Open Questions

### Decisions Made

1. **`.workflow/` is hidden** — Agent-executable state should not be confused with human reference docs in `workflow/`.
2. **Keep `workflow/` as-is** — The existing public workflow documentation serves a different purpose and should not be deleted or renamed.
3. **`.agents/AGENTS.md` is the neutral entry point** — `CLAUDE.md` becomes a thin Claude-specific router. Kiro reads steering files. Antigravity reads skills. All ultimately point to the same `.agents/AGENTS.md` contract.
4. **Makefile is the universal interface** — Even though the project is Node.js, `make` is POSIX-standard and works across all three platforms without requiring `npm`.
5. **`state.json` is separate from `.zero-two-one.json`** — The manifest is the project's identity (static). The state is the execution pointer (dynamic). Mixing them conflates two concerns.

### Open Questions

1. **Should the init script auto-hydrate a root refinement loop?** The research suggests yes — when `zero-two-one-init` runs, it should create `.workflow/state.json` and hydrate a project-root-scoped `refinement-loop.md`. But this adds complexity to the init script.

2. **Should `.kiro/` and `.agents/` be optional during init?** Some users may only use Claude Code. The init script could accept `--platforms claude,kiro,antigravity` to selectively scaffold. Or scaffold all by default (they're small files).

3. **Where does `AGENTS.md` live — `.agents/` or root?** The research uses `.agents/` for Antigravity. But Kiro and Claude Code both support root-level files. Placing it in `.agents/` keeps the root clean but requires explicit references from `CLAUDE.md` and `.kiro/steering/`.

4. **Should the existing `skills/refinement-loop.md` be replaced or supplemented?** The current skill is a prose prompt. The new `.workflow/templates/refinement.template.md` is a parameterized contract. Recommendation: keep the skill as the "how to think" guide, and the template as the "what are your boundaries" contract. The hydrated instance references the skill.

5. **Naming: `.agents/` vs `.antigravity/`?** Using `.agents/` is more generic and could serve as the neutral ground for any platform. Using `.antigravity/` is specific to Google's tooling. Recommendation: use `.agents/` as the neutral directory (it's already what Antigravity uses for workspace customizations), and only add `.antigravity/` if platform-specific hooks are needed.
