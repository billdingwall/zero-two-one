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
