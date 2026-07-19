# Scripts Overview

Lifecycle automation for the Zero Two One framework. All scripts use Node built-ins only (no npm dependencies) and are wired to npm scripts in `package.json`.

## Manifest

- `workflow-status.js`: Detects the current lifecycle phase from repository state (`npm run 021-status`).
- `run-qa.sh`: Phase-appropriate QA suite — docs & optional-prototype validation (Phase 0), tests/a11y/spec compliance (Phase 1), + feedback checks (Phase 2) (`npm run 021-qa`).
- `feedback.js`: The mechanical layer behind `021 feedback` (spec 010) — reads the manifest context block, detects `gh`, and assembles a `gh issue create` invocation or a pre-filled new-issue URL for `billdingwall/zero-two-one`. Dry by default; posts only under `--submit` on the `gh` path. No token handling; Node built-ins only.
- `design.js`: The mechanical layer behind `021 design set <system>` (spec 011) — records `tools.design` in the manifest (targeted write), scaffolds `requirements/_design/tokens/`, and regenerates the marker-bounded "Design System Mapping" section of `DESIGN.md` (material-3 / BYO / none). The assistant walks assess/map around it. Node built-ins only.
- `prototype.js`: The mechanical layer behind `021 prototype init` (spec 012) — scaffolds the opt-in static prototype (`prototype/index.html`/`styles.css`/`app.js`) consuming the design-system CSS variables (`@import` the tokens file, or inline `:root` from `DESIGN.md`); non-destructive (`--force` to overwrite). The assistant builds the real screens from the PRD/EDD. Node built-ins only.

### `speckit/` — Spec Kit integration

- `lib.js`: Shared helpers — spec resolution from branch names, status read/write conventions, gate rules, criteria/task extraction.
- `spec-status.js`: Read/set the lifecycle status in `specs/NNN-feature-name/spec.md` (`npm run 021-spec:status`). The status is the source of truth for the refinement gate.
- `fetch-speckit-context.js`: Pulls a feature's Spec Kit artifacts into AI-readable bundles under `.ai/context/` — one markdown file plus a structured JSON artifact (`npm run 021-spec:context`).
- `verify-spec-compliance.js`: Compliance audit — gate status, artifact completeness, unresolved clarifications, task truthfulness, context freshness (`npm run 021-spec:verify`; `--gate` is the fast subset used by `hooks/pre-commit`; `--json` for agents).
