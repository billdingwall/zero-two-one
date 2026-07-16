---
status: Approved
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

## Clarifications

### Session 2026-07-16

- **Q: How should the reporter reconcile `04-BACKLOG.md`?**
  A: **Release-level check.** Group backlog rows by their `Release` column and flag a release whose rows are still `Open` while that release's specs are `Done`. Deterministic; catches the current real drift; no fuzzy prose→spec matching (item-level attribution is deferred).
- **Q: What is the exit-code contract?**
  A: **Non-zero only on hard drift.** Exit 0 when clean *or* only advisory findings (manifest-phase hint, release-level backlog); non-zero on hard mismatches (spec↔`_INDEX`, spec↔tasks). Driven by the `DriftFinding` severity. Never wired into the commit gate.
- **Q: Do `021-status`/`021-qa` surface a drift hint?**
  A: **No — standalone only.** `021-doctor` is its own command; status/QA neither call it nor mention drift, keeping the reporter fully outside the QA/commit path.

## User Scenarios (Acceptance)

1. **Clean repo** — *Given* lifecycle state is coherent, *when* `021-doctor` runs, *then* it reports "no drift" and writes nothing.
2. **Spec ↔ index drift** — *Given* a spec's frontmatter says `Done` but its `specs/_INDEX.md` row says `In Progress`, *when* the report runs, *then* it flags the mismatch and proposes updating the `_INDEX` row to `Done`.
3. **Spec ↔ work drift** — *Given* a spec marked `Done` with unchecked tasks, *when* the report runs, *then* it flags the spec as `Done`-but-incomplete and shows the unchecked count.
4. **Release ↔ specs drift** — *Given* every spec in a release is `Done` but the `_releases/*.md` Status is still `Planned`/`Next`, *when* the report runs, *then* it flags the release as advanceable and proposes the status change.
5. **Roadmap ↔ release drift** — *Given* the `05-ROADMAP` row status for a release disagrees with that release file's Status, *when* the report runs, *then* it flags the row.
6. **Backlog ↔ release drift** — *Given* a release's `04-BACKLOG` rows are still `Open` while its specs are all `Done`, *when* the report runs, *then* it flags that release's backlog as lagging (advisory).
7. **Manifest phase drift** — *Given* the manifest `phase` disagrees with the inferred phase, *when* the report runs, *then* it flags a possible stale phase (advisory only).
8. **Never blocks** — *Given* drift exists, *when* a commit is made, *then* the commit is unaffected — the reporter is not in the gate, and advisory-only drift exits 0.

## Functional Requirements

- **FR-001 — `021-doctor` command.** A `npm run 021-doctor` entrypoint runs the drift report over the repo and prints a human-readable summary. It is **read-only** — it opens no file for writing, edits no working-tree file, and makes no commit (TDD §13 guardrails).
- **FR-002 — Spec ↔ index reconciliation.** For every spec, compare `spec.md` frontmatter `status` against its `specs/_INDEX.md` row; report each mismatch with the proposed `_INDEX` value.
- **FR-003 — Spec ↔ work reconciliation.** Flag a spec whose status is gate-passing/`Done` while its `tasks.md` has unchecked tasks (the advisory BACKLOG-vs-work drift), showing the unchecked count. (Reuses `lib.js` `countTasks`.)
- **FR-004 — Release ↔ specs reconciliation.** For each `_releases/mvp-*.md`, compare its `Status` against the aggregate state of its specs, flagging only the two *real* mismatches *(narrowed via analyze A1)*: **advanceable** — every spec `Done` but Status not `Delivered`/`Done`; and **overclaimed** — Status `Delivered`/`Done` but a spec is not `Done`. A release with specs still in flight (none `Done` yet) is **not** flagged — that is a legitimate just-started release (R7). Advisory.
- **FR-005 — Roadmap ↔ release reconciliation.** Compare each `05-ROADMAP.md` release-row Status against the matching `_releases/*.md` `Status`; flag disagreements.
- **FR-006 — Backlog ↔ release reconciliation.** Group `04-BACKLOG.md` rows by their `Release` column; flag a release whose rows are still `Open` while that release's specs are all `Done` *(clarified 2026-07-16)*. Release-level and deterministic — no prose→spec item matching. **Advisory** severity.
- **FR-007 — Manifest phase reconciliation.** Compare the manifest `phase` (`manifestFacts`, `source: manifest`) against the inferred phase; when they disagree, flag a *possible* stale phase — **advisory**, low-confidence, never asserted as wrong.
- **FR-008 — Report format & severity.** Each `DriftFinding` carries a `severity` of **hard** (spec↔`_INDEX`, spec↔tasks) or **advisory** (backlog, manifest phase). Findings are grouped by check; each shows location, actual vs expected, and a one-line **proposed correction**. A clean run prints an explicit "no drift" line. Output is deterministic and diff-friendly.
- **FR-009 — Guardrails (normative) & exit code.** The reporter is **advisory only**: never invoked by `hooks/pre-commit`, never in the blocking commit path, never auto-commits, never edits the working tree (detect-only this increment; applying corrections is a later increment). Its exit code is **non-zero only when a *hard*-severity finding exists** *(clarified 2026-07-16)* — clean or advisory-only runs exit 0 — and is **never** wired into the gate.
- **FR-010 — Reuse the contract.** Phase comes from `manifestFacts`; spec state from `lib.js` (`listSpecs`/`readStatus`/`countTasks`). No second manifest/spec parser (extends the spec 003 single-reader discipline).
- **FR-011 — Zero runtime dependencies.** `fs`/`path` (+ `node:child_process` for any git read); no packages.

