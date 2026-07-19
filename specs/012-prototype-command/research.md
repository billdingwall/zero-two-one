# Research: Optional Prototype Command (`021-prototype`)

*Decisions and rejected alternatives behind [plan.md](plan.md). The clarify round settled the subcommand verb, the CSS seam, overwrite protection, scaffold scope, and the emergent wire-in (see [spec.md](spec.md) Clarifications); the items below are the implementation-level calls the plan depends on.*

## R1 — `prototype/` is not installed → `prototype.js` creates it

**Finding:** `scripts/init/**` has **no** `prototype` reference — init does not scaffold `prototype/`. The dir + `_INDEX.md` exist in the dogfood repo as a repo artifact, but a user install has no `prototype/`.

**Decision:** `prototype.js` `mkdir -p prototype/` and seeds `prototype/_INDEX.md` if absent, then scaffolds the starter. `prototype/` is a **runtime-created project artifact**, not part of the install surface (not in `LAYER1_DIRS`). This matches `021-design` scaffolding `requirements/_design/tokens/` (spec 011).

## R2 — The CSS seam: `@import` tokens vs inline `:root`

**Decision:** `styles.css` `@import`s `../requirements/_design/tokens/<vars>.css` when `tools.design !== 'none'` **and** a tokens `*.css` file exists; otherwise it inlines a `:root { --… }` block read from the `DESIGN.md` frontmatter.

- The **`@import`** is the clean re-theme seam (clarify): a later `021-design set <system>` refreshes the tokens CSS file and the prototype re-themes with **no markup change** (spec 011 FR-006 writes that file). The relative path `../requirements/_design/tokens/…` resolves from `prototype/styles.css`.
- The **inline `:root`** (for `none`, or before any tokens file exists) is produced by a **minimal, zero-dep read** of the `DESIGN.md` frontmatter's simple maps — `colors:`, `spacing:`, `radii:` (2-space-indented `key: "value"` lines) → `--color-primary`, `--spacing-md`, `--radius-md`, etc. — plus a comment pointing at `DESIGN.md`. It degrades gracefully on unfamiliar frontmatter (emits what it recognizes); the assistant refines the values. No YAML dependency (matches the framework's "frontmatter as plain text" stance, TDD §9.1).
- *(rejected)* Always inline `:root` — self-contained but a `021-design` swap wouldn't re-theme without re-running `021-prototype`, breaking the "swap re-themes" promise.
- **Tokens filename:** the exact `*.css` name is whatever `021-design`'s import step lands (spec 011 imports the user's Material Theme Builder CSS export). `prototype.js` globs `requirements/_design/tokens/*.css` and imports the first (or a conventional `tokens.css`); when none exists it falls back to inline `:root`.

## R3 — Overwrite threshold

**Decision:** "content" = any file under `prototype/` other than `_INDEX.md`. The `_INDEX.md` scaffold is the framework's own marker (the same threshold `prototype-sync.md` uses: "more than its `_INDEX.md` scaffold"), so it never counts as user content. `init` without `--force` refuses only when a real prototype file is present; `--force` overwrites the three starter files (leaving other user files under `prototype/` alone).

## R4 — Emergent wire-in (verified)

**Finding:** the wire-in TDD §12 describes needs **no code**. Verified:
- `scripts/run-qa.sh:64` gates its prototype tier on `ls prototype/*.html` — scaffolding `index.html` flips it from the INFO-skip to PASS.
- `prototype-sync.md` (Refinement step 5) keys on `prototype/` holding more than `_INDEX.md`.
- `workflow-status.js` has **no** `prototype` reference — Planning is not gated on one (r5).

So `021-prototype` writes only under `prototype/` and the three steps activate by presence detection. This is the spec's FR-005 and shrinks the mechanical surface to the scaffold alone. *(This also means the acceptance test for "activation" asserts the **gate condition** (`prototype/*.html` now matches), not a changed step.)*

## R5 — Golden-fixture safety

**Finding:** adding `.claude/commands/021-prototype.md` does **not** re-baseline `claude-golden.json` — `renderer.test.js` T004 iterates only its three pinned entries (specs 010/011 R4/R5). The command is Layer-2; `scripts/prototype.js` is Layer-1 (`scripts` ∈ `LAYER1_DIRS`), identical across stacks.

## R6 — Why a script, not a pure prompt

Same rationale as specs 010/011: the deterministic work — the presence/overwrite check, the `mkdir`, the themed skeleton, the CSS seam resolution — is mechanical and testable, so it belongs in `scripts/prototype.js`, with `/021-prototype` as the LLM-driven walkthrough that builds the real screens. The clarify chose the thin-script split and the **bare skeleton** scope explicitly (the script never parses the EDD), keeping it zero-dep and deterministic.
