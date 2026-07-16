# Release Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 3) and roadmap definition. Maintains the canonical `_releases/` files.*

**Goal:** Create and update the per-release files in `requirements/_releases/` — the **canonical** source of release detail that the roadmap only summarizes.

## Steps
1. Group backlog items ([backlog-sync](backlog-sync.md)) into a release; create `_releases/<release-id>.md` from `templates/10-RELEASE-Template.md` (MVP releases `mvp-N`; Growth releases `v<major.minor>-<theme>` with a release branch).
2. Fill goal, scope checklist, exit gate; on close, write the Delivered summary and Changelog.
3. How grouping changes by phase:
   - **Planning / MVP Build:** releases are engineering-dependency-ordered; the roadmap stays MVP-focused.
   - **Growth:** releases promote backlog items by user value, each on its own branch, implemented as SSD specs (see [mvp-to-growth-transition.md](mvp-to-growth-transition.md)).
4. Keep the release file authoritative; the roadmap table links to it and never duplicates its state.

**Reads:** `04-BACKLOG.md`, `10-RELEASE-Template.md`. **Writes:** `requirements/_releases/*`. **Feeds:** [roadmap-sync](roadmap-sync.md).
