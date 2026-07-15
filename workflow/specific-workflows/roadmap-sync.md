# Roadmap Sync

*A sub-workflow of the [Refinement Loop](refinement-loop.md) (step 3). Surfaces releases onto the roadmap as a summary view.*

**Goal:** Keep `05-ROADMAP.md` — the **output** side of the data flow — as a summary table (description · status · priority · dependency · phase) that is a *view* over the canonical `_releases/` files, never a second source of truth.

## Steps
1. For each release ([release-sync](release-sync.md)), add/update one roadmap-table row linking to its `_releases/<id>.md`.
2. Set the summary fields — **priority** and **dependency** — from the release ordering; do not restate the release's scope.
3. Set the **phase** column per the 3-phase model (Planning / MVP Build / Growth).
4. How the roadmap changes by phase:
   - **Planning / MVP Build:** roadmap stays MVP-focused; Growth section empty.
   - **Growth:** MVP releases freeze as history; the Growth Releases section activates (see [mvp-to-growth-transition.md](mvp-to-growth-transition.md)).

**Reads:** `_releases/*`, `04-BACKLOG.md`. **Writes:** `requirements/05-ROADMAP.md`.
