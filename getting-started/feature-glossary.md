# Zero Two One — Feature Glossary

*A comprehensive, technical listing of every feature, workflow, skill, and command the package delivers to consuming repositories. Grounded in the shipped code (`bin/`, `scripts/`, `skills/`, `hooks/`, `templates/`, `workflow/`) as of specs 001–012 (mvp-5 delivered).*

---

## 1. Binaries

| Bin | File | Purpose |
|---|---|---|
| `zero-two-one-init` | `bin/init.js` | The install/migrate/upgrade engine |
| `021` | `bin/021.js` | The assistant-agnostic lifecycle CLI — a zero-logic routing shell over `scripts/*` (`spawnSync`, package-relative script paths, project-scoped cwd) |

### 1.1 `zero-two-one-init [target-dir] [options]`

| Flag | Behavior |
|---|---|
| `--dry-run` | Print the classified action plan; write nothing |
| `--stack claude\|antigravity\|kiro` | Tool stack (default `claude`; migrate mode proposes from detected surfaces) |
| `--design none\|material-3\|<system>` | Design system role, independent of stack (default `none`) |
| `--phase planning\|mvp\|growth` | Lifecycle phase (scaffold default `planning`; migrate detects/asks) |
| `--upgrade` | Refresh unmodified framework files; report hand-modified conflicts; never touch user docs |
| `--force <path>` | Overwrite a user-owned file (repeatable; **the only override**) |
| `--dup <path=archive\|update\|leave>` | Pre-resolve a migrate-mode duplicate document |
| `--yes` | Accept inferred defaults; no prompts (migrate) |

**Modes:** *scaffold* (fresh/empty repo — full surface, idempotent re-runs) vs *migrate* (auto-detected from existing docs/hooks/tool surfaces — create-if-missing user files, hash-guarded framework refresh, doc import with duplicate resolution, Spec Kit reuse).

### 1.2 `021 <command>`

