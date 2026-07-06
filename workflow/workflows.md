# Zero Two One Workflows

> The central workflow manifest for this framework. It acts as an index to the modular workflows that govern **Discovery, Design, Refinement, Speckit Implementation, QA, and Release** across the product lifecycle.

---

## 1. Guiding & Key Documents

### Guiding Docs
- `CLAUDE.md`: AI assistant context and high-level project instructions.
- `CODE.md`: Basic coding principles and tech stack (informs constitution).
- `PRODUCT.md`: Formalizes the step-by-step lifecycle workflow.
- `DESIGN.md`: Machine-readable design tokens, palettes, and typography (can be replaced by a Design System).

### Key Docs
- `README.md`: Project status summary (Lifecycle phase, Roadmap Phase, specs, feedback).
- `requirements/01-PRD.md`: Product Requirements Document (What & Why).
- `requirements/02-EDD.md`: Experience Design Document (How - Experience).
- `requirements/03-TDD.md`: Technical Design Document (How - Technical).
- `requirements/04-ROADMAP.md`: Phased plan with milestone gates.
- `requirements/05-BACKLOG.md`: Captures and prioritizes tasks, features, bugs across the lifecycle.

> **Living Documents Paradigm:** The `01-PRD.md`, `02-EDD.md`, and `03-TDD.md` are **living documents** throughout the entire lifecycle. There is no "Lock" phase. They are continuously managed and updated via the Refinement Loop, with changes tracked in their respective changelogs.

---

## 2. Dependencies

The framework heavily relies on the following tools to operationalize these workflows:
- **Claude Code**: Required dependency. The primary AI agent executing the workflows.
- **GitHub SpecKit**: Required dependency. Provides the specification workflow pipelines and context bundling.

---

## 3. Modular Workflows

The framework's operations are broken down into the following specific workflows:

### Core Workflows
- **[Product Lifecycle (PLC)](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/product-lifecycle.md):** The overarching 4-phase lifecycle of the product.
- **[The Refinement Loop (RLP)](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/refinement-loop.md):** The project-level change-control loop for maintaining living documents and the backlog. Note: During reviews, inline `CHANGE:` notes can be used directly in documents.
- **[Spec-Driven Delivery (SSD)](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/spec-driven-delivery.md):** The tactical delivery mechanism utilizing GitHub Spec Kit and the Refinement Gate.

### Transitional Flows
- **[Key Docs > Prototype](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/key-docs-to-prototype.md):** How the living documents drive the initial prototype (Phases 1 & 2).
- **[Key Docs > Roadmap > Backlog > SSD](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/key-docs-to-ssd.md):** How high-level definitions mechanically translate into actionable code.
- **[Review > Backlog > SSD](file:///Users/williamdingwall/Sites/zero-two-one/workflow/specific-workflows/review-to-ssd.md):** How user feedback and analytics continuously cycle into the development pipeline (Phase 4).

---

## 4. Automation & Scripts

| Command | Purpose |
|---|---|
| `npx zero-two-one-init [dir]` | Scaffold the framework into a repository |
| `npm run status` | Detect and print the current lifecycle phase |
| `npm run qa` | Phase-appropriate QA suite |
| `npm run spec:status -- list` | All specs with status and gate state |
| `npm run spec:status -- set <spec> <status>` | Advance a spec's lifecycle |
| `npm run spec:context` | Generate `.ai/context/` bundles for the active feature |
| `npm run spec:verify` | Full spec compliance audit (`--gate` for the fast subset, `--json` for agents) |
