# Tasks: Feedback Command (`021-feedback`)

*Generated from [plan.md](plan.md), [data-model.md](data-model.md), [contracts/feedback-command.md](contracts/feedback-command.md), [research.md](research.md), and [quickstart.md](quickstart.md). Dependency-ordered; tests-first. `[P]` = parallelizable. The mechanical `scripts/feedback.js` (manifest read + `gh` detect + payload/URL assembly, zero-dep) is the core; the dispatcher route, command surface, and issue form ride on it. Cross-stack rendering is (almost) free — adding the `.claude/commands/021-feedback.md` file auto-renders to antigravity via the spec-007 `021-*.md` surface-render, no adapter change.*

**Proposed layout:** new `scripts/feedback.js`; new `.claude/commands/021-feedback.md`; new `.github/ISSUE_TEMPLATE/021-feedback.yml`; `bin/021.js` (+`feedback` route + usage line); `_INDEX.md` updates; tests in `test/feedback/feedback.test.js` (new) + a cross-stack assertion alongside the init suite.

## Phase 1 — Setup & guardrails
- [x] T001 **Confirm the seams before writing code.** `manifestFacts()` (`scripts/speckit/lib.js:206`) returns `stack`/`phase` but **not `version`** → `version` comes from `readManifest()?.version` (both already exported; research R1). `bin/021.js` `resolve()` is the one edit point for the route (spec-009 invariant: no logic in the dispatcher). `REPO = 'billdingwall/zero-two-one'` is a module constant (FR-007). Adding a new command file does **not** re-baseline `claude-golden.json` (research R5). No task changes these facts — this pins them.
- [x] T002 [P] **Test helpers** — a `gh` fake on `PATH` (a shim whose `--version`/`auth status`/`issue create` exit codes are configurable, and that **records** its invocations so "no autonomous post" is assertable); a temp-repo helper that seeds a `.zero-two-one.json` + optional `origin` remote; a runner for `node scripts/feedback.js <args>` capturing stdout/stderr/exit.

