---
status: Draft
feature: Conflict-Aware Pre-commit Install (Chaining)
release: mvp-3
branch: 005-precommit-chaining
created: 2026-07-16
---

# Feature Spec: Conflict-Aware Pre-commit Install (Chaining)

*The fifth and final feature of [mvp-3 — Safe Install & Manifest](../../requirements/_releases/mvp-3.md). Spec [001](../001-safe-install-engine/spec.md) installs the refinement-gate hook by **backing up and overwriting** any existing `.git/hooks/pre-commit` — which silently stops the user's own hook from running. This feature makes the install **conflict-aware**: it chains alongside a plain hook and wires into husky/lefthook instead of clobbering them. Grounded in TDD §1.3 (the Refinement Gate — conflict-aware installation).*

## Why

Real repos already have pre-commit hooks — a hand-written script, or husky, or lefthook. Today's installer does `cp existing pre-commit.backup; cp gate pre-commit` — the user's hook is preserved as a `.backup` file but **no longer executes**, and a husky/lefthook shim gets overwritten (and then silently reinstated by the manager on its next run, dropping the gate). For a framework whose whole promise is "non-destructive adoption," clobbering the one thing every serious repo customizes is the sharpest remaining edge. This feature closes it: the gate coexists with whatever hook setup it finds, or — if it can't wire in safely — installs nothing destructive and tells the user exactly how.

## Users & Context

- **Primary user:** a developer adopting the framework on a repo that **already has a pre-commit hook or a hook manager** (husky/lefthook).
- **Trigger:** the hook-install step of `zero-two-one-init` (both scaffold and migrate), which today calls `installHook` (spec 001 `apply.js`).
- **Builds on:** spec 001's apply pipeline + manifest, and spec 002's migrate detection (an existing `.git/hooks/pre-commit` is already a migrate signal). This feature replaces `installHook` with a conflict-aware strategy chooser.

## Clarifications

### Session 2026-07-16

- **Q: How does the gate chain relative to the user's existing hook steps?**
  A: **Gate-first — insert the guarded block right after the shebang line.** This guarantees the gate runs even if the user's hook ends in `exit 0` (a plain append after such a hook would silently never run — a gate bypass). The user's existing lines are preserved in order; only a block is inserted near the top.
- **Q: How is lefthook wired?**
  A: **Report-only.** Detect lefthook, print the exact `pre-commit` command snippet to add, set strategy `manual`, and **never edit** the user's config (safe under zero-dep + format variety yml/yaml/toml/json).
- **Q: Which husky layout?**
  A: **`.husky/pre-commit` (v9+ layout).** Insert the guarded block after the shebang of `.husky/pre-commit` (create a minimal v9-style file if absent). No special-casing of the legacy `_/husky.sh` sourcing.

## User Scenarios (Acceptance)

1. **No existing hook** — *Given* `.git/hooks/pre-commit` is absent and no manager is present, *when* init installs, *then* the gate is installed directly as `.git/hooks/pre-commit` (unchanged spec 001 behavior).
2. **Plain existing hook** — *Given* a hand-written `.git/hooks/pre-commit`, *when* init installs, *then* the gate is installed as `.git/hooks/pre-commit.zto` and a **guarded block is inserted after the shebang** of the existing hook — both the gate and the user's steps run (gate first). The original lines are preserved in order, never discarded.
3. **husky** — *Given* a `.husky/` directory, *when* init installs, *then* the guarded gate block is inserted after the shebang of `.husky/pre-commit` (created v9-style if absent) and `.git/hooks/` is **not** touched directly.
4. **lefthook** — *Given* a `lefthook.yml` (or equivalent), *when* init installs, *then* init **reports the exact `pre-commit` command snippet** to add (strategy `manual`) and does not edit the user's lefthook config.
5. **Idempotent re-run** — *Given* the gate is already chained, *when* init runs again, *then* no duplicate invocation line is added (a guard marker is detected).
6. **Never silently overwrite** — *Given* any existing hook/manager, *when* init runs, *then* no user hook or manager config is overwritten or emptied; `--dry-run` names the strategy that would be used.
7. **Non-git target** — *Given* no `.git/`, *when* init runs, *then* the gate is staged but inactive (unchanged spec 001 behavior).

## Functional Requirements

