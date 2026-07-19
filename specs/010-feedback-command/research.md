# Research: Feedback Command (`021-feedback`)

*Decisions and rejected alternatives behind [plan.md](plan.md). The clarify round settled transport selection, confirm-then-run, and the context-block field set (see [spec.md](spec.md) Clarifications); the items below are the implementation-level calls the plan depends on.*

## R1 — Where does `version` come from?

**Decision:** read it directly via the already-exported `readManifest(root)?.version`; take `stack`/`phase` from `manifestFacts(root)`.

`manifestFacts()` (`scripts/speckit/lib.js:206`) is the "one copy" phase/stack resolver, and it returns `stack`/`phase`/`ssd`/`mode` — **but not `version`**. Two options:
- **(chosen)** `feedback.js` calls `readManifest()` for `version` and `manifestFacts()` for `stack`/`phase`. Both are already exported; **zero blast radius** on spec-003 and its tests.
- *(rejected)* Add `version` to the `manifestFacts()` return. Cleaner conceptually (version *is* a manifest fact), but perturbs the spec-003 contract + its snapshot tests for a single consumer. Revisit if a second consumer needs `version`.

The absent-manifest path: `readManifest()` returns `null` and `manifestFacts()` falls to inference (no `stack`) — `feedback.js` detects the missing manifest and emits the explicit "manifest not found" marker (FR-003).

## R2 — Detecting `gh` present **and** authenticated

**Decision:** `ghReady()` = `spawnSync('gh',['--version'])` exit 0 (on PATH) **and** `spawnSync('gh',['auth','status'])` exit 0 (authed). Either non-zero → `url`.

The clarify round chose the present-**and**-authed gate specifically so we never hand the user a `gh` command that then fails on auth. `gh auth status` exits non-zero when not logged in, which is exactly the fallback trigger. No token is ever read — we only inspect exit codes. `spawnSync` with a captured (non-inherited) stdio for the probes keeps them quiet.

## R3 — URL fallback: plain pre-fill vs issue-form params, and length

**Decision:** the `url` transport uses plain `?title=&body=` pre-fill (not the `021-feedback.yml` form's field-id query params), `encodeURIComponent`-encoded; if the encoded URL would exceed ~8 KB, truncate the body with a note and echo the full block to stdout.

- GitHub issue **forms** accept pre-fill via field-id params, but the mapping is brittle (depends on the yml `id`s and form state) and silently ignored if it drifts. Plain `title`/`body` pre-fill on `issues/new` is universally reliable and carries the whole context block in `body`. The form still does its job for web-initiated reports (label + title prefix + structure) — FR-008 is about *shaping incoming issues for triage*, which the `labels:`/`title:` defaults deliver regardless of the URL path.
- Browsers/servers cap URL length (~8 KB is the safe floor). Feedback bodies are short, but a long paste could overflow; truncate-with-note keeps the transport from producing a broken link, and stdout always has the full payload for manual paste.
- *(rejected)* `?template=021-feedback.yml` + field params — couples the URL to the form's internal ids and breaks pre-fill when they change.

## R4 — Cross-stack surfacing (esp. kiro)

**Decision:** add only `.claude/commands/021-feedback.md`; rely on the existing surface-renders for antigravity; kiro reaches the command through the `021` agent's CLI wrapper.

- **antigravity** already renders `{ fromDir:'.claude/commands', match:'021-*.md', kind:'command' }` → `.agents/skills/021-feedback/SKILL.md` (spec 007). Adding the command file is enough; **no `adapters.js` change**.
- **kiro** renders `skills/` (not `.claude/commands`) into `.kiro/skills`, plus steering + the `021` agent (`templates/kiro-agent/021.json`). The agent wraps the `021` CLI, so `021 feedback` is reachable without a per-command skill. A one-line mention in the kiro agent/steering is **optional polish**, deferred — the mechanical behavior is identical because all stacks call the same CLI (FR-001).
- *(rejected)* A neutral command source rendered to all three stacks — unnecessary; the spec-007 machinery + the assistant-agnostic CLI already give identical behavior. Matches spec-007's "no neutral command source" decision.

## R5 — Golden-fixture safety

**Finding:** adding `.claude/commands/021-feedback.md` does **not** require re-baselining `test/init/fixtures/claude-golden.json`.

`renderer.test.js` T004 iterates the fixture's **own** entries (`CLAUDE.md`, `021-init.md`, `021-status.md`) and byte-checks each — it is **not** an exhaustive-set assertion, so a new sibling command file doesn't trip it. This spec changes none of the three pinned files. This is the opposite of spec 009, which re-pointed the pinned files and therefore had to re-capture the golden. The neutral-core invariant (T006) also holds: the new file is Layer-2, Layer-1 is untouched.

## R6 — Why a script, not a pure prompt

The command-design layering (§1) and FR-009 (naming `child_process`/`fs`/URL encoding) make the mechanical work — manifest read, `gh` detection, URL assembly, the `gh` invocation — a **script** (`scripts/feedback.js`), with the `/021-feedback` surface as the LLM-driven walkthrough that gathers input and confirms. A pure-prompt version would push `gh`/git/URL mechanics into free-form model behavior, losing determinism and testability. This mirrors every other 021 command: LLM drives, script executes.

## R7 — Confirm-then-run without an auto-post footgun

The confirm-then-run decision is implemented as **dry-by-default + explicit `--submit`**: the script cannot post unless invoked with `--submit`, and the walkthrough only reaches `--submit` after the user confirms. This keeps "no autonomous posting" (FR-006) a **structural** property (the default code path makes no `gh issue create` call) rather than a prompt-only promise, and it's directly testable (assert dry mode records zero `gh issue create` invocations against a fake `gh`).
