# r4 Update Plan: 03-TDD.md

**Status:** Applied (2026-07-12)
**Date:** 2026-07-12
**Round:** r4
**Findings addressed:** 2, 3, 4, 5, 7, 8, 12, 14, 17
**Target doc:** [../03-TDD.md](../03-TDD.md)

## Intent

Architect the r4 direction: init becomes skill-led with the script as its engine, upgrades get a hard scope (templates/skills/scripts/hooks only), the conflict options become ownership rules, and two new command surfaces land (`021-feedback`, `021-design`). Plus the `requirements/_releases/` structure backing the roadmap redesign.

## Proposed Edits

### 1. §1 System Architecture — AI-led init (finding 4)

Recast component 1 as two layers:
- **Init skill/walkthrough** (stack-rendered: `/021-init` for `claude`, skill for `antigravity`, agent/steering for `kiro`): owns the interactive interview — stack, design, lifecycle phase, existing-structure review, per-conflict decisions — using the ask-don't-assume question pattern (EDD). The assistant is the driver; **an LLM is a core dependency of the framework, including setup**.
- **CLI engine (`bin/init.js`)**: the mechanical executor — file classification, merge rules, hashing, manifest writes. Runs standalone (`npx zero-two-one-init`) for bootstrap, accepting flags (`--stack`, `--design`, `--phase`, per-conflict answers) so the walkthrough can drive it non-interactively. Zero-dependency constraint unchanged.

### 2. §5 Package Manifest — key docs note (findings 2, 5)

- Add an explicit note: installing into a target repo **creates `requirements/` with the key docs (PRD, EDD, TDD, Roadmap, Backlog) instantiated from the templates** (the mapping table already covers `0N-*`; make the guarantee explicit in the manifest prose).
- State the template neutrality rule (finding 2): everything under `templates/` is **tool-agnostic**; stack-specific formatting and naming is applied at render time by the init adapter (TDD §9.1) — never authored into the templates.

### 3. §6 File Ownership — duplicate-resolution options (finding 3)

Extend the existing-doc import rule: when migrate mode finds a user doc duplicating a framework file, the walkthrough offers per file — **archive** (move to `requirements/_notes/archive/` with a pointer), **update to fit framework** (restructure in place, content preserved), or **leave alongside** (current import behavior: catalog + cross-link). Record each decision in the install manifest. Invariant stated plainly: existing files may be added to, renamed, or updated — **existing content is never removed**.

### 4. §7 Install Manifest — upgrade scope (finding 12)

Constrain `--upgrade`: package updates refresh **only** framework-owned surfaces — `templates/`, `skills/`, `scripts/`, `hooks/`, and the stack-rendered command surfaces (`.claude/commands/021-*` etc.). User-owned instantiated docs (`requirements/*.md`, guiding docs) are never touched by upgrade, matching the §6 table's "never touch" column.

### 5. New §10 — Feedback Command (finding 14)

`021-feedback` (stack-rendered) files an issue in the zero-two-one GitHub repo:
- **Payload**: feedback text · link to the user's repo · manifest context (framework `version`, `stack`, `phase`) — the "one more valuable piece" is the manifest block, attached automatically.
- **Transport**: prefer the `gh` CLI when present (`gh issue create --repo <owner>/zero-two-one`); fall back to opening a pre-filled GitHub new-issue URL (query-param template) — both preserve zero runtime dependencies and avoid handling auth tokens ourselves.
- `.github/` issue template `021-feedback.yml` shapes the incoming issues for backlog triage.

### 6. New §11 — Design-System Install Command (finding 17)

`021-design` operationalizes the design-system-selection workflow and the §9.4 adapter: select/assess/map/cascade — updates `DESIGN.md` token mapping, imports exports into `requirements/_design/tokens/`, updates component details and the prototype theme, records `tools.design` in the manifest. Supports named systems (`material-3`) and **bring-your-own** (user-supplied token export mapped to roles).

### 7. Releases structure (findings 7, 8)

Add to §2 Data Models: `requirements/_releases/<release-id>.md` — one file per release (MVP releases `mvp-1` … `mvp-3`; Growth releases `v1.x-<theme>`), carrying goal, promoted backlog items, spec links, and delivered summary. Growth releases record their **release branch**; backlog items promoted into a release are implemented as SSD specs off that branch. `04-ROADMAP.md` links to these files (structure in [r4-update-roadmap.md](r4-update-roadmap.md); process in [r4-update-workflows.md](r4-update-workflows.md)).

## Cascade

- Roadmap re-sequenced ([r4-update-roadmap.md](r4-update-roadmap.md)); backlog gains the implementation tasks ([r4-update-backlog.md](r4-update-backlog.md)).
- Changelog entry in the TDD.
