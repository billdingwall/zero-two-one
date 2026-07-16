# Data Model: Workflow-Manager Reporter

*The shapes the reporter produces and the state it reads. All read-only. Behavior in [plan.md](plan.md); the CLI in [contracts/](contracts/).*

## 1. DriftFinding

One detected discrepancy. The checks return `DriftFinding[]`; nothing is persisted.

| Field | Type | Notes |
|---|---|---|
| `check` | string | which reconciliation raised it (e.g. `spec-index`, `release-specs`) |
| `location` | string | where the drift is (spec name, release file, roadmap row, manifest) |
| `actual` | string | the value found |
| `expected` | string | the value repo state implies |
| `proposedFix` | string | one-line correction (what an apply-increment *would* do — not done here) |
| `severity` | `'hard' \| 'advisory'` | `hard` → non-zero exit; `advisory` → informational |

## 2. Severity model

| Severity | Checks | Exit impact |
|---|---|---|
| **hard** | spec ↔ `_INDEX` (FR-002), spec ↔ tasks (FR-003) | any present ⇒ non-zero exit |
| **advisory** | release ↔ specs (FR-004), roadmap ↔ release (FR-005), backlog ↔ release (FR-006), manifest phase (FR-007) | never affects exit |

*Rationale: hard findings are unambiguous, self-caused status lags a maintainer should fix now; advisory findings are lower-confidence or in-flight-legitimate (a release mid-build is not "wrong").*

## 3. The six checks (pure `root → DriftFinding[]`)

| Check | Reads | Fires when |
|---|---|---|
| `checkSpecIndex` | `specs/*/spec.md` frontmatter, `specs/_INDEX.md` | index row status ≠ frontmatter status |
| `checkSpecWork` | spec status + `tasks.md` | status gate-passing/`Done` **and** unchecked tasks > 0 |
| `checkReleaseSpecs` | specs' `release:` + `_releases/*.md` `Status:` | **advanceable** (all specs `Done`, Status not `done`) or **overclaimed** (Status `done`, a spec not `Done`); an in-flight release with no `Done` specs is **not** drift (A1/R7) |
| `checkRoadmapRelease` | `05-ROADMAP.md` table rows, `_releases/*.md` `Status:` | normalized row status ≠ release-file status |
| `checkBacklogRelease` | `04-BACKLOG.md` table (by `Release`), specs' state | a release has `Open` rows while its specs are all `Done` |
| `checkManifestPhase` | `manifestFacts()` | `source==='manifest'` and `phaseNum` ≠ inferred phase's num |

## 4. Status normalization

Statuses appear as glyphs and words across docs; one `normalizeStatus(raw)` collapses them so comparisons are stable:

| Normalized | Sources |
|---|---|
| `done` | `Done`, `✅`, `Delivered`, `Completed` |
| `in-progress` | `In Progress`, `🔜`, `Next`, `In progress` |
| `open` | `Open`, `◻`, `Planned`, `Todo`, `Draft` |

Spec lifecycle statuses (`lib.js` `STATUSES`) map through the same normalizer for the index/work checks.
