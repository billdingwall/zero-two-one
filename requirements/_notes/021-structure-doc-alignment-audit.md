# Audit: 021-structure-proposal.md vs the Key Docs & Guiding Files

*What to weigh before adopting the proposed structure in [021-structure-proposal.md](021-structure-proposal.md). This audit compares the proposal against the **content of the living docs** — PRD, EDD, TDD, 04-BACKLOG, 05-ROADMAP — and the **guiding files** — CLAUDE.md, PRODUCT.md, CODE.md, DESIGN.md, README.md. It is distinct from the earlier cross-functional review (since folded into the proposal), which compared the proposal against the on-disk file tree. Here the question is narrower: **where does the proposal contradict what the docs currently assert, and what would have to change to make them agree?***

*Read as input to r6, not as decisions. Nothing below is applied.*

---

## TL;DR — the two real blockers

Everything in the proposal is either (a) already aligned, (b) a mechanical rename with a known blast radius, or (c) net-new design. Only two items are true **decision blockers** — they change the meaning of the framework and ripple through every doc:

1. **4 phases → 3 phases.** Contradicts every doc (all five key docs + all guiding files name four phases) *and* a code path (`workflow-status.js`) *and* the manifest schema. Also collides with an **existing inconsistency**: the PRD calls phase 1 **"Idea"**, while PRODUCT/README/proposal call it **"Planning."**
2. **04/05 swap (Roadmap↔Backlog).** Contradicts every path reference in every doc, the templates, and the release files. Purely mechanical, but the blast radius is the whole corpus.

Resolve those two first; the rest is downstream.

---

## 1. Decision blocker: 4 phases → 3

DECISION: Keep shift to 3 phases

**Proposal (§7):** collapse to Planning · MVP · Growth; merge Pre-build into Planning; manifest enum becomes `{ planning, mvp, growth }`; preserve the Pre-build exit gate as a "sign-off milestone" inside Planning.

**What the docs say today — all four phases, everywhere:**

| Source | States |
|---|---|
| PRD §2 | "structured, **4-phase** lifecycle (**Idea** → Pre-build → MVP → Growth)" |
| CLAUDE.md | "## **4-Phase** Project Lifecycle" |
| README.md | "runs a **4-phase** lifecycle"; table rows 1 Planning (Zero) · 2 Pre-build · 3 MVP · 4 Growth |
| PRODUCT.md | four numbered phases: 1 Planning (Zero) · 2 Pre-build (Refinement) · 3 MVP Build (One) · 4 Growth |
| EDD §2 | stage-aware reviews name four stages: **Idea / Pre-build / MVP / Growth** |
| TDD §7 | manifest `phase: planning \| prebuild \| mvp \| growth` |
| TDD §8 | heuristics: "otherwise **Planning/Pre-build**" |
| `workflow-status.js` | phase map keys `planning, prebuild, mvp, growth` |
| `templates/reviews/` | `06-REVIEW-{idea,prebuild,mvp,growth}-Template.md` (four templates) |

**Consider before moving:**
- **This is a migration, not an edit.** Merging Pre-build touches: the PRD vision sentence, CLAUDE.md heading, README lifecycle table, PRODUCT.md checklist (renumbers phases 2/3/4), EDD stage-aware review list, the manifest enum + `workflow-status.js` phase map, TDD §8 heuristics, and the four review templates (→ three). Miss any one and `021-status`/the docs disagree again — which is *exactly the drift r5 just fixed*.
- **The dogfood manifest is currently `phase: prebuild`** — an enum value that ceases to exist. The repo's own state must migrate to `planning` (or `mvp`) the moment the enum changes, or `021-status` breaks on this very repo.
- **The Pre-build exit gate is the framework's only pre-code quality gate.** The proposal keeps it as a named milestone — good — but every doc currently treats "Pre-build" as a *phase*, not a *milestone inside Planning*. The gate's home, name, and trigger all need re-anchoring (EDD §3 defines it around the CLI/DX experience; that reference must move with it).
- **Pre-existing naming split to resolve while you're in here:** PRD says **"Idea"**; PRODUCT/README/proposal say **"Planning."** The docs already disagree. The merge is the natural moment to pick one name — but that means the PRD changes too, not just the workflow docs.
- **Timing:** mvp-3 (next build release) hard-codes the manifest schema and phase inference in `bin/init.js`. If phases collapse *after* mvp-3 ships, you migrate the engine twice. **Lock the phase model before mvp-3 writes the manifest engine, or accept rework.**

