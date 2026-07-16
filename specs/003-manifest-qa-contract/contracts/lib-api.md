# Contract: `lib.js` manifest API + `phase` CLI

*The programmatic + CLI surface `scripts/speckit/lib.js` gains. Additive — existing `lib.js` exports (spec helpers) are unchanged.*

## Programmatic API

```js
const { readManifest, manifestFacts } = require('./scripts/speckit/lib');
```

### `readManifest(root = repoRoot())` → `object | null`
- Reads `<root>/.zero-two-one.json`. Returns the parsed object, or `null` when the file is **absent or unparseable** (never throws).

### `manifestFacts(root = repoRoot())` → `ManifestFacts`
- The whole resolution (manifest → inference → Planning; [data-model §3](../data-model.md)). Always returns a fully-populated object (never `null`).
- On an unparseable manifest: emits the one warning (`⚠️  Could not parse .zero-two-one.json …; falling back to inference.`) and infers.
- Shape: `{ phase, phaseNum, phaseLabel, stack, mode, source }` ([data-model §1](../data-model.md)).

## CLI

```
node scripts/speckit/lib.js phase      # → the phaseNum (0|1|2), single line, no trailing prose
```
- Guarded by `if (require.main === module)`; requiring `lib.js` as a library runs no CLI.
- `phase` is the only subcommand this spec adds. Unknown subcommand → non-zero exit + usage on stderr.
- Exit 0 on success. The warning (unparseable manifest) goes to **stderr**, so `$(…)` capture of the number stays clean.

## Behavioral guarantees (assertable)

1. **Single reader** — `.zero-two-one.json` is opened, and the phase inferred, in `lib.js` only. `run-qa.sh` contains no `workflow-status.js --json` pipe and no manifest parse.
2. **Parity** — for any given repo state, `node lib.js phase` == the `phaseNum` `021-status` reports == the phase `run-qa.sh` acts on.
3. **Fallback once** — absent/unparseable manifest → the same inferred phase + one warning, wherever it is read.
4. **`--json` preserved** — `workflow-status.js --json` still emits `{ phase: <num>, status: <label>, source }` (other tooling depends on it).
5. **Zero deps / no throw** — built-ins only; `readManifest` never throws on bad input.
