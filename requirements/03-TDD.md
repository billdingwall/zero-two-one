# Technical Design Document (TDD): Zero Two One

## 1. System Architecture

The framework consists of five main technical components (the fifth, the Workflow Manager, is added in r6 — §13). **An LLM is a core dependency of the framework — including setup**: init is assistant-led, with the CLI as its mechanical engine.

1. **The Init Walkthrough (stack-rendered skill/command)**: `/021-init` for `claude`, an `021-init` skill for `antigravity`, agent/steering for `kiro` (§9.2). Owns the interactive interview — stack, design system, lifecycle phase, existing-structure review, per-conflict decisions — using the ask-don't-assume question pattern (EDD §4). The walkthrough explains the plan, collects answers, and drives the CLI engine non-interactively via flags.
2. **The CLI Engine (`bin/init.js`)**: A zero-dependency Node.js script that constructs the user workspace from clean templates — file classification, merge rules, hashing, manifest writes. Runs standalone (`npx zero-two-one-init`) for bootstrap, accepting flags (`--stack`, `--design`, `--phase`, per-conflict answers) so the walkthrough can drive it. **Interim v1 guards (r7, ahead of the full Init v2 engine):** validates arguments (`--help`/`--version`, rejects unknown flags and `-`-prefixed targets), creates user-owned docs and installs `.claude/commands/` create-if-missing (existing files never overwritten), and backs up an existing `.git/hooks/pre-commit` before installing the gate. It runs in one of two modes, decided at startup:
   - **Scaffold mode** — the target has no framework install and no meaningful pre-existing content in the paths init touches.
   - **Migrate mode** — auto-detected when any of the following exist: `README.md` or other guiding docs, `requirements/`, `.specify/` or a populated `specs/`, an existing `.git/hooks/pre-commit`, or a prior `.zero-two-one.json`. Migrate mode applies the ownership rules (§6) and runs the detection/interview flow (§8).
3. **The Refinement Gate (`hooks/pre-commit`)**: A bash script installed into `.git/hooks/` that parses Markdown frontmatter in `specs/` to determine approval status. Installation is conflict-aware:
   - No existing hook → install directly (current behavior).
   - Existing plain `pre-commit` → install the gate as `.git/hooks/pre-commit.zto` and append a guarded invocation line to the existing hook.
   - Hook manager detected (`.husky/`, `lefthook.yml`) → add the gate invocation to the manager's config instead of touching `.git/hooks/` directly.
   - Never silently overwrite; `--dry-run` shows which strategy will be used.
4. **Lifecycle Tooling (`scripts/`)**: Node.js scripts for fetching context, verifying compliance, and determining project status.
5. **The Workflow Manager (§13)**: an advisory, post-commit / assistant-side state-sync that keeps the manifest `phase` and backlog/roadmap/release status aligned as work lands. Never in the blocking commit path; never auto-commits. Defined here in r6; **built in mvp-3** alongside the manifest engine.

## 2. Data Models
State is managed entirely in text files (Markdown frontmatter and JSON):
- `specs/*/spec.md`: Tracks feature lifecycle status (`status: Draft | In Review | Approved | Ready for Dev | In Progress | Done`).
- `.ai/context/*.json`: Derived artifacts combining spec criteria and gate state for AI consumption.
- `requirements/_releases/<release-id>.md`: One file per roadmap release (MVP releases `mvp-1` … `mvp-3`; Growth releases `v1.x-<theme>`), carrying goal, promoted backlog items, spec links, and a delivered summary. Growth releases record their **release branch**; backlog items promoted into a release are implemented as SSD specs off that branch. `05-ROADMAP.md` keeps per-release summaries and links to these files.
- `requirements/_architecture/`: architecture diagrams, expanded data models, and decision records (ADRs) that back this TDD. **Boundary (r6):** the TDD keeps the decisions and their summary (it stays one third of the cohesive PRD/EDD/TDD set); `_architecture/` holds the supporting detail the TDD links into. Created on first use (empty scaffold + `_INDEX.md`).

