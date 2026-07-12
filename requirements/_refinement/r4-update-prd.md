# r4 Update Plan: 01-PRD.md

**Status:** Applied (2026-07-12)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 1, 4, 14, 15, 16, 17
**Target doc:** [../01-PRD.md](../01-PRD.md)

## Intent

Sharpen the product story to match the stakeholder's vision: the problem is not just agent drift but **artifact drift** (docs going stale and contradicting each other across tools), and the answer is one flexible structure that keeps every lifecycle artifact in sync — powered by an AI assistant, which is the framework's core dependency. Add the feedback loop and design-system install as product capabilities.

## Proposed Edits

### 1. Problem Statement (finding 15)

Append a second dimension to §1: even structured projects decay — requirements docs go stale and start contradicting the roadmap and backlog, and managing requirements, designs, and tasks across multiple disconnected tools becomes daunting. Misaligned docs mislead AI agents just as badly as missing ones.

### 2. Product Vision (finding 16)

Expand §2: Zero Two One provides a comprehensive, flexible structure that manages **all product-lifecycle artifacts in one repository and keeps them in sync**. It ships basic tooling to bootstrap design but supports bring-your-own design system, and offers three supported AI-assistant + spec-driven-delivery pairings (`claude` default · `antigravity` · `kiro`) with room for more. The goal: a structured framework with the flexibility to plug in the tools that work best for each team.

### 3. Core Feature 1 — AI-led init (finding 4)

Reframe: init is an **assistant-led interactive walkthrough** (rendered per stack, e.g. `/021-init`) backed by the mechanical CLI (`npx zero-two-one-init`). The walkthrough interviews the user (stack, existing structure, lifecycle phase, conflict decisions) and drives the script. State explicitly: **an LLM is the framework's core dependency — including setup.**

### 4. Core Feature 2 — Key Documents as one cohesive set (finding 1)

Reword: "PRD, **EDD**, TDD, Roadmap, and Backlog templates…" with an explicit sentence that PRD + EDD + TDD are treated as one cohesive set — every framework surface that reads or references one must include all three. Install lands them as `requirements/` in the target repo (finding 5; mechanics in TDD).

### 5. Core Feature 7 — design-system install command (finding 17)

Add to the design-system bullet: users install their own design system via a `021-design` command that updates the project's visual-design and component details (`DESIGN.md` token mapping, `requirements/_design/tokens/`, prototype) per the design-system-selection workflow.

### 6. New Core Feature 8 — Feedback Loop (finding 14)

`/021-feedback` (stack-rendered) lets any project using the package file feedback directly as a GitHub issue in the zero-two-one repo — feedback text, a link to the user's repo, plus manifest context (framework version, stack, lifecycle phase). Feeds the post-MVP backlog.

### 7. Success Metrics

Add: **Feedback volume** — issues filed via `/021-feedback` from user repos (signal that the loop works and the backlog is user-driven).

## Cascade

- EDD carries the experience for init, CLI, questions, feedback, and design install ([r4-update-edd.md](r4-update-edd.md)); TDD carries the contracts ([r4-update-tdd.md](r4-update-tdd.md)).
- Changelog entry in the PRD.
