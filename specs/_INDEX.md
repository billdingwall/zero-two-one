# Specs Overview

Directory for canonical specs, feature-level implementation details, and validation rules.

## Manifest

| Spec | Feature | Release | Status |
|---|---|---|---|
| [001-safe-install-engine](001-safe-install-engine/spec.md) | Safe Install & Merge Engine — ownership-based file merge + `.zero-two-one.json` install manifest (TDD §6–7) | mvp-3 | Done |
| [002-migrate-mode](002-migrate-mode/spec.md) | Migrate-Mode — detection, phase/stack interview, existing-doc import + duplicate resolution, Spec Kit reuse (TDD §8/§6) | mvp-3 | Done |
| [003-manifest-qa-contract](003-manifest-qa-contract/spec.md) | Manifest as QA Contract — one `lib.js` parser for phase/stack; retire run-qa output-scraping (TDD §7, r7) | mvp-3 | Done |
| [004-workflow-doctor](004-workflow-doctor/spec.md) | Workflow-Manager — read-only `021-doctor` drift reporter reconciling manifest/spec/release/roadmap state (TDD §13, r7) | mvp-3 | Done |
| [005-precommit-chaining](005-precommit-chaining/spec.md) | Conflict-Aware Pre-commit Install — chain a plain hook, wire into husky/lefthook, never clobber (TDD §1.3) | mvp-3 | Done |
| [006-source-layer-renderer](006-source-layer-renderer/spec.md) | Source Layer & Stack-Parameterized Renderer — neutral `ASSISTANT-Template.md` source + zero-dep renderer; `classes.js`/`sources.js` resolve the install surface from `tools.stack`; `claude` byte-identical, `antigravity` `AGENTS.md` entrypoint (TDD §9.1, r9) | mvp-4 | Done |
| [007-antigravity-adapter](007-antigravity-adapter/spec.md) | Antigravity Adapter — populate the `antigravity` adapter 006 stubbed: Antigravity-shaped `AGENTS.md` render + `.agents/skills/021-<name>/SKILL.md` surface renderer; MCP guidance; migrate wire-through (TDD §9.2, r9) | mvp-4 | Done |
| [008-kiro-adapter](008-kiro-adapter/spec.md) | Kiro Adapter & Engine Dispatch — un-reserve `kiro`: `.kiro/steering/021-*.md` + `.kiro/agents/021.json` surface (steering/agent-json render kinds); **`kiro-specs` SSD engine dispatch** in `scripts/speckit/*` + the gate via `tools.ssd` (TDD §9.2/§9.3, r9) | mvp-4 | Done |
| [009-cli-dispatcher](009-cli-dispatcher/spec.md) | The `021` CLI Dispatcher — one assistant-agnostic command surface (`021 status\|qa\|doctor\|spec …`) shelling the existing scripts; adapters reference it (one contract, three renderings); resolves the bare-`021` name; README caveat + API decision (repo-refactor §3.3, r9) | mvp-4 | Done |
| [010-feedback-command](010-feedback-command/spec.md) | Feedback Command (`021-feedback`) — file a shaped issue into `billdingwall/zero-two-one` via `gh` or a pre-filled URL, carrying the manifest `version`/`stack`/`phase` context block; `.github/ISSUE_TEMPLATE/021-feedback.yml`; zero-dep, no token handling (TDD §10) | mvp-5 | Done |
| [011-design-command](011-design-command/spec.md) | Design-System Install Command (`021-design`) — operationalize the DSS workflow over the §9.4 adapter: select/assess/map/cascade, land a token mapping in `DESIGN.md`, import artifacts to `requirements/_design/tokens/`, record `tools.design`, re-theme the prototype if present; material-3 + BYO (TDD §11) | mvp-5 | Done |
| [012-prototype-command](012-prototype-command/spec.md) | Optional Prototype Command (`021-prototype`) — scaffold the opt-in static prototype (HTML/CSS/JS) under `prototype/` consuming the design-system CSS variables (re-themeable by `021-design`); assistant fleshes it from PRD/EDD; first generation activates the QA/refinement/design steps by presence detection; non-destructive; zero-dep (TDD §12) | mvp-5 | Done |
| [013-e2e-test](013-e2e-test/spec.md) | End-to-End Test Harness (scaffold + migrate) — drive a **real** CLI install against a throwaway git repo in both modes, then assert install surface + manifest (spec 003 parser) + gate enforcement (real commit) + green `021` lifecycle commands; the automated precondition for the human field test; complements the mvp-3 unit suites (mvp-6 scope step 1) | mvp-6 | Done |
