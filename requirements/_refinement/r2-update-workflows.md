# r2 Update Plan: Workflows & Docs

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r2
**Findings addressed:** 6.3 (workflow documentation), plus doc alignment
**Target docs:** `workflow/specific-workflows/init-and-migration.md` (new), `workflow/workflows.md`, `CLAUDE.md` (root + template), `.021-updates/init-installation-overview.md`

## Intent

Document the init/migration behavior as a first-class workflow so agents and humans follow the same rules the CLI enforces.

## Proposed Edits

### 1. New `workflow/specific-workflows/init-and-migration.md`

Covers both modes end-to-end:
- **Scaffold flow** (empty repo): current steps, made idempotent.
- **Migrate flow** (working project): detection triggers, ownership/merge rules summary (pointer to TDD §6), the phase interview and Growth-entry shape, existing-doc import, Spec Kit reuse, hook chaining.
- **Re-run / upgrade / uninstall** semantics from the install manifest.
- Linked from `workflows.md` §3 (Core or Transitional flows) and from the templates' getting-started references.

### 2. `workflows.md` §4 command table

Add `--dry-run`, `--force`, `--upgrade`, `--phase` to the `npx zero-two-one-init` row once implemented (plan approves the doc change; the row updates when the spec ships).

### 3. `CLAUDE.md` (root and `templates/CLAUDE-Template.md`)

Installation section gains the migrate-mode summary: init is non-destructive on existing projects, `--dry-run` first is the recommended pattern, and the assistant should read `.zero-two-one.json` (once present) to learn phase and tool stack instead of inferring.

### 4. `.021-updates/init-installation-overview.md`

After r2 is applied, update §4 (migration handling) and §6 (gaps) to reflect the new behavior — keep the doc as the accurate reference it was written to be.

## Cascade

- `npm run sync:package` after all r2 edits so the package carries the new workflow doc and template updates.
- Template-maintenance rule check (r1): new workflow doc referenced from templates where relevant.
