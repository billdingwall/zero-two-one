# Requirements Audit — Delivered vs. Documented

*A technical audit comparing the actual state of the delivered package (code in `bin/`, `scripts/`, `skills/`, `hooks/`, `templates/`, and the `package/` snapshot) against the documentation in `requirements/` (PRD §4 Core Features, TDD §§1–14, Backlog, Roadmap). Audited on branch `mvp-5-lifecycle-commands` after the mvp-5 release close (specs 001–012 Done; suite 115/115 green).*

**Legend:** ✅ delivered & verified · ◐ partially delivered · ❌ documented but not in the codebase

---

## 1. Delivered — implemented, tested, and matching the requirements

| Requirement | Source | Evidence in the codebase |
|---|---|---|
| ✅ Safe install & merge engine — ownership classes (framework / user create-if-missing / merged), hash-guarded refresh, `--dry-run`/`--force` | TDD §§5–6; spec 001 | `scripts/init/{classes,sources,classify,apply,merge,hash,instantiate}.js`; `test/init/engine.test.js` |
| ✅ Install manifest `.zero-two-one.json` — version/mode/phase/`tools.{stack,assistant,ssd,design}`/file inventory/`merged`/`hook` | TDD §7; specs 001, 003 | `scripts/init/manifest.js`; manifest-first resolution in `scripts/speckit/lib.js manifestFacts()`; dogfooded at the repo root (`mode: source`) |
| ✅ Migrate mode — detection, phase/stack interview inputs, doc import + duplicate resolution (`archive`/`update`/`leave`), Spec Kit reuse | TDD §8; spec 002 | `scripts/init/migrate/{detect,index,duplicates,speckit-reuse,growth-entry}.js`; `test/init/migrate.test.js` |
| ✅ Manifest as QA contract — one parser for phase/stack; no output scraping | TDD §7 (r7); spec 003 | `lib.js manifestFacts`; `run-qa.sh` reads `021 phase`; `workflow-status.js` is a thin presenter |
| ✅ Workflow doctor — read-only drift reporter (manifest ↔ specs ↔ releases ↔ roadmap ↔ round frontmatter) | TDD §13 (scoped read-only, r7); spec 004 | `scripts/speckit/doctor.js`; `test/speckit/doctor.test.js` |
| ✅ Conflict-aware pre-commit install — chain plain hooks (gate-first guarded block), husky v9 insertion, lefthook report-only, idempotent markers, strategy in manifest | TDD §1.3; spec 005 | `scripts/init/hook.js`; `hooks/pre-commit`; `test/init/hook*.test` coverage |
| ✅ Refinement gate — spec status blocks implementation commits on `NNN-*` branches; docs never blocked; identical across stacks via the engine contract | PRD §4.3; TDD §§1.3, 9.3 | `hooks/pre-commit` → `verify-spec-compliance.js --gate`; statuses in `lib.js STATUSES/GATE_PASSING` |
| ✅ Source layer & stack-parameterized renderer — neutral `ASSISTANT-Template.md`, adapter registry, per-stack install surface, `claude` byte-identical golden, neutral-core invariant | TDD §9.1 (r9); spec 006 | `scripts/init/{adapters,render,surface}.js`; `test/init/renderer.test.js` (golden sha256 fixture) + T006 invariant |
| ✅ Antigravity adapter — `AGENTS.md` render (`GEMINI.md` honored), `.agents/skills/021-*/SKILL.md` surface (8 skills + lifecycle commands), MCP console note (no `~/.gemini` writes), migrate wire-through | TDD §9.2; spec 007 | `adapters.js` antigravity entry + `surfaceRenders`; `surface.js`; `test/init/surface.test.js` |
| ✅ Kiro adapter + `kiro-specs` engine dispatch — `.kiro/steering/021-*` (inclusion frontmatter), `.kiro/agents/021.json`, `.kiro/skills/`, and the SSD engine layer (`engines/{github-speckit,kiro-specs}.js`, `status:` injected into `requirements.md`, gate/verify/context/doctor honor `tools.ssd`) | TDD §§9.2–9.3; spec 008 | `templates/kiro-{steering,agent}/`; `scripts/speckit/engines/`; `test/speckit/engine.test.js` (incl. subprocess gate test on a kiro fixture) |
| ✅ The `021` CLI — one assistant-agnostic command surface over the scripts; all three stacks reference `npx 021 …`; programmatic API `require('zero-two-one/speckit')` | Repo-refactor §3.3 (r9); TDD §14 API decision; spec 009 | `bin/021.js`; `package.json`/`package/package.json` `bin` + `exports`; `test/cli/dispatch.test.js` |
| ✅ `021-feedback` — gh-or-URL transport (auth-gated), manifest context block, dry-by-default/`--submit`, fixed repo slug, issue form | PRD §4.8; TDD §10; spec 010 | `scripts/feedback.js`; `.claude/commands/021-feedback.md`; `.github/ISSUE_TEMPLATE/021-feedback.yml`; `test/feedback/feedback.test.js` (recording `gh` fake) |
| ✅ `021-design` — DSS select/assess/map/cascade over the §9.4 adapter: targeted `tools.design` write, `tokens/` scaffold, marker-bounded `DESIGN.md` mapping (material-3 skeleton / BYO / none) | TDD §11; spec 011 | `scripts/design.js`; `.claude/commands/021-design.md`; `test/design/design.test.js` |
| ✅ `021-prototype` — opt-in themed static scaffold, tokens `@import` / inline `:root` seam, non-destructive `--force`, **emergent** wire-in of QA/refinement steps, never a gate | PRD §4.9; TDD §12; spec 012 | `scripts/prototype.js`; `.claude/commands/021-prototype.md`; `test/prototype/prototype.test.js` |
| ✅ Stage-specific review templates wired by manifest `phase` | Backlog (mvp-5, r4 templates) | `lib.js reviewTemplateForPhase()`; `021 status` "Review template:" line; `templates/reviews/06-REVIEW-{planning,mvp,growth}-Template.md`; `refinement-loop.md` step 1 |
| ✅ Key-doc & guiding-doc templates, personas, releases; workflows (lifecycle, refinement loop + sync sub-workflows, SSD, init/migration, DSS, prototype flows, transitions) | PRD §4.2; TDD §2 | `templates/` (18 files + `reviews/` + kiro dirs); `workflow/workflows.md` + 17 `specific-workflows/` |
| ✅ Skills + agent tool schemas — 8 skill prompts with frontmatter; `tools.json` (`fetch_speckit_context`, `verify_spec_compliance`, `set_spec_status` w/ `x_command` mappings) | PRD §4.4 | `skills/` |
| ✅ Zero runtime dependencies; `021-` naming convention; no telemetry | TDD §3; PRD §§4.7, 5 | No `dependencies` in either `package.json`; every command surface `021-`-prefixed; no network code outside user-initiated `gh` |
| ✅ Dogfooding architecture — root workspace + `package/` snapshot with `sync-to-package.js` (`--check` drift gate) | PRD §4.5 | `scripts/sync-to-package.js`; CI-usable check mode |
| ✅ Contribution surface (minimal) | r7 | `CONTRIBUTING.md`; issue templates (`bug_report`, `feature_prd`, `021-feedback.yml`) |

