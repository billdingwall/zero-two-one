# Release: mvp-5 — Lifecycle Commands

- **Type:** MVP release
- **Status:** Delivered
- **Lifecycle Phase:** MVP Build (Phase 1)
- **Branch:** feature branches per spec (`NNN-feature-name`)
- **Roadmap:** [05-ROADMAP.md](../05-ROADMAP.md) · [04-BACKLOG.md](../04-BACKLOG.md)

## Goal

Ship the assistant-driven lifecycle commands that ride on the per-stack rendering from mvp-4: feedback, design-system install, and the optional prototype — plus wiring the stage-specific review templates into the loop.

## Scope

- [x] `021-feedback` (TDD §10): file an issue to `billdingwall/zero-two-one` via `gh` or a pre-filled issue URL; attach manifest context (version, stack, phase); `.github/ISSUE_TEMPLATE/021-feedback.yml`. — [spec 010](../../specs/010-feedback-command/spec.md)
- [x] `021-design` (TDD §11): design-system install / BYO over the §9.4 adapter and the design-system-selection workflow. — [spec 011](../../specs/011-design-command/spec.md)
- [x] `021-prototype` (TDD §12): generate the optional prototype from key docs + `DESIGN.md`; wire prototype steps into Design / Refinement step 5 / QA on first run. — [spec 012](../../specs/012-prototype-command/spec.md)
- [x] Stage-specific review-template selection wired into the refinement loop by manifest `phase` (templates shipped r4) — `reviewTemplateForPhase` in `scripts/speckit/lib.js`, surfaced by `021 status`.

## Exit Gate

Each command works end-to-end on the `claude` stack (and renders on the other two); `021-feedback` files a real issue; `021-prototype` produces a themed prototype and activates its workflow steps. **Met** — the three commands are delivered as specs 010–012 (each `claude` end-to-end + rendered on `antigravity`/`kiro`, cross-stack tests green); `021-feedback` assembles a real `gh issue create` / pre-filled URL against `billdingwall/zero-two-one`; `021-prototype` scaffolds a themed prototype whose presence activates the QA/refinement/design steps (emergent wire-in).

## Delivered

- **`021-feedback`** (spec 010) — `scripts/feedback.js` + `021 feedback` CLI + `.claude/commands/021-feedback.md` + `.github/ISSUE_TEMPLATE/021-feedback.yml`; manifest context block; `gh`-or-URL transport; dry-by-default (no autonomous post); zero-dep, no token handling.
- **`021-design`** (spec 011) — `scripts/design.js` + `021 design set <system>`; targeted `tools.design` write, `requirements/_design/tokens/` scaffold, marker-bounded `DESIGN.md` mapping section (material-3 / BYO / none); re-theme seam for the prototype.
- **`021-prototype`** (spec 012) — `scripts/prototype.js` + `021 prototype init [--force]`; themed static scaffold consuming the design-system CSS variables; non-destructive; **emergent wire-in** (no edits to `run-qa.sh` / `prototype-sync.md` / `workflow-status.js`).
- **Stage-specific review templates** — `reviewTemplateForPhase` (`lib.js`) maps the manifest phase to `templates/reviews/06-REVIEW-{planning,mvp,growth}-Template.md` (generic fallback), surfaced by `021 status`; the refinement-loop doc points at it.

All on `mvp-5-lifecycle-commands`: specs 010–012 committed (`a698b98`, `9fe2e5a`, `ca0b307`) + this review-template close-out; full suite 115/115 green.

## Changelog
- **2026-07-18/19:** Release **Delivered** — specs 010 (`021-feedback`), 011 (`021-design`), 012 (`021-prototype`) implemented + verified tests-first; stage-specific review-template selection wired via `reviewTemplateForPhase` + `021 status`. Backlog rows closed; roadmap reconciled.
- **2026-07-12 (r5):** New release — groups the r4 command set (`021-feedback`, `021-design`) with the new optional `021-prototype` and review-template wiring, after the stack adapters (mvp-4).
