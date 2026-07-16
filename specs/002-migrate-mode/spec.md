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

## User Scenarios (Acceptance)

1. **Detected migrate** — *Given* a repo with existing code and a `README.md` but no `.zero-two-one.json`, *when* the user runs init, *then* it engages migrate-mode (not scaffold) and reports what it detected before changing anything.
2. **Phase proposed & confirmed** — *Given* a repo with tests + CI + a release history, *when* migrate runs, *then* it proposes `growth`, and the user confirms (or overrides) — interactively, or non-interactively with `--phase`.
3. **Stack proposed from surfaces** — *Given* a repo containing `.kiro/`, *when* migrate runs, *then* it proposes the `kiro` stack; conflicting surfaces (e.g. both `.claude/` and `.kiro/`) list what was found and defer to the interview / `--stack`.
4. **Existing docs imported, not moved** — *Given* a repo with an authored `docs/product.md`, *when* migrate runs, *then* it catalogs it in `requirements/_notes/imported-docs.md` (path + description slot) and the fresh templates link to it; the original file is untouched.
5. **Duplicate resolved by choice** — *Given* the user has a `README.md` that duplicates the framework README role, *when* migrate runs, *then* it offers **archive / update-to-fit / leave-alongside**, applies the chosen one, and records the decision in the manifest — never removing the user's content.
6. **Spec Kit reuse** — *Given* a repo already carrying `.specify/` or a populated `specs/`, *when* migrate runs, *then* it validates the existing spec frontmatter and **skips** duplicate Spec Kit setup rather than re-scaffolding it.
7. **Non-interactive adoption** — *Given* CI runs `init --phase mvp --stack claude --design none`, *when* there is no TTY, *then* migrate completes with zero prompts and zero user-file overwrites.
8. **Growth entry shape** — *Given* the confirmed phase is `growth`, *when* migrate completes, *then* `05-ROADMAP.md`/`04-BACKLOG.md` are scaffolded in **post-transition shape** (Releases section active, MVP section historical) per the transition workflow.

## Functional Requirements

- **FR-001 — Mode detection.** The engine classifies the target as **migrate** when it holds pre-existing project content (code, docs, or a tool surface) and no framework manifest; an empty or framework-only target stays **scaffold** (spec 001). The resolved mode is recorded in the manifest and reported before any change.
- **FR-002 — Phase heuristics.** Migrate infers a likely lifecycle phase: tests + CI + release history ⇒ `growth`; substantial code but no framework docs ⇒ `mvp` (mid-build); otherwise ⇒ `planning`. The inference and its evidence are surfaced, never silently applied.
- **FR-003 — Phase confirmation.** The inferred phase is confirmed via an interactive prompt (`node:readline`) when a TTY is present, or taken from `--phase <planning|mvp|growth>` non-interactively. The confirmed value is written to the manifest.
- **FR-004 — Stack detection.** Existing tool surfaces propose the stack: `.claude/` ⇒ `claude`; `.agents/` or `AGENTS.md` ⇒ `antigravity`; `.kiro/` ⇒ `kiro`; `.specify/` or a populated `specs/` confirms `github-speckit`. Conflicting surfaces list what was found and defer to the interview; `--stack` sets it non-interactively.
- **FR-005 — Design selection.** `--design <none|material-3|…>` is honored non-interactively; default `none`. (Design-system *installation* remains `021-design` / mvp-4 — this only records the choice.)
- **FR-006 — Existing-doc import.** Pre-existing user-owned docs the framework would otherwise instantiate are **cataloged** into `requirements/_notes/imported-docs.md` (path + description slot), and the freshly-instantiated templates link to that catalog. Imported content is **referenced, never moved or rewritten** (TDD §6).
- **FR-007 — Duplicate resolution.** For each user doc that duplicates a framework-file role, migrate offers three choices — **archive** (move to `requirements/_notes/archive/` leaving a pointer), **update-to-fit** (restructure in place; content preserved), **leave-alongside** (the FR-006 catalog + cross-link). The chosen action is applied and **recorded in the manifest**. Invariant: existing content is never removed (archive leaves a pointer; update preserves content).
- **FR-008 — Spec Kit reuse.** When `.specify/` or a populated `specs/` is present, migrate validates the existing spec frontmatter (resolvable `status:`), reports it, and **skips** duplicate Spec Kit setup instead of re-scaffolding.
- **FR-009 — Growth entry.** When the confirmed phase is `growth`, migrate scaffolds `05-ROADMAP.md`/`04-BACKLOG.md` in **post-transition shape** (Releases section active, MVP section frozen as history) per [mvp-to-growth-transition.md](../../workflow/specific-workflows/mvp-to-growth-transition.md).
- **FR-010 — Non-destructive invariant.** Migrate never removes or overwrites existing content. Every write is additive, create-if-missing, an in-place structure-preserving update, or an archive-with-pointer. Inherits and must not weaken spec 001's user-owned protection.
- **FR-011 — Manifest record.** The manifest records `mode: migrate`, the confirmed `phase`/`tools`, and a **duplicate-resolution record** (per path → archive | update | leave) so the decisions are auditable and a re-run is idempotent.
- **FR-012 — Non-interactive completeness.** With `--phase` (and, where detection is ambiguous, `--stack`/`--design`) supplied and no TTY, migrate completes with **zero prompts**. Prompts appear only when a decision is genuinely unresolved and a TTY exists.
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
- Growth entry scaffolds the post-transition roadmap/backlog shape.
- `npm run lint` passes; no runtime dependency added.

## Out of Scope

- **The merge engine itself** — classify/apply/manifest/hashing are spec 001; this feature consumes them.
- **Assistant-led "review & fit to framework" reconcile command** — the guided, AI-driven doc reconciliation is a sibling spec (surfaced by 001 FR-014). FR-007 here is the *bounded, deterministic* archive/update/leave resolution, not an AI review.
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

*Deferred to clarify: the precise migrate-vs-scaffold detection threshold; whether ambiguous stack with no `--stack` in non-interactive mode should error or pick a documented default; and the exact `--yes`/`--non-interactive` ergonomics. None block the spec's shape.*
