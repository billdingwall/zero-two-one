# Getting Started with Zero Two One — Google Antigravity

*A step-by-step guide for developers consuming the `zero-two-one` package on the **`antigravity` stack**: Google Antigravity as the assistant, GitHub Spec Kit as the spec-driven-delivery (SSD) engine. Antigravity's own task lists / implementation plans / walkthroughs are session artifacts — **Spec Kit holds the durable, gate-readable spec state** while Antigravity drives.*

---

## 0. Prerequisites

| Dependency | Version | Why |
|---|---|---|
| Node.js | ≥ 18 | All lifecycle scripts — zero runtime npm dependencies |
| Git | ≥ 2.30 | The pre-commit refinement gate |
| POSIX `sh` | — | `run-qa.sh`, git hooks |
| Google Antigravity | — | The assistant; reads `AGENTS.md` + `.agents/skills/` |
| [uv](https://docs.astral.sh/uv/) + [Spec Kit](https://github.com/github/spec-kit) | — | Spec pipeline for feature delivery (Phase 1+) |

> **Package availability:** npm publish is scheduled for mvp-6. Until then, install from a checkout:
>
> ```sh
> git clone https://github.com/billdingwall/zero-two-one.git
> npm install -g ./zero-two-one/package     # registers `zero-two-one-init` and `021`
> ```

## 1. Install the framework

Paste into Antigravity inside the target repository:

> Install the zero-two-one framework in this repository. Run `npx zero-two-one-init --dry-run` first and review the plan with me, then run `npx zero-two-one-init` with stack `antigravity` and walk me through the setup questions (design system, lifecycle phase, and any file conflicts) one at a time with a recommendation for each. When done, read `.zero-two-one.json` and `AGENTS.md`, then report the lifecycle phase with `npx 021 status`.

Or directly:

```sh
npx zero-two-one-init --dry-run --stack antigravity
npx zero-two-one-init --stack antigravity
```

Migrate mode auto-detects an existing `.agents/` directory or `AGENTS.md` and proposes the `antigravity` stack.

### What lands (antigravity stack)

| Surface | Contents |
|---|---|
| `AGENTS.md` | The assistant entrypoint, rendered from the neutral `templates/ASSISTANT-Template.md`. **If your repo already has a `GEMINI.md`, it is honored as the entrypoint instead** — the render targets the file Antigravity actually reads |
| `.agents/skills/021-<name>/SKILL.md` | The full skills surface — **13 skills**: the 8 framework skill prompts (`021-generate-prd`, `021-generate-edd`, `021-generate-tdd`, `021-generate-backlog`, `021-generate-frontend-component`, `021-fetch-speckit-context`, `021-verify-spec-compliance`, `021-check-framework-compliance`) **plus** the 5 lifecycle commands rendered as skills (`021-init`, `021-status`, `021-feedback`, `021-design`, `021-prototype`). Each `SKILL.md` carries `name`/`description` YAML frontmatter for Antigravity's skill discovery |
| `requirements/`, `PRODUCT.md`, `CODE.md`, `DESIGN.md`, `README.md` | Key docs + user-owned guiding docs (create-if-missing) |
| `workflow/`, `skills/`, `scripts/`, `templates/`, `hooks/`, `.github/` | Framework machinery (Layer-1 — identical across stacks; the flat `skills/*.md` remain the canonical source the `.agents/` surface is rendered from) |
| `.zero-two-one.json` | Manifest with `tools: { stack: "antigravity", assistant: "antigravity", ssd: "github-speckit", design: … }` |
| `.git/hooks/pre-commit` | The refinement gate (conflict-aware: chains plain hooks/husky; report-only for lefthook) |

**MCP note:** after install, init prints a console note describing the framework's agent tools (from `skills/tools.json`) and how to register them in Antigravity's MCP configuration (`~/.gemini/config/mcp_config.json`). The framework **never writes to your user-global config** — wiring MCP is your explicit step.

## 2. Install Spec Kit (Phase 1+)

```sh
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here
```

Durable spec state lives in `specs/NNN-feature-name/spec.md` frontmatter (`status:`), exactly as on the `claude` stack. Antigravity's in-session artifacts (task lists, walkthroughs) are ephemeral — the framework's gate and scripts read Spec Kit files only.

## 3. Core workflows

### 3.1 Status, QA, drift

```sh
npx 021 status       # phase + stage-specific review template (manifest-first)
npx 021 qa           # phase-tiered QA suite
npx 021 doctor       # read-only drift report
npx 021 phase        # bare phase number for scripts
```

Every rendered skill references `npx 021 …` — Antigravity issues the exact same commands as Claude Code and Kiro (one CLI contract, three surface renderings).

### 3.2 Planning (Phase 0)

Invoke the doc-generation skills from `.agents/skills/` — `021-generate-prd`, `021-generate-edd`, `021-generate-tdd`, `021-generate-backlog` — to draft the key docs as **one cohesive set**, then iterate via refinement rounds in `requirements/_refinement/`. `npx 021 status` names the stage-correct review template. Optional: `021-design` (design system) and `021-prototype` (static prototype).

### 3.3 Feature delivery (Phase 1+)

On an `NNN-feature-name` branch, run the Spec Kit pipeline (Specify → Clarify → Plan → Tasks), then:

```sh
npx 021 spec status set 001 Approved     # HUMAN-authorized — opens the refinement gate
npx 021 spec context 001                 # build .ai/context/001-…{md,json}; load before implementing
# … implement via Antigravity, using the 021-fetch-speckit-context / 021-verify-spec-compliance skills …
npx 021 spec verify 001                  # compliance audit (--gate fast subset, --json for agents)
npx 021 qa
```

The `pre-commit` gate blocks implementation commits on the feature branch until the spec status is `Approved | Ready for Dev | In Progress | Done`. Docs/specs/design assets are never blocked. Statuses: `Draft → In Review → Approved → Ready for Dev → In Progress → Done`.

### 3.4 Lifecycle commands (rendered as skills)

| Skill | Backing command | What it does |
|---|---|---|
| `021-status` | `npx 021 status` | Lifecycle phase + review template |
| `021-init` | `npx zero-two-one-init` | (Re)install / upgrade walkthrough |
| `021-feedback` | `npx 021 feedback "<title>" [--body] [--submit]` | File framework feedback to `billdingwall/zero-two-one` — dry by default; transport is `gh` (on PATH **and** authed) or a pre-filled GitHub issue URL; auto-attaches the manifest context block (version/stack/phase + repo link); posts only on `--submit` after your confirmation; no tokens handled |
| `021-design` | `npx 021 design set <none\|material-3\|byo>` | Adopt/switch/remove a design system — records `tools.design`, scaffolds `requirements/_design/tokens/`, regenerates the marker-bounded `DESIGN.md` mapping section; the assistant walks assess/map |
| `021-prototype` | `npx 021 prototype init [--force]` | Scaffold the opt-in static prototype themed by the design-system CSS variables; assistant builds the screens from PRD/EDD; non-destructive without `--force` |

## 4. Working well with Antigravity

- **Trust Spec Kit for state, Antigravity for drive.** Let Antigravity plan and execute, but treat `specs/**` frontmatter as the single source of truth for what's approved — its session artifacts don't survive, the spec files do.
- **Load the context bundle first.** The `021-fetch-speckit-context` skill (backed by `npx 021 spec context`) produces a single-read markdown bundle + structured JSON — inject it before any implementation.
- **Approval stays human.** Skills can draft and verify; only you run `021 spec status set … Approved`.
- **`AGENTS.md`/`GEMINI.md` is yours.** It's user-owned after render — add project specifics; upgrades preserve a marked local section.

## 5. Upgrading

```sh
npx zero-two-one-init --upgrade
```

Refreshes unmodified framework files (including re-rendering the `.agents/skills/` surface); hand-edits are reported as conflicts and kept. Your specs, requirements content, and entrypoint edits are never overwritten.
