# Engineering Workflow Audit

**Auditor:** Principal Fullstack Engineer
**Scope:** Zero Two One Framework - Technical Architecture, Delivery, & Automation

## 1. Framework Baseline

The framework's technical backbone relies on AI-driven artifact generation gated by human approval. The architecture is defined centrally and executed decentrally via SpecKit.

### Key Technical Documents & Tools
| Component | Purpose | Ownership |
|---|---|---|
| `03-TDD.md` | Technical Design Document (Architecture, Data Models, Endpoints). | Engineering |
| `CODE.md` | Basic coding principles and tech stack (informs constitution). | Engineering |
| `PRODUCT.md` | Formalizes the lifecycle workflow. | Cross-functional |
| `scripts/` & `hooks/` | QA automation, context fetching, and the pre-commit gate. | Engineering |

### Delivery Workflow

```mermaid
flowchart TD
    subgraph Architecture Definition
        A[Living PRD] --> B(Refinement Loop)
        B --> C[Draft/Update Living 03-TDD.md]
    end
    
    subgraph Spec-Driven Delivery (GitHub SpecKit)
        C --> E[Specify]
        E --> F[Clarify]
        F --> G[Plan & Task]
        G --> H{Refinement Gate}
        H -- Approved --> I[Implement Code]
        H -- Draft --> E
        I --> J[Analyze & QA]
    end
```

## 2. Audit Findings

**What Works Well:**
*   **Living Architecture:** Since `03-TDD.md` remains a living document post-MVP, we avoid the trap of "frozen architecture." Technical debt, scaling refactors, and migrations can be properly documented and planned through the Refinement Loop.
*   **The Pre-Commit Gate:** `hooks/pre-commit` mapping branches to spec approval status is an incredibly robust way to prevent AI agents from writing unauthorized code.

**Inconsistencies & Gaps:**
*   **Naming Conventions:** The current `AI_CODING_GUIDELINES.md` and `LIFECYCLE_WORKFLOW.md` are verbose and disconnected from standard conventions.
*   **Constitution Linkage:** The GitHub SpecKit constitution must explicitly draw from the basic coding principles defined in the new `CODE.md`.
*   **Dependency Clarity:** Claude Code and GitHub SpecKit must be explicitly listed as required dependencies for the framework to function.

## 3. Proposed Changes

### High Priority
*   **Rename Core Guidelines:** Rename `AI_CODING_GUIDELINES.md` to `CODE.md` and `LIFECYCLE_WORKFLOW.md` to `PRODUCT.md`.
*   **Update SpecKit Constitution:** Ensure SpecKit's context fetching seamlessly integrates `CODE.md` as the source of truth for coding principles.
*   **Required Dependencies:** Update initializers and documentation to mandate Claude Code and GitHub SpecKit as requirements.

### Medium Priority
*   **Directory Cleanup:** Remove the legacy `docs/` folder entirely, as its contents have migrated to the `workflow/` directory.

### Low Priority
*   **Automated Schema Extraction:** Implement a script in `scripts/qa.sh` that validates the code's actual database schema against the living `03-TDD.md` definitions to catch drift.

## 4. Implementation Considerations

*   **New Projects:** The workflow is perfectly suited for greenfield projects. It forces developers to update the TDD before implementation specs are written, ensuring architectural alignment.
*   **Existing Legacy Projects:** Integrating into a legacy codebase is technically challenging. The pre-commit hooks will immediately block developers if specs aren't present. We must provide a tool to auto-generate the initial living `03-TDD.md` from an existing Prisma schema / DB dump to establish the baseline.
