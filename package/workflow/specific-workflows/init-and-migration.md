# Init & Migration (INM)

**Goal:** Define how `npx zero-two-one-init` lands the framework in a target repository — both fresh scaffolds and migrations into already-working projects — without ever destroying user content. The technical contract lives in the TDD (§§6–8: ownership/merge rules, install manifest, phase detection); this workflow is the human/agent-facing process.

> **Status note:** the merge rules, flags, manifest, and migrate mode described here were designed in refinement round r2. Until the Init v2 backlog group ships (see `requirements/05-BACKLOG.md`), the CLI still performs the legacy scaffold-only behavior — run it only on a clean working tree.

## Mode Decision

`init.js` picks a mode at startup:

- **Scaffold** — target has no framework install and nothing pre-existing in the paths init touches. Full surface is created; re-runs are idempotent.
- **Migrate** — auto-detected when any of these exist: `README.md`/guiding docs, `requirements/`, `.specify/` or a populated `specs/`, an existing `pre-commit` hook, existing tool surfaces (`.claude/`, `.agents/`, `AGENTS.md`, `.kiro/`), or a prior `.zero-two-one.json`.

## Stack & Design Selection

Init asks two tool questions (TDD §9): the **stack** — `claude` (Claude Code + GitHub Spec Kit, default), `antigravity` (Google Antigravity + GitHub Spec Kit), or `kiro` (Kiro assistant + Kiro specs) — and the **design system** (`none` default, or `material-3`; see the [design-system-selection workflow](design-system-selection.md)). Non-interactive: `--stack` and `--design`. In migrate mode, detected tool surfaces propose the matching stack (`.claude/` → claude; `.agents/`/`AGENTS.md` → antigravity; `.kiro/` → kiro); conflicts are resolved by the interview. The adapter renders the framework surface for the chosen stack — all installed command names follow the `021-` naming convention (`CODE.md`), so framework files never collide with user files in shared directories.

## Scaffold Flow (empty repository)

1. `git init` and `npm init -y` if not already done (init completes hook/script wiring only when both exist; re-running is safe).
2. `npx zero-two-one-init` — copies the framework surface, instantiates requirements + guiding docs from templates, installs the stack's assistant surface (default: `.claude/commands/021-*`), provisions `.ai/context/`, installs the refinement gate, merges the `021-*` npm scripts, writes `.zero-two-one.json` (mode: scaffold, phase: planning, tools per the stack/design answers).
3. Continue with the Phase 1 getting-started steps (`workflow/workflows.md`, product lifecycle).

## Migrate Flow (working project)

1. **Dry-run first (recommended):** `npx zero-two-one-init --dry-run` prints the classified action plan — create / skip / merge / conflict per file — and changes nothing.
2. **Run init.** Ownership rules apply (TDD §6):
   - Framework-owned tooling (`scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/`, `.claude/commands/`) is copied in.
   - User-owned files (`README.md`, guiding docs, `requirements/*.md`) are **create-if-missing — never overwritten**. `--force <path>` is the only override.
   - `.gitignore` and `package.json` scripts are additively merged.
3. **Existing docs are imported, not replaced:** init catalogs found documentation in `requirements/_notes/imported-docs.md` and the fresh templates reference it.
4. **Phase interview:** heuristics propose the project's real lifecycle phase; confirm interactively or pass `--phase <phase>`. A shipped product enters at **Growth**: the roadmap/backlog are scaffolded in post-transition shape (Releases active, MVP section historical — see [mvp-to-growth-transition.md](mvp-to-growth-transition.md)).
5. **Existing Spec Kit setups are reused:** `.specify/`/populated `specs/` are detected, frontmatter is validated against the gate, and duplicate setup guidance is suppressed.
6. **Hook installation is conflict-aware:** plain existing hooks are chained (`pre-commit.zto` + invocation line); husky/lefthook get the gate added to their config. Nothing is silently overwritten.
7. `.zero-two-one.json` (mode: migrate, detected phase, tool stack) is written to the repo root.

## Re-run, Upgrade, Uninstall

- **Re-run:** always safe — completes missing pieces only; present-and-unmodified files are skipped.
- **Upgrade:** `npx zero-two-one-init --upgrade` refreshes framework-owned files whose hash still matches the install manifest; anything user-modified is reported as a conflict for manual review.
- **Uninstall:** delete files still matching their manifest hash; the CLI lists everything else for manual review. User-owned docs are never removed.

## Agent Guidance

AI assistants should read `.zero-two-one.json` (when present) to learn the lifecycle phase and tool stack instead of inferring from directory contents, and record it in memory. `npm run 021-status` uses the manifest's `phase` field as the source of truth once available.