## Phase 2 — Tests first (author before their Phase 3 counterparts)
- [x] T003 [P] **Payload / context block** (contract C1): with a fixture manifest, the assembled body contains `version`/`stack`/`phase`; with an `origin` remote the repo link is present; without `origin` it is omitted with the note (Scenarios 3; FR-002/003).
- [x] T004 [P] **Absent manifest degrades** (C1): no `.zero-two-one.json` ⇒ the context block carries the explicit "manifest not found" marker and the command still assembles + exits 0 (Scenario 4; FR-003).
- [x] T005 [P] **Transport selection** (C1): fake `gh` present + `auth status` ok ⇒ `gh`; `gh` absent ⇒ `url`; **`gh` present but `auth status` non-zero ⇒ `url`** (the auth gate specifically); transport is reported before action (Scenarios 1/2; FR-004).
- [x] T006 [P] **No autonomous post** (C1): dry mode (no `--submit`) records **zero** `gh issue create` invocations against the fake `gh`; `--submit` on the `gh` path records exactly one (Scenario 1; FR-006).
- [x] T007 [P] **Fixed slug + URL well-formedness** (C4): every path targets `billdingwall/zero-two-one`; the `url` transport emits a valid `issues/new?title=…&body=…` with `encodeURIComponent`-encoded params carrying the context block; no flag can retarget the repo (Scenario 5; FR-005/007).
- [x] T008 [P] **Dispatch route** (C2): `node bin/021.js feedback "t" --body "b"` execs `scripts/feedback.js` with args passed through and returns its exit; `021 feedback` with no title ⇒ usage + exit 1 (FR-001). *(analyze A4: keep this assertion in `test/feedback/feedback.test.js` with 010's other tests — do not edit `test/cli/dispatch.test.js`; the `Usage: 021` match there is additive-safe to the new `feedback` usage line.)*
- [x] T009 [P] **Cross-stack render** (C3): a `claude` install produces `.claude/commands/021-feedback.md`; an `antigravity` install produces `.agents/skills/021-feedback/SKILL.md` (via the existing `021-*.md` surface-render). For **kiro**, assert the install does **not** error and no per-command skill is expected — feedback is reached through the `021` agent's CLI wrapper, like existing `021-init`/`021-status` *(analyze A1)*. Payload identity is proven by the shared CLI (T003–T007), not per-stack duplication (Scenario 7; FR-001).

## Phase 3 — Implementation
- [x] T010 `scripts/feedback.js`: the mechanical core — parse `<title> [--body <text>] [--submit]` (usage + exit 1 if no title); `context = readManifest()?.version` + `manifestFacts().{stack,phase}` (absent-manifest marker); `repoLink = gitOrigin()` (spawnSync `git remote get-url origin`, else null); assemble body + fenced context block; `ghReady()` = `gh --version` exit 0 **and** `gh auth status` exit 0 (quiet-stdio probes, research R2); report transport; **dry by default** (print transport + payload + the `gh issue create …` it would run / the URL) — post only under `--submit` on the `gh` path via `spawnSync('gh',['issue','create','--repo',REPO,…],{stdio:'inherit'})`, propagate its exit; `url` `--submit` = no-op note. `REPO` constant; Node built-ins only (contracts C1/C4; FR-002/003/004/005/006/007/009).
- [x] T011 `bin/021.js`: add the `feedback` case to `resolve()` (`{ runner:'node', file: script('feedback.js'), lead:[], rest }`) and a `feedback` line to `USAGE`. No logic in the dispatcher (spec-009 invariant) (C2; FR-001).
- [x] T012 `.claude/commands/021-feedback.md`: the ask-don't-assume walkthrough (EDD §4) — gather title + optional detail; run `npx 021 feedback …` (dry) and show the transport + payload; file **only on explicit confirmation** (`… --submit` for gh, or open the URL); report the result. Uses `npx 021 …` (**not** `npm run`, per spec 009). This file **auto-renders** to the antigravity SKILL surface — no `adapters.js` change (C3; FR-001/006). *(analyze A3: add `.claude/commands/021-feedback.md` to `SURFACES.claude` in `test/cli/dispatch.test.js` T006 so its "references `npx 021`, no `npm run 021-`" check covers the new command.)*
- [x] T013 `.github/ISSUE_TEMPLATE/021-feedback.yml`: a GitHub **issue form** — feedback textarea (required) + auto-context textarea, `labels: [feedback]`, a `[feedback] ` title prefix, so submissions land shaped for backlog triage (FR-008). Register it in `.github/ISSUE_TEMPLATE/_INDEX.md`.
- [x] T014 `scripts/_INDEX.md`: add the `feedback.js` row (mechanical layer; called via `021 feedback`).

## Phase 4 — Verify & polish
- [x] T015 Run the [quickstart](quickstart.md) end-to-end: dry `gh` run, `--submit` (only if actually filing), `url` fallback, no-manifest degrade, cross-stack render, form present. Reconcile any drift.
- [x] T016 [P] Wire `test/feedback/feedback.test.js` into `npm test`; full existing suite green; the `claude-golden.json` fixture is **unchanged** (research R5). Update the canonical surface expectations so they don't go stale: add `021-feedback` to `EXPECTED_COMMANDS` in `test/init/surface.test.js` *(analyze A2)* and confirm the `SURFACES.claude` addition from T012 *(analyze A3)* — both are additive; nothing pre-existing breaks.
- [x] T017 [P] `npm run lint` green (`node --check scripts/feedback.js`); **no runtime dependency added** (FR-009); `npm run check:links` clean (incl. this spec's `tasks.md`); `npm run sync:package -- --check` clean (the 3 new files land in `package/**`).
- [x] T018 **Dogfood**: regenerate `.zero-two-one.json` (picks up `scripts/feedback.js`, `.claude/commands/021-feedback.md`, `.github/ISSUE_TEMPLATE/021-feedback.yml`); `npx 021 feedback "dogfood test"` (dry) reports the repo's own `version`/`stack`/`phase` context block; root user-owned docs updated opportunistically (not required).
- [x] T019 Update `specs/_INDEX.md` status; run `npx 021 spec verify 010` clean before `Done`.

## Dependencies (summary)
- Setup: T001 (seams) precedes implementation; T002 (helpers, esp. the recording `gh` fake) → all tests.
- Tests (T003–T009) authored before their Phase-3 counterparts; all `[P]`.
- Core order: **T010 (feedback.js) → T011 (route) → T012 (command surface)**; T013 (form) + T014 (index) independent of the core, can run in parallel `[P]`.
- Verify (T015–T019) last; T019 gates `Done`.

## Parallelization notes
- Phase-2 tests are independent (`[P]`); T006 (no-autonomous-post) and T005 (transport gate) both lean on the recording `gh` fake from T002.
- T010 is the critical path; T013/T014 can land alongside it. T009's cross-stack assertion needs only the command file (T012), not the script.
