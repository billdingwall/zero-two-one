# Skill: Sync Design Tokens

**Description:**
An automated workflow to ingest and synchronize Figma-to-code design updates directly into the codebase's token architecture.

**Usage Constraint:**
Run this skill whenever a designer indicates the Figma file has been updated, or during Phase 2 (Pre-build).

**Execution Steps for AI Agent:**
1. **Locate Target Tokens:** Identify the primary design token file in the repository (e.g., `requirements/_design/tokens.json` or `src/styles/variables.css`).
2. **Ingest Source:** Ask the user to provide the updated Figma export JSON, or (if a Figma API script exists in `scripts/`), execute the script to fetch the latest tokens.
3. **Map and Transform:**
   - Compare the ingested tokens against the existing design system tokens.
   - Update color hex codes, typography scales, spacing variables, and component radii.
   - Preserve existing token variable names (e.g., `--color-primary`) to prevent breaking changes in the frontend.
4. **Commit:** Write the updated tokens to the target file. Provide a summary of the changes to the user and log the token sync in memory.
