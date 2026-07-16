# Research & Decisions: Manifest as QA Contract

*Rationale behind [plan.md](plan.md). The user-facing log is the spec's `## Clarifications`; this captures the why + rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **One resolver in `lib.js`** (`manifestFacts`) owning manifest→inference→Planning | The r6 break came from two consumers resolving phase differently; a single function makes divergence impossible. | Parser-only in `lib.js`, inference elsewhere — reintroduces two paths. |
| R2 | **Inference moves into `lib.js`** (from `workflow-status.js`) | Keeps `run-qa.sh` behavior identical (it gets inference today via the scrape) while removing the scrape — the only behavior-preserving option. | Leave inference in status → `run-qa.sh` calling `lib.js` directly would silently drop it (FR-007 violation). |
| R3 | **`run-qa.sh` reads a dedicated `lib.js phase` CLI** | A clean, testable seam; no inline JS in the shell (the pattern we're reducing). | `node -e require(...)` inline — keeps JS in bash; a separate wrapper script — one more file to sync. |
| R4 | **`workflow-status.js` → thin presenter** | With resolution in `lib.js`, the status script is just formatting; deleting its map/inference removes the duplication outright. | Keep its logic and *also* call `lib.js` — leaves dead duplicate code. |
| R5 | **Parity against a captured baseline is the definition of done** | A pure refactor is only correct if outputs don't move; snapshot first, diff after. | Trust code review — misses subtle label/number drift. |
| R6 | **Preserve `--json` shape** (`{ phase:num, status:label, source }`) | `run-qa.sh` (pre-refactor) and any CI depend on it; changing it is an unrelated break. | "Improve" the JSON now — out of scope, risks consumers. |
| R7 | **Warning → stderr; CLI prints only the number to stdout** | `PHASE=$(node lib.js phase)` must capture a clean integer. | Warning to stdout — pollutes the captured value. |

## Open (plan-level, decided here)

- **CLI subcommand name** = `phase` (room for `stack`, `facts` later without churn).
- **Stack with no manifest** = `null` (no inference for stack; no consumer needs it yet).
- **Legacy `prebuild`** stays a first-class alias → `planning` (back-compat, matches today).

## Zero-dependency confirmation

`fs`/`path` only, as `lib.js` uses today. No package added; `npm run lint` stays dependency-free.
