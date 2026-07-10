# Refinement Round: r2

## Review Meta Data
- **Date:** 2026-07-10
- **Status:** Draft — synthesis plans awaiting approval
- **Round:** 2
- **Reviewer:** William Dingwall (billdingwall) with Claude Code
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)

## Scope

This round addresses the five gaps documented in [.021-updates/init-installation-overview.md](../../.021-updates/init-installation-overview.md) §6. Goal: **after r2 is applied, the package can be initialized into — and migrate — already-working projects using the default tool stack (Claude Code + GitHub Spec Kit).** Multi-tool support (Kiro, Google Antigravity, other assistants/SSD engines) is explicitly deferred to **r3**, building on the adapter layering in [.021-updates/framework-architecture-proposal.md](../../.021-updates/framework-architecture-proposal.md).

## Findings

### 1. `.claude/commands/` never reaches the user
The `/init` and `/status` slash commands ship in the npm tarball but `bin/init.js` does not copy `.claude/` into the target repo. This also makes PRD Core Feature 4 ("Pre-configured `CLAUDE.md`, `.claude/commands/` …") factually wrong for initialized projects.

### 2. Init clobbers user-owned files
The five guiding docs (`README.md` worst of all) and the five `requirements/` docs are copied with unconditional overwrite. Initializing into a working project replaces its README with a template.

### 3. Re-running init is destructive
No create-if-missing / `--force` distinction: a re-run resets filled-in PRD/EDD/TDD/Roadmap/Backlog to blank templates. Re-running is required in real flows (e.g. after `git init` or `npm init` to complete hook/script wiring), so this is a live hazard, not an edge case.

### 4. Pre-commit install conflicts with hook managers
`init.js` overwrites `.git/hooks/pre-commit`. Projects using husky/lefthook (or any existing hook) silently lose their hook — or, if init runs first, the manager later silently disables the refinement gate.

### 5. No upgrade or uninstall path
Nothing records what version of the framework was installed or which files it owns. Upgrading an initialized repo is undefined; uninstalling means manual deletion.

### 6. Migration into working projects is undefined (scope driver)
Beyond not destroying files, init has no concept of a project that already has code, docs, git history, or an existing Spec Kit setup (`.specify/`, `specs/`). It cannot detect the project's real lifecycle phase (a shipped product should enter at Growth, per [mvp-to-growth-transition.md](../../workflow/specific-workflows/mvp-to-growth-transition.md)) and has no way to import existing documentation instead of ignoring it.

## Proposed Changes

1.1 `init.js`: copy `.claude/commands/` into the target (merge-safe — never overwrite a user's existing same-named commands). Fix the PRD Feature 4 wording to match delivered behavior.

2.1 Replace unconditional copies with **ownership-based merge rules**: framework-owned files (scripts/, hooks/, skills/, workflow/, templates/, .github/, .claude/commands/) may be overwritten on install/upgrade; user-owned files (guiding docs, `requirements/*.md`, `README.md`, `.gitignore`, `package.json`) are **create-if-missing only**.

2.2 When a user-owned file already exists, init imports rather than overwrites: catalog existing docs in `requirements/_notes/imported-docs.md` and reference them from the fresh templates instead of clobbering.

3.1 Add flags: `--dry-run` (print the full action plan, change nothing), `--force <path|class>` (explicit opt-in to overwrite), and make plain re-run always safe (idempotent completion of missing pieces only).

4.1 Hook installation becomes conflict-aware: detect an existing `.git/hooks/pre-commit` or a hook manager (`.husky/`, `lefthook.yml`); chain instead of replace (install as `pre-commit.zto` + append an invocation line, or add the gate to the manager's config); never silently overwrite.

5.1 Write a `.zero-two-one.json` install manifest to the target (framework version, install date, file inventory with hashes, detected phase, tool stack). This enables `zero-two-one-init --upgrade` (overwrite framework-owned files only if unmodified since install; report conflicts) and a documented uninstall.

6.1 Add a **migration flow** to init for existing projects: detect prior artifacts (README, docs folders, existing `CLAUDE.md`, `.specify/`/`specs/`, package.json), ask (or accept flags for) the project's actual lifecycle phase, and scaffold accordingly — Growth-phase entry scaffolds the roadmap/backlog in post-transition shape (Releases active, MVP section marked historical).

6.2 Detect an existing GitHub Spec Kit installation and align with it instead of duplicating: reuse existing `specs/` content, verify spec frontmatter compatibility with the gate, and skip `specify init` guidance when already present.

6.3 Document the whole init/migration behavior as a workflow: new `workflow/specific-workflows/init-and-migration.md`, linked from `workflows.md`.

## Open Questions Raised

- **r3 scope (deferred, do not resolve here):** extend init/migration to other AI assistants and SSD engines — Kiro (KIRO.md + Kiro spec management) and Google Antigravity as first candidates — via the adapter contracts in the framework architecture proposal. The `.zero-two-one.json` tool-stack field (5.1) should be designed so r3 adapters slot in without a schema break. Tagged on the v2 backlog items.
- Should the install manifest live at the repo root or under `.ai/`? Leaning root (it is user-visible state, not a generated artifact) — decide during TDD synthesis approval.

## Outcome

<!-- Filled in once the round's changes are applied: which docs were edited, version bumps, date closed -->

Pending. Synthesis plans: [r2-update-prd.md](r2-update-prd.md) · [r2-update-tdd.md](r2-update-tdd.md) · [r2-update-roadmap.md](r2-update-roadmap.md) · [r2-update-backlog.md](r2-update-backlog.md) · [r2-update-workflows.md](r2-update-workflows.md)
