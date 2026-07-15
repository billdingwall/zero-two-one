# Command Design — CLI, Skills & Scripts

*How every zero-two-one command surface maps together: npm scripts, assistant-rendered commands, agent skills, and the underlying Node/shell scripts. This is the reference the EDD's [CLI Experience](../02-EDD.md#3-the-cli-experience) section points to.*

**Status legend:** ✅ shipped · 🔜 planned (release noted, see [../05-ROADMAP.md](../05-ROADMAP.md)).

**Naming:** every framework command follows the `021-` convention (`CODE.md` §2). Assistant-side names are **stack-rendered** (TDD §9.2): `/021-*` slash commands for `claude`, `021-*` skills for `antigravity`, steering + the `021` agent for `kiro`. The tables below name the `claude` (default) rendering.

## 1. The three layers

| Layer | Where it lives | Who invokes it |
|---|---|---|
| **Assistant commands** | stack surface (`.claude/commands/021-*.md`, `.agents/skills/021-*`, `.kiro/`) | the user, through their AI assistant |
| **Agent skills** | `skills/*.md` + `skills/tools.json` | the assistant, mid-task, following a prompt/tool schema |
| **Scripts** | `scripts/*`, `bin/`, `hooks/` | npm scripts, git, or skills — the mechanical layer |

The dependency is deliberate (PRD §2, TDD §1): an **LLM drives**, scripts execute. No command is script-only end-to-end; even init is an assistant walkthrough over a CLI engine.

## 2. npm scripts (mechanical layer)

| Command | Script | Purpose |
|---|---|---|
| `npm run 021-status` | `scripts/workflow-status.js` | Report lifecycle phase — reads `.zero-two-one.json` `phase` first, infers from repo state only if absent (TDD §7). ✅ |
| `npm run 021-qa` | `scripts/run-qa.sh` | Phase-appropriate QA suite (docs → optional prototype → tests/a11y/spec compliance). ✅ |
| `npm run 021-spec:status [-- list \| set <spec> <status>]` | `scripts/speckit/spec-status.js` | List feature specs with gate state, or advance a spec's status (human-authorized). ✅ |
| `npm run 021-spec:context` | `scripts/speckit/fetch-speckit-context.js` | Build `.ai/context/` bundles for the active feature. ✅ |
| `npm run 021-spec:verify` | `scripts/speckit/verify-spec-compliance.js` | Spec-compliance audit (gate, artifact completeness, task truthfulness). ✅ |
| `npm run sync:package` | `scripts/sync-to-package.js` | Dev-only: sync root → `package/` per the manifest (TDD §5). ✅ |
| `npm run publish:package` | sync + `npm publish` | Dev-only: publish the package (MVP launch, mvp-6). ✅ (gated by release) |

## 3. Assistant commands (LLM-driven surface)

| Command (`claude`) | Backed by | Workflow | Status |
|---|---|---|---|
| `/021-init` | `bin/init.js` engine + init walkthrough | [Init & Migration](../../workflow/specific-workflows/init-and-migration.md) | 🔜 walkthrough mvp-4 (engine mvp-3) |
| `/021-status` | `scripts/workflow-status.js` | [Product Lifecycle](../../workflow/specific-workflows/product-lifecycle.md) | ✅ |
| `/021-feedback` | `gh` CLI / pre-filled issue URL | [Feedback loop](../02-EDD.md) (TDD §10) | 🔜 mvp-5 |
| `/021-design` | design-system adapter (TDD §9.4/§11) | [Design-System Selection](../../workflow/specific-workflows/design-system-selection.md) | 🔜 mvp-5 |
| `/021-prototype` | key-docs→prototype generator (TDD §12) | [Key Docs → Prototype](../../workflow/specific-workflows/key-docs-to-prototype.md) | 🔜 mvp-5 (optional feature) |

`/021-init`, `/021-feedback`, `/021-design`, and `/021-prototype` use the **ask-don't-assume** interaction pattern (EDD §4): recommended option + alternatives + write-in.

## 4. Agent skills (`skills/`)

| Skill | Used during | Reads |
|---|---|---|
| `fetch-speckit-context.md` | SSD, before implementing | active `specs/NNN-*/`, emits `.ai/context/` |
| `verify-spec-compliance.md` | SSD / QA | spec artifacts + generated code |
| `generate-prd.md` | Discovery / Planning | EDD + TDD → PRD draft (cohesive set) |
| `generate-edd.md` | Discovery / Planning | PRD + TDD → EDD draft (cohesive set) |
| `generate-tdd.md` | Discovery / Planning | PRD + EDD → TDD draft (cohesive set) |
| `generate-backlog.md` | Planning / SSD | PRD + EDD + TDD → `04-BACKLOG` table (renamed from `generate-tasks`, r6) |
| `generate-frontend-component.md` | Design / build | approved spec + `DESIGN.md` tokens |
| `check-framework-compliance.md` | Governance / audit | repo state vs framework rules |

## 5. Tool schemas (`skills/tools.json`)

Anthropic tool-use schemas mapping agent tool calls to local CLIs:

| Tool | CLI |
|---|---|
| `fetch_speckit_context` | `scripts/speckit/fetch-speckit-context.js` |
| `verify_spec_compliance` | `scripts/speckit/verify-spec-compliance.js` |
| `set_spec_status` | `scripts/speckit/spec-status.js` |

## 6. Command → phase map

- **Planning:** `generate-prd`/`generate-edd`/`generate-tdd`, `generate-backlog` skills; `/021-design`, optional `/021-prototype`; `/021-status`.
- **Planning:** `/021-design`, optional `/021-prototype`; `021-qa` (docs tier); refinement rounds.
- **MVP Build:** `/021-spec:*`, `fetch-speckit-context` / `verify-spec-compliance` skills, the pre-commit gate; `021-qa` (full tier).
- **Growth:** `/021-feedback` → backlog; releases promote to SSD.

*Note on document types (audit r5): the "EDD" here is the **Experience** Design Document; technical/engineering design is the **TDD**. There is no separate engineering-design artifact.*
