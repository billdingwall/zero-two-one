---
status: Draft
feature: Migrate-Mode — Detection, Interview & Doc Import
release: mvp-3
branch: 002-migrate-mode
created: 2026-07-16
---

# Feature Spec: Migrate-Mode — Detection, Interview & Doc Import

*The second feature of [mvp-3 — Safe Install & Manifest](../../requirements/_releases/mvp-3.md), and the other half of Init v2. Where [spec 001](../001-safe-install-engine/spec.md) makes install **safe** on a fresh/partially-present repo, this feature makes it **smart** on an existing, non-empty project: it detects where the project already is (phase + stack), imports the docs it already has, and resolves duplicates without ever destroying the user's content. Grounded in [TDD §8 (Migrate-Mode Detection & Phase Interview)](../../requirements/03-TDD.md) and TDD §6 (existing-doc import + duplicate resolution).*

## Why

Running init on a real, populated repository is the adoption path that matters most — and the riskiest. A project already has a README, maybe a PRD-shaped doc, its own `.claude/` or `.kiro/` surface, and a lifecycle position (still planning vs. shipping vs. growing). A blind scaffold would either collide with all of that or bury it. Migrate-mode reads the existing project, proposes the right phase and stack, catalogs and cross-links the docs it finds, and offers a bounded set of choices for anything that duplicates a framework file — so a maintainer can adopt the framework on an in-flight project in one non-destructive pass.

## Users & Context

- **Primary user:** a developer adopting the framework on an **existing, non-empty** repository (has code, docs, and/or a tool surface already).
- **Secondary user:** CI / scripted adoption — the same flow driven entirely by flags (`--phase`, `--stack`, `--design`), no prompts.
- **Trigger:** `npx zero-two-one-init` on a target the engine classifies as **migrate** (pre-existing project content), rather than scaffold.
- **Builds on:** spec 001's classify → apply → manifest engine, ownership classes, and non-destructive invariant. This feature adds the detection, interview, import, and duplicate-resolution layers **in front of** that engine; it does not re-implement the merge.

## Clarifications

### Session 2026-07-16

- **Q: What triggers migrate-mode instead of scaffold (FR-001)?**
  A: **Any non-framework content.** If the target holds any file that isn't part of the framework surface (ignoring empty and `.git`-only dirs), it's migrate — erring toward the non-destructive flow whenever there's anything to protect.
- **Q: How is a "duplicate" detected (FR-007)?**
  A: **Exact framework-dest collisions only** — the user already has a file where the framework would write (`CLAUDE.md`, `README.md`, `requirements/01-PRD.md`). Deterministic and predictable. Broader role-matching of docs elsewhere (e.g. `docs/product.md → PRODUCT`) is **deferred to the AI-led reconcile sibling**.
- **Q: Non-interactive (CI, no TTY) behavior when a decision isn't resolved by a flag?**
  A: **Safe defaults, proceed.** leave-alongside for duplicates; the documented default stack (`claude`) when the stack is ambiguous/absent. CI never blocks; nothing is destroyed.
- **Q: What does deterministic "update-to-fit" do (FR-007)?**
  A: **Wrap.** Rewrite the file to the framework template's structure and embed the user's existing content verbatim in a clearly-marked "imported content" section — deterministic, content fully preserved, no AI.

### Session 2026-07-16 — round 2

- **Q: How does phase inference resolve conflicting signals (FR-002)?**
  A: **Strict growth, else mvp, else planning.** `growth` requires **all** of tests + CI + release history; failing that, substantial code ⇒ `mvp`; otherwise `planning`. The interview/`--phase` corrects a wrong guess.
- **Q: On leave-alongside for a doc the framework *needs* (e.g. `CLAUDE.md`), what happens to the framework's version?**
  A: **Install it namespaced.** For the guiding/router docs (`CLAUDE`/`CODE`/`PRODUCT`/`DESIGN`), keep the user's file at the dest and also write the framework template alongside as `<name>.zero-two-one.md`, cataloged. (Requirements docs and `README` leave = catalog only — no namespaced copy.)
- **Q: How does a re-run behave for import/archive decisions already made (FR-006/FR-011)?**
  A: **Manifest-driven skip.** Decisions in `manifest.migrate.duplicates` are not re-prompted or re-applied; `imported-docs.md` rows are keyed by path (no duplicates); archive skips if already archived. Fully idempotent.

