# r5 Update Record: 01-PRD.md

**Status:** Applied (2026-07-12) — retroactive record
**Date:** 2026-07-12
**Round:** r5
**Findings addressed:** Showstopper 2 (prototype exit-gate unschedulable), Showstopper 3 (manifest/phase drift), Gap 5 (unmeasurable success metrics)
**Target doc:** [../01-PRD.md](../01-PRD.md)

> **Note:** r5 was driven by the `/harden-docs` audit and applied directly from [r5-review.md](r5-review.md)'s Outcome section rather than through a standalone proposal step. This file records what changed, for consistency with the r1–r4 update-file convention.

## Intent

Resolve the audit's showstoppers touching the PRD: make the prototype genuinely optional (team resolution #2) instead of a blocking, unscheduled exit-gate dependency, and replace unmeasurable success metrics with honest, collectible ones (finding 5). Note the manifest dogfood dependency (team resolution #3) where the PRD references phase state.

## Edits Applied

### 1. New Core Feature — optional prototype command (Showstopper 2)

Added prototype generation as **F9**: a dedicated `021-prototype` command that generates a static prototype from the key docs on demand. No prototype is required by default; the lifecycle does not depend on one existing. Removed the implicit assumption that a prototype is part of every project's Pre-build stage.

### 2. Success Metrics reframed (Gap 5)

Replaced unmeasurable metrics (drift reduction, adoption, stack coverage — no collection mechanism given the zero-dependency/local-first posture) with metrics tied to real, honest measurement sources: npm download stats, field-test observation notes, and `021-feedback` / GitHub issue counts. Metrics without telemetry are explicitly flagged as qualitative.

### 3. Manifest dogfood note (Showstopper 3)

Added a short note cross-referencing `.zero-two-one.json` as the phase source of truth (TDD §7), so the PRD doesn't imply phase is tracked only in prose/memory.

## Cascade

- EDD carries the corresponding prototype-workflow and CLI-experience updates ([r5-update-edd.md](r5-update-edd.md)).
- TDD carries the manifest-read mechanics and the new §12 prototype command contract ([r5-update-tdd.md](r5-update-tdd.md)).
- Changelog entry added to the PRD.
