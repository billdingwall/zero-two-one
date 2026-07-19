# Getting Started with Zero Two One — Kiro

*A step-by-step guide for developers consuming the `zero-two-one` package on the **`kiro` stack**: Kiro (the AWS agentic IDE/CLI) as the assistant **and** Kiro specs as the spec-driven-delivery (SSD) engine. Unlike `claude`/`antigravity`, this stack does not use GitHub Spec Kit — durable spec state lives in `.kiro/specs/`.*

---

## 0. Prerequisites

| Dependency | Version | Why |
|---|---|---|
| Node.js | ≥ 18 | All lifecycle scripts — zero runtime npm dependencies |
| Git | ≥ 2.30 | The pre-commit refinement gate |
| POSIX `sh` | — | `run-qa.sh`, git hooks |
| Kiro (IDE or CLI) | — | The assistant; reads steering, agents, skills, and specs from `.kiro/` |

> **Package availability:** npm publish is scheduled for mvp-6. Until then, install from a checkout:
>
> ```sh
> git clone https://github.com/billdingwall/zero-two-one.git
> npm install -g ./zero-two-one/package     # registers `zero-two-one-init` and `021`
> ```

## 1. Install the framework

Paste into your Kiro session inside the target repository:

> Install the zero-two-one framework in this repository. Run `npx zero-two-one-init --dry-run` first and review the plan with me, then run `npx zero-two-one-init` with stack `kiro` and walk me through the setup questions (design system, lifecycle phase, and any file conflicts) one at a time with a recommendation for each. When done, read `.zero-two-one.json` and the `.kiro/steering/021-*.md` files, then report the lifecycle phase with `npx 021 status`.

Or directly:

```sh
npx zero-two-one-init --dry-run --stack kiro
npx zero-two-one-init --stack kiro
```

Migrate mode auto-detects an existing `.kiro/` directory and proposes the `kiro` stack.

### What lands (kiro stack)

| Surface | Contents |
|---|---|
| `.kiro/steering/021-product.md` | Framework operating guidance — product/lifecycle model (`inclusion: always` frontmatter) |
| `.kiro/steering/021-tech.md` | Engineering constitution + technical constraints (`inclusion: always`) |
| `.kiro/steering/021-structure.md` | Repo/process structure summary |
| `.kiro/agents/021.json` | The **`021` CLI agent** — `prompt: file://.kiro/steering/021-product.md`, `resources` globs over `PRODUCT.md`/`CODE.md`/`DESIGN.md`/`requirements/**`/`.kiro/specs/**`, plus `skill://021-*` references |
| `.kiro/skills/021-<name>/SKILL.md` | The 8 framework skills, materialized natively (PRD/EDD/TDD/backlog generation, spec context, compliance, component generation) |
| `requirements/`, `PRODUCT.md`, `CODE.md`, `DESIGN.md`, `README.md` | Key docs + user-owned guiding docs (create-if-missing) |
| `workflow/`, `skills/`, `scripts/`, `templates/`, `hooks/`, `.github/` | Framework machinery (Layer-1 — identical across all stacks) |
| `.zero-two-one.json` | Manifest with `tools: { stack: "kiro", assistant: "kiro", ssd: "kiro-specs", design: … }` |
| `.git/hooks/pre-commit` | The refinement gate (conflict-aware install; chains plain hooks/husky, report-only for lefthook) |

**Notes specific to kiro:**
- There is **no rendered entrypoint doc** (no `CLAUDE.md`/`AGENTS.md` equivalent) — the steering files *are* the instruction surface. Existing user steering is never clobbered: all framework steering is `021-`-namespaced.
- The `021` agent is invoked as `021` inside Kiro; it wraps the same `021` shell CLI every stack uses, so all lifecycle commands below are identical.
- Framework steering is **stable operating guidance rendered from templates** (`templates/kiro-steering/`) — your live project docs reach Kiro through the agent's `resources` globs, not by re-rendering steering.

## 2. Feature delivery — the `kiro-specs` SSD engine