## 2. Partially delivered

| Requirement | Source | What exists | What's missing |
|---|---|---|---|
| ◐ **AI-led init walkthrough** — an interactive, ask-don't-assume interview (stack, design, phase, per-conflict decisions) driving the engine via flags | PRD §4.1; TDD §1; descoped from mvp-4 → backlog (2026-07-19) | The full mechanical engine with every flag the interview needs (`--stack`, `--design`, `--phase`, `--dup`, `--force`, `--yes`, `--dry-run`); README per-stack walkthrough prompts; a basic `/021-init` command file | The rich stack-rendered walkthrough itself — `/021-init` is currently a post-install checklist, not the guided per-question interview the TDD §1 describes. mvp-4 closed on its adapter-cut scope without this; tracked in `04-BACKLOG.md` "Descoped from mvp-4" for future promotion into a Growth-release spec |
| ◐ **`material-3` design-system binding at init** — `--design material-3` auto-invoking the binding mechanism; the `{material-3}` column of the 3-stack × 2-design acceptance matrix | TDD §9.4; descoped from mvp-4 → backlog (2026-07-19) | The binding **mechanism itself is fully shipped** — `021 design set material-3` (spec 011, mvp-5) writes the `md.sys.*` role-row mapping skeleton, scaffolds `requirements/_design/tokens/`, and accepts Material Theme Builder JSON/CSS-variable imports; the DSS workflow doc; the prototype consumes whatever tokens CSS lands (spec 012's `@import` seam) | `--design material-3` at `init`/`--upgrade` only **records** the choice in the manifest — it does not yet auto-invoke `021-design` to produce the mapping, so a user must still run `021 design set material-3` once, manually, after init. The `{material-3}` acceptance-matrix column is consequently unproven end-to-end (the `{none}`×3 row **is** proven by the neutral-core invariant test). The real gap is narrower than the original mvp-4 scoping implied |
| ◐ **Workflow Manager (state-sync)** | TDD §13 | The read-only `021 doctor` reporter (which is all r7 scoped for MVP) | Any *write-side* state synchronization remains future scope — the doctor reports drift; humans reconcile |

## 3. Documented but missing from the codebase

| Requirement | Source | Status |
|---|---|---|
| ❌ **npm registry publish** — `npx zero-two-one-init` / `npx 021` working from the public registry | PRD §5 (adoption metric); Roadmap mvp-6; README Quick start | The `package/` snapshot is publish-ready (bins, `exports`, `files` whitelist) but **`zero-two-one` is not yet on npm**. Every `npx` invocation in the README/guides assumes the mvp-6 publish. Interim: install globally from a checkout (`npm i -g ./package`) |
| ❌ **CI publish pipeline** — tag-triggered `npm publish --provenance` + pre-publish gate (dangling-link/dummy/LICENSE checks, `sync --check` first) | TDD §14 (r8); Roadmap mvp-6 | Not implemented; `.github/workflows/ci.yml` runs tests only |
| ❌ **End-to-end assistant test** — scaffold + migrate exercised through a real Claude Code session | Backlog (mvp-6) | Not implemented (unit/subprocess coverage is extensive — 115 tests — but no agent-driven e2e) |
| ❌ **Field tests** — three real repos installed from a local tarball, with live feedback | Roadmap mvp-6 | Not performed |
| ❌ **Uninstall** — the manifest is documented as the basis for "safe re-runs, `--upgrade`, uninstall, and the stack adapters" | PRD §4.6; TDD §7 | No uninstall command or script exists; the file inventory that would drive it does |
| ❌ **CODEOWNERS** | r7 review (optional item) | Not present (`CONTRIBUTING.md` was the delivered piece) |

## 4. Documented behaviors worth knowing (by design, not gaps)

- **The prototype QA tier is Phase-0 (Planning) scoped** — `run-qa.sh` validates `prototype/*.html` only in the Planning branch; MVP/Growth QA does not re-check it. The refinement-loop prototype-sync and the `021-design` re-theme are phase-independent.
- **EDD cascade in `021-design` is assistant-guided** — the script never rewrites the EDD; annotation is an explicit LLM step (clarified in spec 011).
- **Antigravity MCP registration is manual** — init prints the guidance; the framework never writes to `~/.gemini/config/mcp_config.json`.
- **`021 feedback` never posts autonomously** — dry-by-default is structural (the default code path issues no `gh issue create`), and `--submit` is reached only after user confirmation.
- **Kiro features resolve by name, not number** — the `NNN-` branch convention is a `github-speckit` idiom; `kiro-specs` uses explicit feature directories.

## 5. Verdict

The delivered package matches its requirements documentation with unusual fidelity — all twelve MVP feature specs (001–012) trace requirement → spec → implementation → tests, and the r5–r9 refinement rounds kept the docs and code reconciled as they moved. mvp-4 closed (2026-07-19) on its adapter-cut scope; the two items that didn't make the cut — the interactive init walkthrough and init-time `material-3` auto-binding — were **descoped to `04-BACKLOG.md`** rather than held as blockers, and the audit found the material-3 gap narrower than originally scoped: the binding mechanism shipped anyway, independently, as `021-design` (mvp-5). The remaining genuine delta is the **entire mvp-6 release** (publish, CI provenance pipeline, e2e + field testing), which the roadmap explicitly sequences last. Nothing in the requirements is silently absent: every gap above is tracked in `requirements/04-BACKLOG.md` or an open release file.
