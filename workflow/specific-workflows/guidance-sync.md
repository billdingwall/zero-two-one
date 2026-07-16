# Guidance Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 4, constraint check). Keeps the guiding/role docs aligned with the key docs.*

**Goal:** Compare the updated PRD/EDD/TDD against the guiding files (role lenses) and update them when core principles moved.

## Steps
1. After the key docs are updated ([requirements-sync](requirements-sync.md)), diff intent against the role lenses:
   - `CODE.md` (Lead Engineer) — coding principles, naming, testing, the "Wait" rule deferral.
   - `PRODUCT.md` (PM) — lifecycle checklist, phase rules, state management.
   - `DESIGN.md` (UX/UI) — design-system rules and tokens.
   - the assistant entrypoint (`AGENTS.md` source → stack-rendered `CLAUDE.md`) — structure map and routing.
2. Amend any lens whose stated rules the round changed; log it.
3. **Template maintenance:** if a guiding or key doc was added/renamed/removed, sweep `templates/` (especially "Related Docs" lines) in the same round.

**Reads:** key docs, guiding files. **Writes:** guiding files, `templates/`.
