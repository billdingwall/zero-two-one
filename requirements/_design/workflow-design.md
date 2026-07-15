# Workflow Design — Hooks & Workflows vs Project Files

*How each workflow and git hook reads from and writes to the project's files. Companion to [command-design.md](command-design.md); the canonical process narrative is [`workflow/workflows.md`](../../workflow/workflows.md).*

## 1. Git hooks

| Hook | Trigger | Reads | Effect |
|---|---|---|---|
| `hooks/pre-commit` (→ `.git/hooks/pre-commit`) | every commit on a feature branch (`NNN-feature-name`) | `specs/NNN-*/spec.md` `status:` frontmatter; staged file paths | **Blocks** the commit if implementation code is staged while the matching spec is not `Approved`/beyond. Docs, specs, and design assets are never blocked — the gate stops code, not refinement (EDD). Conflict-aware install: chains onto plain hooks, or registers with husky/lefthook (TDD §1). |

The gate is the framework's one hard enforcement point. Everything else is convention the assistant follows.

## 2. Workflows → files

| Workflow | Doc | Primarily reads | Primarily writes |
|---|---|---|---|
| **Discovery** | product-lifecycle §1 | `requirements/_notes/` | `01-PRD.md`, `02-EDD.md`, `03-TDD.md` (drafted as one set), `05-ROADMAP.md` |
| **Design** | key-docs-to-prototype, design-system-selection | PRD/EDD, `DESIGN.md` | `DESIGN.md`, `requirements/_design/tokens/`, `prototype/` (optional) |
| **Refinement Loop (RLP)** | refinement-loop | living docs + `r{n}-review.md` | `_refinement/r{n}-*.md`, then the living docs in cascade order (PRD → EDD → TDD → Roadmap → Backlog), `CODE.md` on constraint change |
| **Spec-Driven Delivery (SSD)** | spec-driven-delivery, key-docs-to-ssd | approved key docs | `specs/NNN-*/{spec,plan,tasks}.md`, implementation code, `.ai/context/` |
| **QA** | (run-qa.sh) | docs, optional `prototype/`, `specs/`, tests | QA report (stdout); no file writes |
| **Release** | mvp-to-growth-transition | `05-ROADMAP.md`, `04-BACKLOG.md` | `requirements/_releases/<id>.md`, roadmap summaries |
| **Init & Migration** | init-and-migration | target repo state, existing docs | framework surface, `requirements/` key docs, `.zero-two-one.json`, hook install |
| **Design-System Selection** | design-system-selection | `DESIGN.md`, EDD | `DESIGN.md` token map, `requirements/_design/tokens/`, `tools.design` in manifest, `prototype/` theme (if present) |
| **Prototype (optional)** | key-docs-to-prototype | PRD, EDD, `DESIGN.md` | `prototype/` static build; only after `/021-prototype` runs are prototype steps active in Design/Refinement/QA |

## 3. The manifest as shared state (`.zero-two-one.json`)

Written at repo root by init (TDD §7); read by tooling as the source of truth:

| Field | Written by | Read by |
|---|---|---|
| `phase` | init phase interview; RLP transition | `workflow-status.js` / `/021-status`; stage-aware review-template selection (RLP step 1) |
| `tools.stack` | init stack question | adapter rendering; assistant surface resolution |
| `tools.design` | `/021-design` | design-system adapter; prototype theming |
| `files` | init engine (hashes) | idempotent re-run, `--upgrade`, uninstall |
| `mode` | init | re-run behavior |

This repo **dogfoods** its own manifest: `phase: planning`, `stack: claude` (r6 — the former `prebuild` value merged into `planning`). That is why `021-status` reports Planning rather than inferring from directory contents.

## 4. Prototype: optional, not on the critical path (r5)

The prototype is **not required** for a project to progress. It is added on demand by `/021-prototype`, which generates a static prototype from the key docs and only then activates the prototype steps in the Design, Refinement (step 5), and QA workflows. Until the command runs:

- `prototype/` holds only its `_INDEX.md` scaffold.
- `workflow-status.js` does **not** gate Planning on a prototype.
- Design-System Selection re-themes the prototype only *if one exists*.
- The Planning sign-off milestone is defined around the CLI/DX experience (EDD §3), not a prototype.

## 5. File-ownership recap (enforcement, TDD §6)

| Class | Example paths | Workflow that may touch them |
|---|---|---|
| Framework-owned | `scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.claude/commands/021-*` | Init/upgrade only (never user-edited in place) |
| User-owned | `requirements/*.md`, `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md` | Discovery, RLP (content); init create-if-missing only |
| Merged | `.gitignore`, `package.json` scripts | Init additive merge |
| Generated | `.ai/context/` | SSD (rebuildable) |
