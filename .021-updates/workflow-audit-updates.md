# Zero Two One: Comprehensive Workflow Audit Updates

Based on the cross-functional workflow audits performed by the leadership team against the current state of the Zero Two One repository, below is the comprehensive breakdown of proposed upgrades to align the framework with the new "Living Document" workflow mechanics.

---

## 1. Team-Wide Proposed Updates (Consolidated)

These updates represent the overarching architectural changes to the framework's workflows, documentation, and tooling required to support all disciplines across the entire product lifecycle.

### Living Documents & The Refinement Loop
*   **Remove the Phase 4 "Lock":** Eliminate the concept of locking documents in Phase 4. Explicitly state in all documentation (`PRODUCT.md`, `workflows.md`) that `01-PRD.md`, `02-EDD.md`, and `03-TDD.md` remain **living documents** throughout the entire lifecycle. Updates will be tracked via changelogs at the bottom of these docs.
*   **Standardized Inline CHANGE Notes:** Introduce a standardized process during the Refinement Loop allowing the team to add `CHANGE` notes directly into a document, ensuring those changes are processed as part of the current review round.

### Artifact Renaming & Structuring
*   **Guiding Docs Reorganization:** Rename `AI_CODING_GUIDELINES.md` to `CODE.md` and `LIFECYCLE_WORKFLOW.md` to `PRODUCT.md`. Establish `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, and `DESIGN.md` (or a Design System) as the core Guiding Docs.
*   **The Universal Backlog:** Rename `04-PROJECT-TRACKING.md` to `05-BACKLOG.md` to capture and prioritize refinement tasks, new features, enhancements, and bugs continuously across all lifecycle phases.
*   **Key Docs Consolidation:** Elevate `README.md` to act as the primary Key Doc dashboard (summarizing lifecycle phase, roadmap phase, active specs).
*   **Legacy Cleanup:** Remove the `docs/` folder from the repository root entirely, as its contents have been migrated to the `workflow/` directory.

### Dependencies
*   **Required Tooling:** Explicitly define Claude Code and GitHub SpecKit as mandatory required dependencies in the framework documentation.

---

## 2. Principal Product Manager Proposed Updates

**Focus:** Alignment, lifecycle gates, backlog prioritization, and requirements tracing.

### High Priority
*   **Implement `05-BACKLOG.md`:** Establish the formal backlog document to act as the intake engine for tasks across all lifecycle phases, complementing the living PRD.
*   **Inline CHANGE Process:** Document and formalize the protocol for adding `CHANGE` notes directly to the PRD during refinement reviews.
*   **Elevate `README.md`:** Restructure the README to provide a high-level status of the project, tracking active specs and feedback rounds.

### Medium Priority
*   **Backlog Context Injection:** Ensure the SpecKit context builder (`scripts/speckit/fetch-speckit-context.js`) natively bundles `05-BACKLOG.md` alongside the living PRD to give the AI complete context.

### Low Priority
*   **Roadmap Automation:** Enhance the framework's tooling to tightly link `04-ROADMAP.md` milestones to GitHub Milestones, updating them automatically upon SpecKit phase completions.

---

## 3. Principal Fullstack Engineer Proposed Updates

**Focus:** CI/CD, technical debt, implementation velocity, and spec compliance.

### High Priority
*   **Execute Core Renames:** Programmatically rename `AI_CODING_GUIDELINES.md` to `CODE.md` and `LIFECYCLE_WORKFLOW.md` to `PRODUCT.md` across the repository and all automation scripts.
*   **Update SpecKit Constitution:** Ensure GitHub SpecKit's context fetching seamlessly integrates the new `CODE.md` as the absolute source of truth for coding principles and the constitution.
*   **Enforce Dependencies:** Update project scaffolding and initialization scripts to enforce the presence of Claude Code and GitHub SpecKit.

### Medium Priority
*   **Directory Cleanup:** Fully delete the `docs/` directory and ensure no lingering references remain in scripts or `package.json`.

### Low Priority
*   **Automated Schema Extraction:** Integrate a database schema validation step into `scripts/run-qa.sh` that compares the live database structure against the living `03-TDD.md` definitions to catch schema drift.

---

## 4. Principal UX Designer Proposed Updates

**Focus:** Design systems, prototype fidelity, UX strategy, and user feedback integration.

### High Priority
*   **Design System Policy:** Update the documentation to clarify how an external or more robust Design System can officially replace the content of `DESIGN.md`.
*   **Post-MVP Prototype Deprecation Policy:** Explicitly state whether the `prototype/` directory is deprecated after Phase 3 or maintained as a visual sandbox for the living `02-EDD.md`.

### Medium Priority
*   **UX QA Integration:** Add visual regression or AI vision comparison steps to `scripts/run-qa.sh` to ensure the rendered components match the rules defined in `DESIGN.md`.

### Low Priority
*   **UX Pattern Library:** Introduce a `components.md` document alongside `DESIGN.md` to catalog specific combinations of tokens (e.g., "Primary Modal"), providing AI agents with macro-level UI components to build with rather than just raw tokens.
