# Implementation Plan: Workflow-Manager Reporter

*The HOW for [spec.md](spec.md). A read-only report that runs a set of pure reconciliation checks over repo state and prints the drift. Reuses spec 003's `lib.js`; writes nothing.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/speckit/doctor.js`) |
| **Dependencies** | **None** — `fs`/`path` (+ `node:child_process` if any git read); reuses `lib.js` |
| **Reuses** | spec 003: `manifestFacts`, `listSpecs`, `readStatus`, `countTasks`, `repoRoot` |
| **Testing** | `node:test` over `doctor.js` against seeded fixture repos |
| **Source of truth** | TDD §13 (Workflow Manager, read-only reporter first) |

## Constraints check (must hold)

- **Read-only** — opens no file for writing, edits no working-tree file, makes no commit; whole-tree snapshot identical after a run (FR-009).
- **Out of the commit path** — never referenced by `hooks/pre-commit`; exit code advisory (non-zero on hard drift only), never gated (FR-009).
- **No second parser** — phase/spec state comes through `lib.js` (FR-010), extending spec 003's single-reader discipline.
- **Deterministic** — checks are pure functions of repo state; structured status only, no prose matching.
- **Zero dependencies** — built-ins only (FR-011).

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | `DriftFinding` shape, severity model, the six checks, status normalization |
| [contracts/doctor-cli.md](contracts/doctor-cli.md) | `021-doctor` CLI + check contracts + exit-code + guardrails |
| [research.md](research.md) | Decisions & rationale (rolls up the clarify session) + rejected alternatives |
| [quickstart.md](quickstart.md) | Validation walkthrough (seed each drift, run, observe) |

## Approach

```
021-doctor
  findings = []
  findings.push(...checkSpecIndex(root))     // FR-002: spec.md status vs _INDEX row
  findings.push(...checkSpecWork(root))      // FR-003: Done spec w/ unchecked tasks
  findings.push(...checkReleaseSpecs(root))  // FR-004: release Status vs its specs' aggregate
  findings.push(...checkRoadmapRelease(root))// FR-005: roadmap row Status vs release file
  findings.push(...checkBacklogRelease(root))// FR-006: backlog Open rows vs Done specs (advisory)
  findings.push(...checkManifestPhase(root)) // FR-007: manifest phase vs inferred (advisory)
  render(findings)                           // FR-008: grouped, proposed fixes, severity, "no drift"
  process.exit(findings.some(hard) ? 1 : 0)  // FR-009: non-zero only on HARD drift, NOT gated
```

Each `check*` is a pure function `root → DriftFinding[]`. Nothing writes; the command's only effect is stdout + an exit code.

## Modules

| Piece | Role |
|---|---|
| `scripts/speckit/doctor.js` | the checks + `render` + CLI (`require.main` guard); reuses `lib.js` |
| `package.json` `021-doctor` script | `node scripts/speckit/doctor.js` |
| `lib.js` (spec 003, reused) | `manifestFacts`, `listSpecs`, `readStatus`, `countTasks`, `repoRoot` |

## Check details

- **checkSpecIndex** — parse the `specs/_INDEX.md` table (Spec → Status column); for each spec, compare to `readStatus(spec)`; mismatch → finding (proposed: the frontmatter value).
- **checkSpecWork** — for each gate-passing/`Done` spec, `countTasks(tasks.md)`; unchecked > 0 → finding.
- **checkReleaseSpecs** — group specs by `release:` frontmatter; if all `Done` and the `_releases/<rel>.md` `Status` isn't a delivered/in-progress value → finding (proposed advance); none started but Status implies progress → finding.
- **checkRoadmapRelease** — parse the `05-ROADMAP` MVP table rows (release → Status glyph); compare to each `_releases/*.md` `Status:` line; disagreement → finding.
- **checkBacklogRelease** — parse the `04-BACKLOG.md` table (Description · Status · Ownership · Release); group by `Release`; if a release has `Open` rows while its specs are all `Done` → advisory finding (release-level; no item↔spec matching).
- **checkManifestPhase** — `manifestFacts()`; if `source === 'manifest'` and `phaseNum` ≠ the inferred phase's num → advisory finding (low severity).

Each finding is **hard** (spec↔`_INDEX`, spec↔tasks) or **advisory** (backlog, manifest phase); `hard = (f) => f.severity === 'hard'` drives the exit code. Status parsing is tolerant (glyphs like ✅/🔜/◻ and words like Done/Open/Planned map to a small normalized set) — a shared `normalizeStatus` keeps the comparisons stable.

## Testing strategy

`node:test` over `doctor.js` against fixture repos (temp dirs with seeded `specs/`, `_INDEX.md`, `_releases/`, manifest):
- clean repo → no findings, exit 0.
- each check fires on a seeded mismatch (spec↔index, done-with-tasks, release-lag, roadmap-lag, phase drift).
- read-only: whole-tree snapshot unchanged after a run.
- a check that `hooks/pre-commit` does not reference the doctor.

## Work breakdown

See [tasks.md](tasks.md).
