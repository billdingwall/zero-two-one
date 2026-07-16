# Research & Decisions: Conflict-Aware Pre-commit Install

*Rationale behind [plan.md](plan.md). The user-facing log is the spec's `## Clarifications`; this captures the why + rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **Insert the gate, don't overwrite** | For a framework selling non-destructive adoption, clobbering the one file serious repos customize is the worst edge; chaining preserves the user's hook. | Spec 001's backup-and-overwrite — the user's hook silently stops running. |
| R2 | **Gate-first (after the shebang)** | A blocking gate must run; appended after a hook ending in `exit 0` would never execute — a silent bypass. | Append at end — bypassable; append + warn — shifts the burden to the user. |
| R3 | **lefthook report-only** | Editing yml/yaml/toml/json without a parser (zero-dep) risks corrupting the user's config; a printed snippet is safe and clear. | Automated YAML edit — fragile across formats/indentation/existing sections. |
| R4 | **husky = `.husky/pre-commit` v9+** | v9 is current; a plain `.husky/pre-commit` works for the live majority; append/create is simple. | Version-detect v5–8 `_/husky.sh` sourcing — more code for a shrinking population. |
| R5 | **`.git/hooks/pre-commit.zto` as the chained gate artifact** | TDD §1.3 prescribes it; keeps the gate a single installed file that any strategy invokes. | Invoke the repo `hooks/pre-commit` inline — works, but §1.3 names `.zto`, and `.git/hooks` is the canonical hook location. |
| R6 | **Guard-marker block (`>>> … >>>`)** | One `grep` gives idempotency and a clean find/remove handle for the user. | A hash/loose match — brittle; no removal handle. |
| R7 | **Persist `manifest.hook`** | `apply.js` already computes the strategy for logging; persisting it makes re-runs idempotent and lets `021-doctor` (004) surface hook state later. | Recompute every run — fine, but the manifest is the natural audit trail. |

## Open (plan-level, decided here)

- **Helper module** = `scripts/init/hook.js` (detection + `insertGuarded`), kept out of the already-busy `apply.js`.
- **`manual` (lefthook) exit** = success (0) — reporting a manual step is not a failure; init still completes.
- **Marker text** = `>>> zero-two-one gate >>>` / `<<< zero-two-one gate <<<`.

## Zero-dependency confirmation

`fs`/`path` + string manipulation only; lefthook is report-only, so no config parser is needed. No package added; `npm run lint` stays dependency-free.