## 3. Technical Constraints & Decisions
- **Zero Runtime Dependencies**: The framework must run on built-in Node.js modules (`fs`, `path`, `child_process`) and standard POSIX shell utilities. We do not want to bloat the user's `node_modules` with framework tooling.
- **Dual-Workspace Dogfooding**: The repository maintains a boundary between internal development (root) and the distributable template (`package/`). A sync script (`scripts/sync-to-package.js`) bridges them and must implement the Package Manifest (section 5) — including excluding itself and any future dev-only scripts from `package/scripts/`. Any change to what ships requires updating the manifest first.

## 4. Assistant Integration (default stack: `claude`)
The assistant role is stack-resolved (§9); this section documents the default `claude` binding.
- Uses `.claude/commands/` for custom slash commands (`/021-init`, `/021-status` — see the naming convention, §6). `init.js` copies `.claude/commands/` into the target repo, merge-safe: existing user commands with the same name win, and skips are reported.
- Uses `tools.json` (MCP or Anthropic tool schemas) mapped to local Node scripts for verifying specs and fetching context.
- **Spec Kit detection**: if `.specify/` or a spec-bearing `specs/` exists in the target, init validates spec frontmatter compatibility with the gate (a `status:` field readable by `verify-spec-compliance.js`), reuses the existing setup, and suppresses the `specify init` next-step guidance.

## 5. Package Manifest

The canonical contract for what crosses the root ↔ `package/` boundary. `scripts/sync-to-package.js` enforces this manifest.

### Ships in the package (synced from root)
| Path | Notes |
|---|---|
| `bin/` | CLI scaffolder (`init.js`) |
| `hooks/` | Refinement gate (`pre-commit`) |
| `templates/` | Starting-point templates, including guiding-doc templates |
| `workflow/` | Lifecycle, refinement, and SSD process docs |
| `skills/` | Agent prompts and `tools.json` |
| `scripts/` | Lifecycle tooling only — dev-only scripts excluded (`sync-to-package.js`, `check-links.js`) |
| `.claude/commands/` | Claude slash commands — **single-sourced from root** (r9/W2); no longer a package-only copy |
| `.ai/` | **Empty** `context/` scaffold only — generated bundles never ship (r7) |
| `.github/` | Issue templates only — CI `workflows/` excluded (r7) |
| `README.md`, `LICENSE`, `.gitignore` | Starting-point files (r7: LICENSE added) |

