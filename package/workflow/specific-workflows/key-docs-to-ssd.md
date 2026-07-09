# Flow: Key Docs > Roadmap > Backlog > SSD

**Scope:** Project-to-Implementation Handoff

## The Flow

This workflow illustrates how high-level project definitions mechanically translate into shipping code.

1. **Key Docs (`01-PRD.md`, `02-EDD.md`, `03-TDD.md`)**
   The living documents define the WHAT, HOW (Experience), and HOW (Technical). They are constantly maintained by the Refinement Loop.
2. **Roadmap (`04-ROADMAP.md`)**
   The Key Docs dictate the sequencing of major milestones and phases.
3. **Backlog (`05-BACKLOG.md`)**
   The Roadmap dictates the immediate priorities, which are broken down into actionable tasks, feature requests, and bug fixes in the universal backlog.
4. **Spec-Driven Delivery (SSD)**
   Items are pulled from the backlog into the SSD pipeline (SpecKit branches). The `.ai/context/` generation script automatically bundles `CODE.md`, `PRODUCT.md`, and `05-BACKLOG.md` to ensure the AI agent understands the implementation requirements within the context of the living architecture.
