# Skill: Verify Spec Compliance

**Description:**
Validate that generated front-end components or logic strictly adhere to the downloaded Speckit definitions, and that the spec artifact set itself is complete and cleared for implementation.

**Usage Constraint:**
Run after generating or modifying implementation code (Phase 3/4), before committing, and always before setting a spec's status to `Done`. The pre-commit hook runs the fast gate subset automatically; this skill is the full audit.

**Execution Steps for AI Agent:**
1. **Run the automated audit:** Execute `npm run 021-spec:verify` (i.e. `node scripts/speckit/verify-spec-compliance.js [spec] --json`). This checks: the spec resolves for the branch, a lifecycle status is declared and gate-passing, `plan.md`/`tasks.md` exist, no `[NEEDS CLARIFICATION]` markers remain, a `Done` spec has no unchecked tasks, and the `.ai/context` bundle is fresh.
2. **Fix FAIL findings first:** Any `FAIL` finding blocks the commit gate. Resolve it (or escalate to the user if it requires a spec decision) before continuing.
3. **Semantic compliance review:** Beyond the automated checks, compare the implementation against the context bundle in `.ai/context/NNN-feature-name.json`:
   - Every `acceptanceCriteria` entry maps to observable behavior in the code (and ideally a test).
   - Component props/fields match the entities and validation rules in `data-model.md`.
   - Interfaces match `contracts/` exactly — names, shapes, and error cases.
   - Styling follows the design system defined in `requirements/_design/` — no ad-hoc values that conflict with it.
4. **Update task state:** Check off completed items in `tasks.md` so progress reporting stays truthful.
5. **Report:** Output a markdown compliance summary — criteria satisfied, criteria not yet covered, deviations needing a spec update (which must flow through the refinement loop, not silent code drift).
