# Flow: Key Docs to Prototype

**Scope:** Planning (Phase 1) — **optional** (r5)

> The prototype is opt-in. This flow runs only when a team invokes **`021-prototype`** (TDD §12); until then a project has no prototype and none of the steps below apply. A prototype is never a lifecycle gate condition.

## The Flow

1. **Ideation & Research:** Raw inputs enter `requirements/_notes/`.
2. **Drafting Key Docs:** The inputs inform the drafting of the living documents (`01-PRD.md`, `02-EDD.md`, `03-TDD.md`).
3. **Design System:** The `02-EDD.md` drives the creation of `DESIGN.md` (or a Design System) and visual assets (`requirements/_design/`).
4. **Prototype Generation (`021-prototype`):** The PRD/EDD logic and DESIGN tokens are used to build the static HTML/CSS/JS prototype in `prototype/`, consuming the design-system CSS variables.
5. **Wire-in & Validation:** On first generation the prototype steps activate in the Design, Refinement (step 5), and QA workflows. The prototype then serves as the visual contract for stakeholders; feedback feeds back into the Refinement Loop to update the Key Docs.
