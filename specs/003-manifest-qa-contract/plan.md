# Implementation Plan: Manifest as QA Contract

*The HOW for [spec.md](spec.md). A consolidation refactor — one manifest reader in `lib.js`, every consumer routed through it, no behavior change.*

## Approach

1. **Add the parser to `lib.js`** — `readManifest(root)` (parse or null) and `manifestFacts(root)` → `{ phase, phaseNum, phaseLabel, stack, mode }`, applying the canonical vocabulary (with the `prebuild→planning` legacy alias). Export both.
2. **Move the vocabulary into `lib.js`** — the single `PHASE` map (`planning|mvp|growth` + legacy) lives here; `workflow-status.js` deletes its copy and imports it.
3. **Route `run-qa.sh` through the parser** — replace the `workflow-status.js --json | node -e '…JSON.parse…'` scrape with one `node -e "process.stdout.write(String(require('./scripts/speckit/lib').manifestFacts().phaseNum))"` (or a `lib.js` CLI subcommand — clarify). Same "Detected Lifecycle Phase: N" output.
4. **Delegate `workflow-status.js`** — its manifest branch calls `manifestFacts`; the no-manifest inference stays here as the single documented fallback (FR-006).
5. **Gate coherence** — `hooks/pre-commit` reads phase/stack (if/when needed) via the same parser; today it needs neither, so this is a guard rail + a comment pointing at the contract.

## Design notes

- **Fallback lives once:** absent/unparseable manifest → Planning (0) + one warning string, exported from `lib.js` so QA and status emit the same thing.
- **Behavior parity is the acceptance bar:** the refactor is validated by asserting identical phase output and identical QA-tier/gate outcomes before/after (FR-007) — snapshot the current outputs first.
- **Zero deps, sync:** `fs`/`path` only, matching `lib.js` today.
- **Package sync:** `lib.js`, `run-qa.sh`, `workflow-status.js`, `hooks/pre-commit` all ship — `npm run sync:package` after.

## Testing strategy

`node:test` over `lib.js` (`test/speckit/` or `test/init/`-adjacent):
- `manifestFacts` maps each phase value (incl. `prebuild` legacy) → number/label; unknown/absent → Planning fallback.
- `readManifest` returns null on missing/corrupt file.
- an integration check that `run-qa.sh` no longer references `workflow-status.js` for phase, and prints the expected phase for a fixture manifest.
- a grep-guard test: `.zero-two-one.json` is opened in exactly one module.

## Work breakdown

See [tasks.md](tasks.md).
