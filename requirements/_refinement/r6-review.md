# Refinement Review Round: r6 — Pre-build Stage

## Review Meta Data
- **Date:** 2026-07-15
- **Status:** Applied (2026-07-15) — approved and cascaded (RLP steps 3–6)
- **Round:** 6
- **Reviewer:** William Dingwall (billdingwall)
- **Lifecycle Phase:** Pre-build (Phase 2) — one more Pre-build round before MVP Build
- **Source:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) + [_notes/021-structure-doc-alignment-audit.md](../_notes/021-structure-doc-alignment-audit.md) (decisions locked in proposal §8.1)
- **Primary references (read in full before drafting update plans):**
  - [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) — the target structure in full; §8.2 is the migration surface, §8.3 the adoption phasing.
  - [_notes/021-structure-doc-alignment-audit.md](../_notes/021-structure-doc-alignment-audit.md) — the conflict analysis vs the living docs, with the recorded DECISIONs per section.
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md) · [README](../../README.md)

## Review Focus: Structural Overhaul Before MVP Build

*A structural round. The proposed target structure ([021-structure-proposal.md](../_notes/021-structure-proposal.md)) was audited against the living docs and guiding files ([alignment audit](../_notes/021-structure-doc-alignment-audit.md)); the decisions below are **locked** (proposal §8.1) and now need to cascade into the living docs. The driver is timing: **mvp-3 (next release) bakes the phase schema and doc-numbering into `bin/init.js`** — so these structural decisions must land in the docs before the engine is built, or the framework migrates twice (proposal §8.3).*

Round scope, per the RLP change-control loop:
- **Key-doc refinement**: propagate the 3-phase model, the 04/05 numbering swap, and the guiding-file/workflow re-framing through PRD/EDD/TDD/Roadmap/Backlog so nothing contradicts the new structure.
- **Roadmap definition**: confirm the MVP releases still sequence correctly under the new structure; add the structural migration itself where it needs a release home.
- **Prototype review**: N/A — no prototype has been added to this repo (optional since r5).

## Project Updates

*The locked decisions (proposal §8.1) and their migration surface (§8.2), grouped by change. Each becomes a per-doc update plan in step 2 (synthesize) — human-approved before any living doc is edited.*

### 1. Lifecycle: 4 phases → 3 (Planning · MVP · Growth)

- Merge **Pre-build into Planning**; the Pre-build **exit gate is preserved as a named "sign-off milestone" inside Planning** (every core scenario stakeholder-reviewable + architecture locked in the TDD; definition from EDD §3 moves with it).
- **Phase-1 name resolved to "Planning"** — reconcile the PRD's legacy **"Idea"** wording to "Planning" (PRODUCT/README already say Planning).
- Manifest `phase` enum → `{ planning, mvp, growth }` (drops `prebuild`); **the dogfood `.zero-two-one.json` migrates `phase: prebuild` → `planning`**; `workflow-status.js` phase map updated.
- Review templates `06-REVIEW-{idea,prebuild,mvp,growth}` → `{planning, mvp, growth}` (stage `idea` → `planning`).
- **Cascade targets:** PRD §2 (vision sentence: 4→3, Idea→Planning), EDD §2 (stage-aware review list), TDD §7/§8 (manifest enum + heuristics), PRODUCT.md (phase checklist renumber/merge), CLAUDE.md ("4-Phase" heading + Context), README (lifecycle table + count), `workflow/specific-workflows/product-lifecycle.md`, `scripts/workflow-status.js`, `templates/reviews/`.

### 2. Numbering: 04-BACKLOG / 05-ROADMAP swap

- Backlog = `04`, Roadmap = `05` (backlog is the input, roadmap the output). One **atomic** whole-corpus rename.
- **Cascade targets:** rename `04-ROADMAP.md`↔`05-BACKLOG.md` + their templates; fix every path reference (TDD §2/§5/§8, PRODUCT.md, README fill-in list + tree, `_releases/` conventions, PRD refs); update `bin/init.js` template→install mapping (built in mvp-3 — must reflect the new numbering).

### 3. Table-format key docs

- **04-BACKLOG** becomes a table (description · status · **ownership** · release); **05-ROADMAP** becomes a table (description · status · **priority** · **dependency** · phase), as a summary **view** over canonical `_releases/` (never a second source of truth).
- `ownership`, `priority`, `dependency` are **net-new fields** — update `04-BACKLOG-Template.md` / `05-ROADMAP-Template.md` and the `backlog-sync` / `roadmap-sync` output formats.

### 4. Guiding files as AI roles/lenses + assistant entrypoint