### Session 2026-07-16 — round 3

- **Q: On a re-run (manifest already present), where do mode/phase/stack come from?**
  A: **Recorded manifest wins.** Detection runs only on the first (no-manifest) pass; thereafter mode/phase/stack are read from `.zero-two-one.json`, and recorded duplicate decisions are honored idempotently.
- **Q: During Spec Kit reuse, if a spec's status frontmatter is missing/invalid (FR-008)?**
  A: **Report & skip anyway.** Warn about the offending spec(s) and still skip re-scaffolding; never touch the user's spec files. The fix is left to the user / Workflow-Manager.
- **Q: What counts as "release history" for the strict growth signal (FR-002)?**
  A: **git tags only** — version tags in git history. `_releases/` and CHANGELOG do not, by themselves, count.

## User Scenarios (Acceptance)

1. **Detected migrate** — *Given* a repo with existing code and a `README.md` but no `.zero-two-one.json`, *when* the user runs init, *then* it engages migrate-mode (not scaffold) and reports what it detected before changing anything.
2. **Phase proposed & confirmed** — *Given* a repo with tests + CI + a release history, *when* migrate runs, *then* it proposes `growth`, and the user confirms (or overrides) — interactively, or non-interactively with `--phase`.
3. **Stack proposed from surfaces** — *Given* a repo containing `.kiro/`, *when* migrate runs, *then* it proposes the `kiro` stack; conflicting surfaces (e.g. both `.claude/` and `.kiro/`) list what was found and defer to the interview / `--stack`.
4. **Existing docs imported, not moved** — *Given* the user has their own `requirements/01-PRD.md` (an exact framework-dest collision), *when* migrate runs and the user picks **leave-alongside**, *then* it catalogs the file in `requirements/_notes/imported-docs.md` (path + description slot) and the guiding docs link to it; the original file is left byte-unchanged.
5. **Duplicate resolved by choice** — *Given* the user has a `README.md` that duplicates the framework README role, *when* migrate runs, *then* it offers **archive / update-to-fit / leave-alongside**, applies the chosen one, and records the decision in the manifest — never removing the user's content.
6. **Spec Kit reuse** — *Given* a repo already carrying `.specify/` or a populated `specs/`, *when* migrate runs, *then* it validates the existing spec frontmatter and **skips** duplicate Spec Kit setup rather than re-scaffolding it.
7. **Non-interactive adoption** — *Given* CI runs `init --phase mvp --stack claude --design none`, *when* there is no TTY, *then* migrate completes with zero prompts and zero user-file overwrites.
8. **Growth entry shape** — *Given* the confirmed phase is `growth`, *when* migrate completes, *then* `05-ROADMAP.md`/`04-BACKLOG.md` are scaffolded in **post-transition shape** (Releases section active, MVP section historical) per the transition workflow.

## Functional Requirements

