# Zero Two One Workflows

> The canonical, expanded workflow reference for this framework. It extracts and extends `workflow-overview.md`, detailing the exact processes for **Discovery, Design, Refinement, Speckit Implementation, QA, and Release** — including how AI agents and automated scripts interact at each stage.

---

## 0. The Operating Model

The framework runs two distinct but connected workflows across a 4-phase lifecycle:

1. A **project-level documentation workflow** — the living design documents (`requirements/`) that define the entire product, evolved through refinement rounds.
2. A **feature-level specification workflow** (GitHub Spec Kit) — numbered feature branches producing self-contained artifact sets under `specs/NNN-feature-name/`.

| Lifecycle phase | Dominant workflows |
|---|---|
| 1 — Planning (Zero) | Discovery |
| 2 — Pre-build (Refinement) | Design, Refinement |
| 3 — MVP Build (One) | Speckit Implementation, QA, Release |
| 4 — Growth | Refinement + Speckit Implementation + QA + Release, continuously |

The current phase is detected mechanically by `npm run status` (`scripts/workflow-status.js`) and tracked in the AI assistant's memory. `CLAUDE.md` is the bridge between the two workflows: it tells the agent which documents to read, what the constraints are, and which workflow a given change belongs to.

### The dependency chain

```
AI_CODING_GUIDELINES.md        governs everything (the constitution)
       ↓
requirements/01-PRD.md         defines what gets built
       ↓
requirements/02-TDD.md         defines how it gets built
       ↓
requirements/03-ROADMAP.md     sequences when it gets built
       ↓
specs/NNN-feature-name/        operationalizes individual features
       ↓
.ai/context/NNN-*.{md,json}    generated agent-readable context bundles
```

Changes only flow **down** this chain. A discovery during implementation that contradicts the PRD flows back up via a refinement round — never as silent code drift.

### Repository structure

```
zero-two-one/
├── requirements/
│   ├── 01-PRD.md                  # What & why — modules, user scenarios, data model, IA
│   ├── 02-TDD.md                  # How & where — architecture, specs, service design
│   ├── 03-ROADMAP.md              # When — phased plan with milestone gates
│   ├── 04-PROJECT-TRACKING.md     # Tasks — remaining work before the next build phase
│   ├── _refinement/               # Review rounds and doc update plans
│   │   ├── r{n}-review.md         # Raw feedback (or user-direction note) per round
│   │   └── r{n}-update-{doc}.md   # Formatted update plan per target doc per round
│   ├── _design/                   # Design mocks, icons, images, design system
│   └── _notes/                    # Loose notes and domain research (kebab-case names)
├── prototype/                     # Static HTML/CSS/JS prototype for design review
├── specs/                         # Feature-level Spec Kit artifacts (NNN-feature-name)
├── .ai/context/                   # Generated Speckit context bundles (gitignored)
├── templates/                     # Templates for project documentation
├── skills/                        # AI skills + tools.json agent tool schemas
├── scripts/                       # Lifecycle automation (speckit/, QA)
├── hooks/                         # Git hooks (pre-commit refinement gate)
├── workflow/                      # This documentation + personas + manifest
├── CLAUDE.md                      # AI assistant context
└── README.md
```

### Naming conventions

- All doc and note filenames are **kebab-case** (`account-types.md`).
- Review rounds: `r{n}-review.md`; update plans: `r{n}-update-{target-doc}.md`.
- **Round numbers are global**: one round = one revision event, numbered sequentially by date, shared across all docs and changelog entries.
- Feature directories **and branches**: `NNN-feature-name` with sequential numbering. The 1:1 branch↔spec mapping is what lets the automation resolve context without configuration.

---

## 1. Discovery

**Goal:** turn an idea (Zero) into an agreed written definition of the product.
**Phase:** 1 — Planning. **Owner:** founder/product, with the AI agent as author-assistant.

### Process

