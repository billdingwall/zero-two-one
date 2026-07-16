---
status: Draft
feature: Workflow-Manager — Read-Only Drift Reporter
release: mvp-3
branch: 004-workflow-doctor
created: 2026-07-16
---

# Feature Spec: Workflow-Manager — Read-Only Drift Reporter

*The fourth feature of [mvp-3 — Safe Install & Manifest](../../requirements/_releases/mvp-3.md), and the framework's **fifth technical component** (TDD §1/§13). As work lands, lifecycle state drifts: a spec is marked `Done` but its `_INDEX` row still says `In Progress`, a release is `Delivered` but scope boxes are unchecked, the manifest `phase` no longer matches reality. This feature detects that drift and reports it with proposed corrections — **read-only, advisory, never in the commit path**. It consumes spec [003](../003-manifest-qa-contract/spec.md)'s `manifestFacts` and `lib.js` spec helpers. Grounded in TDD §13 (r7: read-only reporter first).*

## Why

Before r5, lifecycle state drifted silently — the manifest, backlog, and roadmap disagreed about where the project was, and nothing caught it. This session alone surfaced a real instance: `specs/_INDEX.md` showed spec 002 as `In Progress` while its frontmatter already said `Done`. A human has to notice these by eye today. The Workflow-Manager is the fifth component that keeps lifecycle state honest — but safely: this first increment (r7) only **detects and reports**, with a proposed diff for each drift, so a maintainer can run one command (`021-doctor`) and see exactly what's out of sync before deciding to fix it. Applying corrections is a later increment, once the report is trusted.

## Users & Context

- **Primary user:** a maintainer (or the assistant) checking lifecycle coherence — e.g. before the mvp-6 pre-publish review, or after landing a spec.
- **Trigger:** `npm run 021-doctor` (assistant-side or post-commit helper). It is **not** a `pre-commit` hook and never blocks a commit.
- **Builds on:** spec 003's `scripts/speckit/lib.js` — `manifestFacts` (phase), `listSpecs`/`readStatus`/`countTasks` (spec state). No duplicate manifest or spec parsing.

## User Scenarios (Acceptance)

1. **Clean repo** — *Given* lifecycle state is coherent, *when* `021-doctor` runs, *then* it reports "no drift" and writes nothing.
2. **Spec ↔ index drift** — *Given* a spec's frontmatter says `Done` but its `specs/_INDEX.md` row says `In Progress`, *when* the report runs, *then* it flags the mismatch and proposes updating the `_INDEX` row to `Done`.
3. **Spec ↔ work drift** — *Given* a spec marked `Done` with unchecked tasks, *when* the report runs, *then* it flags the spec as `Done`-but-incomplete and shows the unchecked count.
4. **Release ↔ specs drift** — *Given* every spec in a release is `Done` but the `_releases/*.md` Status is still `Planned`/`Next`, *when* the report runs, *then* it flags the release as advanceable and proposes the status change.
5. **Roadmap ↔ release drift** — *Given* the `05-ROADMAP` row status for a release disagrees with that release file's Status, *when* the report runs, *then* it flags the row.
6. **Manifest phase drift** — *Given* the manifest `phase` disagrees with the inferred phase, *when* the report runs, *then* it flags a possible stale phase (advisory only).
7. **Never blocks** — *Given* drift exists, *when* a commit is made, *then* the commit is unaffected — the reporter is not in the gate.

## Functional Requirements

