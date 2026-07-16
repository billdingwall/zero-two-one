# Specs Overview

Directory for canonical specs, feature-level implementation details, and validation rules.

## Manifest

| Spec | Feature | Release | Status |
|---|---|---|---|
| [001-safe-install-engine](001-safe-install-engine/spec.md) | Safe Install & Merge Engine — ownership-based file merge + `.zero-two-one.json` install manifest (TDD §6–7) | mvp-3 | Done |
| [002-migrate-mode](002-migrate-mode/spec.md) | Migrate-Mode — detection, phase/stack interview, existing-doc import + duplicate resolution, Spec Kit reuse (TDD §8/§6) | mvp-3 | Done |
| [003-manifest-qa-contract](003-manifest-qa-contract/spec.md) | Manifest as QA Contract — one `lib.js` parser for phase/stack; retire run-qa output-scraping (TDD §7, r7) | mvp-3 | Done |
| [004-workflow-doctor](004-workflow-doctor/spec.md) | Workflow-Manager — read-only `021-doctor` drift reporter reconciling manifest/spec/release/roadmap state (TDD §13, r7) | mvp-3 | In Progress |
