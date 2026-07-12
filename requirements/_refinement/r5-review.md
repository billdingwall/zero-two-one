# Refinement Review Round: r5 — MVP-Build Stage

## Review Meta Data
- **Date:** 2026-07-12
- **Status:** Applied (2026-07-12)
- **Round:** 5
- **Reviewer:** William Dingwall (billdingwall) + `/harden-docs` alignment audit
- **Lifecycle Phase:** Pre-build → MVP Build hardening
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)

## Scope

Driven by the `/harden-docs` Document Hardening & Alignment audit run against the five key docs post-r4, plus the stakeholder's answers to the audit's clarification questions. Goal: resolve every showstopper and gap the audit found and leave the doc suite **ready for MVP build**.

## Findings (from `/harden-docs`) → Resolutions (team-directed)

### Showstoppers

1. **Publish-before-safe-install.** Backlog ordered "Publish v1.1.x" above the Init v2 safe-install group; Roadmap put publish last. Publishing first would ship the legacy clobbering CLI to test repos, violating PRD F1 / TDD §6.
   - **Resolution (team #1):** NPM publish is part of the **MVP launch release** (last). Backlog reordered so publish lives only in the launch release. V2 is emptied — all v2 items move to MVP; the three "Other v2 items" (MCP server, extra templates, tracker integration) are **dropped for now** (to be re-defined in Growth).

2. **Prototype exit-gate unschedulable.** Pre-build exit gate required a reviewable prototype; none exists and none was scheduled, blocking the release from exiting.
   - **Resolution (team #2):** No prototype is required for this project. Prototype becomes **optional**, added by a dedicated **`021-prototype`** command that generates it from the key docs and only then wires prototype steps into the workflow. Until that command runs in a project, the prototype pieces are absent and the lifecycle does not depend on them. The Pre-build exit gate is redefined around the CLI/DX experience, not a prototype.

3. **Manifest / phase drift.** PRD F6 + TDD §7 + CLAUDE.md designate `.zero-two-one.json` as the phase source of truth, but none existed here and `workflow-status.js` doesn't read it — it inferred **1.5** from a missing prototype while every doc said **Phase 2**.
   - **Resolution (team #3):** **Dogfood `.zero-two-one.json`** in this repo (phase `prebuild`, stack `claude`). Update `workflow-status.js` to read the manifest's `phase` first and to stop treating the prototype as mandatory in its fallback inference. This is added to MVP scope (mvp-2).

### Gaps & Orphans

4. **Orphaned v2 items** (MCP server, extra templates, tracker integration) had no PRD anchor. → Dropped (team #1). V2/Growth backlog is now empty; V2 is defined in the Growth phase after MVP ships.

5. **Unmeasurable Success Metrics** (drift reduction, adoption, stack coverage) had no collection mechanism given the zero-dependency/local-first posture. → PRD §5 reframed with explicit, honest measurement sources (npm stats, field-test observation, GitHub issue counts) and qualitative flags where no telemetry exists.

6. **EDD naming.** Audit brief expected an "Engineering Design Document"; repo's `02-EDD.md` is an **Experience** Design Document (engineering design lives in the TDD). → Documented as the intended split; no rename. Noted in `command-design.md`/`workflow-design.md` context.

7. **`021-feedback` target repo** was a `<owner>/zero-two-one` placeholder. → Resolved to **`billdingwall/zero-two-one`** in TDD §10.

8. **mvp-3 overloaded + no dependency ordering.** → MVP roadmap re-sequenced into engineering-ordered releases (mvp-1…mvp-6); each release is a coherent, dependency-respecting unit with its own `_releases/` file.

## Project Updates (team direction, verbatim intent)

- **#1** NPM publish is part of MVP launch. V2 should be empty; all v2 items move to MVP; the leftover three can be dropped for now.
- **#2** No prototype needed for this project. Prototype functionality is optional and added via a specific command that generates it from the key docs, then wires it into the workflow. Until run, the prototype piece can be removed. Document the CLI experience: add `requirements/_design/command-design.md` (all CLI commands, skills, scripts → AI-assistant command mapping) and `requirements/_design/workflow-design.md` (all hooks and workflows as they relate to project files).
- **#3** Dogfood `.zero-two-one.json` to resolve the phase conflict; add to MVP. Review the MVP roadmap and adjust releases to align with engineering needs; add MVP releases as needed to cover the full scope. Move all currently defined V2 work into MVP releases. V2 is defined later, in the Growth phase, after MVP is implemented and released.

## Outcome

Applied 2026-07-12. Docs edited: `01-PRD.md` (prototype command F9, metrics reframe, manifest dogfood note), `02-EDD.md` (prototype workflow, CLI-docs pointer), `03-TDD.md` (§12 prototype command, §7 manifest-read + status script, §10 repo slug), `04-ROADMAP.md` (six engineering-ordered MVP releases, empty Growth), `05-BACKLOG.md` (release-mapped, V2 emptied). New: `.zero-two-one.json`, `requirements/_design/command-design.md`, `requirements/_design/workflow-design.md`, `requirements/_releases/mvp-4..6.md`. Code: `scripts/workflow-status.js` reads manifest + prototype optional. Process: `product-lifecycle.md`, `refinement-loop.md`, `key-docs-to-prototype.md`, `workflows.md` updated for optional prototype. `sync:package` run. `/harden-docs` re-run to confirm MVP-ready.
