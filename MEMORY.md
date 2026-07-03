# Zero Two One: Project Memory & State

This file tracks the current phase and state of the Zero Two One lifecycle. It serves as the primary context reference for AI assistants to understand where the project is and what needs to be done next.

## Active Phase Tracker
**Current Phase:** 1 - Planning

*To update the current phase, change the number above and document the transition.*

---

## 4-Phase Project Lifecycle

### Phase 1: Planning (Zero)
**Goal:** Define the product vision, fill in key docs, and initialize the guiding files.
**Activities:**
- Complete `requirements/01-PRD.md` (Product Requirements Document).
- Complete `requirements/02-TDD.md` (Technical Design Document).
- Establish initial `requirements/03-ROADMAP.md`.
- Initialize `CLAUDE.md`, `MEMORY.md`, and `README.md` with project specifics.
**Exit Criteria:** Key documents are filled out, technology stack is selected, and vision is clear.

### Phase 2: Pre-build (Refinement)
**Goal:** Establish a design system, build a static prototype, and refine requirements through iteration.
**Activities:**
- Create `DESIGN.md` (Design Guidelines and System Tokens).
- Build a static prototype in `prototype/` based on the PRD/TDD.
- Execute refinement loops (`review -> synthesize -> update docs & prototype`) using `requirements/_refinement/`.
**Exit Criteria:** Prototype aligns perfectly with PRD, technical decisions for MVP are locked in TDD, and team is ready to build.

### Phase 3: MVP Build (One)
**Goal:** Deliver the first functional version of the product based on the refined prototype and specs.
**Activities:**
- Create detailed specifications in `specs/` for each roadmap phase.
- Use Github Speckit for implementation based on specs.
- Continuously test against success criteria defined in PRD.
**Exit Criteria:** MVP features are fully implemented, tested, and ready for user feedback.

### Phase 4: Growth (Stabilize & Scale)
**Goal:** Post-MVP phase focused on product-market fit, user feedback, and enhancements.
**Activities:**
- Re-enter the refinement workflow for user feedback and analytics.
- Update roadmap and specs for new features.
- Continue delivering enhancements using Speckit.
**Exit Criteria:** Ongoing iterative development based on real-world usage.

---

## Project State Notes
*(Add recent decisions, important context, or major blockers here)*

* Example: Decided to use SQLite for MVP database to keep architecture lean.
* Example: Need to finalize user personas before starting prototype.
