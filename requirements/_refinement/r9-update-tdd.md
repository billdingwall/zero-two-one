---
status: Applied
round: 9
---

# r9 Update Plan: 03-TDD.md (Groups C5, E1)

**Date:** 2026-07-16 · **Source:** [r9-review.md](r9-review.md) §C, §E · [_notes/repo-refactor.md](../_notes/repo-refactor.md) §3, §6
**Targets:** `requirements/03-TDD.md` §5, §7, §9.1

## Intent
Bring the package-manifest contract in line with the r9 distribution fixes, record the stack-parameterized install surface + `021` CLI, and make the state-store boundary normative.

## Applied edits
1. **§5 Package Manifest** — `.claude/commands/` moved into the "Ships (synced)" set (single-sourced, W2); removed from "Package-only". `specs/` removed from the shipped set (P1) with a "Not shipped" note (never installed — engine excludes `specs/`); an open question flags whether init seeds an empty `specs/_INDEX.md` (→ mvp-4 source-layer spec).
2. **§9.1 Source layer** — added: the install surface is **stack-parameterized** (`classes.js`/`sources.js` resolve from manifest `tools.stack`); the **`021` CLI** (`bin/021`) is the shared cross-stack command contract that all adapter instructions reference — the deterministic POSIX surface without a Makefile (replaces the audit's Makefile proposal).
3. **§7 Install Manifest** — new normative **state-store boundary**: two durable stores (manifest + spec frontmatter), one parser (`lib.js`); a parallel agent-writable `.workflow/state.json` is **rejected** (reintroduces the split-brain specs 003/004 removed); refinement-round state rides `status:` frontmatter surfaced by `021-doctor`.
4. Changelog entry added.

## Cascade
No PRD/EDD change (structural/packaging, not business logic). Constraint check: **CODE.md unchanged** — §2 Artifact Integrity already covers "package/ synced from root"; the one-parser rule is an architectural note, not a new coding principle.