- Reframe `PRODUCT.md` / `DESIGN.md` / `CODE.md` as **role lenses** (PM / Designer / Lead Engineer), distinct from `workflow/_personas/` (user/stakeholder/contributor persona docs).
- **Assistant entrypoint:** `AGENTS.md` (from `templates/ASSISTANT-Template.md`) is the **tool-neutral source**; it renders per stack at init (`CLAUDE.md` for `claude`, `AGENTS.md` for `antigravity`, `.kiro/steering/021-*` for `kiro`) — the *rendered* file is the runtime entrypoint (aligns TDD §9.1/§9.2).
- **"Wait" rule** lives in the entrypoint; **CODE.md §4 "Ask for Clarification" defers to it** (dedup — one rule, two references).
- Entrypoint's "Documentation Structure" list gains `_architecture/`.

### 5. Workflows: two-level layout, sync decomposition, retained files

- Keep `workflow/workflows.md` (index) + `specific-workflows/` (detail) + `_personas/`.
- Decompose `refinement-loop.md` into named syncs (`review-sync`, `requirements-sync`, `guidance-sync`, `prototype-sync`, `backlog-sync`, `release-sync`, `roadmap-sync`).
- Rename `phase0-to-phase1` → `planning-to-mvp`; add `release-launch.md`.
- **Retain (do not drop)** the workflows the earlier draft omitted: `init-and-migration`, `design-system-selection`, `key-docs-to-ssd`, `review-to-ssd`, `key-docs-to-prototype` (initial generation; distinct from `prototype-sync`).
- Fix inbound links in PRD/EDD/TDD/PRODUCT/entrypoint/README per rename.

### 6. New artifacts needing an authored home (net-new — author before build)

- **`requirements/_architecture/`** — ADRs/diagrams/expanded data models that back the TDD. **Boundary:** TDD keeps decisions + summary; `_architecture/` holds supporting detail. Author the boundary in the TDD.
- **Workflow-manager** — a **fifth** TDD §1 technical component: post-commit/assistant-side state-sync that keeps manifest `phase` + backlog/roadmap/release status aligned. **Guardrails:** advisory/corrective, never in the blocking commit path, **never auto-commits**, zero-dependency. Needs a TDD section before mvp-3/mvp-4 build it.
- **Advisory doc-sync** (non-blocking BACKLOG-vs-work drift check) — assistant-side or CI, never the commit gate.

### 7. Skills: one generator per key doc

- Rename `generate-tasks.md` → `generate-backlog.md` (already emits an epic/task breakdown → the `04-BACKLOG` table; per-feature SSD `tasks.md` stays Spec Kit's job — no functional loss).
- Add `generate-prd.md` / `generate-edd.md` (additive; matches the cohesive PRD/EDD/TDD set).
- Update `requirements/_design/command-design.md` + `skills/_INDEX.md` (which name `generate-tasks`).

### 8. Roadmap/backlog impact for the structural work itself

- The structural migration is largely **doc/tooling change, not feature code** — most lands via this refinement round, not SSD specs. But the pieces that touch `bin/init.js` (new numbering in the template→install mapping; `{planning,mvp,growth}` phase schema; Workflow-manager if built) must be **reflected in mvp-3/mvp-4 scope** so the engine is built against the new structure. Confirm whether the Workflow-manager is authored-now / built-later (recommend: author in this round, schedule build into an mvp release).

## Persona Feedback

*Stakeholder direction (William): proceed with the structural overhaul now, in Pre-build, while there is no MVP code to migrate. Accept the churn of the 04/05 swap and the 3-phase merge as a one-time cost paid before the build hardens the schema. Keep the deterministic refinement gate, the manifest as source of truth, and `_releases/` canonical (all already aligned, proposal §6 — do not re-litigate).*

## Open Questions for this round
- **Workflow-manager timing:** author the TDD component in r6 and schedule the build into a specific mvp release (which one?), or defer authoring entirely to Growth? (Recommend: author now, build later.)
- **`_architecture/` at MVP:** stand up the directory now (empty + `_INDEX.md`) with the TDD boundary, or defer creation until there's architecture detail to move? (Recommend: define the boundary now, create on first use.)
- **Priority/dependency fields:** are explicit roadmap columns wanted at MVP, or is the current engineering-dependency ordering (narrative) enough until Growth? (Decision affects `05-ROADMAP-Template.md` shape.)

---

*Next (RLP step 2 — Synthesize): on approval of this review, draft per-doc update plans `r6-update-{prd,edd,tdd,roadmap,backlog,workflows}.md` in dependency order (PRD > EDD > TDD > Roadmap > Backlog), then apply and cascade (step 3), constraint-check `CODE.md` (step 4), and commit (step 6). No living doc is edited until the update plans are approved.*