The manifest's `tools.ssd: "kiro-specs"` switches every spec script (`021 spec status|context|verify`, the pre-commit gate, `021 doctor`) to an engine that reads **Kiro-native spec files** instead of `specs/NNN-*/`:

```
.kiro/specs/<feature>/
├── requirements.md    # EARS requirements — carries the injected `status:` YAML frontmatter (the gate state)
├── design.md          # the design/plan document
└── tasks.md           # checkbox task list — task progress is derived from these
```

The artifact mapping (identical pipeline, different filenames):

| Pipeline doc | `github-speckit` (claude/antigravity) | `kiro-specs` |
|---|---|---|
| primary spec | `specs/NNN-x/spec.md` | `.kiro/specs/<feature>/requirements.md` |
| plan | `plan.md` | `design.md` |
| tasks | `tasks.md` | `tasks.md` |

### The workflow

1. Have Kiro create a spec (its native requirements/design/tasks flow) under `.kiro/specs/<feature>/`.
2. Check state:
   ```sh
   npx 021 spec status list        # every feature with status + gate state
   ```
3. **Human approval** (this opens the gate — never delegate to the agent):
   ```sh
   npx 021 spec status set <feature> Approved
   ```
   This injects/updates `status: Approved` in the requirements.md frontmatter (Kiro tolerates the extra frontmatter).
4. Build the agent context bundle before implementing:
   ```sh
   npx 021 spec context <feature>  # writes .ai/context/<feature>.{md,json}
   ```
5. Implement via the `021` agent; verify continuously:
   ```sh
   npx 021 spec verify <feature>
   npx 021 qa
   ```

**The gate:** `.git/hooks/pre-commit` blocks implementation commits on a feature branch unless the feature's `requirements.md` status is `Approved | Ready for Dev | In Progress | Done`. `.kiro/**` doc edits themselves are never blocked (spec/doc paths are excluded) — the gate stops code, not refinement. Statuses: `Draft → In Review → Approved → Ready for Dev → In Progress → Done`.

Note: with `kiro-specs`, features resolve by **explicit feature name** (`021 spec status set my-feature Approved`) rather than the `NNN-` numeric convention.

## 3. Lifecycle commands

All via the same shell CLI (the `021` agent references these; npm-script aliases exist for CI):

```sh
npx 021 status                    # phase + stage-specific review template
npx 021 qa                        # phase-tiered QA suite
npx 021 doctor                    # read-only drift report (manifest ↔ specs ↔ releases ↔ roadmap)
npx 021 phase                     # bare phase number
npx 021 feedback "<title>" [--body <text>] [--submit]   # file framework feedback (gh or pre-filled URL; dry by default)
npx 021 design set <none|material-3|byo>                # adopt/switch/remove a design system
npx 021 prototype init [--force]  # scaffold the opt-in static prototype (themed by the design system)
```

`021 feedback`, `021 design`, and `021 prototype` behave identically to the other stacks (one CLI, three surface renderings) — on kiro you reach them through the `021` agent rather than per-command skills.

## 4. Working well with Kiro

- **Let steering do its job.** `021-product`/`021-tech` are `inclusion: always` — Kiro carries the lifecycle model and engineering constitution into every session without prompting.
- **Ask the `021` agent for lifecycle work.** It has the guiding docs, requirements, and specs in its `resources`, plus all 8 `skill://021-*` skills for doc generation and compliance.
- **Keep the cohesive set cohesive.** PRD/EDD/TDD are one set — any change to one is checked against all three (the refinement loop's cascade order: PRD → EDD → TDD → Backlog → Roadmap).
- **Approval is yours.** The agent can draft requirements/design/tasks; only you run `021 spec status set <feature> Approved`.

## 5. Upgrading

```sh
npx zero-two-one-init --upgrade
```

Framework-owned files (steering, skills, agent definition, scripts, templates, hooks) refresh when unmodified; your hand-edits are reported as conflicts and kept. `.kiro/specs/**` is **never** touched by install/upgrade — your spec state is yours.
