# Release Launch

*How a completed release is verified, published, and recorded. Runs at the end of each MVP release (and each Growth release).*

**Goal:** Take a release from "scope complete" to "launched and recorded," closing its `_releases/` file and updating roadmap/backlog state.

## Steps
1. **Verify:** the release's specs are all `Done`; `npx 021 spec verify` is clean; `npx 021 qa` is green (tests / a11y / spec compliance).
2. **Gate:** confirm the release's exit gate (from its `_releases/<id>.md`) is satisfied.
3. **Publish / deliver:** perform the release's delivery action (e.g. the NPM publish in mvp-6 — never before safe-install lands, r5). Publishing is a per-release step defined in the release file, not a standing automation.
4. **Record:** write the **Delivered** summary + Changelog in `_releases/<id>.md`; flip its status to Delivered ([release-sync](release-sync.md)).
5. **Roll state forward:** update the `05-ROADMAP.md` row and `04-BACKLOG.md` statuses; if this was the last MVP release, run the [MVP → Growth transition](mvp-to-growth-transition.md).

**Reads:** `_releases/<id>.md`, specs, QA. **Writes:** `_releases/<id>.md`, `05-ROADMAP.md`, `04-BACKLOG.md`, `.zero-two-one.json` (on phase change).
