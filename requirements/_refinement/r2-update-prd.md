# r2 Update Plan: 01-PRD.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r2
**Findings addressed:** 1 (PRD claim), 6 (migration as a product capability)
**Target doc:** [../01-PRD.md](../01-PRD.md)

## Intent

Two PRD-level changes: make migration into working projects a first-class product capability, and correct Core Feature 4 so the PRD stops claiming something init doesn't deliver.

## Proposed Edits

### 1. Expand Core Feature 1 (Scaffolding CLI)

From "instantly inject the framework into any repository" to two explicit modes:
- **Scaffold** — fresh/empty repositories get the full surface (current behavior, made idempotent).
- **Migrate** — working projects get a non-destructive install: existing files are never overwritten, prior docs are imported and referenced, the project's real lifecycle phase is detected/asked (a shipped product enters at Growth), and an existing Spec Kit setup is reused rather than duplicated.

### 2. Correct Core Feature 4 (Agent Integration)

Reword to match delivered behavior once finding 1 is fixed: `.claude/commands/` is copied into the target during init (merge-safe). Until the code change lands, the PRD wording should say "installed by the scaffolder" rather than "pre-configured", tying the claim to init behavior.

### 3. Add Core Feature 6 (Install Manifest & Upgrades)

New feature bullet: a `.zero-two-one.json` manifest recording framework version, file inventory, detected phase, and tool stack — the basis for safe re-runs, `--upgrade`, uninstall, and (r3) alternative tool adapters.

### 4. Success Metrics

Add: **Migration success** — number of *existing* (non-empty) repositories initialized without manual repair; zero user files overwritten without explicit `--force`.

## Cascade

- EDD: no change this round (CLI interaction flow may warrant an EDD section when the init interview lands; noted, not blocking).
- TDD: architecture for all of the above — [r2-update-tdd.md](r2-update-tdd.md).
- Changelog entry in the PRD.
