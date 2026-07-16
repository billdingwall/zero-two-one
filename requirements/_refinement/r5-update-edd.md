# r5 Update Record: 02-EDD.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 2 (prototype exit-gate unschedulable), Gap 6 (EDD naming)
**Target doc:** [../02-EDD.md](../02-EDD.md)

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Update the prototype workflow to reflect that it is optional and command-generated (team resolution #2), and point to the new CLI-experience design docs rather than duplicating their content in the EDD.

## Edits Applied

### 1. Prototype workflow reframed (Showstopper 2)

The prototype section no longer assumes a prototype exists by default. It now describes the prototype as added on demand via `021-prototype`, generated from the key docs; until that command runs, prototype-related steps in the workflow simply don't apply. The Pre-build exit gate language was updated to route around the prototype (reviewable via the key docs, or the prototype if one was added) instead of requiring it.

### 2. CLI-experience pointer added

Added a pointer from the EDD's CLI-experience section to the new `requirements/_design/command-design.md` (full command ↔ skill ↔ script mapping) and `requirements/_design/workflow-design.md` (hooks/workflows ↔ project files), so the EDD stays high-level and the detailed mapping lives in one place.

### 3. EDD-naming note (Gap 6)

No rename performed — confirmed and documented that `02-EDD.md` is intentionally the **Experience** Design Document (not an "Engineering Design Document"); engineering/technical design lives in the TDD. Noted explicitly to prevent the ambiguity recurring in future audits.

## Cascade

- Companion to the PRD's new F9 prototype feature ([r5-update-prd.md](r5-update-prd.md)).
- TDD implements the `021-prototype` command contract in its new §12 ([r5-update-tdd.md](r5-update-tdd.md)).
- Changelog entry added to the EDD.
