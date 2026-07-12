# r2 Update Plan: 03-TDD.md

**Status:** Applied (2026-07-10)
**Date:** 2026-07-10
**Round:** r2
**Findings addressed:** 1, 2, 3, 4, 5, 6 (technical design for all)
**Target doc:** [../03-TDD.md](../03-TDD.md)

## Intent

Design the init/migration architecture. The Package Manifest (TDD §5, r1) defined what ships; this round defines **how it lands** in a target repo without destroying anything, and how installs are tracked for upgrade/uninstall.

## Proposed Edits

### 1. Amend §1 System Architecture — CLI Scaffolder becomes two-mode

`bin/init.js` gains a mode decision at startup:
- **Scaffold mode** — target has no framework install and no meaningful pre-existing content in the paths init touches.
- **Migrate mode** — auto-detected when any of: existing `README.md`/guiding docs, `requirements/`, `.specify/` or populated `specs/`, an existing pre-commit hook, or a prior `.zero-two-one.json`. Migrate mode applies the ownership rules below and runs the detection/interview flow.

### 2. New §6 — File Ownership & Merge Rules

The enforcement contract for both modes:

| Class | Paths | Install | Re-run | Upgrade |
|---|---|---|---|---|
| **Framework-owned** | `scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/`, `.claude/commands/` | copy | overwrite only if unmodified vs manifest hash; else report conflict | same |
| **User-owned, instantiated** | `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`, `requirements/*.md` | create-if-missing | never touch | never touch |
| **Merged** | `.gitignore`, `package.json` (scripts) | additive merge (current behavior, kept) | idempotent | idempotent |
| **Generated** | `.ai/context/` | provision empty | leave | leave |

`--force <path>` is the only way to overwrite user-owned files. `--dry-run` prints the classified action plan (create/skip/merge/conflict per file) and exits.

Existing-doc import: when a user-owned doc already exists, init writes `requirements/_notes/imported-docs.md` cataloging what was found (path, one-line description slot) and the fresh templates link to it — content is referenced, never moved or rewritten.

### 3. New §7 — Install Manifest (`.zero-two-one.json`)

Written to the target root at install:

```json
{
  "version": "<package version>",
  "installedAt": "<ISO date>",
  "mode": "scaffold | migrate",
  "phase": "planning | prebuild | mvp | growth",
  "tools": { "assistant": "claude-code", "ssd": "github-speckit" },
  "files": { "<path>": "<sha256 at install>" }
}
```

- Basis for idempotent re-runs (skip anything present and unmodified), `--upgrade` (refresh framework-owned files whose hash still matches install; list conflicts otherwise), and uninstall documentation (delete files still matching their hash; list the rest).
- The `tools` block is the r3 extension point: adapters (Kiro, Google Antigravity, alternative SSD engines) register here without schema changes.
- Location decision: repo root (user-visible state, not a generated artifact) — confirm at approval.

### 4. Amend §1/§3 — Conflict-aware hook installation

- No existing hook → install as today.
- Existing plain `.git/hooks/pre-commit` → install the gate as `.git/hooks/pre-commit.zto` and append a guarded invocation line to the existing hook.
- Husky (`.husky/`) or lefthook (`lefthook.yml`) detected → add the gate invocation to the manager's config instead of touching `.git/hooks/` directly.
- Never silently overwrite; `--dry-run` shows which strategy will be used.

### 5. Amend §4 — Claude Code Integration

- init copies `.claude/commands/` into the target, merge-safe (existing user commands with the same name win; report skips).
- Spec Kit detection: if `.specify/` or spec-bearing `specs/` exists, init validates frontmatter compatibility with the gate (`status:` field readable by `verify-spec-compliance.js`), reuses the existing setup, and suppresses the `specify init` next-step guidance.

### 6. Phase detection & interview (migrate mode)

Heuristics first (tests exist + CI + releases → likely Growth; code but no framework docs → likely MVP-ish), then confirm with a prompt (or `--phase <phase>` non-interactive). Growth entry scaffolds `04-ROADMAP.md`/`05-BACKLOG.md` in post-transition shape per [mvp-to-growth-transition.md](../../workflow/specific-workflows/mvp-to-growth-transition.md) (Releases active, MVP section historical) and records the phase in the manifest so `workflow-status.js` can read it instead of guessing from directory contents.

## Constraints

Zero runtime dependencies holds: hashing via `node:crypto`, prompts via `node:readline`. No new packages.

## Cascade

- Implementation itself is Phase 3 work and flows through SSD as specs (see [r2-update-backlog.md](r2-update-backlog.md)) — this round only locks the architecture.
- Changelog entry in the TDD.
