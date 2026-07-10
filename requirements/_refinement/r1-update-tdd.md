# r1 Update Plan: 03-TDD.md

**Status:** Proposed — awaiting human approval
**Date:** 2026-07-10
**Round:** r1
**Findings addressed:** 1.1, 1.2, 2.2
**Target doc:** [../03-TDD.md](../03-TDD.md)

## Intent

The TDD documents the dual-workspace boundary (root vs `package/`) but does not define *what* crosses that boundary. This plan adds a canonical **Package Manifest** so the sync workflow has a contract to enforce, and dev-only tooling stops leaking into the published package.

## Proposed Edits

### 1. Add a new section `5. Package Manifest`

Defines three categories:

- **Ships in the package** (synced from root):
  `bin/`, `hooks/`, `templates/`, `workflow/`, `skills/`, `scripts/` (lifecycle tooling only), `specs/` (scaffold), `prototype/` (scaffold), `.github/`, `README.md`, `.gitignore`.
- **Package-only** (never overwritten by sync):
  `package/package.json` (publish config), `package/.claude/` (slash commands).
- **Root-only** (development workspace, excluded from sync):
  `requirements/` (the framework's own living docs), `.021-updates/` (internal audits/proposals), `scripts/sync-to-package.js` (the bridge tool itself — finding 1.1), `CLAUDE.md`/`CODE.md`/`PRODUCT.md`/`DESIGN.md` root instances (the package carries their `templates/*-Template.md` counterparts instead — finding 2.2), `.ai/` (generated, gitignored).

### 2. Document the template→install mapping

Short table stating that guiding docs are delivered as templates and instantiated by `bin/init.js` (e.g. `templates/CLAUDE-Template.md` → user's `CLAUDE.md`), so package consumers get clean starting points rather than this repo's dogfooding content.

### 3. Amend section 3 (Constraints & Decisions)

Extend the **Dual-Workspace Dogfooding** bullet: the sync script must implement the manifest above (add a `scriptExclusions` list so `sync-to-package.js` is not copied into `package/scripts/`), and any change to what ships requires updating this manifest section first.

## Cascade

- `scripts/sync-to-package.js` gains an exclusion for itself; delete `package/scripts/sync-to-package.js`; re-run `npm run sync:package` (mechanics covered in [r1-update-workflows.md](r1-update-workflows.md)).
- Changelog entry in the TDD.

## Out of Scope

Tool-agnostic layering (finding 3.1) — handled as a proposal in `.021-updates/framework-architecture-proposal.md`, not a TDD edit this round.