- **FR-001 — `021-doctor` command.** A `npm run 021-doctor` entrypoint runs the drift report over the repo and prints a human-readable summary. It is **read-only** — it opens no file for writing, edits no working-tree file, and makes no commit (TDD §13 guardrails).
- **FR-002 — Spec ↔ index reconciliation.** For every spec, compare `spec.md` frontmatter `status` against its `specs/_INDEX.md` row; report each mismatch with the proposed `_INDEX` value.
- **FR-003 — Spec ↔ work reconciliation.** Flag a spec whose status is gate-passing/`Done` while its `tasks.md` has unchecked tasks (the advisory BACKLOG-vs-work drift), showing the unchecked count. (Reuses `lib.js` `countTasks`.)
- **FR-004 — Release ↔ specs reconciliation.** For each `_releases/mvp-*.md`, compare its `Status` against the aggregate state of its specs (all `Done` ⇒ advanceable; none started ⇒ Planned); flag releases whose recorded Status lags reality, with a proposed Status.
- **FR-005 — Roadmap ↔ release reconciliation.** Compare each `05-ROADMAP.md` release-row Status against the matching `_releases/*.md` `Status`; flag disagreements.
- **FR-006 — Manifest phase reconciliation.** Compare the manifest `phase` (`manifestFacts`, `source: manifest`) against the inferred phase; when they disagree, flag a *possible* stale phase — advisory, low-confidence, never asserted as wrong.
- **FR-007 — Report format.** Findings are grouped by check; each shows location, the actual vs expected value, and a one-line **proposed correction**. A clean run prints an explicit "no drift" line. Output is deterministic and di-friendly.
- **FR-008 — Guardrails (normative).** The reporter is **advisory only**: never invoked by `hooks/pre-commit`, never in the blocking commit path, never auto-commits, never edits the working tree (this increment is detect-only; applying corrections is a later increment). Its exit code signals drift for CI *visibility* (0 = clean, non-zero = drift found) but is **not** wired into the gate.
- **FR-009 — Reuse the contract.** Phase comes from `manifestFacts`; spec state from `lib.js` (`listSpecs`/`readStatus`/`countTasks`). No second manifest/spec parser (extends the spec 003 single-reader discipline).
- **FR-010 — Zero runtime dependencies.** `fs`/`path` (+ `node:child_process` for any git read); no packages.

## Key Entities

- **DriftFinding** — one detected discrepancy: `{ check, location, actual, expected, proposedFix, severity }`. `severity` distinguishes a hard mismatch (spec↔index) from an advisory hint (manifest phase).
- **Doctor report** — the grouped, ordered collection of findings + a summary line (count, or "no drift"). The command's entire output; nothing is persisted.
- **Reconciliation checks** — the five comparisons (FR-002…FR-006), each a pure function of repo state returning `DriftFinding[]`.

## Acceptance Criteria

- `021-doctor` on a coherent repo prints "no drift" and exits 0; a repo with a seeded mismatch exits non-zero and names it.
- An `_INDEX` row that disagrees with a spec's frontmatter is flagged with the correct proposed value (the concrete drift this session hit).
- A `Done` spec with unchecked tasks is flagged with its unchecked count.
- A release whose specs are all `Done` but Status is `Planned`/`Next` is flagged advanceable.
- A roadmap row Status that disagrees with its release file is flagged.
- The reporter writes **nothing** (verified: working tree byte-identical after a run) and is absent from `hooks/pre-commit`.
- Runs green against this repo's actual state (or reports only true, explainable drift).
- `npm test`/`npm run lint` pass; no runtime dependency added.

## Out of Scope

- **Applying corrections** — auto-editing the working tree to fix drift is the *next* Workflow-Manager increment (TDD §13); this spec is detect-only.
- **Auto-commit / pre-commit integration** — forbidden by the §13 guardrails; the deterministic refinement gate stays the only commit-path check.
- **Fuzzy prose reconciliation** — matching free-text release *descriptions* or backlog narrative; the reporter compares **statuses and structured state**, not prose.
- **The manifest schema / QA-contract parser** — owned by specs 001/002/003; 004 only *reads* via them.

## Dependencies & References

- [spec 003 — Manifest as QA Contract](../003-manifest-qa-contract/spec.md) (`manifestFacts` + `lib.js` helpers this reuses).
- TDD §13 (Workflow Manager, read-only reporter first) · §1 (fifth component) · §7 (manifest).
- Consumers of the state it reconciles: `specs/_INDEX.md`, `_releases/*.md`, `05-ROADMAP.md`, `04-BACKLOG.md`, `.zero-two-one.json`.

## Open Questions

*Deferred to clarify: whether the report also reconciles `04-BACKLOG.md` item statuses (or defers backlog to the apply-increment); the exact exit-code contract (always-0 vs non-zero-on-drift for CI); and whether `021-status`/`021-qa` should surface a one-line drift hint or keep the reporter fully standalone. None change the spec's shape.*
