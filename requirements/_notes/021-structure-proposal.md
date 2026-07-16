# Proposed Zero Two One Structure

*The proposed target structure for the framework, detailed in full. It folds in the decisions recorded in [021-structure-doc-alignment-audit.md](021-structure-doc-alignment-audit.md) (the key-doc/guiding-file alignment review) so it can serve as the working draft for a refinement round (r6). Where the proposal changes something that exists today, a **Δ today** note records the delta; §8 collects the required migration surface. Decisions from the audit are now **locked** here — this is no longer an open menu.*

**Headline changes vs today (decided):** 4 phases collapse to **3** (Planning · MVP · Growth); the Backlog/Roadmap numbering swaps to `04-BACKLOG`/`05-ROADMAP`; the refinement loop is decomposed into named `*-sync` workflows; guiding files are framed as **AI roles/lenses**; `AGENTS.md` is the tool-neutral **source** for the assistant entrypoint, rendered per stack at init. Reconciled so r4/r5 decisions survive: the `.zero-two-one.json` manifest stays the state source of truth, the deterministic pre-commit refinement gate stays the blocking check, and `_releases/` files stay canonical for release detail.

---

## 1. Requirements structure

### Requirements docs (the "key docs")

The five living documents that define the product. They are a **cohesive set** — cross-checked against each other every refinement round.

* **requirements/01-PRD.md** — the *what* and the *why*. Overarching product direction: frames the vision, the problem, the proposed solution and the opportunity it enables; defines target audiences, audience goals, the features required to enable those goals, stakeholder management, go-to-market strategy, customer-feedback strategy, and what success looks like.
* **requirements/02-EDD.md** — the *experience*. How the product direction translates into an easy-to-use, visually coherent product: user needs, user flows, information architecture, interaction principles, visual design, and UX patterns. ("EDD" = **Experience** Design Document.)
* **requirements/03-TDD.md** — the *build*. How the experience is implemented: dev-environment details, technology stack, data structures, engineering principles, security considerations, testing strategy, and publishing details. ("TDD" = **Technical** Design Document; there is no separate engineering-design artifact.)
* **requirements/04-BACKLOG.md** — the *work*, as a table (description · status · ownership · release). Everything completed, in progress, or open: team tasks, open decisions, feature ideas, enhancement requests, and bugs. It is the connective tissue between the requirements docs, prototype feedback, and product feedback and the tasks that make up releases.
* **requirements/05-ROADMAP.md** — the *releases*, as a table (description · status · priority · dependency · lifecycle phase). Functionality developed and previously delivered, grouped into releases and broken out by lifecycle phase (primarily MVP and Growth).

> **Numbering — decided (04/05 swapped).** Backlog is `04`, Roadmap is `05`: the **backlog is the input and the roadmap is the output** — tasks are captured in the backlog, then grouped into releases on the roadmap. The numbering follows the data flow (backlog → releases → roadmap). This is a whole-corpus rename (§8) — every path reference, template, and the `init.js` template→install mapping moves together, as one atomic change.
>
> **New table fields (Δ today).** `ownership` (backlog) and `priority` + `dependency` (roadmap) do not exist today — today's backlog is release-grouped checklists and today's roadmap is prose sections. Adding them changes `04-BACKLOG-Template.md` / `05-ROADMAP-Template.md` and the `backlog-sync` / `roadmap-sync` output formats (§8).
>
> **Roadmap ↔ releases (reconciled).** The roadmap table is a **summary view**. The canonical detail of each release lives in its `_releases/NNN.md` file (goal · scope · exit gate · delivered · changelog). The table's `priority`/`dependency` columns summarize the release files; they never become a second source of truth for release state.

### Requirements context

Supporting directories that feed and record the key docs.

