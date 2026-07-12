# r4 Update Plan: 02-EDD.md

**Status:** Applied (2026-07-12)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 1, 3, 10, 11, 13, 14, 17
**Target doc:** [../02-EDD.md](../02-EDD.md)

## Intent

First dedicated EDD round. The EDD is currently 26 lines while the PRD and TDD have absorbed three rounds of refinement — exactly the cohesion gap finding 1 names. This plan brings the EDD up to parity as the experience half of the PRD/EDD/TDD set: the init walkthrough, the CLI command surface, the interactive-question pattern, and the feedback and design-install experiences.

## Proposed Edits

### 1. Expand "Project Initialization" (finding 3)

Split into two scenarios plus shared rules:

- **New project (scaffold)**: current instant-setup flow; the assistant walkthrough confirms stack + design and lands the full surface, including `requirements/` key docs from templates.
- **Active project (migrate)**: the assistant runs an **interactive walkthrough** — asks about project stack, existing structure, and lifecycle phase (detection proposes answers; the user confirms). Existing files are **never destroyed**: they may be added to, renamed, or updated, but existing content is never removed. When init finds an existing doc that duplicates a framework file, the user chooses per file: **archive** the old duplicate, **update it to fit the framework**, or **leave it alongside** the new file.
- **Merge-conflict handling**: describe the experience of the ownership rules (TDD §6) — conflicts are reported with a classified plan (`--dry-run` view), never silently resolved; the walkthrough turns each conflict into a question rather than an error.
- **Experience goal**: setup is a conversation, not a script — the assistant explains what will land where before anything is written (finding 4 pairs with this; the mechanics live in the TDD).

### 2. New section: The CLI Experience (finding 10)

Document the `021` command surface as a first-class interface:

- **Legible**: every command is `021-` namespaced, discoverable, and self-describing; output states the phase, what was checked, and the next step.
- **Automatic by default**: commands map to the specific 021 workflows (init/migration, refinement loop, SSD, QA, release) so the happy path needs no process knowledge.
- **Manual controls always available**: status checks (`021-status`, `021-spec:status`), explicit state changes (`021-spec:status -- set`), verification (`021-spec:verify`, `021-qa`), and context rebuilds (`021-spec:context`) let users inspect and manage the project at any point without the automated flow.
- Include the command ↔ workflow table (stack-rendered names noted per TDD §9.2).

### 3. New design principle: Ask, don't assume (finding 11)

When a `021` command needs more context, it asks an **interactive question** presenting: a recommended option (marked as such), sensible alternatives, and a free-text write-in option. Applies to init walkthrough questions, phase/stack confirmation, conflict resolution, and any future command needing input.

### 4. New workflow: Sending Feedback (finding 14)

- **User Action**: runs `/021-feedback` (stack-rendered) with their feedback text.
- **System Response**: files a GitHub issue in the zero-two-one repo — text, a link to the user's repo, and manifest context (version, stack, phase). Confirms with the issue URL.
- **Experience Goal**: zero-friction feedback from inside the working session; users see their input land somewhere actionable.

### 5. New workflow: Installing a Design System (finding 17)

- **User Action**: runs `021-design` naming their design system (or choosing a supported one, e.g. `material-3`).
- **System Response**: walks the design-system-selection workflow — maps tokens into `DESIGN.md`, stores exported artifacts in `requirements/_design/tokens/`, updates component details and the prototype theme.
- **Experience Goal**: swapping or adopting a design system re-themes the project without touching the key docs.

### 6. Stage-aware reviews (finding 13)

Note under AI Agent Interaction (or a short new subsection): review rounds present a template matched to the lifecycle stage — Idea: completing key/guiding docs; Pre-build: refining key docs, prototype reviews, roadmap definition; MVP: code review and build testing; Growth: product review and user feedback. (Template mechanics in [r4-update-workflows.md](r4-update-workflows.md).)

### 7. Cohesion sweep support (finding 1)

Add a line to the Overview: the EDD is one third of the cohesive PRD/EDD/TDD set and participates in every cascade. Add a **Changelog** section (the EDD lacks one — required for RLP step 3 logging).

## Cascade

- `templates/02-EDD-Template.md` gains matching section skeletons (Initialization scenarios, CLI Experience, interactive-question principle, Changelog) — template-maintenance rule, executed via [r4-update-workflows.md](r4-update-workflows.md).
- TDD implements the walkthrough, feedback, and design commands ([r4-update-tdd.md](r4-update-tdd.md)).
