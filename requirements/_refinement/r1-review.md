# Refinement Round: r1

**Status:** Applied
**Date:** 2026-07-10
**Reviewer:** William Dingwall (billdingwall)
**Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)

## Scope

<!-- Which document(s) or sections does this round cover? -->

This review covers the full repository to define what should only be in the main repo and left out of the package. I want to establish clear workflows for how the package will be updated without transferring tools for building the package, to the package iteslf.
## Findings

<!-- One entry per issue: what's wrong, where, why it matters -->
### 1. There's still some docs that don't need to be in the package
For example things like "sync-to-package" doesn't need to be in the package since that's a tool specific for updating the package.
### 2. Some of the templates and workflows need updating 
I see a few template updates that should be cleaned up based on proposed changes. There could also be a more defined structure to the package sync workflow; things like a clear manifest of what should be in the package and how that connects to templates or other parts of the main repository.
### 3. there's two new features that should be added
1. Having the user define a specific design system they want to use. This would then update all relevant design & development requirements docs to best utilize the chosen design system. That process would need a dedicated workflow to walk the user through decisions, gaps and implications.
2. Allowing the user to chose a spec driven delivery method. The default SSD workflow is Github Speckit, but other tools like Kiro could be used for managing specs and the SSD process.
3. Allowing users to pick an AI assistant other than Claude Code. For example, a user could chose Kiro and Kiro-CLI to manage the whole product. In that case I CLAUDE.md should be KIRO.md and that should be configured in the Kiro project settings. The functionality would be equivalent to CLAUDE.md. 
4. ADD TO BACKLOG: all this new feature work should be added to the backlog and not part of MVP scope.

### 4. Roadmap and backlog update based on product phase
* much of the zero two one framework focuses on hitting MVP for the purpose of getting the product into users hands and testing assumption or risks. The notions of defining assumptions early on and calling out risks from the beginning. After the product phase reaches "Growth", that roadmap should update to clearly show historical work down in MVP phases, then add a new section above the MVP section of the roadmap to focus more on pulling items from the backlog to create releases. 

## Proposed Changes

<!-- What should change in response to each finding -->

1.1 remove sync-to-package.js script from the package folder
1.2 In the main repo create a clear manifest of what's going into the package, the structure of the package that will be installed. This should be part of the TDD requirements docs.

2.1 add CODE.md and PRODUCT.md to the refinement review template "Related docs". Also TDD, PRD, EDD are not there, that section seems to be outdated. Update "related docs" with the current key and guiding docs then add a workflow for updating this template and others if those docs changes.
2.2 add these guiding docs and key docs to the package if not already there.

3.1 The overall structure of the zero-two-one framework needs to be defined further to help make it more tools agnostic. For example at a top level there's principles definitions that happen in CLAUDE.md, PRODUCT.md, CODE.md and DESIGN.md or other guiding docs. The key docs contain all the information on what we're building and why. The specs and workflows define the how. The better this layering structure is defined, the better it can be applied to other projects and the better other tools (like Kiro) can map into it for customizing tool sets within the framework.
3.2 Add a "configuration flow" from the beginning to define project tools and existing docs so the framework can adjust to those needs and update framework docs based on existing work.
3.3 Add a framework architecture proposal to .021-updates that defines the layers of the framework and how other tools as alternatives to Claude and Github Speckit might be used. Also add notes on how different design systems might be integrated and how the init process could work for adding this framework to existing repositories. 

4.1 As part of the workflows, add product lifecycle transition workflows to when the projects shifts from MVP to Growth it changes how the product backlog and roadmap work together. In the MVP phase the roadmap is the focus and all backlog work is meant to support delivery of the MVP. When switching to the Growth phase, the upcoming roadmap phases are undefined and will need be defined as "releases". Release will pull from the backlog at the team's discretion. 
4.2 Propose a solution for cleaning up the refinement loop to cover the notion of "releases" as it relates to the Growth phase of the product lifecycle. All work identified as v2 should be in the backlog once the growth phase is reached. "User value" should be the primary means of prioritizing backlog items in the growth phase. "User value" should be defined based on user feedback.

## Open Questions Raised

<!-- Anything that should land in 05-BACKLOG.md's Open Questions & Blockers register instead of being resolved here -->

not at the moment. Add an audit of the framework and project workflows to the .021-updates folder.

## Outcome

<!-- Filled in once the round's changes are applied: which docs were edited, version bumps, date closed -->

This review round is focused on getting this project to MVP and adding v2 items for the growth phase.

**Closed:** 2026-07-10. Changes applied per the four synthesis plans (`r1-update-{tdd,roadmap,backlog,workflows}.md`):

- `03-TDD.md` — added §5 Package Manifest; bound the sync script to it (findings 1.1, 1.2, 2.2).
- `04-ROADMAP.md` — restructured into Releases (Growth) + frozen MVP Roadmap; Phase 4 bullets moved to backlog (finding 4.1).
- `05-BACKLOG.md` — populated: MVP tasks, v2/Growth items (design system, pluggable SSD tool, pluggable assistant, config flow — out of MVP scope per finding 3.4), open-questions register (findings 3, 4.2).
- `scripts/sync-to-package.js` — self-exclusion via `scriptExclusions`; removed from `package/scripts/` (finding 1.1).
- `templates/06-REVIEW-Template.md` — Related Docs line restored with current guiding + key docs (finding 2.1).
- `templates/04-ROADMAP-Template.md`, `templates/05-BACKLOG-Template.md` — restructured to match the new living-doc shapes (finding 2.1).
- `workflow/specific-workflows/mvp-to-growth-transition.md` — new transition workflow, linked from `workflows.md`, `product-lifecycle.md`, and `refinement-loop.md` (findings 4.1, 4.2).
- `CODE.md` — constraint check: no principle changes required.
- Framework layering + tool-agnosticism recorded in `.021-updates/framework-architecture-proposal.md` (findings 3.1–3.3); v2 execution deferred to the backlog.