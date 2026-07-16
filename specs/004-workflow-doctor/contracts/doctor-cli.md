# Contract: `021-doctor` CLI + checks

*The command surface and the guarantees each check + the runner make. All read-only.*

## Command

```
npm run 021-doctor          # → node scripts/speckit/doctor.js
```

- Prints a grouped drift report to stdout; a clean repo prints exactly one "no drift" line.
- **Exit code:** non-zero iff at least one **hard**-severity finding exists; clean or advisory-only ⇒ 0.
- Writes nothing (no file opened for write, no commit). `require.main === module` guards the CLI so `doctor.js` can also be required by tests.

## Report format

```
Zero Two One — workflow doctor

  spec ↔ index
    ✗ 002-migrate-mode: _INDEX says "In Progress", spec says "Done"
        → update the _INDEX row to Done
  release ↔ specs
    • mvp-3: all specs Done but Status is "Next"   (advisory)
        → advance _releases/mvp-3.md Status

  1 hard, 1 advisory drift finding(s).
```
- `✗` = hard, `•` = advisory. Groups appear only if they have findings. Deterministic ordering (check order, then location).

## Check contracts (each: pure `root → DriftFinding[]`, no writes)

| Check | Guarantee |
|---|---|
| `checkSpecIndex` | Every `_INDEX` row is compared to its spec's frontmatter; a missing spec dir or missing row is itself a (hard) finding. |
| `checkSpecWork` | Only gate-passing/`Done` specs are checked for unchecked tasks; `In Progress` with open tasks is **not** drift (in-flight is legitimate). |
| `checkReleaseSpecs` | Aggregate over a release's specs; "all Done" and "none started" are the only states that can disagree with the recorded Status. Advisory. |
| `checkRoadmapRelease` | Compares normalized statuses only; prose descriptions are ignored. Advisory. |
| `checkBacklogRelease` | Release-level only — `Open` rows vs `Done` specs; no per-item spec attribution. Advisory. |
| `checkManifestPhase` | Only fires when the manifest phase is authoritative (`source: manifest`) and disagrees with inference. Advisory, low-confidence. |

## Guardrails (normative — TDD §13)

1. **Read-only** — whole-tree snapshot is byte-identical before/after a run.
2. **Not in the commit path** — `hooks/pre-commit` never references `doctor.js`; the gate is unaffected by drift.
3. **No auto-commit / no working-tree edit** — this increment detects only.
4. **No second parser** — phase via `manifestFacts`, spec state via `lib.js`.
5. **Standalone** — `021-status`/`021-qa` neither invoke it nor surface drift.
