---
status: Draft
round: 9
---

# Refinement Review Round: r9 — MVP Build Stage

## Review Meta Data
- **Date:** 2026-07-16
- **Status:** Draft — **Pending approval** (RLP step 2: no living document is edited until the update plans are approved)
- **Round:** 9
- **Reviewer:** William Dingwall (billdingwall) + repo-refactor architecture review
- **Lifecycle Phase:** MVP Build (Phase 1) — post-mvp-3, pre-mvp-4
- **Source:** [_notes/repo-refactor.md](../_notes/repo-refactor.md) — the r9 research note reconciling [_notes/standards-audit.md](../_notes/standards-audit.md) (cross-platform AI-config research) against the post-mvp-3 repo, with a full review of both the working repo and the delivered package.
- **Primary reference (read in full before drafting update plans):** [_notes/repo-refactor.md](../_notes/repo-refactor.md) — §1 audit verdicts, §2 findings (W1–W5, P1–P6), §3 target architecture, §4–§5 improvement plans, §7 open questions.
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Backlog](../04-BACKLOG.md) · [Roadmap](../05-ROADMAP.md) · [mvp-4](../_releases/mvp-4.md) · [mvp-6](../_releases/mvp-6.md) · [CODE](../../CODE.md) · [CLAUDE](../../CLAUDE.md)

*(This file dogfoods proposal **B1** below: refinement rounds carry `status:` frontmatter so tooling — `021-doctor` — can read round state instead of parsing prose.)*

## Review Focus: Working Repo ↔ Package Split — Neutral Core + Stack Adapters

*An architecture round driven by the repo-refactor plan. The governing principle it establishes: the **working repo** is the Claude Code dogfood; the **delivered package** is **assistant-agnostic** — a tool-neutral core that renders per-stack surfaces (Claude Code / Kiro / Google Antigravity) at init, per the assistant's conventions. The round's job: land the mechanical fixes now (r9), sharpen mvp-4's spec cut around the adapter architecture, extend mvp-6's publish gate, and record the deliberate rejections (no parallel state store, no Makefile) so they don't resurface.*

## Project Updates

*Numbered groups become the per-doc/per-surface update plans in step 2 (synthesize). Each item carries its plan source and landing spot: **(r9)** = fix in this round · **(mvp-N)** = scoped into that release + backlog · **(Growth)** = deferred backlog candidate.*

### A. Package distribution & sync fixes *(plan P1, W2, W3, P5-seed — all r9)*

Mechanical, no behavior change; precedent for in-round tooling fixes is r5/r6/r7.

1. **Stop shipping internal specs (P1)** (r9): remove `"specs/"` from `package/package.json` `files`; remove `specs` from `sync-to-package.js` `dirsToCopy`; delete `package/specs/`. The 38 internal feature-spec files (001–005) currently ship in the tarball but are never installed (engine excludes `specs/` — spec 001/A3): pure bloat + user confusion. User repos get `specs/` from Spec Kit setup, not the tarball.
2. **Single-source `.claude` (W2)** (r9): move `.claude/commands` from `preserveInPackage` to the sync copy list in `sync-to-package.js`. Today root and `package/` hold two independent copies of the Claude command surface (identical by luck, not by mechanism); a root edit would silently not ship.
3. **Hygiene (W3)** (r9): gitignore + de-track `.DS_Store`.
4. **mvp-6 checklist seed (P5)** (r9, docs): note in `_releases/mvp-6.md` that the pre-publish gate must verify the shipped README is install-focused and audit tarball contents (no internal specs / dev files — the P1 regression check).

### B. Refinement-round state convention *(plan §3.2 — r9)*

1. **Round `status:` frontmatter** (r9): rounds carry YAML frontmatter (`status: Draft | Pending approval | Applied | Closed`) alongside the prose meta block. Convention documented in [refinement-loop.md](../../workflow/specific-workflows/refinement-loop.md)/[review-sync.md](../../workflow/specific-workflows/review-sync.md); historical rounds are not retrofitted. This is the audit's "human-review gate" idea adapted to existing machinery — no new state store.
2. **Doctor check** (r9, small tooling — or first mvp-4 spec if preferred): `021-doctor` gains an advisory check reading round frontmatter (e.g. a round `Applied` whose plan files still say `Pending approval`). Advisory only; never in the commit path (TDD §13 guardrails hold).

### C. mvp-4 re-scope — the adapter release *(plan §3, §5.2 — release + backlog + TDD cascade)*

