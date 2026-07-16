# r6 Update Plan: 01-PRD.md

**Status:** Draft — **Pending approval** (no edit until approved, RLP step 2)
**Date:** 2026-07-15
**Round:** r6
**Decisions addressed:** #1 (3-phase lifecycle + Idea→Planning), #2 (04/05 numbering)
**Target doc:** [../01-PRD.md](../01-PRD.md)
**References:** [_notes/021-structure-proposal.md](../_notes/021-structure-proposal.md) §7 · [alignment audit](../_notes/021-structure-doc-alignment-audit.md) §1

## Intent

Bring the PRD's lifecycle framing into line with the decided 3-phase model and resolve the phase-1 naming split (the PRD is the only doc that says "Idea"). Keep the PRD light — it holds vision, not path references.

## Proposed Edits

### 1. §2 Product Vision — 4 phases → 3, "Idea" → "Planning"

- Change "structured, **4-phase** lifecycle (**Idea** → Pre-build → MVP → Growth)" to the **3-phase** lifecycle "(**Planning** → MVP → Growth)". Pre-build folds into Planning.
- Add one clause noting the **Planning sign-off milestone** (every core scenario stakeholder-reviewable + architecture locked in the TDD) as the gate into MVP Build — so merging Pre-build doesn't read as dropping the pre-code quality gate.

### 2. Feature references

- Sweep §4 features for "Pre-build" phase mentions; re-anchor any to "Planning" (e.g. F9 optional prototype — "Planning" not "Pre-build").
- F2 key-doc list wording ("PRD, EDD, TDD, Roadmap, and Backlog") is order-of-mention, not path numbers — leave unless a path is written; the 04/05 swap is a TDD/Roadmap/Backlog concern (see those plans).

### 3. Changelog

- Add an r6 entry: 3-phase lifecycle; "Idea"→"Planning".

## Cascade

- EDD stage-aware reviews + Planning sign-off milestone ([r6-update-edd.md](r6-update-edd.md)); TDD manifest enum + numbering ([r6-update-tdd.md](r6-update-tdd.md)).
- Guiding files (PRODUCT/README/entrypoint) via [r6-update-workflows.md](r6-update-workflows.md).
