# Data Model: Manifest as QA Contract

*The shapes and mappings the parser owns. Behavior in [plan.md](plan.md); the API in [contracts/](contracts/). No manifest **schema** change — only how it is read.*

## 1. ManifestFacts

The normalized read `manifestFacts(root)` returns — the single shape every consumer trusts.

| Field | Type | Notes |
|---|---|---|
| `phase` | `'planning' \| 'mvp' \| 'growth'` | canonical string key |
| `phaseNum` | `0 \| 1 \| 2` | what `run-qa.sh` acts on |
| `phaseLabel` | string | exact current label (parity) — `Planning (Zero)` / `MVP Build (One)` / `Growth` |
| `stack` | `'claude' \| 'antigravity' \| 'kiro' \| null` | from `tools.stack`; `null` when no manifest |
| `mode` | `'scaffold' \| 'source' \| 'migrate' \| null` | from the manifest; `null` when inferred |
| `source` | `'manifest' \| 'inferred'` | how the phase was resolved (preserves `--json`) |

`readManifest(root)` returns the raw parsed object or `null` — for callers that need more than the facts.

## 2. Phase vocabulary (defined once in lib.js)

| Manifest value | phaseNum | phaseLabel |
|---|---|---|
| `planning` | 0 | Planning (Zero) |
| `prebuild` *(legacy alias)* | 0 | Planning (Zero) |
| `mvp` | 1 | MVP Build (One) |
| `growth` | 2 | Growth |

Unknown/absent phase value → the inference path (§3). This table replaces `workflow-status.js`'s `PHASE_FROM_MANIFEST`.

## 3. Resolution order (owned by `manifestFacts`)

```
1. manifest present & parseable & phase ∈ vocabulary → { …, source: 'manifest' }
2. manifest unparseable → warn once, fall through
3. infer from repo state (source: 'inferred'):
     specs/ has a non-_INDEX .md            → mvp   / 1
     else 01-PRD.md exists and > 1000 bytes → planning / 0
     else                                    → planning / 0
```

Step 3 is the current `workflow-status.js` inference, moved verbatim into `lib.js` so QA, status, and the gate share one fallback (clarified 2026-07-16). Stack has no inference — `null` when there is no manifest.

## 4. Consumers (after the refactor)

| Consumer | Reads phase via | Keeps |
|---|---|---|
| `scripts/speckit/lib.js` | *owns* `manifestFacts` + the `phase` CLI | the vocabulary, resolution, fallback |
| `scripts/run-qa.sh` | `node scripts/speckit/lib.js phase` → `phaseNum` | its QA-tier `case` on the number |
| `scripts/workflow-status.js` | `manifestFacts()` | only `--json` / human formatting |
| `hooks/pre-commit` | (none today) — contract-ready | the spec-status gate |

*Out of scope (analyze A1): the install engine `scripts/init/` (`manifest.js`, `migrate/detect.js`) keeps its own manifest read/write — specs 001/002 own that persistence. The single-reader contract covers only the lifecycle **phase-read** path above.*