1. **Initialize** — run `npx zero-two-one-init` in the new repository. This scaffolds the framework, provisions `.ai/context/` and `requirements/_design/tokens/`, installs the pre-commit gate, wires the lifecycle npm scripts, and checks Spec Kit prerequisites.
2. **Capture raw inputs** — dump interviews, market notes, competitor analysis, and domain research into `requirements/_notes/` as kebab-case files. Nothing here needs structure yet; it is the evidence base agents cite later.
3. **Draft the PRD** — fill `requirements/01-PRD.md` from `templates/01-PRD-Template.md`: problem statement, target personas (formalized under `workflow/_personas/`), modules, user scenarios, data model, information architecture, success metrics.
4. **Draft the TDD** — use `skills/generate-tdd.md` to derive `requirements/02-TDD.md` from the PRD: architecture decisions, service responsibilities, validation rules, locked decisions.
5. **Sequence the roadmap** — outline milestone-gated phases in `requirements/03-ROADMAP.md`; consolidate open pre-build work in `04-PROJECT-TRACKING.md`.
6. **Exit** — the agent records the transition to Phase 2 in memory and updates `CLAUDE.md`/`README.md` with project specifics.

### Agent & automation touchpoints

- The agent reads `CLAUDE.md` + memory at session start to confirm the phase (verify with `npm run status`).
- `npm run qa` in Phase 1 validates that the core documents exist and are non-empty.
- The agent drafts documents; the human decides. Every locked decision goes into TDD §"locked decisions" so later agents don't relitigate it.

**Exit gate:** PRD, TDD, and Roadmap complete; `workflow-status` reports readiness for Phase 2.

---

## 2. Design

**Goal:** make the written definition visible — a design system and a static prototype that stakeholders can react to.
**Phase:** 2 — Pre-build. **Owner:** design, with the agent building the prototype.

### Process

1. **Design system** — establish UI guidelines and shared style foundations in `requirements/_design/`. How design values are sourced and synchronized (e.g. from a design tool) is managed outside this framework — record the chosen approach in the TDD.
2. **Prototype** — build a static HTML/CSS/JS prototype in `prototype/` that applies the design system consistently (no ad-hoc style values). The prototype is not Speckit-managed; it is maintained by the agent directly from the PRD + TDD so it always reflects the current documents.
3. **Design assets** — mocks, icons, and imagery land in `requirements/_design/`.

### Agent & automation touchpoints

- `npm run qa` in Phase 2 validates prototype assets exist.
- The agent regenerates prototype screens after each refinement round so review always happens against current state.

**Exit gate:** stakeholders can review every core scenario in the prototype.

---

## 3. Refinement

**Goal:** converge the documents and prototype on the desired fidelity through structured review rounds. This is the project-level change-control loop — used heavily in Phase 2 and again in Phase 4 for user feedback and analytics.

### The loop

```
Prototype review & UX design (or user feedback / analytics in Phase 4)
↓
requirements/_refinement/r{n}-review.md          ← raw feedback, one file per round
↓
requirements/_notes/*.md                          ← domain research as questions arise
↓
requirements/_refinement/r{n}-update-{doc}.md     ← synthesized change plan per affected doc
↓
requirements/01-PRD.md   (+ Changelog entry)      ← business logic applied first
↓
requirements/EDD.md      (+ Changelog entry)      ← UX strategy updated based on PRD
↓
requirements/02-TDD.md   (+ Changelog entry)      ← technical architecture updated based on PRD + EDD
↓
requirements/03-ROADMAP.md                        ← re-sequenced based on PRD + EDD + TDD
↓
requirements/04-PROJECT-TRACKING.md               ← updated based on PRD + EDD + TDD + Roadmap
↓
AI_CODING_GUIDELINES.md                           ← amended only if principles changed
↓
DESIGN.md / prototype/*                           ← design tokens & prototype updated
↓
next round
```

### Process, step by step

1. **Review** — create `r{n}-review.md` with the round's raw feedback (`templates/05-REVIEW-Template.md`). `{n}` is the next global round number.
2. **Research** — capture domain answers in `requirements/_notes/`.
3. **Synthesize** — the agent drafts `r{n}-update-{doc}.md` per affected document with a section-by-section change list. The human approves the plan **before** any document is edited.
4. **Apply & Cascade** — Apply updates in the exact dependency order, logging each in its respective changelog referencing round `r{n}`:
   - **PRD > EDD:** Update the PRD, then update the EDD to support the new business logic.
   - **PRD + EDD > TDD:** Update the TDD to architecturally support the new features and UX.
   - **Alignment Checks:** Perform bidirectional checks (`PRD <> TDD` and `PRD <> EDD`) to ensure no contradictory constraints were introduced.
   - **PRD + EDD + TDD > Roadmap:** Re-sequence the Roadmap based on the fully aligned requirements.
   - **PRD + EDD + TDD + Roadmap > Project Tracking:** Update the project backlog and tracking documents.