**Not shipped:** `prototype/` (r7 — generated on demand by `021-prototype`, §12) and `specs/` (r9/P1 — the framework's own internal feature specs are never installed, since the engine excludes `specs/` from the install surface, §6; shipping them was pure tarball bloat). Whether init seeds an empty `specs/_INDEX.md` into a user repo (template-instantiated, user-owned) is an open question for the mvp-4 source-layer spec.

### Package-only (never overwritten by sync)
| Path | Notes |
|---|---|
| `package/package.json` | Publish config (`files`, `publishConfig`, cleaned scripts) |

### Root-only (development workspace, excluded from sync)
| Path | Notes |
|---|---|
| `requirements/` | This framework's own living docs |
| `.021-updates/` | Internal audits and proposals (archived — tombstoned, r7) |
| `scripts/sync-to-package.js`, `scripts/check-links.js` | Dev-only tooling — users never sync a package |
| `.github/workflows/` | CI governs this repo, not scaffolded projects (r7) |
| `CONTRIBUTING.md` | Contribution flow for this repo, not shipped to user projects |
| `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md` | Root instances are dogfooding content; the package delivers their `templates/*-Template.md` counterparts instead |
| `.ai/context/` (generated bundles) | Generated, gitignored artifacts — only the empty scaffold ships |

### Template → install mapping
Guiding docs are delivered as templates and instantiated by `bin/init.js` in the user's repo:
`templates/CLAUDE-Template.md` → `CLAUDE.md` · `templates/CODE-Template.md` → `CODE.md` · `templates/PRODUCT-Template.md` → `PRODUCT.md` · `templates/DESIGN-Template.md` → `DESIGN.md` · `templates/README-Template.md` → `README.md` · `templates/0N-*-Template.md` → `requirements/0N-*.md` (key docs: `01-PRD`, `02-EDD`, `03-TDD`, `04-BACKLOG`, `05-ROADMAP` — r6 numbering).

- **Install guarantee (r4)**: installing into a target repo **creates `requirements/` with the key docs — PRD, EDD, TDD, Roadmap, Backlog — instantiated from the templates** (create-if-missing in migrate mode, per §6).
- **Template neutrality (r4)**: everything under `templates/` is **tool-agnostic**. Stack-specific formatting and naming is applied at render time by the init adapter (§9.1) — never authored into the templates.

## 6. File Ownership & Merge Rules

The enforcement contract for both init modes. The Package Manifest (§5) defines what ships; this section defines how it lands.

| Class | Paths | Install | Re-run | Upgrade |
|---|---|---|---|---|
| **Framework-owned** | `scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/`, `.claude/commands/` | copy | overwrite only if unmodified vs manifest hash; else report conflict | same |
| **User-owned, instantiated** | `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`, `requirements/*.md` | create-if-missing | never touch | never touch |
| **Merged** | `.gitignore`, `package.json` (scripts) | additive merge | idempotent | idempotent |
| **Generated** | `.ai/context/` | provision empty | leave | leave |

- `--force <path>` is the only way to overwrite user-owned files.
- `--dry-run` prints the classified action plan (create / skip / merge / conflict per file) and exits without changing anything.
- **Existing-doc import**: when a user-owned doc already exists, init writes `requirements/_notes/imported-docs.md` cataloging what was found (path + description slot), and the fresh templates link to it — existing content is referenced, never moved or rewritten.
- **Duplicate resolution (r4)**: when migrate mode finds a user doc duplicating a framework file, the walkthrough offers per file — **archive** (move to `requirements/_notes/archive/` with a pointer left behind), **update to fit framework** (restructure in place; content preserved), or **leave alongside** (the import behavior above: catalog + cross-link). Each decision is recorded in the install manifest. Invariant: existing files may be added to, renamed, or updated — **existing content is never removed**.
- **Framework naming convention (r3)**: every framework-owned name installed into a shared namespace follows `021-<name>` (lowercase kebab-case after the prefix; `:` reserved for npm subcommand grouping, e.g. `021-spec:status`; bare `021` only where a tool requires a single identifier). The rule is authored in `CODE.md` §2 and enforced structurally here: in shared directories, framework-owned paths are **stack-resolved and 021-scoped** (`.claude/commands/021-*` for `claude`; `.agents/skills/021-*` for `antigravity`; `.kiro/steering/021-*` + `.kiro/agents/021.json` for `kiro`), so user files in the same directories are untouchable by definition. Lifecycle npm scripts: `021-status`, `021-qa`, `021-spec:status`, `021-spec:context`, `021-spec:verify`. `zero-two-one-init` and `.zero-two-one.json` already comply.

## 7. Install Manifest (`.zero-two-one.json`)

Written to the **target repo root** at install (user-visible state, not a generated artifact):

```json
{
  "version": "<package version>",
  "installedAt": "<ISO date, first install>",
  "updatedAt": "<ISO date, last re-run/upgrade>",
  "mode": "scaffold | migrate | source",
  "phase": "planning | mvp | growth",
  "tools": {
    "stack": "claude | antigravity | kiro",
    "assistant": "claude-code | antigravity | kiro",
    "ssd": "github-speckit | kiro-specs",
    "design": "none | material-3 | <system>"
  },
  "files": { "<framework-owned path>": "<sha256 of LF-normalized content at install>" },
  "merged": { "<merged file>": ["<framework-contributed entry>", "..."] }
}
```

- Basis for **idempotent re-runs** (skip anything present and unmodified), **`--upgrade`** (refresh framework-owned files whose hash still matches install; list conflicts otherwise), and a documented **uninstall** (delete files still matching their hash; list the rest for manual review).
- **Upgrade scope (r4)**: `--upgrade` refreshes **only** framework-owned surfaces — `templates/`, `skills/`, `scripts/`, `hooks/`, and the stack-rendered command surfaces (`.claude/commands/021-*` etc.). User-owned instantiated docs (`requirements/*.md`, guiding docs) are never touched by upgrade, matching the §6 "never touch" column.
- `workflow-status.js` reads `phase` from the manifest when present, instead of inferring from directory contents (**implemented and dogfooded in this repo** — `.zero-two-one.json` at the framework root sets `phase: planning`, r6). Inference is the fallback only when no manifest exists, and it no longer treats a prototype as required (prototype is optional, §12). **Phase enum (r6):** `{ planning, mvp, growth }` — the former `prebuild` value is merged into `planning` and kept only as a back-compat alias in the status reader.
- **QA contract (r7):** `workflow-status.js --json` emits `{ phase, status, source }`. Consumers (`scripts/run-qa.sh`, CI) read this machine-readable output — **never** scrape the human-readable block. Once the mvp-3 manifest write lands, `run-qa.sh` and `hooks/pre-commit` resolve phase/stack through a single parser in `scripts/speckit/lib.js`, permanently retiring the output-scraping coupling that caused the r6 `run-qa.sh` phase regression.
- **`mode: source` (r5)**: the self-referential case for the framework's own repo, which is the source rather than an init target (`scaffold`/`migrate` both imply init ran on someone else's project). Init v2 **regenerates this repo's own manifest** — including the full `files` hash inventory — so the framework dogfoods its own manifest end-to-end rather than relying on the hand-authored `files: {}` stub (mvp-3).
- `assistant`/`ssd` are **derived from `stack`** (kept for per-role tooling and r2 compatibility); `design` is chosen independently of the stack (§9.4). Additive since r2 — no schema break.
- **Merge-engine fields (mvp-3, spec [`001-safe-install-engine`](../specs/001-safe-install-engine/spec.md)):** three additive members, no break. (a) **`updatedAt`** — refreshed on every re-run/`--upgrade`; `installedAt` is written once and preserved. (b) **`files` is framework-owned only** and hashed over **LF-normalized** content, so a Windows/`autocrlf` checkout doesn't spuriously conflict (user-owned/merged/generated classes are not hashed). (c) **`merged`** — records the entries the engine contributed to each merged file (`.gitignore` lines, `package.json` script keys), so a re-run distinguishes "never added" from "added then removed" and respects a user's deletion.

