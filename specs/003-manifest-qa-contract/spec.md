---
status: Draft
feature: Manifest as QA Contract
release: mvp-3
branch: 003-manifest-qa-contract
created: 2026-07-16
---

# Feature Spec: Manifest as QA Contract

*The third feature of [mvp-3 — Safe Install & Manifest](../../requirements/_releases/mvp-3.md). Specs [001](../001-safe-install-engine/spec.md)/[002](../002-migrate-mode/spec.md) make `.zero-two-one.json` the authoritative record of a project's phase, stack, and install state. This feature makes it the **single contract** every lifecycle script reads through — one parser in `scripts/speckit/lib.js` — retiring the ad-hoc manifest parsing and stdout-scraping that caused the r6 phase-detection regression. Grounded in TDD §7 (manifest) and the r7 audit.*

## Why

Today three places decide "what phase is this project in," each differently: `run-qa.sh` **scrapes** `workflow-status.js --json` through an inline `node -e` one-liner; `workflow-status.js` carries its own manifest read, phase-vocabulary map, and inference fallback; and `lib.js` (the Speckit helper library) knows nothing about the manifest at all. That duplication is exactly what broke in r6 — a change to one consumer's output silently changed another's behavior. The manifest is meant to be the source of truth (TDD §7); this feature makes reading it a **contract**: one parser, one phase/stack vocabulary, one fallback rule, consumed identically by QA, the gate, and status.

## Users & Context

- **Primary user:** the framework's own lifecycle scripts — `run-qa.sh`, `hooks/pre-commit`, `workflow-status.js` — and, transitively, every maintainer who runs `npm run 021-qa` or commits behind the gate.
- **Trigger:** any script that needs the project's phase or stack. Instead of re-parsing `.zero-two-one.json` or scraping another script, it calls the shared parser.
- **Builds on:** the manifest written by specs 001/002. This feature does **not** change the manifest schema — it centralizes *reading* it.

## User Scenarios (Acceptance)

1. **One parser** — *Given* a repo with a manifest, *when* any lifecycle script needs the phase, *then* it obtains it from `lib.js`'s manifest parser — no script re-implements manifest parsing or scrapes another script's stdout.
2. **QA reads the contract** — *Given* `run-qa.sh` runs, *when* it resolves the lifecycle phase, *then* it calls the `lib.js` parser directly (not `workflow-status.js --json`), and the phase it acts on is identical to what `021-status` reports.
3. **Status delegates** — *Given* `workflow-status.js` reports the phase, *when* a manifest is present, *then* it reads phase/stack through the same `lib.js` parser rather than its own copy of the vocabulary map.
4. **Consistent fallback** — *Given* no manifest (or an unparseable one), *when* any consumer resolves the phase, *then* all of them apply the **same** documented fallback (Planning / phase 0) and the same warning — no consumer diverges.
5. **No behavior change** — *Given* the refactor lands, *when* QA and the gate run at each phase, *then* the tier selected and the gate outcome are unchanged from before (pure consolidation).
6. **Stack available** — *Given* the parser, *when* a consumer needs the tool stack, *then* it is exposed by the same contract (ready for the stack-aware QA/gate that lands with mvp-4).

## Functional Requirements

- **FR-001 — Single manifest parser.** `scripts/speckit/lib.js` exposes one manifest reader — e.g. `readManifest(root)` → the parsed object or `null`, plus `manifestFacts(root)` → `{ phase, phaseNum, phaseLabel, stack, mode }` with the canonical mapping applied. It is the **only** place that opens `.zero-two-one.json` for phase/stack.
- **FR-002 — Canonical vocabulary.** The phase vocabulary lives once in `lib.js`: `planning→0/Planning`, `mvp→1/MVP Build`, `growth→2/Growth`, with the legacy `prebuild→planning` alias (back-compat). Stacks: `claude|antigravity|kiro`. No consumer keeps its own copy of these maps.
- **FR-003 — QA reads the contract.** `run-qa.sh` resolves the phase by invoking the `lib.js` parser directly (a single `node` call into the library), **not** by scraping `workflow-status.js --json`. The stdout-scraping one-liner is removed.
- **FR-004 — Status delegates.** `workflow-status.js` reads the manifest and applies the phase/stack vocabulary via the `lib.js` parser instead of its own duplicated logic; its no-manifest inference remains its own responsibility but is the single documented fallback (FR-006).
- **FR-005 — Gate coherence.** `hooks/pre-commit`, where it needs phase/stack, uses the same parser — never an independent parse or scrape. (Today it needs neither; this fixes the contract so a future stack-aware gate message can't reintroduce a second parser.)
- **FR-006 — One fallback rule.** When `.zero-two-one.json` is absent or unparseable, every consumer resolves to the **same** default — Planning (phase 0) — and emits a consistent warning. No divergent per-script defaults.
- **FR-007 — Behavior-preserving.** This is a consolidation: QA tier selection and gate outcomes at each phase are **unchanged**. The existing suite, `npm run 021-qa`, and `021-spec:verify` stay green.
- **FR-008 — Zero runtime dependencies.** Node built-ins only; consistent with 001/002.

## Key Entities

- **Manifest facts** — the normalized read the parser returns: `{ phase, phaseNum, phaseLabel, stack, mode }` (plus raw access via `readManifest`). The single shape every consumer trusts.
- **Phase vocabulary** — the canonical `planning|mvp|growth` (+ `prebuild` legacy alias) → number/label mapping, defined once in `lib.js`.

## Acceptance Criteria

- A repo-wide check shows `.zero-two-one.json` is opened for phase/stack in exactly one place (`lib.js`); `run-qa.sh` no longer pipes `workflow-status.js --json`.
- `run-qa.sh` prints the same "Detected Lifecycle Phase: N" for a given manifest as before the refactor, and it matches `021-status`.
- Removing/corrupting the manifest yields the same Planning-fallback + warning from both `run-qa.sh` and `021-status`.
- The phase/stack vocabulary map appears once in the codebase.
- `npm test`, `npm run 021-qa`, and `npm run 021-spec:verify` are green (no behavior change).
- `npm run lint` passes; no runtime dependency added.

## Out of Scope

- **Workflow-Manager reporter** (`021-doctor` drift report) — sibling spec 004; this feature only centralizes the read it will build on.
- **Manifest schema changes** — owned by specs 001/002; 003 changes only how the manifest is *read*.
- **Stack-aware QA tiers / gate messages** — the parser *exposes* stack, but consuming it to vary behavior arrives with the stack adapters (mvp-4).
- **Changing QA tier logic or gate rules** — pure consolidation; outcomes must not move (FR-007).

## Dependencies & References

- [spec 001](../001-safe-install-engine/spec.md) / [spec 002](../002-migrate-mode/spec.md) — the manifest writers (`mode`/`phase`/`tools`).
- TDD §7 (manifest as source of truth), r7 audit ([_refinement/r7-review.md](../../requirements/_refinement/r7-review.md)).
- Current consumers: `scripts/run-qa.sh`, `scripts/workflow-status.js`, `scripts/speckit/lib.js`, `hooks/pre-commit`.

## Open Questions

*Deferred to clarify: whether `workflow-status.js`'s no-manifest inference should move **into** `lib.js` (so the fallback also lives in one place) or stay in the status script; and whether the QA phase read should shell into `lib.js` via a tiny `node -e` or a dedicated `lib.js` CLI subcommand. Neither changes the spec's shape.*