---

## 2. Decision blocker: 04-BACKLOG / 05-ROADMAP swap

DECISION: accept proposal. use 04-BACKLOG and 05-ROADMAP. Update in proposal

**Proposal (§1):** Backlog = `04`, Roadmap = `05`, justified as "backlog feeds roadmap."

**What the docs say today — the opposite, everywhere:** `04-ROADMAP.md`, `05-BACKLOG.md` are referenced by path in PRD (via TDD refs), TDD §2 ("`04-ROADMAP.md` keeps per-release summaries"), TDD §8 ("scaffolds `04-ROADMAP.md`/`05-BACKLOG.md`"), TDD §5 template mapping (`0N-*-Template.md → requirements/0N-*.md`), PRODUCT.md step 1.4, README (fill-in list + tree), the templates (`04-ROADMAP-Template.md`, `05-BACKLOG-Template.md`), and both release-file conventions.

**Consider before moving:**
- **Pure churn, whole-corpus reach.** No behavior changes; every path string does. This is the single most mechanical change and the single most widespread — a find-and-replace that, if partial, leaves dangling links across the doc set and breaks `init.js`'s template→install mapping.
- **The justification is real but weak.** "Backlog feeds roadmap" is defensible, but the current numbering (Roadmap 04, Backlog 05) has three refinement rounds and all templates behind it. The audit's earlier verdict was "reject unless justified." Decide explicitly: is the ordering worth rewriting every reference?
- **Recommendation:** if you keep the swap, do it as its own atomic commit *with* the template renames and `init.js` mapping update, never piecemeal.

---

## 3. Net-new design (more than restructuring — these need authoring)

DECISION: make required updates to move forward with shift

These are presented as structure but introduce **behavior or artifacts that no current doc defines**. Each needs a home in the PRD/EDD/TDD before it's "structure," not just a bullet.

- **AGENTS.md "Wait rule" + persona routing + "check BACKLOG before code."** Today's CLAUDE.md has none of these — it's a minimal instructions file. CODE.md §4 already has "Ask for Clarification: halt if ambiguous," which **overlaps** the Wait rule; authoring both without dedup creates two half-rules. Decide where the Wait rule lives (AGENTS/CLAUDE vs CODE) and reconcile.
- **AGENTS.md as "the primary context engine."** Partially conflicts with the stack model. Per PRD F7 / TDD §9.2, `AGENTS.md` is the **neutral/antigravity** rendering; the **`claude` stack loads `CLAUDE.md`**, kiro loads `.kiro/steering/021-*`. The proposal's inline bullet (line 53) reads as if AGENTS.md is universally the entrypoint; its own NOTE (line 54) corrects this. Make the structure text say *source-layer neutral default → stack-rendered runtime file*, matching TDD §9.1, so it doesn't contradict the adapter architecture.
- **"Workflow manager" hook (post-commit state-sync).** No current component. TDD §1 enumerates exactly **four** technical components; this adds a fifth that auto-edits tracked docs (manifest phase, backlog/roadmap status). Needs: a TDD section, a zero-dependency story, and a rule that it never auto-commits or fights the refinement gate. The proposal itself lists this as an open decision — keep it there.
- **`requirements/_architecture/` split from the TDD.** New directory for ADRs/diagrams. Risk: the PRD/EDD/TDD are declared **"one cohesive set"** and the TDD is defined (PRD F2, TDD §2/§3) as holding data structures and engineering principles. Hollowing architecture out of the TDD needs a stated boundary (TDD = decisions + summary; `_architecture/` = detail/ADRs) and updates to CLAUDE.md's "Documentation Structure" list (which today names `_refinement`, `_notes`, `_design` — not `_architecture`).
- **Backlog as a table with an `ownership` column.** Current 05-BACKLOG.md is release-grouped checklists; there is **no ownership concept anywhere** in the framework today. Adding it is a new data field (who owns items?) plus a reformat plus a `05-BACKLOG-Template.md` change plus a `backlog-sync` output-format change.
- **Roadmap as a table with `priority` + `dependency` columns.** Current 04-ROADMAP.md is prose sections (summary + link to `_releases/`), using "engineering-dependency order" as narrative, not explicit fields. A table with explicit priority/dependency is a new shape; reconcile with the "table is a view over canonical `_releases/`" rule so the columns don't become a second source of truth.

