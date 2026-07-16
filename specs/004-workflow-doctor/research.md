# Research & Decisions: Workflow-Manager Reporter

*Rationale behind [plan.md](plan.md). The user-facing log is the spec's `## Clarifications`; this captures the why + rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **Read-only reporter first** (detect + propose; no apply) | TDD §13 r7: earn trust before touching the working tree; detection is the safe, high-value first slice. | Auto-fix now — risks clobbering intentional in-flight state before the report is trusted. |
| R2 | **Pure `check(root) → DriftFinding[]` functions** | Testable in isolation against fixtures; the runner just concatenates + renders. | One monolithic scan — hard to test each drift type. |
| R3 | **Hard vs advisory severity** drives the exit code | Distinguishes self-caused status lags (fix now) from in-flight-legitimate or low-confidence hints; keeps the exit code meaningful. | Any-drift → non-zero — advisory hints (mid-build release) would cry wolf. |
| R4 | **Backlog reconciled at the release level** | Backlog rows link to specs only by prose; release-column grouping is the deterministic signal, and it still catches the real Open-vs-Done drift. | Item-level prose matching — fuzzy, false matches; defer to an apply-increment. |
| R5 | **Standalone command** | Keeps the reporter out of the QA/commit path it must never join (§13); avoids coupling `021-status`→doctor. | A hint in `021-status`/`021-qa` — creeps toward the path §13 forbids. |
| R6 | **Reuse `lib.js` (spec 003)** | Phase/spec state through one reader; no drift between how the doctor and the rest read state. | A private manifest/spec parser — the exact duplication spec 003 removed. |
| R7 | **`In Progress` + open tasks is NOT drift** | A spec mid-implementation legitimately has unchecked tasks; only `Done`/gate-passing-with-open-tasks is a real mismatch. | Flag all open tasks — noise on every active spec. |
| R8 | **Tolerant `normalizeStatus`** | Docs use glyphs (✅/🔜/◻) and words interchangeably; normalize once so comparisons don't false-positive on formatting. | Exact-string compare — every glyph/word variant reads as drift. |

## Open (plan-level, decided here)

- **Module** = `scripts/speckit/doctor.js` (sits with `lib.js`; reuses it directly).
- **Report glyphs** = `✗` hard / `•` advisory; groups suppressed when empty.
- **Missing spec dir or `_INDEX` row** = a hard finding (a structural inconsistency, not just a status lag).

## Zero-dependency confirmation

`fs`/`path` + `lib.js` (which already uses `child_process` for git). No package added; `npm run lint` stays dependency-free.
