# CLI Experience Walkthrough — Stakeholder Sign-off Demo

*A lightweight, reviewable transcript of the `021` command surface as it exists today. This is the artifact backing the **Pre-build exit gate** (EDD [§3 The CLI Experience](../02-EDD.md#3-the-cli-experience); r5 Q2): it lets stakeholders see and sign off on the DX before MVP build proceeds. It is a **source-repo dogfooding artifact** — it is not shipped in the package.*

**Captured:** 2026-07-12, from this repository (`mode: source`, Phase 3 branch `mvp-3-safe-install-and-manifest`). Output is real, not illustrative.

## What stakeholders are signing off on

The `021` surface is the framework's first-class interface (EDD §3): every command is `021-`namespaced, self-describing, and states *the current phase, what was checked, and the next step*. The happy path is automatic; manual controls (status, explicit state changes, verification, context rebuilds) are always available. The full command ↔ skill ↔ script mapping lives in [command-design.md](command-design.md); how each touches project files is in [workflow-design.md](workflow-design.md).

## Command surface at a glance

| Command | Kind | Demonstrated below |
|---|---|---|
| `/021-init` (assistant) / `npx zero-two-one-init` | Automatic (walkthrough) | §1 |
| `/021-status` → `npm run 021-status` | Manual status check | §2 |
| `npm run 021-spec:status -- list` | Manual inspect / state change | §3 |
| `npm run 021-spec:verify` · `npm run 021-qa` | Manual verification | referenced |

Assistant-side names are stack-rendered (TDD §9.2): the `claude` rendering ships as `.claude/commands/021-*.md`. As of this release the source repo carries [`.claude/commands/021-init.md`](../../.claude/commands/021-init.md) and [`.claude/commands/021-status.md`](../../.claude/commands/021-status.md), so the framework dogfoods its own slash commands.

## §1 — `/021-init`: init is a conversation, not a script

The assistant-led walkthrough explains what will land where **before** anything is written, then the CLI engine executes (EDD §3; TDD §1). The `claude` rendering is the slash command below, which drives `npx zero-two-one-init`:

```
$ cat .claude/commands/021-init.md
Initialize this repository with the Zero Two One agentic product framework.

Run the following command to scaffold the framework:

    npx zero-two-one-init

After initialization, complete these setup steps:
  1. Review README.md and workflow/workflows.md to understand the 4-phase lifecycle.
  2. Fill in requirements/01-PRD.md ...
  ... (7 setup steps + Spec Kit integration for Phase 3+)
```

The scaffolder lands the full surface — `requirements/` key docs from templates, `workflow/`, `skills/`, `specs/`, the stack command surface, and the `pre-commit` gate — and reports each action and any missing prerequisite (git repo, `package.json`, Spec Kit tooling) as a next step. The safe, non-destructive **Init v2** engine (ownership-based merge, `--dry-run`/`--force`, migrate mode) is the scope of mvp-3; the current scaffolder is the legacy behavior it hardens.

## §2 — `/021-status`: every command states the phase and the next step

```
$ npm run 021-status

=== Zero Two One Lifecycle Status ===
Current Phase: 3 - MVP Build (One)
Source: .zero-two-one.json
===================================
```

`Source: .zero-two-one.json` shows the manifest is the phase source of truth (TDD §7) — the dogfooded manifest at the repo root is read directly rather than inferred. The `/021-status` slash command then layers on document-completeness, spec gate state (Phase 3+), and recommended next steps.

## §3 — Spec-driven delivery surface (Phase 3)

```
$ npm run 021-spec:status -- list
No specs found in specs/. Run /speckit-specify to create one.
```

Clean baseline as MVP build opens: no feature specs yet, and the surface points to the next action. As specs land, this lists each with its refinement-gate state (✅ gate-passing / ⛔ blocked), and `npm run 021-spec:verify` / `npm run 021-qa` provide the manual verification path.

## Sign-off

This walkthrough demonstrates the `021` CLI experience end to end against the real repository: an assistant-led, non-destructive init; a phase-aware, manifest-sourced status surface; and a gated spec-delivery surface — satisfying the EDD §3 "legible / automatic-by-default / manual-controls-available" criteria. It stands as the Pre-build exit-gate demo (mvp-2). Architecture is locked in the TDD; mvp-3 scope is specced in [_releases/mvp-3.md](../_releases/mvp-3.md).

## Changelog
- **2026-07-12 (mvp-2 close):** Created — lightweight command-walkthrough / transcript backing the Pre-build exit gate (EDD §3; r5 Q2). Closes the mvp-2 "stakeholder sign-off demo" scope item.
