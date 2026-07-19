# Getting Started with Zero Two One — Claude Code

*A step-by-step guide for developers consuming the `zero-two-one` package on the **`claude` stack** (the default): Claude Code as the assistant, GitHub Spec Kit as the spec-driven-delivery (SSD) engine.*

Zero Two One turns your repository into a structured, agent-operable product workspace: living requirements docs, a project-level refinement loop, feature delivery through Spec Kit, and a git `pre-commit` **refinement gate** that blocks implementation code until a feature's spec is human-approved.

---

## 0. Prerequisites

| Dependency | Version | Why |
|---|---|---|
| Node.js | ≥ 18 | All lifecycle scripts (`bin/`, `scripts/`) — zero runtime npm dependencies |
| Git | ≥ 2.30 | Branch↔spec mapping, the pre-commit gate |
| POSIX `sh` | — | `run-qa.sh`, git hooks (Windows: Git Bash/WSL) |
| [Claude Code](https://claude.com/claude-code) | — | The assistant that drives the framework |
| [uv](https://docs.astral.sh/uv/) + [Spec Kit](https://github.com/github/spec-kit) | — | `/speckit-*` slash commands for feature delivery (Phase 1+) |

> **Package availability:** publish to the npm registry is scheduled for the mvp-6 release. Until then, install from a checkout of this repository:
>
> ```sh
> git clone https://github.com/billdingwall/zero-two-one.git
> npm install -g ./zero-two-one/package     # registers the `zero-two-one-init` and `021` bins
> ```
>
> Once published, every `npx zero-two-one-init` / `npx 021 …` command below works directly.

## 1. Install the framework

Init is **assistant-led** — paste this prompt into Claude Code inside your target repository:

> Install the zero-two-one framework in this repository. Run `npx zero-two-one-init --dry-run` first and review the plan with me, then run `npx zero-two-one-init` with stack `claude` and walk me through the setup questions (design system, lifecycle phase, and any file conflicts) one at a time with a recommendation for each. When done, read `.zero-two-one.json` and `workflow/workflows.md`, then report the lifecycle phase with `npx 021 status`.

Or run the engine directly:

```sh
npx zero-two-one-init --dry-run          # print the classified action plan; write nothing
npx zero-two-one-init                    # scaffold (fresh repo) or migrate (existing repo)
```

Useful flags:

```
--stack claude|antigravity|kiro    # tool stack (default: claude)
--design none|material-3|<system>  # design system (default: none)
--phase planning|mvp|growth        # lifecycle phase (scaffold default: planning)
--upgrade                          # refresh unmodified framework files; report conflicts
--force <path>                     # overwrite a user-owned file (repeatable; the only override)
--dup <path=archive|update|leave>  # pre-resolve a migrate duplicate
--yes                              # accept inferred defaults (migrate)
```

### What lands (claude stack)

| Surface | Contents |
|---|---|
| `CLAUDE.md` | Assistant entrypoint (rendered from the neutral `templates/ASSISTANT-Template.md`) |
| `.claude/commands/021-*.md` | `/021-init`, `/021-status`, `/021-feedback`, `/021-design`, `/021-prototype` |
| `requirements/` | `01-PRD.md` … `05-ROADMAP.md` instantiated from templates + `_refinement/`, `_releases/`, `_design/`, `_notes/` |
| `PRODUCT.md`, `CODE.md`, `DESIGN.md`, `README.md` | User-owned guiding docs (create-if-missing — **never overwritten**) |
| `workflow/`, `skills/`, `scripts/`, `templates/`, `hooks/`, `.github/` | Framework machinery (framework-owned, hash-tracked) |
| `.zero-two-one.json` | The install manifest (version, mode, phase, `tools.{stack,assistant,ssd,design}`, file inventory) |
| `.git/hooks/pre-commit` | The refinement gate — installed **conflict-aware** (see below) |

**Non-destructive guarantees (migrate mode):** user-owned files are create-if-missing; framework files are refreshed only when their hash matches the manifest (hand-edits become reported conflicts); existing docs are imported, not replaced; an existing Spec Kit setup is detected and reused. `--force` is the only override.

**Hook chaining:** if your repo already has a `pre-commit` hook, the gate *chains* rather than clobbers — a plain hook gets a guarded block inserted after its shebang (gate-first); husky (`.husky/pre-commit`) gets the same guarded block; lefthook is **report-only** (init prints the exact snippet to add and never edits your config). The strategy is recorded as `hook` in the manifest.

## 2. Install Spec Kit (Phase 1+)

```sh
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai claude
```

This adds the `/speckit-*` slash commands (`/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`) Claude Code uses to run the spec pipeline.

## 3. Core workflows

### 3.1 Check where you stand — any time

```sh
npx 021 status
```

```
=== Zero Two One Lifecycle Status ===
Current Phase: 1 - MVP Build (One)
Source: .zero-two-one.json
Review template: templates/reviews/06-REVIEW-mvp-Template.md
===================================
```

Phase resolution is manifest-first (`.zero-two-one.json` → `phase`), falling back to repo-state inference. `--json` emits `{ phase, status, source, reviewTemplate }` for tooling — never scrape the human block.

### 3.2 Planning (Phase 0)

1. Fill in the key docs as **one cohesive set**: `requirements/01-PRD.md`, `02-EDD.md`, `03-TDD.md`, `04-BACKLOG.md`, `05-ROADMAP.md`. Claude Code drives this from the `skills/generate-{prd,edd,tdd,backlog}.md` prompts.
2. Iterate through the **refinement loop** (`requirements/_refinement/r{n}-*.md`): review → synthesize per-doc update plans → human approves → apply & cascade in dependency order (PRD → EDD → TDD → Backlog → Roadmap). `npx 021 status` names the stage-correct review template for the round.
3. Optionally: `/021-design` to adopt a design system, `/021-prototype` to generate the static prototype.
4. Exit gate: the **Planning sign-off milestone** — every core scenario stakeholder-reviewable, architecture locked in the TDD.

### 3.3 Feature delivery (Phase 1+) — the SSD pipeline

Each feature runs Spec Kit on an `NNN-feature-name` branch:

```sh
git checkout -b 001-user-onboarding
```

1. **Specify** → `specs/001-user-onboarding/spec.md` (`status: Draft`)
2. **Clarify** → resolve open questions (`In Review`)
3. **Plan** → `plan.md`, `research.md`, `data-model.md`, `contracts/`
4. **Tasks** → dependency-ordered `tasks.md`
5. **Approval** — a human runs:
   ```sh
   npx 021 spec status set 001 Approved
   ```
   **This opens the refinement gate.** Only a human authorizes this transition.
6. **Implement** — before writing code, load the context bundle:
   ```sh
   npx 021 spec context 001            # writes .ai/context/001-user-onboarding.{md,json}
   ```
   Claude Code reads the bundle (spec + acceptance criteria + entities + task progress + `CODE.md`/`PRODUCT.md`/backlog) in a single read.
7. **Verify** — after meaningful units of work and before `Done`:
   ```sh
   npx 021 spec verify 001             # gate, artifact completeness, task truthfulness; --gate for the fast subset, --json for agents
   npx 021 qa                          # the phase-appropriate QA suite
   ```

**The gate in practice:** committing implementation files on `001-user-onboarding` while the spec is `Draft`/`In Review` fails at `pre-commit`. Docs, specs, and design assets are never blocked — the gate stops code, not refinement.

Spec statuses: `Draft → In Review → Approved → Ready for Dev → In Progress → Done` (gate passes at `Approved` and beyond).

### 3.4 Lifecycle commands

| Command | What it does |
|---|---|
| `/021-status` → `npx 021 status` | Lifecycle phase, source, stage-specific review template |
| `npx 021 qa` | Phase-tiered QA: docs (+ optional prototype) in Planning; full code QA (tests, a11y, spec compliance) in MVP; + feedback checks in Growth |
| `npx 021 doctor` | Read-only drift report reconciling manifest ↔ specs ↔ releases ↔ roadmap |
| `npx 021 phase` | Bare phase number (for scripts/hooks) |
| `/021-feedback` → `npx 021 feedback "<title>" [--body <text>] [--submit]` | File framework feedback to `billdingwall/zero-two-one`. Dry by default: prints the transport (`gh` if on PATH **and** authed, else a pre-filled issue URL) + full payload incl. an auto-attached manifest context block (version/stack/phase + `origin` link). Posts only with `--submit` after you confirm — no tokens ever handled |
| `/021-design` → `npx 021 design set <none\|material-3\|byo-name>` | Adopt/switch/remove a design system: records `tools.design`, scaffolds `requirements/_design/tokens/`, regenerates the marker-bounded "Design System Mapping" section in `DESIGN.md`. The assistant walks assess/map and imports your token export |
| `/021-prototype` → `npx 021 prototype init [--force]` | Scaffold the **opt-in** static prototype (`prototype/{index.html,styles.css,app.js}`) themed by the design-system CSS variables; the assistant builds the real screens from the PRD/EDD. Refuses over an existing prototype without `--force`. Its presence activates the QA/refinement prototype steps automatically |

### 3.5 Programmatic API

```js
const speckit = require('zero-two-one/speckit');
speckit.manifestFacts();            // { phase, phaseNum, phaseLabel, stack, ssd, mode, source }
speckit.readStatus('001');          // spec lifecycle status
speckit.isGatePassing('Approved');  // true
speckit.reviewTemplateForPhase(1);  // 'templates/reviews/06-REVIEW-mvp-Template.md'
```

## 4. Leveraging Claude Code well

- **Load context before implementing.** `npx 021 spec context` first, always. The pre-commit gate enforces the approval; the context bundle prevents drift.
- **Let the skills drive doc generation.** `skills/*.md` are step-by-step prompts (PRD/EDD/TDD/backlog generation, component generation, compliance checks); `skills/tools.json` carries Anthropic-format tool schemas (`fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status`) with `x_command` mappings for shell-executing harnesses. Note `set_spec_status` to `Approved` is **human-authorized** — agents should never self-approve.
- **Respect the dual workflow.** Product-level changes (what it *is*) go through `requirements/_refinement/` rounds; feature-level changes (building it) go through Spec Kit branches. Don't edit key docs ad hoc mid-feature.
- **Keep `CLAUDE.md` current.** It's user-owned — record your project's phase, domain constraints, and conventions there; the framework never overwrites it.
- **Ask Claude to verify, not just build.** `npx 021 spec verify` after each meaningful unit; `npx 021 qa` before release.

## 5. Upgrading

```sh
npx zero-two-one-init --upgrade
```

Refreshes framework-owned files whose hash still matches the manifest; hand-modified files are reported as conflicts (kept, never overwritten). Upgrades deliver templates/skills/scripts/hooks + command surfaces only — instantiated user docs are never touched.
