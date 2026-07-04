# Zero Two One

**An agentic product framework that takes new products from point 0 (idea) to point 1 (MVP) — and helps them grow and stabilize from there.**

Zero Two One is the foundational operating system for a product repository. It gives founders and product teams a structured starting point: living requirements documents, a project-level refinement loop, and feature delivery through [GitHub Spec Kit](https://github.com/github/spec-kit) — all wired for AI-agent execution with human decision gates.

This README serves as the high-level entry point into the product documentation ecosystem, which branches into key core documents:
- **[PRD (What & Why)](requirements/01-PRD.md)**: Product Requirements Document focusing on business logic and feature goals.
- **[TDD (How - Technical)](requirements/02-TDD.md)**: Technical Design Document focusing on system architecture.
- **[EDD (How - Experience)](requirements/EDD.md)**: Experience Design Document focusing on overall UX strategy and interaction architecture.
- **[DESIGN.md (Design Tokens)](DESIGN.md)**: A machine-readable guiding document located in the root, defining the design tokens, color palettes, and typography for UI consistency.

## How it works

The framework runs a **4-phase lifecycle** driven by two connected workflows:

| Phase | Focus | Workflow |
|---|---|---|
| 1 — Planning (Zero) | PRD, TDD, Roadmap in `requirements/` | Discovery |
| 2 — Pre-build | Design system + static prototype, iterated via review rounds | Design + Refinement |
| 3 — MVP Build (One) | Features specified and implemented via Spec Kit in `specs/` | Speckit Implementation + QA + Release |
| 4 — Growth | Feedback/analytics re-enter the refinement loop; enhancements ship via Spec Kit | All of the above, continuously |

**Project-level changes** (what the product *is*) flow through the refinement loop in `requirements/_refinement/`. **Feature-level changes** (building it) flow through Spec Kit on `NNN-feature-name` branches. The full process — Discovery, Design, Refinement, Speckit Implementation, QA, Release — is documented in [`workflow/workflows.md`](workflow/workflows.md).

### The refinement gate

The framework's central enforcement: **no implementation code lands until the feature's spec is approved.** Every `specs/NNN-feature-name/spec.md` carries a lifecycle status (`Draft → In Review → Approved → Ready for Dev → In Progress → Done`). The installed `pre-commit` hook blocks implementation commits on feature branches unless the status is `Approved` or beyond. Docs, specs, and design assets are never blocked — the gate stops code, not refinement.

## Quick start

```sh
# In a new (or existing) repository:
npx zero-two-one-init

# Install Spec Kit slash commands for your agent (Claude Code shown):
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai claude
```

Then:

1. Fill in `requirements/01-PRD.md`, `02-TDD.md`, and `03-ROADMAP.md` (your AI assistant can drive this from `templates/`).
2. Ask your assistant to record the current lifecycle phase in its memory, and update `CLAUDE.md` + this README with project specifics.
3. Check where you stand any time: `npm run status`.

## Tooling reference

| Command | Purpose |
|---|---|
| `npm run status` | Detect the current lifecycle phase from repo state |
| `npm run qa` | Phase-appropriate QA suite (docs → prototype → tests/a11y/spec compliance) |
| `npm run spec:status -- list` | All feature specs with status and gate state |
| `npm run spec:status -- set <spec> <status>` | Advance a spec through its lifecycle |
| `npm run spec:context` | Pull the active feature's Spec Kit artifacts into AI-readable bundles (`.ai/context/`) |
| `npm run spec:verify` | Spec compliance audit — gate status, artifact completeness, unresolved clarifications, task truthfulness (`--gate`, `--json`) |

## AI agent integration

- **`skills/tools.json`** — tool schemas (Anthropic tool-use format) for `fetch_speckit_context`, `verify_spec_compliance`, and `set_spec_status`, each mapped to a local CLI.
- **`skills/*.md`** — step-by-step skills the agent follows for context fetching, compliance verification, component generation, and doc generation.
- **`.ai/context/`** — generated per-feature context bundles: one markdown file an agent loads in a single read, plus a structured JSON artifact (status, gate state, acceptance criteria, data-model entities, task progress). Gitignored; rebuild with `npm run spec:context`.
- **`CLAUDE.md` / `AI_CODING_GUIDELINES.md`** — session context and the coding constitution that governs all generated work.

## Repository structure

```
requirements/     PRD, TDD, Roadmap, tracking + _refinement/ rounds, _design/, _notes/
prototype/        Static prototype for design review (Phase 2)
specs/            Spec Kit feature artifacts (NNN-feature-name)
.ai/context/      Generated agent context bundles (gitignored)
workflow/         workflows.md (canonical process), overview, manifest, personas
skills/           AI skills + tools.json agent tool schemas
scripts/          speckit/ (status, context, verify), status, QA
hooks/            pre-commit refinement gate (installed to .git/hooks by init)
templates/        Document templates (PRD, TDD, roadmap, reviews, personas)
bin/init.js       The zero-two-one-init scaffolder
```

## Dependencies

The framework itself is dependency-free at runtime (Node built-ins only) and stack-agnostic — it imposes no frontend framework on the product you build with it.

### Required

| Dependency | Version | Used for |
|---|---|---|
| [Node.js](https://nodejs.org) | ≥ 18 | All lifecycle scripts (`scripts/`, `bin/init.js`) |
| [Git](https://git-scm.com) | ≥ 2.30 | Branch↔spec mapping, pre-commit refinement gate |
| POSIX shell (`sh`) | — | `run-qa.sh`, git hooks (on Windows, use Git Bash/WSL) |

### Required for Spec Kit feature delivery (Phase 3+)

| Dependency | Install | Used for |
|---|---|---|
| [uv](https://docs.astral.sh/uv/) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` | Installing/running the Spec Kit CLI |
| [Spec Kit (`specify`)](https://github.com/github/spec-kit) | `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` | `/speckit-*` slash commands, spec templates |
| An AI coding agent | e.g. [Claude Code](https://claude.com/claude-code) | Executes the skills, spec pipeline, and implementation |

No Speckit API keys are required — Spec Kit runs locally through your agent; the agent itself authenticates per its own setup (e.g. a Claude subscription or `ANTHROPIC_API_KEY` for Claude Code).

### Optional

| Dependency | Used for |
|---|---|
| [pa11y-ci](https://github.com/pa11y/pa11y-ci) or axe | Wire into `scripts/run-qa.sh` Phase 3 accessibility checks |
| A test runner (Jest/Vitest/etc.) | `npm test` in the consuming repo — `run-qa.sh` calls it when present |
| React/Astro/other UI stack | Peer of the *consuming* product only; chosen in your TDD, not imposed by the framework |

## TODOs for a new project

- [ ] Fill out key documents in `requirements/`
- [ ] Define the project architecture and roadmap
- [ ] Set up baseline CI (run `npm run qa && npm run spec:verify` once a stack is chosen)