- **State-store boundary (r9, normative):** the framework has exactly **two durable state stores**, read through **one parser** (`scripts/speckit/lib.js` — `manifestFacts`/`readStatus`): this manifest (project identity + lifecycle phase + stack) and spec `status:` frontmatter (work-item state, the gate's input, §9.3). A **third, agent-writable state store (e.g. a `.workflow/state.json`) is explicitly rejected** — it reintroduces the multi-parser split-brain drift that specs 003/004 eliminated. Refinement-round state rides existing machinery: `status:` frontmatter on `_refinement/r{n}-*.md`, surfaced advisorily by `021-doctor` (§13). Runtime write-gates for non-git-hook assistants and a `.workflow/` scoped-loop engine are Growth-phase candidates, not MVP.

## 8. Migrate-Mode Detection & Phase Interview

- **Heuristics first**: tests + CI + release history → likely Growth; code present but no framework docs → likely mid-MVP; otherwise Planning.
- **Then confirm**: interactive prompt via `node:readline`, or `--phase <phase>` for non-interactive runs (`planning | mvp | growth`).
- **Stack detection (r3)**: existing tool surfaces propose the matching stack — `.claude/` → `claude`; `.agents/` or `AGENTS.md` → `antigravity`; `.kiro/` → `kiro`; `.specify/`/populated `specs/` confirms `github-speckit`. Conflicting surfaces (e.g. both `.claude/` and `.kiro/`) → the interview decides; detection lists what was found. Non-interactive: `--stack` and `--design` flags.
- **Growth entry** scaffolds `05-ROADMAP.md`/`04-BACKLOG.md` in post-transition shape per `workflow/specific-workflows/mvp-to-growth-transition.md` (Releases section active, MVP section historical) and records the phase in the manifest.
- Zero-runtime-dependency constraint holds throughout: hashing via `node:crypto`, prompts via `node:readline` — no new packages.

## 9. Adapter Architecture & Contracts

The framework runs on one of **three supported stacks** (free assistant × SSD pairing is out of scope — r3 stakeholder direction), plus an independent design-system role. Bindings here are normative; process docs (layer 3) reference roles only.

### 9.1 Source layer (tool-neutral)

`templates/ASSISTANT-Template.md` (generalized from `CLAUDE-Template.md`; **`AGENTS.md` is the neutral default output name**), `skills/*.md` prompts, the key docs, and `skills/tools.json` schemas. Renderers are template transforms in `bin/init.js` — built-in `fs`/`path` only, YAML frontmatter emitted as plain text (zero-dependency constraint holds).

The **install surface itself is stack-parameterized** (r9): `classes.js`/`sources.js` resolve which dirs and guiding docs install from the manifest `tools.stack` — only the chosen stack's Layer-2 surface is written (repo-refactor §3.1). The **shared command contract across all stacks is the `021` CLI** (`bin/021` — `021 status|qa|doctor|spec …`, a built-in-only dispatcher over the existing scripts; npm scripts stay as aliases). Every adapter's rendered instructions (Claude commands, Antigravity `SKILL.md`, Kiro steering) reference `021 …`, so all three stacks issue identical commands — the deterministic POSIX surface without a Makefile dependency (r9; replaces the audit's Makefile proposal).

> **Name disambiguation (r9, open — spec 009 clarify):** the bare token `021` is now claimed twice — this shell CLI (`bin/021`) and the Kiro **agent** identifier `.kiro/agents/021.json` "invoked as `021`" (§9.2). They live in different invocation contexts (a PATH binary vs Kiro's agent runner), but the shared spelling is a footgun. Spec 009 decides the CLI's actual bin name against the naming convention's "bare `021` only where a tool requires a single identifier" clause (§6) — candidates `021` / `zto` / `zero-two-one`; if the CLI takes a distinct name, the adapter-instruction references above and the PRD §4.7 Kiro row update in the same spec.

### 9.2 Supported stacks

All command surfaces follow the naming convention (§6):

| Stack | Instructions | Skills/commands (021-namespaced) | SSD engine |
|---|---|---|---|
| `claude` (default) | `CLAUDE.md` | `skills/*.md` as-is; `.claude/commands/021-init.md`, `021-status.md` → `/021-init`, `/021-status` | `github-speckit` |
| `antigravity` | `AGENTS.md` (project root; `GEMINI.md` honored) | `.agents/skills/021-<name>/SKILL.md` (+ `scripts/`, `references/`, `assets/`); MCP via `~/.gemini/config/mcp_config.json`; artifact-review gate noted | `github-speckit` |
| `kiro` | `.kiro/steering/021-{product,tech,structure}.md` with YAML frontmatter inclusion modes (`always` for product/tech; `fileMatch` where scoped) | `skill://` resources; `.kiro/agents/021.json` CLI agent, invoked as `021` (`prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks`) | `kiro-specs` |

Steering mapping for `kiro`: `PRODUCT.md` → `021-product.md`; `CODE.md` + TDD constraints → `021-tech.md`; `workflows.md` structure summary → `021-structure.md` — namespaced filenames so existing user steering is never clobbered.

### 9.3 SSD engine contract

Every engine must expose: (a) **durable committed spec state** readable by the gate, (b) a context source for `021-spec:context`, (c) a verify surface for `021-spec:verify`.

- `github-speckit`: `specs/NNN-*/spec.md` `status:` frontmatter — native. Serves the `claude` **and** `antigravity` stacks: Antigravity's task lists / implementation plans / walkthroughs are session artifacts, not durable spec state, so Spec Kit holds the gate-readable state while Antigravity drives.
- `kiro-specs`: `.kiro/specs/<feature>/{requirements,design,tasks}.md` (EARS notation); adapter injects `status:` frontmatter into `requirements.md` (Kiro tolerates extra frontmatter); task progress derived from `tasks.md` checkboxes; `scripts/speckit/*` gain an engine-dispatch layer (read engine from the manifest, resolve paths/state accordingly). Serves the `kiro` stack.

### 9.4 Design-system adapter contract (independent of stack)

`DESIGN.md` carries a structured **token mapping** section: project decisions expressed as system-token role assignments; exported artifacts checked into `requirements/_design/tokens/`; the prototype consumes the CSS variables, so a system swap re-themes without touching key docs.

- `none` (default): bespoke `DESIGN.md` tokens — current behavior.
- `material-3`: roles map to `md.sys.*` tokens (tiers `md.ref`/`md.sys`/`md.comp`; color/typography/shape/elevation/motion); Material Theme Builder exports (JSON/CSS variables/DSP) stored and referenced; M3 Expressive component/motion implications surfaced by the [design-system-selection workflow](../workflow/specific-workflows/design-system-selection.md).

## 10. Feedback Command (`021-feedback`)

Stack-rendered command that files feedback from a user's repo as an issue in the zero-two-one GitHub repo:

- **Payload**: feedback text · link to the user's repo · manifest context (framework `version`, `stack`, `phase`) — the manifest block is the extra high-value field, attached automatically.
- **Transport**: prefer the `gh` CLI when present (`gh issue create --repo billdingwall/zero-two-one`); otherwise fall back to opening a **pre-filled GitHub new-issue URL** (`https://github.com/billdingwall/zero-two-one/issues/new?...`, query-param template). Both preserve zero runtime dependencies and keep auth entirely on GitHub's side — the framework never handles tokens. The destination repo slug (`billdingwall/zero-two-one`) is a build-time constant in the command template.
- `.github/ISSUE_TEMPLATE/021-feedback.yml` shapes incoming issues for backlog triage; feedback issues are pulled into refinement rounds (Growth reviews) and promoted to releases from there.

## 11. Design-System Install Command (`021-design`)

Operationalizes the design-system-selection workflow over the §9.4 adapter — select / assess / map / cascade:

- Updates the `DESIGN.md` token-mapping section; imports exported artifacts into `requirements/_design/tokens/`; updates component details and the prototype theme; records `tools.design` in the manifest.
- Supports named systems (`material-3`) and **bring-your-own**: a user-supplied token export mapped onto the framework's role assignments.

## 12. Optional Prototype Command (`021-prototype`)

The prototype is an **opt-in** artifact, not a lifecycle prerequisite (r5). `021-prototype` (stack-rendered) generates it on demand:

- **Generate**: reads the key docs (PRD/EDD) and `DESIGN.md` tokens; produces a static HTML/CSS/JS prototype under `prototype/` consuming the design-system CSS variables (so a later `021-design` swap re-themes it).
- **Wire in**: on first successful run it activates the prototype steps that are otherwise inert — Design workflow prototype build, Refinement Loop step 5 (prototype update), and the `021-qa` prototype tier. Presence is detected by `prototype/` holding more than its `_INDEX.md` scaffold.
- **Until run**: no command, script, or gate depends on a prototype. `workflow-status.js` does not gate Planning on one (§7); the Planning sign-off milestone is defined around the CLI/DX experience (EDD §3). This removes the r4-era unschedulable-exit-gate conflict (r5 audit finding 2).
- Zero-runtime-dependency constraint holds: generation is template/string assembly via built-in `fs`/`path`, driven by the assistant.

## 13. Workflow Manager (state-sync) — r6

A **fifth** technical component (§1): keeps lifecycle state consistent as work lands, so the manifest and the docs don't drift the way they did before r5.

- **Role**: after commits land or a phase changes, reconcile the manifest `phase`, the `04-BACKLOG` statuses, the `05-ROADMAP` release rows, and the `_releases/*` delivered summaries against actual repo state; surface or apply the corrections.
- **Guardrails (normative)**: advisory / corrective only — **never in the blocking commit path** (that stays the deterministic `pre-commit` refinement gate, §1/§3) and **never auto-commits** (it edits the working tree; the human commits). It is assistant-side or a post-commit helper, not a `pre-commit` gate.
- **Advisory doc-sync**: the non-blocking BACKLOG-vs-work drift check lives here too — it warns when spec/backlog status and committed work diverge, but never blocks.
- **Zero runtime dependencies**: built-in `fs`/`path` (+ `node:child_process` for git reads); no packages.
- **Delivery (r7)**: **read-only reporter first** — mvp-3 ships drift *detection* with proposed diffs (a `021-doctor`-style report; no auto-apply). Applying working-tree corrections is a later increment once the report is trusted. Guardrails above hold at every increment.

## 14. Publish Pipeline (mvp-6) — r7

Publishing is **CI-only, tag-triggered**, never a local one-liner:

- Trigger: a version tag pushes; the workflow runs `npm run sync:package -- --check` (fail on drift), then `npm publish --provenance` from `package/`.
- **Pre-publish gate** (fails the pipeline): a dangling `"main"`, a missing `LICENSE`, any `.ai/context` generated bundle in the tarball, or unresolved Markdown links. These encode the r7 audit's package findings as the release's own checks.
- `npm run publish:package` remains only as a documented manual fallback (not the primary path).
- **API surface (open, decide mvp-4):** `"main"` is removed from both manifests now (no dangling entry). Whether to expose a programmatic surface — `require('zero-two-one/speckit')` over `scripts/speckit/lib.js` via `exports` — is decided with the adapter seam in mvp-4; until then the package is CLI/content-only.

## Changelog
- **2026-07-16 (r9):** §5 package manifest — `specs/` no longer shipped (framework's own internal specs, never installed; P1) and `.claude/commands/` single-sourced from root (W2); §9.1 — install surface is stack-parameterized + the **`021` CLI** shared command contract (replaces the Makefile idea); §7 — normative **state-store boundary** (two stores, one parser; a parallel `.workflow/state.json` is rejected). Per [_refinement/r9-review.md](_refinement/r9-review.md) (source: [_notes/repo-refactor.md](_notes/repo-refactor.md)).
- **2026-07-15 (mvp-3, spec 001):** §7 manifest gains three additive fields from the safe-install-engine spec — `updatedAt` (preserve `installedAt`, refresh on re-run/upgrade), framework-owned-only + LF-normalized `files`, and a `merged` contribution record (respects user deletions). No schema break. Per [specs/001-safe-install-engine](../specs/001-safe-install-engine/spec.md).
- **2026-07-15 (r7):** §1 CLI Engine gains the interim v1 guards; §5 manifest updated (drop `prototype/` + generated `.ai` bundles + CI workflows from the package; add `LICENSE`, `CONTRIBUTING.md` root-only, `check-links.js` dev-only); §7 QA contract (`--json`, single-parser rule); §13 Workflow Manager → read-only reporter first; new **§14 Publish Pipeline** (CI-only, provenance, pre-publish gate) + `main`-removal / API-decision-at-mvp-4. Per [_refinement/r7-review.md](_refinement/r7-review.md).
- **2026-07-15 (r6):** Lifecycle enum → `{ planning, mvp, growth }` (§7; `prebuild` merged into Planning); §2/§5/§8 key-doc numbering swapped to `04-BACKLOG`/`05-ROADMAP`; `_architecture/` boundary added (§2); new **§13 Workflow Manager** (fifth §1 component, built mvp-3); §12 Pre-build references → Planning sign-off milestone. Per [_refinement/r6-review.md](_refinement/r6-review.md).
- **2026-07-12 (r5):** §10 feedback repo slug resolved to `billdingwall/zero-two-one`; §7 manifest-read implemented and dogfooded (`.zero-two-one.json` at root) with prototype dropped from inference; new §12 Optional Prototype Command (`021-prototype`). Per [_refinement/r5-review.md](_refinement/r5-review.md).
- **2026-07-12 (r4):** §1 recast as walkthrough + engine (AI-led init; LLM a core dependency); §2 gains `requirements/_releases/` release files; §5 install guarantee + template neutrality; §6 duplicate-resolution options (archive/update/leave-alongside) with content-preservation invariant; §7 upgrade scope limited to templates/skills/scripts/hooks + command surfaces; new §10 (`021-feedback`) and §11 (`021-design`). Per [_refinement/r4-update-tdd.md](_refinement/r4-update-tdd.md).
- **2026-07-10 (r3):** §4 generalized to Assistant Integration (default stack `claude`); new §9 Adapter Architecture (three supported stacks, SSD engine contract, design-system adapter); §7 `tools` block gains `stack`/`design`; §8 stack detection; §6 framework naming convention (`021-`). Per [_refinement/r3-update-tdd.md](_refinement/r3-update-tdd.md).
- **2026-07-10 (r2):** Two-mode CLI (§1), conflict-aware hook install (§1), merge-safe `.claude/commands/` delivery + Spec Kit detection (§4), new §6 File Ownership & Merge Rules, §7 Install Manifest (root location confirmed), §8 Migrate-Mode Detection. Per [_refinement/r2-update-tdd.md](_refinement/r2-update-tdd.md).
- **2026-07-10 (r1):** Added Package Manifest (section 5); amended Dual-Workspace Dogfooding constraint to bind the sync script to the manifest. Per [_refinement/r1-update-tdd.md](_refinement/r1-update-tdd.md).
