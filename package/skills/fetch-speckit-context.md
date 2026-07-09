# Skill: Fetch Speckit Context

**Description:**
Dynamically retrieve the current feature's Spec Kit requirements, data models, and acceptance criteria, and inject them into the agent's context window as AI-readable artifacts.

**Usage Constraint:**
Run this skill BEFORE beginning any implementation work on a feature (Phase 3: MVP Build, or Phase 4 enhancements), and re-run it whenever spec artifacts change. Never implement from memory of an old spec read.

**Execution Steps for AI Agent:**
1. **Resolve the feature:** Determine the active spec from the current `NNN-feature-name` branch, or ask the user which spec to load if the branch does not follow the convention.
2. **Generate the bundle:** Run `npm run spec:context` (i.e. `node scripts/speckit/fetch-speckit-context.js [spec]`). This concatenates `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`, and `checklists/` into `.ai/context/NNN-feature-name.md`, and extracts a structured `.ai/context/NNN-feature-name.json` (status, gate state, acceptance criteria, entities, task progress).
3. **Load the context:** Read `.ai/context/NNN-feature-name.md` into your working context. Treat the JSON artifact's `acceptanceCriteria` array as the checklist your implementation must satisfy.
4. **Check the gate:** If the JSON reports `gate.passing: false`, STOP. Do not write implementation code. Tell the user the spec status and what is required to open the gate (status `Approved` or `Ready for Dev` via `npm run spec:status -- set <spec> <status>` after sign-off).
5. **Proceed:** Implement strictly against the loaded bundle, working through `tasks.md` in dependency order.
