# Scripts Overview

Lifecycle automation for the Zero Two One framework. All scripts use Node built-ins only (no npm dependencies) and are wired to npm scripts in `package.json`.

## Manifest

- `workflow-status.js`: Detects the current lifecycle phase from repository state (`npm run 021-status`).
- `run-qa.sh`: Phase-appropriate QA suite — docs validation (Phase 1), prototype checks (Phase 2), tests/a11y/spec compliance (Phase 3+) (`npm run 021-qa`).

### `speckit/` — Spec Kit integration

- `lib.js`: Shared helpers — spec resolution from branch names, status read/write conventions, gate rules, criteria/task extraction.
- `spec-status.js`: Read/set the lifecycle status in `specs/NNN-feature-name/spec.md` (`npm run 021-spec:status`). The status is the source of truth for the refinement gate.
- `fetch-speckit-context.js`: Pulls a feature's Spec Kit artifacts into AI-readable bundles under `.ai/context/` — one markdown file plus a structured JSON artifact (`npm run 021-spec:context`).
- `verify-spec-compliance.js`: Compliance audit — gate status, artifact completeness, unresolved clarifications, task truthfulness, context freshness (`npm run 021-spec:verify`; `--gate` is the fast subset used by `hooks/pre-commit`; `--json` for agents).