- **FR-001 — Mode detection.** The engine classifies the target as **migrate** when it holds **any non-framework content** — any file outside the framework surface, ignoring empty and `.git`-only dirs — and no framework manifest; an empty or framework-only target stays **scaffold** (spec 001) *(clarified 2026-07-16)*. Detection runs only on the first pass; on a **re-run** (manifest present) mode/phase/stack are **read from the manifest**, not re-detected *(clarified 2026-07-16)*. The resolved mode is recorded in the manifest and reported before any change.
- **FR-002 — Phase heuristics.** Migrate infers a likely lifecycle phase with a **strict precedence** *(clarified 2026-07-16)*: `growth` requires **all** of tests + CI + release history (**git tags**, clarified); failing that, substantial code (but no framework key docs) ⇒ `mvp`; otherwise ⇒ `planning`. The inference and its evidence are surfaced, never silently applied.
- **FR-003 — Phase confirmation.** The inferred phase is confirmed via an interactive prompt (`node:readline`) when a TTY is present, or taken from `--phase <planning|mvp|growth>` non-interactively. The confirmed value is written to the manifest.
- **FR-004 — Stack detection.** Existing tool surfaces propose the stack: `.claude/` ⇒ `claude`; `.agents/` or `AGENTS.md` ⇒ `antigravity`; `.kiro/` ⇒ `kiro`; `.specify/` or a populated `specs/` confirms `github-speckit`. Conflicting surfaces list what was found and defer to the interview; `--stack` sets it non-interactively. When the stack is ambiguous or absent and no TTY/`--stack` resolves it, migrate uses the documented default `claude` and proceeds *(clarified 2026-07-16)*.
- **FR-005 — Design selection.** `--design <none|material-3|…>` is honored non-interactively; default `none`. (Design-system *installation* remains `021-design` / mvp-4 — this only records the choice.)
- **FR-006 — Existing-doc import.** When a duplicate is resolved as **leave-alongside**, the user's file is kept in place and **cataloged** into `requirements/_notes/imported-docs.md` (path + description slot), which the framework's guiding docs link to. Imported content is **referenced, never moved or rewritten** (TDD §6). *(Scope, clarified: import operates on exact-dest collisions — see FR-007; discovering equivalent docs elsewhere in the tree is the AI-reconcile sibling's job.)*
- **FR-007 — Duplicate resolution.** A **duplicate** is an **exact framework-dest collision** — the user already has a file where the framework would write (`CLAUDE.md`, `README.md`, `requirements/01-PRD.md`, …) *(clarified 2026-07-16)*. For each, migrate offers three choices — **archive** (move the user's file to `requirements/_notes/archive/` leaving a pointer, then instantiate the fresh template at the dest), **update-to-fit** (**wrap**: rewrite the dest to the framework template's structure with the user's existing content embedded verbatim in a marked "imported content" section), **leave-alongside** (keep the user's file; catalog it per FR-006; do not overwrite — and for the guiding/router docs `CLAUDE`/`CODE`/`PRODUCT`/`DESIGN`, also install the framework template alongside as `<name>.zero-two-one.md` so its content is still present *(clarified 2026-07-16)*; `README`/`requirements/*` leave = catalog only). The chosen action is applied and **recorded in the manifest**. Invariant: existing content is never removed — archive leaves a pointer, update embeds it verbatim, leave keeps it in place. Broader/fuzzy role-matching is out of scope (AI-reconcile sibling).
- **FR-008 — Spec Kit reuse.** When `.specify/` or a populated `specs/` is present, migrate validates the existing spec frontmatter (resolvable `status:`), reports it, and **skips** duplicate Spec Kit setup instead of re-scaffolding. A spec with missing/invalid frontmatter is **reported as a warning and skipped anyway** — migrate never modifies the user's spec files *(clarified 2026-07-16)*.
- **FR-009 — Growth entry.** When the confirmed phase is `growth`, migrate scaffolds `05-ROADMAP.md`/`04-BACKLOG.md` in **post-transition shape** (Releases section active, MVP section frozen as history) per [mvp-to-growth-transition.md](../../workflow/specific-workflows/mvp-to-growth-transition.md).
- **FR-010 — Non-destructive invariant.** Migrate never removes or overwrites existing content. Every write is additive, create-if-missing, an in-place structure-preserving update, or an archive-with-pointer. Inherits and must not weaken spec 001's user-owned protection.
- **FR-011 — Manifest record & idempotency.** The manifest records `mode: migrate`, the confirmed `phase`/`tools`, and a **duplicate-resolution record** (per path → archive | update | leave). Re-runs are **manifest-driven**: recorded decisions are not re-prompted or re-applied; `imported-docs.md` rows are keyed by path (no duplicates); archive skips if already archived *(clarified 2026-07-16)*.
- **FR-012 — Non-interactive completeness.** With no TTY, migrate completes with **zero prompts**, resolving anything not fixed by a flag via **safe defaults**: leave-alongside for duplicates, and the documented default stack (`claude`) when ambiguous/absent *(clarified 2026-07-16)*. Flags (`--phase`/`--stack`/`--design`/`--dup`) override the defaults. CI never blocks; nothing is destroyed.
- **FR-013 — Zero runtime dependencies.** Prompts via `node:readline`, hashing via `node:crypto`, files via `fs`/`path`. No new packages.

## Key Entities

- **Migrate decision record** — the manifest fields this feature adds/sets: `mode: migrate`, confirmed `phase`/`tools`, and `migrate: { duplicates: { "<path>": "archive|update|leave" } }`. Makes the adoption auditable and re-runs idempotent.
- **Imported-docs catalog** — `requirements/_notes/imported-docs.md`: a table of pre-existing docs found (path + description slot) that the instantiated templates cross-link to.
- **Detection signals** — the read-only evidence gathered before any decision: phase signals (tests/CI/release history/code/framework-docs) and stack surfaces (`.claude/`, `.agents/`/`AGENTS.md`, `.kiro/`, `.specify/`/`specs/`).

## Acceptance Criteria

- Migrate is engaged (not scaffold) on a non-empty fixture repo, and the detected phase/stack are reported before any write.
- A migrate run on a non-empty fixture completes with **zero user-file overwrites** (the mvp-3 exit-gate migration acceptance test).
- Phase inference matches the fixture's signals (growth/mvp/planning), and `--phase` overrides it non-interactively.
- Stack is proposed from the present surface; conflicting surfaces are reported and `--stack` resolves them.
- A pre-existing user doc is cataloged in `requirements/_notes/imported-docs.md` and left byte-unchanged.
- Each duplicate-resolution choice (archive/update/leave) behaves per FR-007 and is recorded in the manifest; **no existing content is removed** (archive leaves a pointer).
- A repo with `.specify/`/populated `specs/` has its spec frontmatter validated and Spec Kit setup skipped.
- `--phase … --stack … --design …` with no TTY completes with zero prompts.
- With **no flags and no TTY**, migrate still completes non-destructively via safe defaults (leave-alongside duplicates; default `claude` stack) and exits 0.
- **update-to-fit** rewrites the dest to the template's structure with the user's content embedded verbatim in a marked "imported content" section (nothing lost).
- Growth entry scaffolds the post-transition roadmap/backlog shape.
- Phase inference follows strict precedence: tests+CI **without** release history infers `mvp`/`planning`, not `growth`.
- leave-alongside on a user's `CLAUDE.md` also writes `CLAUDE.zero-two-one.md` (framework version present), while their `CLAUDE.md` is untouched.
- A second migrate run re-applies **nothing** (manifest-driven): mode/phase/stack read from the manifest, no re-prompts, no duplicate `imported-docs.md` rows, no re-archiving.
- A pre-existing spec with missing/invalid `status:` frontmatter is **reported and skipped**; the user's spec files are left untouched.
- `npm run lint` passes; no runtime dependency added.

## Out of Scope

- **The merge engine itself** — classify/apply/manifest/hashing are spec 001; this feature consumes them.
- **Assistant-led "review & fit to framework" reconcile command** — the guided, AI-driven doc reconciliation is a sibling spec (surfaced by 001 FR-014). FR-007 here is the *bounded, deterministic* archive/update/leave resolution over **exact-dest collisions only**; discovering equivalent docs elsewhere in the tree and fuzzy/role-based matching (e.g. `docs/product.md → PRODUCT`) is the AI-reconcile sibling's job *(clarified 2026-07-16)*.
- **Manifest-as-QA-contract** (single `lib.js` parser) — sibling spec 003.
- **Workflow-Manager reporter** (`021-doctor`) — sibling spec 004.
- **Conflict-aware `pre-commit` chaining** (husky/lefthook) — sibling spec.
- **Stack/design adapter rendering & design-system install** (`021-design`, per-stack template rendering) — mvp-4. This spec only *records* stack/design choices.

## Dependencies & References

- [spec 001 — Safe Install & Merge Engine](../001-safe-install-engine/spec.md) (the engine this builds on).
- TDD §8 (Migrate-Mode Detection & Phase Interview), §6 (existing-doc import + duplicate resolution), §7 (manifest).
- [mvp-to-growth-transition.md](../../workflow/specific-workflows/mvp-to-growth-transition.md) (Growth-entry shape).
- [init-and-migration.md](../../workflow/specific-workflows/init-and-migration.md) workflow.

## Open Questions

*Resolved in the 2026-07-16 clarify session: migrate threshold (any non-framework content), duplicate detection (exact-dest collisions), non-interactive behavior (safe defaults, proceed), and update-to-fit (wrap). Remaining minor item for the plan pass: the exact `--dup <path>=<action>` / `--yes` flag ergonomics — a surface detail, not a shape question.*