* **requirements/_refinement/**\* — the refinement loop's working files. One `r{N}-review.md` per round capturing cross-functional feedback, plus per-doc update plans (`r{N}-update-prd.md`, `-update-edd.md`, `-update-tdd.md`, `-update-backlog.md`, `-update-roadmap.md`, `-update-workflows.md`) that translate the review into applied changes.
* **requirements/_releases/**\* — one file per roadmap release; **canonical** for release detail. MVP releases (`mvp-N.md`) are the delivery units of the MVP roadmap in engineering-dependency order; Growth releases (`v<major.minor>-<theme>.md`) tie to release branches and promote backlog items into specs. Each holds goal, scope checklist, exit gate, delivered summary, and changelog.
* **requirements/_design/**\* — design assets and design-reference docs: `command-design.md` (how npm scripts, assistant commands, skills, and scripts map together), `workflow-design.md` (how workflows and hooks read/write project files), `cli-walkthrough-demo.md` (stakeholder sign-off transcript), and `tokens/` (design-system token exports, created on demand by `/021-design`).
* **requirements/_architecture/**\* — *(new)* architecture diagrams, data-model references, and decision records (ADRs) that back the TDD. **Boundary (Δ today):** the TDD keeps the **decisions and their summary** (it stays one third of the cohesive PRD/EDD/TDD set); `_architecture/` holds the **supporting detail** — full diagrams, expanded data models, and ADR history — that would otherwise bloat the TDD. The TDD links into it. Adopting this updates the "Documentation Structure" list in the assistant entrypoint (today's `CLAUDE.md`), which names `_refinement`/`_notes`/`_design` but not `_architecture`.
* **requirements/_notes/**\* — unstructured research and background context: raw notes, drafts, and explorations (like this file) that inform the key docs but are not governed by the refinement loop.

Every directory carries an **`_INDEX.md`** manifest (the repo-wide convention) describing its contents; templates follow the **`NN-NAME-Template.md`** convention.

---

## 2. State & templates

* **.zero-two-one.json** — the machine-readable **state source of truth** (kept, per audit). Records the lifecycle `phase`, the tool stack (`stack`, `assistant`, `ssd`, `design`), the install `mode` (`source` for this repo, else the init target), and a full file-hash inventory used by Init v2 for safe, non-destructive upgrades. `021-status` reads `phase` from here first, inferring from repo state only if the manifest is absent. **Δ today:** the `phase` enum drops `prebuild` (see §7) — `{ planning, mvp, growth }`.
* **templates/**\* — the source templates init renders into a new project: key-doc templates (`01-PRD-Template.md` … `05-ROADMAP-Template.md`), guiding-file templates (`ASSISTANT`/`AGENTS`, `PRODUCT`, `DESIGN`, `CODE`, `README`), the review template (`06-REVIEW-Template.md`), persona templates (user / stakeholder / contributor), the release template (`10-RELEASE-Template.md`), and `reviews/` (phase-specific review templates — `{planning, mvp, growth}`, §7). Templates are the single origin for scaffolded files; user files are then create-if-missing.

---

## 3. Process structure

### Guiding files (AI roles / lenses)

These act as the "system prompts" for the repository — behavior and rules the assistant loads as context. They are **role lenses layered onto one assistant**, not separate agents, and are distinct from the *persona documents* in `workflow/_personas/` (which describe users/stakeholders/contributors). **Δ today:** the audit flagged calling these "personas" as a naming collision — renamed to **roles/lenses**.

* **README.md** — front-facing overview of the repository: what it is, how to get started, and the general structure.
* **The assistant entrypoint (`AGENTS.md` source → stack-rendered)** — the primary context engine and **master router**: describes the framework's structure, connects the pieces, and points to the other context files for detail. Defines the AI role lenses (PM, Designer, Lead Engineer) and the rules of engagement.
  * **Source vs runtime (aligns with TDD §9.1/§9.2).** `AGENTS.md` (from `templates/ASSISTANT-Template.md`) is the **tool-neutral source and default output name**. At init it renders to the file the assistant actually loads for the chosen stack: **`CLAUDE.md`** for `claude`, **`AGENTS.md`** for `antigravity`, **`.kiro/steering/021-*`** for `kiro`. The *rendered* file is the runtime entrypoint — `AGENTS.md` is not universally "the" entrypoint, it is the neutral source the adapter renders from.
  * **"Wait" rule.** Outline a proposed plan and get confirmation before executing complex multi-file changes. **Dedup (Δ today):** this is the router-level home of the halt-and-confirm behavior; `CODE.md` §4's existing "Ask for Clarification" becomes the code-specific instance that **defers to** this rule rather than restating it — one rule, referenced from two places.
* **PRODUCT.md** — the **PM lens**. Holds the current phase and manages process across requirements, releases, delivery, and launch: state management (how/when to update the BACKLOG), phase rules (e.g. rejecting complex features during MVP), and triage formatting for bugs and feedback.
* **DESIGN.md** — the **UX/UI lens** and design-system rulebook: component-library rules (e.g. utility classes over custom CSS), theme/token constraints (color, spacing, typography), and interaction principles (accessibility, loading states). Ensures generated UI aligns with the flows in `02-EDD.md`.
* **CODE.md** — the **Lead Engineer lens** and technical-constraints file: tech-stack guardrails, code style and linting standards (naming, typing strictness), testing requirements, and commit/PR formatting standards.

### Workflows

Two-level layout (**Δ today: keep the manifest-plus-detail shape**, not a flat directory): **`workflow/workflows.md`** is the index/manifest; the detail lives in **`workflow/specific-workflows/`**; **`workflow/_personas/`** holds the user/stakeholder/contributor persona documents. Each workflow doc states its steps and the files it reads and writes, and how it shifts across lifecycle phases.

**Top-level workflows**

* **product-lifecycle.md** — the overall project workflow and how execution changes across the three phases (Planning → MVP → Growth). The refinement-loop and roadmap-delivery workflows shift focus by phase: clarifying requirements (Planning), delivering the MVP (MVP), then prepping releases to grow the product (Growth).
  * **planning-to-mvp.md** — how the workflows shift at the Planning→MVP transition (the old 0→1), gated by the Planning sign-off milestone (§ lifecycle). **Δ today:** renamed from `phase0-to-phase1`.
  * **mvp-to-growth-transition.md** — how the workflows shift at the MVP→Growth transition (the old 1→2): MVP releases freeze as history, Growth releases activate, and backlog prioritization switches to user value.
* **init-and-migration.md** — *(retained; was omitted from the earlier draft)* the assistant-led init walkthrough over the `bin/init.js` engine: scaffold vs migrate, ownership rules, duplicate resolution (archive / update-to-fit / leave-alongside), stack/design detection. Referenced by the assistant entrypoint, EDD (init), TDD §1/§8, and README.
* **design-system-selection.md** — *(retained; was omitted)* the `021-design` flow over the §9.4 design adapter: select / assess / map tokens into `DESIGN.md` / cascade to `requirements/_design/tokens/` and the prototype. Referenced by EDD, TDD §9.4/§11, PRD F7.

**Refinement**

* **refinement-loop.md** — the loop that takes team feedback from `r{N}-review.md`, compares it to the key docs to generate per-doc update plans, and applies those changes. The loop shape is constant; what feedback updates (requirements → specs → backlog → releases) shifts by phase and by whether a prototype exists. Decomposed into named syncs:
  * **review-sync.md** — how review content is compared to the requirements docs to produce a per-doc update plan.
  * **requirements-sync.md** — how update plans are applied to their docs, then the updated docs cross-checked against each other for inconsistency and conflict.
  * **guidance-sync.md** — how the PRD/EDD/TDD are compared against the guiding files to see whether the guiding files need updating.
  * **prototype-sync.md** — how an **existing** prototype is kept in sync during refinement (refinement-loop step); distinct from initial generation, which is `key-docs-to-prototype.md`.
  * **backlog-sync.md** — how backlog items are created from the key docs and review rounds (emits the `04-BACKLOG` table rows).
  * **release-sync.md** — how releases are created from the backlog, and how that changes across Planning/MVP/Growth.
  * **roadmap-sync.md** — how releases are surfaced onto the roadmap (the summary view over `_releases/`), and how that changes across phases.

**Delivery**

* **roadmap-delivery.md** — how a roadmap release is picked up from the backlog, turned into a spec, driven through implementation, and launched.
  * **key-docs-to-ssd.md** — *(retained; was omitted)* how the key docs seed a feature's initial spec (the SSD entry path from requirements).
  * **review-to-ssd.md** — *(retained; was omitted)* how review findings feed into specs during delivery.
  * **key-docs-to-prototype.md** — *(retained; was omitted)* initial prototype **generation** from the key + guiding docs via `021-prototype` (TDD §12); its refinement-time counterpart is `prototype-sync.md` above.
  * **spec-driven-delivery.md** — the per-feature pipeline: specify → clarify → plan → task → **human approval** → implement → verify. Covers the refinement gate and the agent implementation loop (`021-spec:context` → execute `tasks.md` → `021-spec:verify`).
  * **release-launch.md** — *(new)* how a completed release is verified (QA green, spec compliance), published, and recorded — closing the release file's Delivered summary and updating roadmap/backlog state. **Δ today:** closest current coverage is the release-file exit gates plus `mvp-to-growth-transition.md`.

### Hooks

* **pre-commit** — the **refinement gate** (kept as the blocking check, per audit). A deterministic, offline, zero-dependency shell script: on an `NNN-feature-name` branch, implementation files cannot be committed unless the matching spec is `Approved`/`Ready for Dev`. It also warns on direct-to-`main` commits and nudges spec/doc alignment. Emergency bypass: `ZTO_SKIP_GATE=1`. **Δ today:** an earlier proposal replaced this with an AI script checking BACKLOG-vs-code — rejected, because it is nondeterministic and network-dependent inside the commit path and would silently drop the framework's flagship gate.
  * **Advisory doc-sync (optional, non-blocking).** The BACKLOG-vs-code alignment idea survives as an *advisory* layer — an assistant-side or CI check that warns when backlog/spec status and committed work drift, but never blocks the commit.
* **Workflow manager** — *(net-new; needs a TDD home before build — §8)* not a git gate but a **post-commit / assistant-side state-sync automation**: as commits land and phases change, it keeps the manifest `phase`, backlog/roadmap statuses, and release files in sync. **Guardrails (decided):** it runs *after* the fact, is advisory/corrective, **never sits in the blocking commit path, and never auto-commits** — it proposes or applies working-tree edits the user then commits. Zero-runtime-dependency constraint holds. It becomes a **fifth** technical component in TDD §1, which must be authored before mvp-3/mvp-4 build it.

### Scripts (mechanical layer)

`scripts/` (+ `bin/`), Node built-ins only, wired to npm scripts. The mechanical executors the LLM drives.

* **scripts/workflow-status.js** (`npm run 021-status`) — reports the lifecycle phase; reads `.zero-two-one.json` `phase` first, infers only if absent. **Δ today:** phase map drops `prebuild` (§7).
* **scripts/run-qa.sh** (`npm run 021-qa`) — phase-appropriate QA: docs validation (Planning), prototype checks, then tests / a11y / spec compliance (MVP+).
* **scripts/speckit/spec-status.js** (`npm run 021-spec:status -- list | set <spec> <status>`) — read/set the lifecycle status in `specs/NNN-*/spec.md`; the source of truth for the refinement gate.
* **scripts/speckit/fetch-speckit-context.js** (`npm run 021-spec:context`) — pull a feature's Spec Kit artifacts into AI-readable bundles under `.ai/context/`.
* **scripts/speckit/verify-spec-compliance.js** (`npm run 021-spec:verify`) — compliance audit (gate status, artifact completeness, unresolved clarifications, task truthfulness); `--gate` is the fast subset the pre-commit hook calls.
* **scripts/speckit/lib.js** — shared helpers: spec resolution from branch names, status conventions, gate rules.
* **scripts/sync-to-package.js** (`npm run sync:package`) — dev-only (source repo): sync framework files from root into `package/` for publishing.
* **bin/init.js** (`npx zero-two-one-init`) — the init engine (safe, non-destructive merge engine from mvp-3; legacy scaffold before that).

### Skills

`skills/` — AI prompts the assistant follows mid-task. **Δ today:** the doc-generation set expands to one generator per key doc.

* **generate-prd.md** — *(new)* draft a PRD from the EDD + TDD; if only one is available, use it; if a PRD draft exists, fill gaps from EDD + TDD.
* **generate-edd.md** — *(new)* draft an EDD from the PRD + TDD; if only the PRD exists, use it; if an EDD draft exists, fill gaps.
* **generate-tdd.md** — draft a TDD from the PRD + EDD; if only the PRD exists, use it; if a TDD draft exists, fill gaps.
* **generate-backlog.md** — *(renamed from `generate-tasks.md`)* generate a dependency-ordered Epic/Task breakdown from PRD + EDD + TDD, formatted as the `04-BACKLOG` table. The skill already emits an epic/task breakdown, so this is a rename + reformat, not a new capability; per-feature SSD `tasks.md` generation stays Spec Kit's job (no functional loss). Update `command-design.md` + `skills/_INDEX.md`, which name `generate-tasks` today.
* **generate-frontend-component.md** — scaffold UI components against an approved spec and `DESIGN.md` tokens.
* **fetch-speckit-context.md** — pull the active feature's Spec Kit artifacts into context before implementing.
* **verify-spec-compliance.md** — audit spec completeness and validate generated code against the spec.
* **check-framework-compliance.md** — diagnostic review of repo state against framework best practices.
* **tools.json** — Anthropic tool-use schemas mapping agent tool calls to the `scripts/speckit/` CLIs.

### Agents

There is no separate executable-agent layer. What plays the "agent" role:

* **skills/tools.json** — tool schemas (`fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status`) that let an agent runtime call the local CLIs.
* The **AI role lenses** (PM/Designer/Lead Engineer, § guiding files) — instructions layered onto one assistant, not distinct agents.
* **workflow/_personas/** — persona *documents* (users/stakeholders/contributors), inputs to discovery and review — not runnable agents.

---

## 4. Delivery structure

* **specs/**\* — one directory per feature (`specs/NNN-feature-name/`): `spec.md` (with its lifecycle status), plus `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `tasks.md` as the pipeline advances. The spec status is what the refinement gate reads.
* **.ai/context/**\* — generated, AI-readable context bundles per active feature (`NNN-feature-name.md` + a structured JSON artifact), assembled by `021-spec:context`. Gitignored; rebuilt on demand.
* **prototype/**\* — *(optional)* a static prototype generated from the key + guiding docs via `/021-prototype`, refined alongside the docs during Planning. Never a gate condition.

## 5. Distribution structure

* **package/**\* — the clean, publishable snapshot for NPM. Development happens in the root; `npm run sync:package` renders root → `package/`, preserving package-specific files (`package.json`, `.claude/`) and excluding dev-only content. This boundary lets the framework dogfood its own rules in the root while shipping a clean package.

---

## 6. User commands

The `021` surface — assistant slash commands over the mechanical scripts (assistant-side names are stack-rendered; the `claude` rendering is shown).

* **`/021-init`** — assistant walkthrough that runs the Init v2 engine (`npx zero-two-one-init`) and guides post-init setup. *Partial: command file + `npx` scaffold exist today; safe-install engine is mvp-3, the AI-led walkthrough is mvp-4* (PRD F1, TDD §1).
* **`/021-status`** — reports lifecycle phase, document completeness, spec-gate states, and recommended next steps. *Shipped.*
* **`/021-feedback`** — files a feedback issue to the framework repo (`gh` / pre-filled issue URL). *Planned mvp-5.*
* **`/021-design`** — design-system selection/install walkthrough over the design adapter. *Planned mvp-5.*
* **`/021-prototype`** — optional prototype generation from the key docs. *Planned mvp-5.*
* **Mechanical layer** — `npm run 021-status | 021-qa | 021-spec:status | 021-spec:context | 021-spec:verify` (manual inspection, QA, and explicit state changes). *Shipped.*

All assistant walkthroughs use the **ask-don't-assume** pattern (recommended option + alternatives + write-in).

---

## 7. Product lifecycle — three phases (decided)

**Decided: 4 phases (Planning · Pre-build · MVP · Growth) collapse to 3.** Pre-build merges into Planning; manifest `phase` enum becomes `{ planning, mvp, growth }`. This is a migration (surface in §8), not a rename.

**Phase-1 naming — resolved to "Planning."** The docs currently disagree: the PRD calls phase 1 **"Idea"** while PRODUCT/README call it **"Planning."** Canonical name is **Planning (Zero)**; the PRD's "Idea" wording is reconciled to "Planning" as part of the migration. The stage-aware review stage `idea` renames to `planning` (four review templates → three: `{planning, mvp, growth}`).

### 1. Planning (Zero — Planning & Refinement)
* **Initialize:** run `npx zero-two-one-init` in a new (or existing) repo.
* **Define vision:** fill `requirements/01-PRD.md` — problem, audience, scope, success metrics.
* **Experience design:** draft `requirements/02-EDD.md` (UX strategy, interaction architecture, states); establish UI guidelines in `DESIGN.md`.
* **Draft architecture:** complete `requirements/03-TDD.md` (technical decisions, data models); stabilize before build.
* **Prototype & iterate (optional):** build a static prototype to visualize the PRD; use the refinement loop (`requirements/_refinement/`) to gather feedback, update docs, and tweak the prototype.
* **Set roadmap:** outline initial milestones in `requirements/05-ROADMAP.md`.
* **Sign-off gate (preserved).** Before entering MVP Build, a named milestone must pass: **every core scenario is stakeholder-reviewable** (in the docs, or the prototype if one exists) and **the architecture is locked in the TDD**. **Δ today:** this is the old Pre-build exit gate — kept as an explicit milestone inside Planning so the merge doesn't delete the framework's main pre-build quality gate. Its definition (EDD §3, around the CLI/DX experience) moves here with it.
* **Update state:** record the transition to **MVP (One)** in the manifest and assistant memory.

### 2. MVP Build (One — MVP delivery)
* **Specify features:** write implementation-ready specs in `specs/NNN-feature-name/` (Spec Kit or manual).
* **Implement:** write code adhering to `CODE.md` to satisfy the specs, through the refinement gate.
* **Validate:** test against the PRD's success metrics; run `021-qa`.
* **Launch:** deploy the MVP (`release-launch.md`).
* **Update state:** record the transition to **Growth (Two)** in the manifest and assistant memory.

### 3. Growth (Two — Stabilize & Scale)
* **Gather feedback:** collect user analytics and `021-feedback` issues.
* **Refine:** re-enter the refinement loop to plan improvements from real-world usage.
* **Define releases:** group prioritized tasks, bugs, and enhancements from `requirements/04-BACKLOG.md` into release cycles on `requirements/05-ROADMAP.md`, each with a `_releases/` file and release branch.
* **Specify & build:** create new specs and implement iteratively to scale the product.

---

## 8. Decisions, required updates & adoption phasing

### 8.1 Decisions locked (from the alignment audit)

1. **3-phase lifecycle** — adopt (Pre-build merges into Planning; phase 1 = "Planning").
2. **04-BACKLOG / 05-ROADMAP swap** — accept.
3. **Net-new items** — proceed, with the required authoring below (Wait-rule dedup, AGENTS source/runtime framing, Workflow-manager guardrails, `_architecture` boundary, new backlog/roadmap table fields).
4. **Omitted workflows** — add them back (done in §3: `init-and-migration`, `design-system-selection`, `key-docs-to-ssd`, `review-to-ssd`, `key-docs-to-prototype`).
5. **Mechanical renames** — proceed, updating inbound links (below).

### 8.2 Required updates / migration surface

The concrete change-set adopting this proposal implies. Each group should land atomically with its references.

* **Phase model (3 phases + Idea→Planning):** PRD §2 vision sentence (4→3, "Idea"→"Planning"); assistant entrypoint heading ("4-Phase"→"3-Phase"); README lifecycle table + count; PRODUCT.md checklist (renumber phases, merge Pre-build into Planning); EDD §2 stage list (`idea`→`planning`, drop `prebuild`); TDD §7 manifest enum + §8 heuristics; `workflow-status.js` phase map; review templates `06-REVIEW-{idea,prebuild,mvp,growth}` → `{planning,mvp,growth}`; **the dogfood `.zero-two-one.json` migrates `phase: prebuild` → `planning`**.
* **04/05 swap:** rename `04-ROADMAP.md`↔`05-BACKLOG.md` and their templates; fix every path reference (PRD via TDD refs, TDD §2/§5/§8, PRODUCT.md, README fill-in list + tree, `_releases/` conventions); update `init.js` template→install mapping.
* **New table fields:** `04-BACKLOG-Template.md` gains `ownership`; `05-ROADMAP-Template.md` gains `priority`/`dependency`; `backlog-sync`/`roadmap-sync` output formats updated.
* **Net-new authoring homes:** Wait rule → assistant entrypoint (CODE.md §4 defers to it); Workflow-manager → new TDD §1 component + guardrails; `_architecture/` → TDD boundary statement + entrypoint "Documentation Structure" list.
* **Workflow adds/renames:** `phase0-to-phase1`→`planning-to-mvp`; `refinement-loop` decomposed into `*-sync`; new `release-launch.md`; re-home `key-docs-to-ssd`/`review-to-ssd`/`key-docs-to-prototype` under delivery. Fix inbound links in PRD/EDD/TDD/PRODUCT/entrypoint/README per rename.
* **Skill renames:** `generate-tasks`→`generate-backlog`; add `generate-prd`/`generate-edd`; update `command-design.md` + `skills/_INDEX.md`.

### 8.3 Recommended adoption phasing (for r6)

1. **Land the phase model first.** It gates the manifest schema and `init.js`, which **mvp-3 builds next** — settle 3-vs-4 and Idea-vs-Planning before the engine bakes them in, or budget a second migration. (Decided here; execute first.)
2. **Land the 04/05 swap** as one atomic rename commit across docs + templates + `init.js` mapping.
3. **Author the net-new items** that need PRD/EDD/TDD text (Workflow-manager component, `_architecture` boundary, Wait-rule dedup, new table fields) before any release depends on them.
4. **Apply the workflow adds/renames and skill renames**, links included.
5. **Wire the advisory doc-sync + Workflow-manager triggers** last — they're corrective, not blocking, so they can trail the structural changes.

**Cheapest-time note:** the repo is at Pre-build with no MVP code yet, so the overhaul is cheapest now — but the same fact means mvp-3's engine bakes in whatever schema/naming exists when built. That is why steps 1–2 front-load into r6 rather than trailing the build.

*Next step: fold §8 into `r6-review.md` and run the refinement loop.*