- **FR-001 — Hook-situation detection.** Before installing, classify the target into one of: **none** (no `pre-commit`, no manager), **plain** (a non-framework `.git/hooks/pre-commit` exists), **husky** (`.husky/` present), **lefthook** (`lefthook.{yml,yaml,toml,json}` or a `lefthook` key in `package.json`). A prior framework install counts as **already-installed** (no-op), recognized by **either** the direct-gate marker (`Zero Two One pre-commit hook`) **or** the chained guard-marker block (`>>> zero-two-one gate >>>`) in `.git/hooks/pre-commit` or `.husky/pre-commit` *(covers chained re-runs, analyze A1)* — so a re-run over a chained repo short-circuits rather than re-classifying as plain/husky.
- **FR-002 — Direct install (none).** With no existing hook or manager, install the gate directly as `.git/hooks/pre-commit` — spec 001's current behavior, unchanged.
- **FR-003 — Chain a plain hook.** With a plain existing `.git/hooks/pre-commit`, install the gate as `.git/hooks/pre-commit.zto` (executable) and insert a **guarded invocation block immediately after the shebang line** of the existing hook (**gate-first**, so it runs even if the user's hook ends in `exit` *(clarified 2026-07-16)*). The user's existing lines are preserved **in order** — only a block is inserted; nothing is truncated, reordered, or replaced.
- **FR-004 — husky integration.** With husky detected, insert the guarded gate block after the shebang of `.husky/pre-commit` (creating a minimal **v9-style** file if absent, clarified), and **do not** write `.git/hooks/pre-commit` (husky owns it).
- **FR-005 — lefthook integration.** With lefthook detected, init **reports the exact `pre-commit` command snippet** for the user to add and sets strategy `manual` *(clarified 2026-07-16)*; it **never edits** the lefthook config (safe under zero-dep + `yml/yaml/toml/json` variety). Because the config is never parsed, a re-run **re-prints the snippet** (init can't confirm the user added it) — this is advisory, not drift *(analyze A2)*.
- **FR-006 — Idempotency.** Every chained invocation carries a stable guard marker; a re-run detects it and adds nothing. Direct install remains idempotent per spec 001.
- **FR-007 — Never silently overwrite; report the strategy.** No user hook or manager config is overwritten, emptied, or reordered. When a safe automated wiring can't be determined, init installs no destructive change and **reports the manual step**. `--dry-run` prints the chosen strategy per FR-001.
- **FR-008 — Manifest record.** The manifest records the hook strategy applied (`none`/`direct`/`chain-plain`/`husky`/`lefthook`/`manual`) so re-runs are idempotent and `021-doctor` (spec 004) can surface hook state later.
- **FR-009 — Non-git target.** With no `.git/`, the gate is staged inactive and reported (unchanged spec 001 behavior).
- **FR-010 — Zero runtime dependencies.** `fs`/`path` only; no YAML/JSON hook-config libraries.

## Key Entities

- **HookSituation** — the detected state: `none | plain | husky | lefthook` (+ `already-installed`). Chooses the install strategy.
- **Guard marker** — a stable comment pair (e.g. `# >>> zero-two-one gate >>>` … `# <<< zero-two-one gate <<<`) wrapping the inserted invocation block, so idempotency is a simple presence check and the user can find/remove it.
- **Hook strategy record** — `manifest.hook` = the strategy actually applied; the audit trail for re-runs and the doctor.

## Acceptance Criteria

- No-hook target → gate installed directly at `.git/hooks/pre-commit` (spec 001 tests still pass).
- Plain hook → original lines preserved verbatim + a guarded block inserted after the shebang (gate-first); `.git/hooks/pre-commit.zto` present and executable; both run, and the gate runs even if the user's hook ends in `exit 0`.
- husky → `.husky/pre-commit` carries the guarded block (after shebang, v9-style if created); `.git/hooks/pre-commit` untouched.
- lefthook → init prints the command snippet and records strategy `manual`; the user's lefthook config is byte-unchanged.
- Re-run adds no duplicate invocation (guard marker respected); whole-tree diff on the second run touches nothing hook-related.
- No existing hook/manager file is ever overwritten or emptied (asserted on a fixture with a sentinel hook).
- `manifest.hook` records the strategy; `--dry-run` names it.
- `npm test`/`npm run lint` pass; no runtime dependency added.

## Out of Scope

- **Other hook managers** (pre-commit.com/`.pre-commit-config.yaml`, simple-git-hooks, etc.) — husky + lefthook are the two in scope (TDD §1.3); others fall to the FR-007 report-and-guide path.
- **Other git hooks** (commit-msg, pre-push) — only `pre-commit` carries the refinement gate.
- **Uninstall / unchaining** — removing the gate cleanly is a later concern; this spec installs/chains only.
- **The gate's own logic** — the approval-status parsing in `hooks/pre-commit` is unchanged; this spec only changes how it's *installed*.

## Dependencies & References

- [spec 001](../001-safe-install-engine/spec.md) `apply.js` `installHook` (replaced here) + manifest.
- TDD §1.3 (Refinement Gate — conflict-aware installation), §6 (non-destructive ownership).
- `hooks/pre-commit` (the gate script; its marker line identifies a framework install).

## Open Questions

*Resolved in the 2026-07-16 clarify session: chain order is **gate-first** (insert after the shebang, so a trailing `exit 0` can't bypass it); lefthook is **report-only** (never edits the config); husky targets the **`.husky/pre-commit` v9+ layout**. No open items remain.*