## Key Entities

- **DriftFinding** — one detected discrepancy: `{ check, location, actual, expected, proposedFix, severity }`. `severity` is **hard** (spec↔`_INDEX`, spec↔tasks — drives non-zero exit) or **advisory** (backlog, manifest phase — informational).
- **Doctor report** — the grouped, ordered collection of findings + a summary line (count by severity, or "no drift"). The command's entire output; nothing is persisted.
- **Reconciliation checks** — the six comparisons (FR-002…FR-007), each a pure function of repo state returning `DriftFinding[]`.

## Acceptance Criteria

- `021-doctor` on a coherent repo prints "no drift" and exits 0; a repo with a seeded **hard** mismatch exits non-zero and names it; a repo with only **advisory** findings exits 0.
- An `_INDEX` row that disagrees with a spec's frontmatter is flagged with the correct proposed value (the concrete drift this session hit).
- A `Done` spec with unchecked tasks is flagged with its unchecked count.
- A release whose specs are all `Done` but Status is `Planned`/`Next` is flagged advanceable; a release Status `Delivered` with a non-`Done` spec is flagged overclaimed; an in-flight release (no `Done` specs) is **not** flagged.
- A roadmap row Status that disagrees with its release file is flagged.
- A release whose backlog rows are `Open` while its specs are `Done` is flagged (advisory, release-level).
- The reporter writes **nothing** (verified: working tree byte-identical after a run) and is absent from `hooks/pre-commit`.
- Runs green against this repo's actual state (or reports only true, explainable drift).
- `npm test`/`npm run lint` pass; no runtime dependency added.

## Out of Scope

- **Applying corrections** — auto-editing the working tree to fix drift is the *next* Workflow-Manager increment (TDD §13); this spec is detect-only.
- **Auto-commit / pre-commit integration** — forbidden by the §13 guardrails; the deterministic refinement gate stays the only commit-path check.
- **Fuzzy prose reconciliation** — matching free-text release *descriptions*, or **item-level** backlog↔spec attribution by description; the reporter compares **statuses and structured state** (backlog is reconciled at the release level only, clarified), not prose.
- **`021-status`/`021-qa` drift hints** — the reporter is standalone; status/QA do not call it (clarified).
- **The manifest schema / QA-contract parser** — owned by specs 001/002/003; 004 only *reads* via them.

## Dependencies & References

- [spec 003 — Manifest as QA Contract](../003-manifest-qa-contract/spec.md) (`manifestFacts` + `lib.js` helpers this reuses).
- TDD §13 (Workflow Manager, read-only reporter first) · §1 (fifth component) · §7 (manifest).
- Consumers of the state it reconciles: `specs/_INDEX.md`, `_releases/*.md`, `05-ROADMAP.md`, `04-BACKLOG.md`, `.zero-two-one.json`.

## Open Questions

*Resolved in the 2026-07-16 clarify session: backlog is reconciled at the **release level** (Open rows vs Done specs, no prose matching); exit code is **non-zero only on hard drift** (advisory-only runs exit 0); and the reporter is **standalone** (no `021-status`/`021-qa` hint). No open items remain.*
