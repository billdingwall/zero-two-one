# Implementation Plan: Workflow-Manager Reporter

*The HOW for [spec.md](spec.md). A read-only report that runs a set of pure reconciliation checks over repo state and prints the drift. Reuses spec 003's `lib.js`; writes nothing.*

## Approach

```
021-doctor
  findings = []
  findings.push(...checkSpecIndex(root))     // FR-002: spec.md status vs _INDEX row
  findings.push(...checkSpecWork(root))      // FR-003: Done spec w/ unchecked tasks
  findings.push(...checkReleaseSpecs(root))  // FR-004: release Status vs its specs' aggregate
  findings.push(...checkRoadmapRelease(root))// FR-005: roadmap row Status vs release file
  findings.push(...checkManifestPhase(root)) // FR-006: manifest phase vs inferred (advisory)
  render(findings)                           // FR-007: grouped, proposed fixes, or "no drift"
  process.exit(findings.length ? 1 : 0)      // FR-008: advisory exit code, NOT gated
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
- **checkManifestPhase** — `manifestFacts()`; if `source === 'manifest'` and `phaseNum` ≠ the inferred phase's num → advisory finding (low severity).

Status parsing is tolerant (glyphs like ✅/🔜/◻ and words like Done/Planned map to a small normalized set) — a shared `normalizeStatus` keeps the comparisons stable.

## Testing strategy

`node:test` over `doctor.js` against fixture repos (temp dirs with seeded `specs/`, `_INDEX.md`, `_releases/`, manifest):
- clean repo → no findings, exit 0.
- each check fires on a seeded mismatch (spec↔index, done-with-tasks, release-lag, roadmap-lag, phase drift).
- read-only: whole-tree snapshot unchanged after a run.
- a check that `hooks/pre-commit` does not reference the doctor.

## Work breakdown

See [tasks.md](tasks.md).
