# Refinement Review Round: r4

## Review Meta Data
- **Date:** 2026-07-10
- **Status:** Applied (2026-07-12)
- **Round:** 4
- **Reviewer:** William Dingwall (billdingwall)
- **Related Docs:** [PRD](../01-PRD.md) · [EDD](../02-EDD.md) · [TDD](../03-TDD.md) · [Roadmap](../04-ROADMAP.md) · [Backlog](../05-BACKLOG.md) · [CODE](../../CODE.md) · [PRODUCT](../../PRODUCT.md) · [DESIGN](../../DESIGN.md)

## Scope

Fresh review round: a check that the current living docs (post r1–r3) still align with the stakeholder's vision for the framework, rather than a round driven by a pre-identified gap. Findings below are dictated by the reviewer as they go through the docs.

Finalize details before deploying the package and testing in different projects. I want to make sure the package is clean and the working repo is running.

## Project Updates
*Direct changes to the project requirements, design, roadmap, etc.*
*Note: You can also use inline `CHANGE:` notes directly within the living documents (e.g., `01-PRD.md`) during a review round. Any inline `CHANGE:` notes found in the living docs will be processed as part of this current review round.*
-

* EDD needs to be included alongside TDD and PRD in all parts of the framework. The PRD, EDD and TDD docs should be treated as one cohesive set.
* Templates should be tool agnostic and the /021-init functionally translates those templates to appropriate formatting and naming for the tools stack used in a user project
* In EDD core workflows add to the init section with details about running init in a new project vs running init in an active project. Answer details on how merge conflicts are handled. The init workflow should also feature an Interactive walkthrough where the AI assisted prompts the user to answer questions about project stack, existing project structure, etc. make any scripts or skills to facilitate this setup/init process. When using in an active project the setup/init process should not override existing files. Existing files may be added to, renamed or updated but existing content should not be removed. Give users the option on “archive old duplicate files”, “update to fit framework” or “leave along side new files”.
* The 021-init process should not be fully script based, it should utilize a prompt or skill that works with the active AI assistant. The core dependency of this framework is that needs an LLM to run, this includes the setup process.
* when setting up zero-two-one in another repo, a requirements folder with key docs based on the templates should be added. Make note of that in the package manifest.
* The roadmap should be fully focused on MVP until the projects transitions to the Growth phase. Then the MVP portion of the roadmap becomes a historical view of that happened to get there and the Growth portion of the roadmap is established. 
* The growth portion of the roadmap should also have its own phases called “releases”. Each release would be tied to a specific branch and items from the backlog would be promoted to the release and implemented as their own specs.
* Both MVP phases and Releases should have a folder in requirements with their own dedicated file, so there can be more detail added to each release. The roadmap would point to these release files and summarize what will be delivered as well as what was delivered. To simplify naming, rename MVP phases to MVP releases.
* Claude, Kiro and Antigravity should all have easy install prompts that can be copied and pasted. Add them to the readme in the main repo root
* In the experience design doc (EDD), make sure the CLI experience is well represented. I want to make sure 021 commands are easy to understand and robust enough to manage the project as needed. Workflows should be automatic, based on specific 021 workflows but there should also be enough manual controls and status checks to give users the flexibility to manage their projects as they need.
* As users use 021 commands, if there’s additional context needed, ask them as an interactive question with a recommendation and other options as well as a write option.
* As the package updates, uses that update the package in there repo should only get template, skill, script and hook updates.
* Review templates should be unique to the product stage it’s in. The initial phase should focus on filling out the key docs and principle/guiding docs. The pre-build phase should focus on refining the key docs, prototype reviews and roadmap definition. The MVP phase should focus on code review and testing build phases. The growth phase should focus on product review and gathering user feedback.

## Persona Feedback
*Ambiguous feedback from different persona types (Users, Stakeholders, Contributors) to help steer project direction.*
-

- in genera I want to make the feedback process an important part of this project. So while using it in other repos users can just run a feedback command and create issues directly in the zero-two-one repo. That will help build the backlog after mvp

## Findings

<!-- One entry per issue: what's wrong, where, why it matters -->

*Synthesized from the raw feedback above (Project Updates, Persona Feedback, Proposed Changes) into numbered findings for the r4 update plans to reference.*