5. **Constraint check** — if principles changed, amend `AI_CODING_GUIDELINES.md`.
6. **Design & prototype** — update `DESIGN.md` tokens, assets, and prototype to reflect the applied changes.
7. **Commit** — all affected docs together in a single commit (`hooks/pre-commit` reminds when `specs/` changes may need requirement alignment).

### Why the loop is shaped this way

Feedback is **quarantined** (`r{n}-review.md`) before it is **planned** (`r{n}-update-{doc}.md`) before it is **applied**. Each stage is a reviewable artifact, so an agent can execute steps 3–6 autonomously while the human only gates the synthesis. Global round numbers keep changelogs and refinement files lined up, which is what lets a later agent reconstruct *why* any requirement changed.

**Exit gate (Phase 2 → 3):** a review round produces no material changes; architecture is locked in the TDD; roadmap milestones are gated. The agent records Phase 3 in memory.

---

## 4. Speckit Implementation

**Goal:** deliver roadmap features through GitHub Spec Kit, with the refinement gate ensuring no code is written against an unapproved spec.
**Phase:** 3 — MVP Build (and Phase 4 enhancements). **Owner:** the AI agent, gated by human approval.

### 4.1 Specification pipeline (per feature)

```
/speckit-specify     natural-language description → specs/NNN-feature-name/spec.md   [status: Draft]
       ↓
/speckit-clarify     resolve underspecified areas (max 3 rounds)                     [status: In Review]
       ↓
/speckit-plan        plan.md + research.md + data-model.md + contracts/
       ↓
/speckit-tasks       dependency-ordered tasks.md
       ↓
  HUMAN SIGN-OFF     npm run spec:status -- set NNN Approved        ← THE GATE OPENS HERE
       ↓
/speckit-implement   execute tasks.md                               [status: In Progress]
       ↓
  QA + review        npm run spec:verify                            [status: Done]
```

Optional: `/speckit-checklist`, `/speckit-analyze` (cross-artifact audit), `/speckit-taskstoissues`. Git automation commands (`/speckit-git-feature` etc.) handle sequential `NNN-feature-name` branch creation and phase auto-commits.

### 4.2 The spec status lifecycle

Every `spec.md` declares a status — YAML frontmatter (`status: Approved`) or an inline `**Status**: Approved` line:

| Status | Meaning | Implementation allowed? |
|---|---|---|
| `Draft` | Written, not reviewed | ⛔ |
| `In Review` | Under clarification/stakeholder review | ⛔ |
| `Approved` | Signed off against PRD/TDD | ✅ |
| `Ready for Dev` | Approved + planned + tasked | ✅ |
| `In Progress` | Implementation underway | ✅ |
| `Done` | All tasks complete, QA passed | ✅ |

Manage it with `npm run spec:status -- list | get | set <spec> <status>`. **Only a human decision moves a spec to `Approved`/`Ready for Dev`** — the agent may request the transition, never assume it.

### 4.3 The refinement gate (enforced)

`hooks/pre-commit` (installed into `.git/hooks` by init) blocks any commit of implementation files on an `NNN-feature-name` branch unless `scripts/speckit/verify-spec-compliance.js --gate` passes — i.e. the matching spec exists and its status is gate-passing. Documentation, spec, design, and tooling paths are exempt: **the gate blocks code, not refinement**. Emergency bypass: `ZTO_SKIP_GATE=1 git commit ...`.

### 4.4 Implementation loop (agent-executed)

1. `npm run spec:context` — generate `.ai/context/NNN-feature-name.md` (single-read markdown bundle) and `.json` (status, gate state, acceptance criteria, entities, task progress). The agent loads the bundle instead of re-reading eight files.
2. If `gate.passing` is `false` — stop and request approval.
3. Work through `tasks.md` in dependency order, checking off tasks as they complete; use `skills/generate-frontend-component.md` for UI work (spec + design system + existing patterns).
4. `npm run spec:verify` after each meaningful unit — fix `FAIL` findings immediately; a stale-context `WARN` means re-run step 1.
5. Commit per task group; the pre-commit gate re-validates automatically.

**Exit gate (per feature):** `spec:verify` fully compliant, all tasks checked, status set to `Done`.

---

