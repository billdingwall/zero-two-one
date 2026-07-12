# r4 Update Plan: 04-ROADMAP.md

**Status:** Applied (2026-07-12)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 6, 7, 8, 18 (+ Outcome goals)
**Target doc:** [../04-ROADMAP.md](../04-ROADMAP.md)

## Intent

Make the roadmap launch-ready: rename MVP phases to **MVP releases** with dedicated release files, absorb all v2 items into MVP (they're needed for multi-repo testing at launch), and sharpen the Growth mechanics (releases tied to branches, backlog → release → specs).

## Proposed Edits

### 1. Rename MVP phases → MVP releases (finding 8)

"MVP Roadmap (Phases 1–3)" becomes **"MVP Releases"**: `mvp-1 — Planning` (completed), `mvp-2 — Pre-build` (current), `mvp-3 — MVP Build` (next). Lifecycle *phases* (Idea/Pre-build/MVP/Growth) are untouched — the rename applies to the roadmap's delivery units only.

### 2. Release files (finding 8)

Create `requirements/_releases/` with one file per release: `mvp-1.md`, `mvp-2.md`, `mvp-3.md` (from a new `templates/10-RELEASE-Template.md`). Each carries goal, scope detail, spec links, and a delivered summary. The roadmap keeps a per-release **summary + link** — detail lives in the release file. Growth releases follow the same pattern (`v1.x-<theme>.md`) with a **release branch** field (finding 7).

### 3. Releases (Growth) section (findings 6, 7)

Tighten the section intro: each Growth release ties to a specific release branch; backlog items are **promoted** into the release and implemented as their own SSD specs through the refinement gate. Until the Growth transition the roadmap stays **fully MVP-focused**; at transition the MVP Releases section freezes as the historical record of how the product got here (already the documented behavior — restate in the new terms).

### 4. Absorb v2 into MVP (finding 18)

Move the entire v2/Growth backlog scope into **mvp-3**, grouped:
- **Stacks & Design Adapters** (r3 group): source-layer generalization, `antigravity` + `kiro` stacks, design-system adapter + `material-3`, init integration, 3×2 acceptance matrix.
- **r4 features**: AI-led init walkthrough, `021-feedback`, `021-design`, stage-specific review templates, README install prompts, EDD-cohesion sweep, upgrade-scope enforcement.
- Carried v2 extras (MCP server, extra templates, issue-tracker sync) stay in the backlog — they were "future potential", not named launch needs; flagged for the user to confirm.

### 5. Launch sequence (Outcome goals)

Order mvp-3 to end at the stakeholder's stated launch state: package published → framework tested via init in three real repos (claude+speckit at Growth · antigravity+speckit · kiro, different phases) → feedback flowing back via `021-feedback` into this repo's issues.

## Cascade

- Backlog restructures to match ([r4-update-backlog.md](r4-update-backlog.md)); transition mechanics updated in `mvp-to-growth-transition.md` ([r4-update-workflows.md](r4-update-workflows.md)).
- Changelog entry in the roadmap.