1. **Key-doc cohesion**: the EDD is under-represented — PRD, EDD, and TDD must be treated as one cohesive set across all framework surfaces (workflows, skills, scripts, templates, references).
2. **Tool-agnostic templates**: templates must stay tool-neutral; `/021-init` translates them to the formatting and naming of the project's stack.
3. **Init experience is under-specified in the EDD**: needs new-project vs active-project detail, merge-conflict handling, an interactive AI-led walkthrough (stack, existing structure, phase), non-destructive rules (existing files may be added to, renamed, or updated — content never removed), and per-duplicate user options: **archive**, **update to fit framework**, or **leave alongside**.
4. **AI-led init**: init must not be fully script-based — it runs as a prompt/skill with the active assistant, backed by scripts. An LLM is the framework's core dependency, including setup.
5. **Install lands the key docs**: setting up in another repo adds a `requirements/` folder with key docs instantiated from the templates; note it in the package manifest.
6. **Roadmap discipline**: fully MVP-focused until the Growth transition; then the MVP portion freezes as history and the Growth portion activates.
7. **Growth releases**: each release ties to a specific branch; backlog items are promoted into the release and implemented as their own specs.
8. **Release files**: MVP phases are renamed **MVP releases**; MVP releases and Growth releases each get a dedicated file in a requirements folder; the roadmap links to these files and summarizes planned vs delivered.
9. **README install prompts**: copy-paste easy-install prompts for Claude, Kiro, and Antigravity in the repo-root README.
10. **CLI experience in the EDD**: `021` commands must be easy to understand and robust — automatic workflow-driven behavior plus enough manual controls and status checks for flexible project management.
11. **Interactive-question pattern**: when a `021` command needs more context, it asks an interactive question with a recommendation, alternative options, and a write-in option.
12. **Upgrade scope**: package updates deliver only template, skill, script, and hook updates to user repos.
13. **Stage-specific review templates**: Idea → filling key/guiding docs; Pre-build → refining key docs, prototype reviews, roadmap definition; MVP → code review and build testing; Growth → product review and user feedback.
14. **Feedback loop** (persona feedback): a `/021-feedback` command files feedback from user repos directly as issues in the zero-two-one GitHub repo (feedback text + repo link + one more high-value field), building the post-MVP backlog.
15. **PRD problem statement**: add doc staleness/misalignment — requirements contradict roadmap/backlog, and managing artifacts across multiple tools is daunting.
16. **PRD vision**: comprehensive, flexible structure keeping all lifecycle artifacts in sync; bootstrap design tools plus bring-your-own design system; three assistant + SSD pairings (`claude` default, `antigravity`, `kiro`) with room for more.
17. **Design-system install command**: a command to "install" the user's own design system, updating visual design and component details in the project.
18. **v2 → MVP**: all v2 backlog items move into MVP — needed at launch for multi-repo testing.

## Proposed Changes

<!-- What should change in response to each finding -->

* In the PRD problem statement, also mention how documents become stale and misaligned. Requirements docs start to contradict the roadmap and backlog. Managing all these docs, requirements and tasks becomes daunting because it’s typically handled across multiple tools. 
* Zero-two-one provides a comprehensive and flexible structure to manage all the product lifecycle artifacts and keep them in sync. It provides basic  tools to bootstrap the design but also gives flexibility to bring your own design system. There’s three core AI assistant + spec driven delivery pairings with more potential options in the future. 
* The goal a provide a structured framework with the flexibility to plugin tools that work best for individual use cases.
* The three pairs are “Claude Code + GitHub Speckit” (default), “Google Antigravity + GitHub Speckit” and “Kiro CLI + Kiro IDE”.
* Ade a command for a user to “install” their own design system. It should update any visual design or component details existing in the project.
* Add a new command that projects using the zero-two-one package can use to directly give feedback as they’re using it in their repository. When a user submits feedback via a /021-feedback command the text entered with it and a link to their repo should be added as an issue in the zero-two-one GitHub repo. If there’s one more piece of info that would be valuable add to the implementation spec for the feedback feature.
* All v2 items in the backlog should be added to MVP. They will be needed at launch for testing in a variety of other repos.

## Open Questions Raised

<!-- Anything that should land in 05-BACKLOG.md's Open Questions & Blockers register instead of being resolved here -->

## Outcome

<!-- Filled in once the round's changes are applied: which docs were edited, version bumps, date closed -->

**Applied 2026-07-12.** All 18 findings landed via the six approved plans ([prd](r4-update-prd.md) · [edd](r4-update-edd.md) · [tdd](r4-update-tdd.md) · [roadmap](r4-update-roadmap.md) · [backlog](r4-update-backlog.md) · [workflows](r4-update-workflows.md)):

- **Key docs edited:** `01-PRD.md` (problem/vision/features 1·2·7 + new Feature 8 Feedback Loop + metric), `02-EDD.md` (first dedicated round — init scenarios, CLI Experience, ask-don't-assume, feedback/design workflows, changelog), `03-TDD.md` (walkthrough+engine split, install guarantee, template neutrality, duplicate options, upgrade scope, new §10/§11, `_releases/` data model), `04-ROADMAP.md` (MVP releases + launch sequence), `05-BACKLOG.md` (v2→MVP promotion + r4 feature group).
- **New structure:** `requirements/_releases/{_INDEX,mvp-1,mvp-2,mvp-3}.md`, `templates/10-RELEASE-Template.md`, `templates/reviews/06-REVIEW-{idea,prebuild,mvp,growth}-Template.md`.
- **Process/templates/README:** init-and-migration (walkthrough + duplicate options), mvp-to-growth-transition (branch-tied releases, promotion), refinement-loop (stage-aware reviews, `_releases` cascade), product-lifecycle (EDD in Phase 1, per-phase review focus), workflows.md manifest rows; EDD-cohesion sweep of `skills/generate-{tdd,tasks}.md`; EDD template gains Core Workflows; README gains the three assistant install prompts.
- **Approvals at apply:** `021-feedback` uses the pre-filled issue-URL fallback when `gh` is absent; the three carried v2 items (MCP server, extra templates, tracker sync) stay in the Growth backlog.
- Implementation work is queued as the mvp-3 scope ([_releases/mvp-3.md](../_releases/mvp-3.md)); `npm run sync:package` run at close.

*Original outcome goals, kept for reference:*

* at the end of this round of review, I want all the feedback listed above to be added across the key docs and guiding docs.
* I want to roadmap set and ready to implement changes to the package, the full 021 tool set, workflow details, etc.
* I want to publish the package so I can pull it into other repositories to test. While I’m working in those repositories I want to use a 021-feedback command to send feedback straight to the zero-two-one repo so that feedback can be pulled into upcoming releases.
* One project I want to use this in is a Claude Code + GitHub Speckit repo with a similar structure and in the growth phase. Another uses Google antigravity + GitHub Speckit. Another uses Kiro CLI & IDE. All are at different phases of the product lifecycle.