## 5. QA

**Goal:** phase-appropriate verification, automated wherever possible.

### Process

`npm run qa` (`scripts/run-qa.sh`) detects the phase via `workflow-status.js` and runs the matching tier:

| Phase | Checks |
|---|---|
| 1 — Planning | Core documents exist and are structurally valid |
| 2 — Pre-build | Prototype assets present (HTML/CSS/JS in `prototype/`) |
| 3/4 — Build/Growth | `npm test` (unit), accessibility checks (wire pa11y-ci/axe here), spec compliance (specs exist for the code being shipped) |

On top of the phase tier, per-feature QA in Phase 3/4:

1. **Automated compliance** — `npm run spec:verify` (artifact completeness, no `[NEEDS CLARIFICATION]`, task truthfulness, context freshness).
2. **Semantic compliance** — the agent runs `skills/verify-spec-compliance.md`: every acceptance criterion maps to observable behavior and a test; components match `data-model.md` and `contracts/`; styling follows the design system in `requirements/_design/`.
3. **Framework compliance** — `skills/check-framework-compliance.md` before merging: spec-driven, lean architecture, artifact integrity, modularity.
4. **Human review** — PR review on the feature branch; CI should run `npm run qa && npm run spec:verify` (add this to the consuming repo's CI once a stack is chosen).

**Exit gate:** QA suite green, compliance report clean, PR approved.

---

## 6. Release

**Goal:** ship deliberately and capture what the release teaches.

### Process

1. **Pre-flight** — on the feature branch: `npm run spec:verify` compliant; `npm run qa` green; spec status `Done`; changelog entries present for any project-doc changes that rode along.
2. **Merge** — feature branch → `main` via PR. A feature branch contains only that feature's Spec Kit artifacts and implementation; project-level docs change on `main` via refinement rounds.
3. **Tag & deploy** — tag `vX.Y.Z`; deploy per the consuming project's pipeline (out of framework scope by design — the framework is stack-agnostic).
4. **Record** — update `requirements/03-ROADMAP.md` milestone state and `04-PROJECT-TRACKING.md`; the agent records progress (and, at MVP launch, the Phase 3 → 4 transition) in memory.
5. **Learn** — user feedback and analytics enter the system as new refinement rounds (`r{n}-review.md`), closing the loop back to §3.

### Agent & automation touchpoints

- The agent assembles the release summary from spec artifacts and changelogs (they are the record — no reconstruction from commit messages).
- Post-release, the agent monitors `04-PROJECT-TRACKING.md` and proposes the next feature spec from the roadmap.

---

## 7. Gates summary

| # | Gate | Enforced by | Blocks |
|---|---|---|---|
| G1 | Docs complete before Pre-build | `run-qa.sh` (Phase 1 tier) | Phase transition |
| G2 | Spec validation (testable, ≤3 `[NEEDS CLARIFICATION]`) | Spec Kit templates + `/speckit-clarify` | Spec approval |
| G3 | Constitution Check (before research, after design) | Spec Kit plan workflow + `AI_CODING_GUIDELINES.md` | Planning |
| G4 | **Refinement gate: spec `Approved`/`Ready for Dev` before implementation** | `hooks/pre-commit` → `verify-spec-compliance.js --gate` | Commits of implementation code |
| G5 | Compliance audit before `Done` | `spec:verify` + `verify-spec-compliance.md` skill | Feature completion |
| G6 | Phase-tier QA before merge | `run-qa.sh` + PR review | Release |

Any constitution violation must be documented in the plan's Complexity Tracking table with explicit rationale — violations are visible decisions, never silent.

---

## 8. Command reference

| Command | Purpose |
|---|---|
| `npx zero-two-one-init [dir]` | Scaffold the framework into a repository |
| `npm run status` | Detect and print the current lifecycle phase |
| `npm run qa` | Phase-appropriate QA suite |
| `npm run spec:status -- list` | All specs with status and gate state |
| `npm run spec:status -- set <spec> <status>` | Advance a spec's lifecycle |
| `npm run spec:context` | Generate `.ai/context/` bundles for the active feature |
| `npm run spec:verify` | Full spec compliance audit (`--gate` for the fast subset, `--json` for agents) |

Agent-facing tool schemas for `fetch_speckit_context`, `verify_spec_compliance`, and `set_spec_status` live in `skills/tools.json`.