---

## 4. Omissions — workflows the docs rely on that the proposal drops

DECISION: add these workflows as part of proposal

The proposal's Workflows section (§3) lists lifecycle/refinement/delivery workflows but **omits several that the key docs actively link to**. All exist today and are referenced:

| Missing from proposal | Referenced by |
|---|---|
| `init-and-migration.md` | CLAUDE.md, EDD (init), TDD §1/§8, README |
| `design-system-selection.md` | EDD §"Installing a Design System", TDD §9.4/§11, PRD F7 |
| `key-docs-to-ssd.md`, `review-to-ssd.md` | the SSD entry paths (roadmap-delivery) |
| `key-docs-to-prototype.md` | EDD prototype workflow, TDD §12 (may be the proposal's `prototype-sync.md` — confirm rename vs drop) |

If these are being **renamed/subsumed** (e.g. `key-docs-to-prototype` → `prototype-sync`), the proposal should say so and every inbound doc link must move with the rename. If they're being **dropped**, that deletes documented, doc-referenced behavior — call it out explicitly. Right now they're just absent.

---

## 5. Mechanical renames — safe, but update the inbound links

DECISION: move forward with proposal and outline required file updates as need

These are low-risk *if* done atomically with their references:

- **Skills:** `generate-tasks.md` → `generate-backlog.md` is clean — the skill already emits an Epic/Task breakdown, not per-feature SSD `tasks.md` (that stays Spec Kit's job), so **no functional loss**. Add `generate-prd.md` / `generate-edd.md` (additive, matches the cohesive-set principle). Update `command-design.md` and `skills/_INDEX.md`, which name `generate-tasks` today.
- **Workflow file renames** (`phase0-to-phase1` → `planning-to-mvp`, decomposition of `refinement-loop` into `*-sync`): each rename breaks links in PRD/EDD/TDD/PRODUCT/CLAUDE/README. Grep-and-fix inbound links per rename.
- **`/021-init` "Shipped" label (proposal §6):** optimistic — only the command file + `npx` scaffold exist; the **AI-led walkthrough is mvp-4** (PRD F1, TDD §1). Mark it "partial: engine mvp-3, walkthrough mvp-4" to match the roadmap.

---

## 6. Already aligned (no action)

Worth stating so these don't get re-litigated: the proposal correctly preserves the **deterministic pre-commit refinement gate** (PRD F3, EDD §2, TDD §1/§9.3), the **`.zero-two-one.json` manifest as state source of truth** (PRD F6, TDD §7), **`_releases/` as canonical** (TDD §2), **optional prototype via `021-prototype`** (PRD F9, EDD, TDD §12, CODE.md §1), the **`021-` naming convention** (CODE.md §2, TDD §6), the **package/ dogfooding boundary** (TDD §3/§5), and the **command surface** (EDD §3). These match the docs as-written.

---

## 7. Recommended sequencing for r6

DECISION: add recommended phasing to proposal

1. **Decide the phase model first (blocker 1).** It gates the manifest schema and `init.js`, which mvp-3 builds next. Settle 3-vs-4 and the Idea-vs-Planning name before mvp-3 writes the engine, or budget for a second migration.
2. **Decide the 04/05 swap (blocker 2)** as a yes/no; if yes, one atomic rename commit across docs + templates + `init.js` mapping.
3. **Triage §3 net-new items** into "author now (needs PRD/EDD/TDD text)" vs "defer" — don't let them ride in as if they were restructuring. The Workflow-manager and _architecture split are the two most likely to warrant deferral.
4. **Resolve §4 omissions** — mark each dropped/renamed workflow explicitly; no silent disappearances.
5. **Only then** apply §5 mechanical renames, links included.

**Cheapest-time note:** the repo is at Pre-build with no MVP code yet. A structural overhaul is *cheapest now* — but the same fact means mvp-3's engine will bake in whatever schema/naming exists when it's built. That is the real reason to front-load blockers 1 and 2 into r6 rather than let them trail the build.

*Next step: fold blockers 1–2 and the §3 triage into `r6-review.md`.*
