# Research: Design-System Install Command (`021-design`)

*Decisions and rejected alternatives behind [plan.md](plan.md). The clarify round settled the mechanical split, the mapping-section edit mode, the prototype seam, the living-doc handling, the EDD cascade, and the material-3 export formats (see [spec.md](spec.md) Clarifications); the items below are the implementation-level calls the plan depends on.*

## R1 — Targeted manifest write vs `buildManifest`

**Decision:** `scripts/design.js` writes `tools.design` with `loadManifest` → mutate → `writeManifest`, **not** `buildManifest`.

`scripts/init/manifest.js` exports `loadManifest`/`writeManifest`/`orderFields` alongside `buildManifest`. `buildManifest` recomputes the whole object (files hashes, merged, hook, migrate) and is meant for install/upgrade. For a single-field change, a targeted read-modify-write keeps every other field byte-stable and avoids re-hashing the tree — exactly the "record `tools.design` without a full init re-run" the clarify chose. `writeManifest` already applies `orderFields` + trailing newline, so the on-disk shape stays consistent.

- *(rejected)* Re-running `bin/init.js --design <system>` — it works (init resolves `tools.design`), but it re-walks/re-hashes the whole surface and touches `updatedAt`/`files`, coupling a design change to a full install. The clarify explicitly chose the thin-script path.

## R2 — The `DESIGN.md` mapping section: marker + append-when-absent

**Decision:** bound the "Design System Mapping" section with an HTML-comment marker pair and **replace** the region when present, **append** it (with markers) when absent; never touch the frontmatter token block.

The clarify chose "replace the section" for idempotence. But the **real project `DESIGN.md` is user-owned and may predate the template** — the dogfood repo's own `DESIGN.md` has **no "Design System Mapping" section at all** (it's an older bespoke doc). So a pure "replace" would have nothing to replace. The append-when-absent fallback handles that case: on first `021 design` the section is added (with its markers), and subsequent runs replace within the markers. The frontmatter tokens (the bespoke source of truth) are parsed as an opaque leading block and preserved verbatim.

- **Marker form:** `<!-- 021-design:mapping start -->` … `<!-- 021-design:mapping end -->` — invisible in rendered Markdown, greppable, and user-removable. Mirrors the guard-marker idea from spec 005's hook chaining.
- *(rejected)* Keying off the `## Design System Mapping` heading text — brittle to user renaming/translation; the comment marker is stable.

## R3 — The prototype seam (spec 012 not built)

**Decision:** `021-design` writes/updates the **CSS-variables file** under `requirements/_design/tokens/` and, when `prototype/` exists, points the prototype at it; it never generates a prototype. No-op when `prototype/` is absent.

This honors "a swap re-themes the prototype without touching key docs" (§9.4) while keeping `021-design` independent of the unbuilt `021-prototype` (spec 012). The seam is the **tokens CSS-variables file**: `021-design` owns producing/refreshing it; `021-prototype` (later) consumes it when it generates `prototype/`. Because the prototype is optional (r5), the cascade degrades to a no-op — the acceptance suite exercises both the present and absent cases. The actual CSS-variable *values* come from the user's export (assistant-placed), so the deterministic script scaffolds the location and the walkthrough fills content.

## R4 — Golden-fixture safety

**Finding:** adding `.claude/commands/021-design.md` does **not** require re-baselining `test/init/fixtures/claude-golden.json`.

Same as spec 010: `renderer.test.js` T004 iterates the fixture's own three entries (`CLAUDE.md`, `021-init.md`, `021-status.md`) and byte-checks each — it is not an exhaustive-set assertion, so a new sibling command file doesn't trip it. This spec changes none of the three. The neutral-core invariant (T006) holds: the command is Layer-2, `scripts/design.js` is Layer-1 (`scripts` ∈ `LAYER1_DIRS`) and identical across stacks.

## R5 — System skeletons (`material-3` / BYO / `none`)

**Decision:** the script emits a **skeleton** per system, not final values.

- `material-3` — a role-row table scaffolding `md.sys.*` assignments across the M3 tiers (`md.ref`/`md.sys`/`md.comp`; color/typography/shape/elevation/motion), with a placeholder for the Material Theme Builder export reference. The assistant fills the actual token names + M3 Expressive notes.
- `<byo>` — generic project-role rows (primary, body typography, spacing, radii, …) with a placeholder for the user's export reference; no `md.sys.*` assumptions.
- `none` — the region collapses to a one-line note that the bespoke frontmatter tokens are the source of truth.

Keeping values out of the script (a) preserves zero-dep determinism, (b) makes the edit idempotent, and (c) leaves the judgement (which role → which token) where it belongs — the assistant. Mirrors spec 010's split (script assembles structure; LLM supplies content).

## R6 — Why a script, not a pure prompt

Same rationale as spec 010 (R6 there): the deterministic work — the targeted `tools.design` write, the `tokens/` scaffold, the marker-bounded section regeneration — is mechanical and testable, so it belongs in `scripts/design.js`, with `/021-design` as the LLM-driven walkthrough. A pure-prompt version would push manifest editing and idempotent Markdown surgery into free-form model behavior, losing determinism. The clarify chose the thin-script split explicitly.