1. **Adopt the three-layer model** (TDD): Layer 1 neutral core / Layer 2 stack adapters rendered at init (only the chosen stack's surface installs; un-chosen stacks install **nothing**) / Layer 3 working-repo-only. Largely a sharpening of TDD §9 — the delta is making the install surface **stack-parameterized**: `classes.js FRAMEWORK_DIRS` and `sources.js userDocMappings` currently hard-wire `.claude/commands` + `CLAUDE.md` for every stack (plan P2).
2. **Proposed spec cut** (release file): **006** source layer & renderer (`ASSISTANT-Template.md` neutral source; `claude` rendering byte-identical to today as the regression bar; stack-parameterized surface) · **007** Antigravity adapter (`AGENTS.md`, `.agents/skills/021-*/SKILL.md`) · **008** Kiro adapter + `kiro-specs` engine dispatch (steering rendering, `.kiro/agents/021.json`, dispatch reads `tools.ssd` via the spec-003 `manifestFacts` seam) · **009** the **`021` CLI** (single assistant-agnostic command surface; replaces the Makefile idea — see E).
3. **New acceptance-matrix invariant** (release file): beyond 3 stacks × {none, material-3} green — *diff the installed tree across stacks; only Layer-2 (adapter) paths may differ.*
4. **Working-repo dogfood of the inversion (W1)** (lands with 006): `CLAUDE-Template.md` re-derived from `ASSISTANT-Template.md`; root `CLAUDE.md` re-rendered via guidance-sync, with the dogfooding preamble preserved as a marked local section.
5. **TDD cascade:** §9.1 gains the `021` CLI as the adapters' shared command contract; §5 package manifest drops `specs/` from the shipped set (A1); record the stack-parameterized-surface requirement.

### D. mvp-6 publish-gate deltas *(plan §5.3 — release file)*

1. Pre-publish gate additions: **tarball-content audit** (P1 regression: no internal specs, no dev files), **install-focused README** check (P5; split decision at the publish spec), **per-stack fresh-install smoke test** from the packed tarball (3 stacks).

### E. Deliberate rejections — record so they don't resurface *(plan §1.2, §6 — TDD/notes)*

1. **No parallel `.workflow/state.json` store**: the manifest + spec frontmatter (one reader: `manifestFacts`/`lib.js`) are the two durable state stores; a third agent-writable store reintroduces the split-brain that specs 003/004 eliminated. Recorded as a TDD §7 note (or ADR).
2. **No Makefile**: the one-command-surface intent lands as the `021` CLI (npm-guaranteed, Windows-safe, zero new toolchain deps) — C2/spec 009.
3. **Deferred to Growth** (backlog candidates, audit §4.2 as design note): scoped/hydrated refinement-loop instances; runtime write-guards for non-git-hook assistants; doctor apply-mode (TDD §13 increment 2).

## Cascade Map (step 2 targets)

| Update plan | Targets | Groups |
|---|---|---|
| `r9-update-package-sync.md` | `package/package.json` · `scripts/sync-to-package.js` · `.gitignore` · `package/specs/` removal | A1–A3 |
| `r9-update-workflows.md` | `refinement-loop.md` / `review-sync.md` (round-status convention) · doctor check note | B |
| `r9-update-tdd.md` | TDD §5 (shipped set) · §9.1 (`021` CLI, stack-parameterized surface) · §7 note (state-store rejection) | C5, E1–E2 |
| `r9-update-releases.md` | `_releases/mvp-4.md` (spec cut 006–009, invariant, W1) · `_releases/mvp-6.md` (gate deltas, A4) | C, D |
| `r9-update-backlog.md` | mvp-4 rows (spec cut) · Growth deferrals · **overdue: close the 15 delivered mvp-3 rows** (the standing `021-doctor` advisory) | C, E3, hygiene |
| `r9-update-roadmap.md` | mvp-4 row description (adapter spec cut + `021` CLI) | C |

## Open Questions (carried from the plan §7 — resolve at the named clarify passes)

1. **Stack switching on re-init** — remove / leave / archive the old stack's rendered surface? → spec 006 clarify (the spec-001 orphan mechanism likely covers it).
2. **CLI bin name** — `021` (leading digit, unusual in PATH) vs `zto` vs `zero-two-one`? → spec 009 clarify.
3. **Seeded `specs/_INDEX.md`** — should init seed an empty specs index (user-owned, template-instantiated), or leave `specs/` entirely to Spec Kit? → spec 006 clarify.
4. **Package README split** — separate installer-facing `package/README.md` vs sync-time transform? → mvp-6 publish spec.

## Approval

Per RLP step 2: approving this review authorizes drafting the update plans above; each plan is then approved before its documents are edited. Groups A (mechanical fixes) and B1 (convention) are candidates for immediate execution on approval; C–E are doc/release cascades.
