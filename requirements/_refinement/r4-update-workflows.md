# r4 Update Plan: Workflows, Templates & README

**Status:** Applied (2026-07-12)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 1, 2, 3, 4, 7, 8, 9, 13
**Target docs:** `workflow/specific-workflows/init-and-migration.md`, `workflow/specific-workflows/mvp-to-growth-transition.md`, `workflow/specific-workflows/refinement-loop.md`, `workflow/specific-workflows/product-lifecycle.md`, `workflow/workflows.md`, `templates/` (review + release + EDD templates), `README.md` + `templates/README-Template.md`

## Intent

Carry the r4 decisions into the process docs and template surface: AI-led init with duplicate-resolution options, the releases model, stage-specific review templates, EDD parity, and the copy-paste install prompts.

## Proposed Edits

### 1. `init-and-migration.md` (findings 3, 4)

- Reframe around the **assistant-led walkthrough** (skill drives, `bin/init.js` executes); document the interview topics (stack, design, phase, existing structure) and the ask-don't-assume question format.
- Add the duplicate-resolution options (**archive / update-to-fit / leave-alongside**) and the content-preservation invariant (add/rename/update, never remove).
- New-project vs active-project sections aligned with the expanded EDD workflow.

### 2. `mvp-to-growth-transition.md` + `product-lifecycle.md` (findings 6, 7, 8)

- Rename MVP phases → **MVP releases** in transition mechanics; the MVP Releases section freezes as history at transition.
- Growth releases: tied to a release branch; backlog items promoted into the release; each item implemented as its own SSD spec through the gate; release file in `requirements/_releases/` created at release open, delivered-summary at close.
- `refinement-loop.md` Growth-note updated to **Roadmap > Releases (`_releases/`) > Backlog**.

### 3. Stage-specific review templates (finding 13)

Replace the single `06-REVIEW-Template.md` with a phase-matched set (recommend: `templates/reviews/06-REVIEW-{idea,prebuild,mvp,growth}-Template.md`, with `06-REVIEW-Template.md` kept as the generic fallback):
- **Idea**: completing key docs and principle/guiding docs.
- **Pre-build**: refining key docs, prototype reviews, roadmap definition.
- **Growth**: product review and user-feedback gathering (feeds `021-feedback` triage).
- **MVP**: code review and build testing.
The refinement loop step 1 picks the template by manifest `phase`.

### 4. New `templates/10-RELEASE-Template.md` (finding 8)

Release file skeleton: id, phase (MVP/Growth), branch (Growth), goal, promoted backlog items, spec links, delivered summary, changelog.

### 5. EDD cohesion sweep (finding 1)

Sweep `workflow/`, `skills/`, and `templates/` so every "PRD + TDD" pairing includes the **EDD** (workflows.md doc tables, skills prompts such as `generate-tdd.md`/`check-framework-compliance.md`, Related Docs lines). Update `templates/02-EDD-Template.md` with the expanded EDD structure (per [r4-update-edd.md](r4-update-edd.md)).

### 6. Template neutrality note (finding 2)

Add to `templates/_INDEX.md`: templates are tool-agnostic by rule; stack naming/formatting is applied by the init adapter at render time.

### 7. README install prompts (finding 9)

Add an "Install" section to the repo-root `README.md` (and `README-Template.md` where relevant) with three copy-paste prompt blocks — **Claude Code**, **Google Antigravity**, **Kiro** — each a one-paragraph prompt the user pastes into their assistant to install and initialize zero-two-one in their repo (wrapping `npx zero-two-one-init` + the walkthrough).

## Cascade

- `npm run sync:package` after apply; template-maintenance sweep for the renamed/added templates (r1 rule).
- Changelog entries where touched docs carry one.
