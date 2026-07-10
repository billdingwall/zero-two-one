# Project Backlog

## Current Phase: Pre-build (Phase 2)

*Backlog ordering is roadmap-driven until the Growth phase. From Growth onward, **user value** — defined from user feedback collected in refinement rounds — is the primary prioritization signal. See the [MVP → Growth transition workflow](../workflow/specific-workflows/mvp-to-growth-transition.md).*

## MVP Backlog

*Supports delivery of [04-ROADMAP.md](04-ROADMAP.md) Phases 2–3.*

- [ ] Implement package-manifest sync exclusions; remove `sync-to-package.js` from `package/scripts/` (r1 finding 1.1).
- [ ] Update `06-REVIEW-Template.md` Related Docs and add the template-maintenance rule to the Refinement Loop (r1 finding 2.1).
- [ ] Publish `zero-two-one` v1.1.x to the NPM registry.
- [ ] End-to-end test of `npx zero-two-one-init` on a fresh repository via Claude Code.
- [ ] Automated tests for `bin/init.js` and `hooks/pre-commit`.

## v2 / Growth Backlog

*Not MVP scope. Pulled into releases at the team's discretion once the Growth phase begins.*

From r1 finding 3:
1. **Design-system selection** — user picks a design system during setup; a dedicated workflow walks through decisions, gaps, and implications, then updates `DESIGN.md`, the EDD, and development requirements to utilize it.
2. **Pluggable spec-driven delivery tool** — default remains GitHub Spec Kit; allow alternatives (e.g. Kiro) to manage specs and the SSD process.
3. **Pluggable AI assistant** — support assistants other than Claude Code (e.g. Kiro CLI): `CLAUDE.md` becomes the tool's equivalent (`KIRO.md`) wired into that tool's project settings, functionally identical.
4. **Configuration flow at init** — an interview at the start defining project tools and existing docs so the framework adapts to them (r1 finding 3.2; see [.021-updates/framework-architecture-proposal.md](../.021-updates/framework-architecture-proposal.md)).

Carried over from the pre-r1 roadmap Phase 4:
5. Native MCP (Model Context Protocol) server support within the framework.
6. Additional templates (e.g. database schema, API design).
7. Issue-tracker integration (Linear, Jira) to sync spec statuses.

## Open Questions & Blockers

- How should framework layers be formalized to stay tool-agnostic? → Layering model proposed in [.021-updates/framework-architecture-proposal.md](../.021-updates/framework-architecture-proposal.md); audit living docs against the "no tool names in layers 2–3" invariant before any v2 adapter work starts.

## Refinement Cycles

- **r1** (2026-07-10): full-repo review — package boundary, template drift, v2 features, MVP→Growth mechanics. See [_refinement/r1-review.md](_refinement/r1-review.md).

## Changelog
- **2026-07-10 (r1):** Populated the backlog stub: MVP tasks, v2/Growth items (explicitly out of MVP scope), open-questions register, refinement cycle log. Per [_refinement/r1-update-backlog.md](_refinement/r1-update-backlog.md).
