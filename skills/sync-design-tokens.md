# Skill: Sync Design Tokens

**Description:**
An automated workflow to ingest and synchronize Figma-to-code design updates directly into the codebase's token architecture (`requirements/_design/tokens/`).

**Usage Constraint:**
Run this skill whenever a designer indicates the Figma file has been updated, or during Phase 2 (Pre-build) prototype styling. Token renames/removals are breaking changes to the design system's public API — never `--prune` without explicit user confirmation.

**Execution Steps for AI Agent:**
1. **Ingest source:** Ask the user for the Figma token export JSON (W3C Design Tokens format from the Figma Variables API or the "Design Tokens" plugin; flat `name: value` maps also accepted). Save it to a temporary file.
2. **Preview the diff:** Run `npm run tokens:sync -- --input <file> --dry-run` and review the report: added, changed, unchanged, and orphaned tokens.
3. **Apply:** Re-run without `--dry-run`. The script merges into `requirements/_design/tokens/tokens.json` (source of truth, W3C format) and regenerates `tokens.css` (`:root` custom properties). Existing token names are preserved so frontend references (e.g. `var(--color-primary)`) do not break; alias values like `{color.primary}` become `var(--color-primary)` in CSS.
4. **Propagate:** Ensure the prototype (Phase 2) or app stylesheets (Phase 3+) import `tokens.css`. If tokens were added, wire them into the affected components.
5. **Report & record:** Summarize the changes for the user, note orphaned tokens that may need a designer decision, and log the sync in memory. Commit `tokens.json` and `tokens.css` together.