| Subcommand | Dispatches to | Purpose |
|---|---|---|
| `status` | `scripts/workflow-status.js` | Phase + source + stage-specific review template (`--json`: `{phase, status, source, reviewTemplate}`) |
| `qa` | `scripts/run-qa.sh` | Phase-tiered QA suite |
| `doctor` | `scripts/speckit/doctor.js` | Read-only workflow drift report |
| `phase` | `scripts/speckit/lib.js phase` | Bare phase number (for scripts/hooks) |
| `spec status [list\|get\|set <spec> <status>]` | `scripts/speckit/spec-status.js` | Read/advance spec lifecycle status (the gate's source of truth) |
| `spec context <spec>` | `scripts/speckit/fetch-speckit-context.js` | Build `.ai/context/<spec>.{md,json}` agent bundles |
| `spec verify [spec] [--gate] [--json]` | `scripts/speckit/verify-spec-compliance.js` | Spec-compliance audit; exit 1 on FAIL |
| `feedback "<title>" [--body <text>] [--submit]` | `scripts/feedback.js` | File framework feedback (see §6.1) |
| `design set <none\|material-3\|byo>` | `scripts/design.js` | Design-system install/switch/removal (see §6.2) |
| `prototype init [--force]` | `scripts/prototype.js` | Scaffold the opt-in static prototype (see §6.3) |

npm-script aliases (dogfood/CI): `021-status`, `021-qa`, `021-doctor`, `021-spec:status`, `021-spec:context`, `021-spec:verify`.

## 2. The 3-phase lifecycle & the refinement gate

- **Phases:** `planning` (0, "Planning (Zero)") → `mvp` (1, "MVP Build (One)") → `growth` (2). Canonical vocabulary lives once in `scripts/speckit/lib.js` (`PHASE`); `prebuild` is a legacy alias for planning. Resolution order: manifest `phase` → repo-state inference → planning.
- **Spec statuses:** `Draft → In Review → Approved → Ready for Dev → In Progress → Done`. The gate passes at `Approved` and beyond. **Advancing to `Approved` is human-authorized.**
- **The refinement gate** (`hooks/pre-commit`): on an `NNN-feature-name` branch, implementation commits are blocked unless the matching spec passes the gate. Docs, specs, and design assets are never blocked. Reads durable spec state through the SSD-engine contract, so it behaves identically on every stack.
- **Conflict-aware hook install** (spec 005): situation detection (`none`/`plain`/`husky`/`lefthook`/already-installed) → direct install, guarded-block chaining (gate-first, after the shebang, marker-idempotent), husky v9 `.husky/pre-commit` insertion, or **report-only** manual snippet for lefthook. Strategy recorded as `hook` in the manifest.

## 3. The install manifest — `.zero-two-one.json`

```jsonc
{
  "version": "1.1.0",          // framework version installed
  "installedAt": "…", "updatedAt": "…",
  "mode": "scaffold|migrate|source",
  "phase": "planning|mvp|growth",
  "tools": {
    "stack": "claude|antigravity|kiro",
    "assistant": "claude-code|antigravity|kiro",   // derived from stack
    "ssd": "github-speckit|kiro-specs",            // derived from stack
    "design": "none|material-3|<byo-name>"         // independent role
  },
  "files": { "<relpath>": "<sha256>" },  // framework-owned inventory — the hash guard for safe re-runs/upgrades
  "merged": { "<file>": ["<entries>"] }, // framework-contributed lines in merged files (package.json, .gitignore)
  "hook": "direct|chain-plain|husky|manual|none",
  "migrate": { }                          // present in migrate installs
}
```

Consumed by: re-runs/upgrade (hash guard), the QA suite (phase), the gate + spec scripts (ssd), the doctor, `021 status`, and the stack/design adapters.

## 4. Stack adapters (three renderings, one contract)

The install surface is stack-parameterized (`scripts/init/adapters.js` registry; `classes.js`/`sources.js`/`surface.js` resolve from `tools.stack`). The **neutral core (Layer 1)** — `scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/` — installs byte-identically on every stack; only the chosen stack's Layer-2 surface is written.

| Stack | Entrypoint | Command/skill surface | SSD engine |
|---|---|---|---|
| `claude` (default) | `CLAUDE.md` (rendered from `templates/ASSISTANT-Template.md`) | `.claude/commands/021-{init,status,feedback,design,prototype}.md` → `/021-*` slash commands | `github-speckit` |
| `antigravity` | `AGENTS.md` (an existing `GEMINI.md` is honored instead) | `.agents/skills/021-<name>/SKILL.md` — 8 skills + 5 lifecycle commands, frontmatter-discoverable; post-install MCP note (never writes `~/.gemini/`) | `github-speckit` |
| `kiro` | *(none — steering is the surface)* | `.kiro/steering/021-{product,tech,structure}.md` (+inclusion frontmatter) · `.kiro/agents/021.json` CLI agent (`file://` + `skill://` resources) · `.kiro/skills/021-*/SKILL.md` | `kiro-specs` |

**SSD engine contract** (`scripts/speckit/engines/{github-speckit,kiro-specs}.js`; resolved from `tools.ssd`): each engine exposes `listSpecs`/`specPath`/`readStatus`/`writeStatus`/`countTasks` plus a `docs` filename map — `spec.md↔requirements.md`, `plan.md↔design.md`, `tasks.md↔tasks.md`. `kiro-specs` reads `.kiro/specs/<feature>/` with `status:` frontmatter injected into `requirements.md`.

**Design adapter (§9.4, independent of stack):** `DESIGN.md` carries a token-mapping section; exported artifacts live in `requirements/_design/tokens/`; the prototype consumes the CSS variables so a system swap re-themes without markup changes.

## 5. Spec tooling (`scripts/speckit/`)

| Script | Function |
|---|---|
| `lib.js` | The shared contract: `repoRoot`, `manifestFacts` (phase/stack/ssd/mode resolution — manifest → inference), `PHASE`, spec resolution from branch names, `readStatus`/`writeStatus`, `isGatePassing`, `countTasks`, `extractCriteria`, `reviewTemplateForPhase`, `engineFor`. Exposed programmatically as `require('zero-two-one/speckit')` |
| `spec-status.js` | `list` (all specs + gate glyphs) / `get` / `set <spec> <status>` |
| `fetch-speckit-context.js` | Builds `.ai/context/<feature>.md` (single-read agent bundle injecting spec artifacts + `CODE.md`/`PRODUCT.md`/backlog) and `.json` (status, gate state, acceptance criteria, entities, task progress). Gitignored; rebuild at will |
| `verify-spec-compliance.js` | The audit: spec resolves (G1), status present (G2), gate passes (G3), plan/tasks present (C1), no unresolved `[NEEDS CLARIFICATION]` (C3), task truthfulness on Done (C4), context freshness (C5). `--gate` = fast subset used by the pre-commit hook; `--json` for agents |
| `doctor.js` | Read-only drift reporter: manifest ↔ spec statuses ↔ release files ↔ roadmap ↔ backlog reconciliation; advisory findings only |

## 6. Lifecycle commands (mvp-5)

All three follow the same architecture: **the LLM drives judgement, a thin zero-dep script does the deterministic work**, and one CLI serves all three stacks.

### 6.1 `021 feedback` (`scripts/feedback.js`, TDD §10)

- **Payload:** title + body + auto-attached **manifest context block** (`version`/`stack`/`phase` + the `origin` remote link; explicit marker when the manifest is absent).
- **Transport:** `gh issue create --repo billdingwall/zero-two-one` when `gh` is on PATH **and** `gh auth status` succeeds; otherwise a pre-filled `issues/new?title=…&body=…` URL (≈8 KB ceiling with truncate-and-note). Destination repo is a build-time constant.
- **Dry by default:** prints transport + full payload; posts **only** under `--submit` (structural no-autonomous-post). No HTTP issued by framework code; no token ever handled.
- Ships `.github/ISSUE_TEMPLATE/021-feedback.yml` (issue form: `labels: [feedback]`, title prefix, context textarea) for triage into refinement rounds.

### 6.2 `021 design set <system>` (`scripts/design.js`, TDD §11)

- Records `tools.design` via a **targeted manifest write** (`loadManifest`→mutate→`writeManifest`; every other field byte-stable — no re-hash, no init re-run).
- Scaffolds `requirements/_design/tokens/` (link-free `_INDEX.md`).
- Regenerates the `DESIGN.md` **"Design System Mapping"** section between stable markers (`<!-- 021-design:mapping start/end -->`): replace when marked, replace the unmarked template heading when present, append otherwise; creates `DESIGN.md` from the template when absent. Bespoke frontmatter tokens are never touched.
- Skeletons: `material-3` (roles → `md.sys.*` across color/typography/shape/elevation/motion; Material Theme Builder JSON + CSS-variable exports) · BYO (generic role rows, no `md.sys.*` assumptions) · `none` (collapse to the bespoke note). The assistant fills values, imports artifacts, annotates the EDD, and surfaces the refinement round.

### 6.3 `021 prototype init [--force]` (`scripts/prototype.js`, TDD §12)

- Scaffolds the **opt-in** static prototype: `prototype/{index.html,styles.css,app.js}` (+ `_INDEX.md`). Plain HTML/CSS/JS — no bundler, no framework, no build step.
- **Theming seam:** `styles.css` `@import`s `requirements/_design/tokens/*.css` when a design system is set (so `021 design` re-themes without markup changes); under `design: none` it inlines `:root` variables best-effort-parsed from the `DESIGN.md` frontmatter.
- **Non-destructive:** refuses over an existing prototype (any file beyond `_INDEX.md`) unless `--force`.
- **Emergent wire-in:** writes only under `prototype/`. The QA prototype tier (`run-qa.sh`, Phase 0), the refinement step-5 prototype-sync, and the design re-theme all activate by presence detection — no other file changes. The prototype is never a lifecycle gate.

## 7. Skills & agent tools (`skills/`)

Eight step-by-step skill prompts (flat `skills/*.md`, with `name`/`description` frontmatter; rendered natively into `.agents/skills/` and `.kiro/skills/` on those stacks):

| Skill | Used during |
|---|---|
| `generate-prd.md` / `generate-edd.md` / `generate-tdd.md` | Planning — drafts each key doc as part of the cohesive PRD/EDD/TDD set |
| `generate-backlog.md` | Planning/refinement — backlog derivation |
| `generate-frontend-component.md` | MVP Build — token-consuming component generation |
| `fetch-speckit-context.md` | Before implementation — context-bundle discipline |
| `verify-spec-compliance.md` | After implementation / QA — compliance discipline |
| `check-framework-compliance.md` | Any time — structural conformance |

**`skills/tools.json`** — three agent tool schemas in Anthropic tool-use format, each with an `x_command` CLI mapping for shell-executing harnesses: `fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status` (the latter is human-gated by policy).

## 8. QA suite (`scripts/run-qa.sh`)

Phase read via `021 phase` (manifest contract — no output scraping):

| Phase | Checks |
|---|---|
| 0 Planning | Key-docs presence/completeness + **optional** prototype assets (`prototype/*.html`; INFO skip when absent) |
| 1 MVP Build | Key docs + full code QA — `npm test` (when present), accessibility hooks (pa11y/axe wiring points), spec compliance |
| 2 Growth | Phase-1 QA + feedback checks (backlog present for `021-feedback` triage) |

## 9. Workflows (`workflow/`)

`workflow/workflows.md` is the canonical process manifest; `specific-workflows/` documents each flow:

| Workflow | Purpose |
|---|---|
| `product-lifecycle.md` | The 3-phase model + the Planning sign-off milestone |
| `refinement-loop.md` (+ `review-sync`, `requirements-sync`, `guidance-sync`, `prototype-sync`, `backlog-sync`, `release-sync`, `roadmap-sync`) | The project-level change-control loop: stage-aware review (template resolved from phase — `reviewTemplateForPhase`, surfaced by `021 status`) → human-approved synthesis plans → cascade-ordered application (PRD → EDD → TDD → Backlog → Roadmap) with changelogs; round docs carry `status:` frontmatter read by the doctor |
| `spec-driven-delivery.md` | The SSD pipeline + the gate + the agent implementation loop |
| `init-and-migration.md` | Scaffold vs migrate semantics, ownership rules, duplicate resolution |
| `design-system-selection.md` | Select / assess / map / cascade — operationalized by `021-design` |
| `key-docs-to-prototype.md` / `prototype-sync.md` | Prototype generation (opt-in, via `021-prototype`) and round-sync |
| `planning-to-mvp.md` / `mvp-to-growth-transition.md` / `release-launch.md` / `review-to-ssd.md` / `key-docs-to-ssd.md` | Phase transitions, release mechanics, review→spec promotion |

`workflow/_personas/` holds the persona set backing the templates.

## 10. Templates (`templates/`)

Key docs (`01-PRD` … `05-ROADMAP`), guiding docs (`PRODUCT`, `CODE`, `DESIGN`, `README`, neutral `ASSISTANT`), reviews (generic `06-REVIEW` + staged `reviews/06-REVIEW-{planning,mvp,growth}`), personas (`07`–`09`), releases (`10-RELEASE`), and the kiro surfaces (`kiro-steering/`, `kiro-agent/021.json`). User docs are instantiated once (create-if-missing); framework templates refresh on `--upgrade`.

## 11. Programmatic API

```js
const speckit = require('zero-two-one/speckit');   // package `exports` map
```

Exposes the `scripts/speckit/lib.js` surface: `manifestFacts()`, `readManifest()`, `inferFacts()`, `PHASE`/`PHASE_KEY_BY_NUM`, `reviewTemplateForPhase(phase)`, `listSpecs()`, `resolveSpec()`, `readStatus()`, `writeStatus()`, `isGatePassing()`, `countTasks()`, `extractCriteria()`, `engineFor()`, `STATUSES`, `GATE_PASSING`.

## 12. Constraints (by design)

- **Zero runtime dependencies** — Node built-ins only, across every script and bin.
- **LLM-led** — an AI assistant is the framework's core dependency, including setup; scripts are the mechanical layer.
- **Non-destructive** — user content is never removed; `--force` is the only override; hooks chain rather than clobber.
- **No telemetry** — local-first; feedback is explicit and user-initiated (`021 feedback`).
- **`021-` namespace** — every framework command/skill/steering file is `021-`-prefixed to avoid collisions with user projects and tool built-ins.
