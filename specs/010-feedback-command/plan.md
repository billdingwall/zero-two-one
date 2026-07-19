# Implementation Plan: Feedback Command (`021-feedback`)

*The HOW for [spec.md](spec.md). A mechanical `scripts/feedback.js` (manifest read + `gh` detection + payload / URL assembly, zero-dep) exposed as a **`021 feedback`** subcommand on the spec-009 dispatcher, driven by a new **`.claude/commands/021-feedback.md`** command surface that gathers the text, shows the transport + payload, and files on confirmation. The command file **auto-renders to antigravity** through the existing `021-*.md` surface-render (spec 007) — no adapter-table change; kiro reaches it through the `021` agent's CLI wrapper. A GitHub issue form `.github/ISSUE_TEMPLATE/021-feedback.yml` shapes submissions for triage.*

## Technical Context

| Dimension | Value |
|---|---|
| **Language / runtime** | Node.js (`scripts/feedback.js`), dispatched via `bin/021.js` (spec 009) |
| **Dependencies** | **None** (FR-009) — `child_process.spawnSync` (`gh` detect, `git remote`, `gh issue create`), `fs`/`path`, built-in `encodeURIComponent`. No HTTP client, no GitHub SDK, no token storage |
| **New files** | `scripts/feedback.js`; `.claude/commands/021-feedback.md`; `.github/ISSUE_TEMPLATE/021-feedback.yml` |
| **Changed** | `bin/021.js` (+`feedback` route + usage line); `scripts/_INDEX.md`; `.github/ISSUE_TEMPLATE/_INDEX.md`; `test/…` (new); `package/**` via `sync:package` |
| **Reuses** | `scripts/speckit/lib.js` → `readManifest` (version) + `manifestFacts` (stack/phase) + `repoRoot`; the spec-007 `.claude/commands` → `.agents/skills` surface-render (cross-stack, unchanged) |
| **Testing** | `node:test` — payload assembly (context block from a fixture manifest; absent-manifest degrade), transport selection (`gh` present+authed vs not, injected), URL well-formedness + fixed slug, no-autonomous-post (dry mode makes no `gh issue create` call), cross-stack render (feedback command appears in antigravity surface) |
| **Source of truth** | TDD §10 (payload, transport, repo-slug constant, issue template); `requirements/_design/command-design.md` (CLI / skills / scripts layering); EDD §4 (ask-don't-assume) |

## Constraints check (must hold)

- **LLM drives, script executes** (PRD §2 / command-design §1) — `scripts/feedback.js` does the mechanical work (manifest, `gh` detect, assembly); the `/021-feedback` surface is the assistant walkthrough that gathers input and confirms. Neither is end-to-end script-only.
- **No autonomous posting** (FR-006) — the script's **default (dry) mode never posts**; it prints the chosen transport + full payload and, on the `gh` path, the exact `gh issue create …` it *would* run. Posting happens only under an explicit `--submit` invocation, which the command reaches **after** user confirmation.
- **No token handling** (FR-004, spec Out of Scope) — auth stays on GitHub's side: `gh` for the CLI path, the browser for the URL path. The framework issues no HTTP itself.
- **Fixed destination** (FR-007) — `REPO = 'billdingwall/zero-two-one'` is a module constant in `feedback.js`, never a runtime parameter.
- **Zero dependencies** (FR-009) — built-ins only.
- **Golden fixture holds** — adding a *new* `.claude/commands/021-feedback.md` does **not** re-baseline `claude-golden.json`: T004 byte-checks only its three pinned entries (it is not an exhaustive-set assertion), and this spec touches none of them. Contrast spec 009, which re-pointed the pinned files. (See [research.md](research.md) R5.)
- **Neutral-core invariant holds** (spec 006 T006) — the new command is Layer-2 (claude surface, rendered to antigravity); Layer-1 is untouched.

## Design artifacts

| Artifact | Purpose |
|---|---|
| [data-model.md](data-model.md) | `FeedbackPayload` / `ManifestContextBlock` / `Transport` shapes; the dispatcher route row; the issue-form field set; the file inventory + ownership |
| [contracts/feedback-command.md](contracts/feedback-command.md) | `scripts/feedback.js` CLI contract (args, dry vs `--submit`, transport selection, exit codes, stdout shape); the `021 feedback` dispatch contract; the `/021-feedback` walkthrough contract; the URL-format contract |
| [research.md](research.md) | `version`-source decision (read `readManifest().version` vs extend `manifestFacts`); `gh` present-and-authed probe; URL length ceiling + plain-prefill vs issue-form params; kiro surfacing; golden-safety; rejected alternatives |
| [quickstart.md](quickstart.md) | End-to-end: run `021 feedback` dry with/without `gh`, confirm-then-`--submit`, verify the URL fallback, the rendered antigravity surface, and `sync:package --check` |

## Approach

### A1. The mechanical script (`scripts/feedback.js`) — FR-002/003/004/005/007/009

```
node scripts/feedback.js "<title>" [--body <text>] [--submit]

REPO = 'billdingwall/zero-two-one'              // build-time constant (FR-007)

1. facts   = manifestFacts(root)                // stack, phase   (lib.js)
   version = readManifest(root)?.version        // version        (not on manifestFacts — R1)
   context = manifest present ? {version,stack,phase} : { absent:true }   (FR-003)
2. repoLink = gitOrigin(root)                    // `git remote get-url origin`, else null (FR-002)
3. body    = <user body> + '\n\n' + renderContextBlock(context, repoLink)
4. transport = ghReady() ? 'gh' : 'url'         // gh on PATH AND `gh auth status` ok (FR-004)
5a. dry (default):  print transport + title + body; if gh, print the exact
                    `gh issue create --repo <REPO> --title … --body …`; DO NOT run it.
5b. --submit (gh):  spawnSync('gh', ['issue','create','--repo',REPO,'--title',title,'--body',body],
                    { stdio:'inherit' }); exit with its status.
5c. url path:       print the pre-filled issues/new URL (FR-005); --submit is a no-op note
                    (browser submission is the user's action).
```

- **`ghReady()`** — `spawnSync('gh',['--version'])` exit 0 (on PATH) **and** `spawnSync('gh',['auth','status'])` exit 0 (authed). Either failing → `url` (FR-004; never emit a gh path that fails on auth).
- **`gitOrigin()`** — `spawnSync('git',['remote','get-url','origin'],{cwd:root})`; non-zero or empty → `null`, link omitted with a note (FR-002).
- **Context block** is a small Markdown fenced block: `version` / `stack` / `phase` (+ repo link line, or an "no origin remote" note); absent-manifest emits an explicit "manifest not found" marker rather than aborting (FR-003, Scenario 4).
- Zero-dep throughout (FR-009).

### A2. Dispatcher route (`bin/021.js`) — FR-001 (surface reach)

Add one `resolve()` case, mirroring the existing rows:
```js
case 'feedback':
  return { runner: 'node', file: script('feedback.js'), lead: [], rest };
```
…and a `feedback   file a feedback issue to the framework repo` line in `USAGE`. No logic in the dispatcher (spec 009 invariant). This makes `npx 021 feedback …` the assistant-agnostic entry the surfaces call.

### A3. Command surface (`.claude/commands/021-feedback.md`) — FR-001/006, EDD §4

A new claude command file (ask-don't-assume walkthrough):
1. Ask the user for the feedback (a title + optional detail).
2. Run `npx 021 feedback "<title>" --body "<detail>"` (dry) → shows the **transport** it will use and the **full payload** incl. the auto-attached context block.
3. Present that to the user; on explicit confirmation, either run `npx 021 feedback … --submit` (gh path) or open / hand over the pre-filled URL (url path).
4. Report the filed issue URL (gh) or that the browser tab is pre-filled (url).

**Cross-stack (FR-001, Scenario 7):**
- **claude** — the file above, copied verbatim (`surfaceDirs: ['.claude/commands']`).
- **antigravity** — **auto-rendered** to `.agents/skills/021-feedback/SKILL.md` by the existing `{ fromDir:'.claude/commands', match:'021-*.md', kind:'command' }` surface-render (spec 007). **No adapter change.**
- **kiro** — not a `.claude/commands` renderer; the `021` agent already wraps the `021` CLI, so `021 feedback` is reachable through it — **the same way existing `021-init`/`021-status` reach kiro** (lifecycle commands are not kiro skills). Payload/transport identity comes from the shared CLI, so no kiro-specific artifact is required; a steering/agent mention is optional polish *(analyze A1; research R4)*.

> **Migrate mode (analyze A5).** All three new files are framework-owned — `scripts/feedback.js` + `.github/ISSUE_TEMPLATE/021-feedback.yml` are Layer-1 (`LAYER1_DIRS` includes `scripts` + `.github`, `classes.js:29`), `.claude/commands/021-feedback.md` is claude Layer-2. They install identically on **scaffold and migrate** through the shared `classify`/`apply` pipeline with **no** `migrate/duplicates.js` branch (nothing user-owned to reconcile, unlike spec 006's entrypoint). The migrate path is a non-event, not an oversight.

> **Neutral-core invariant (analyze A6).** `scripts/feedback.js` + the issue form are all-stack and byte-identical (Layer-1), so spec 006's T006 holds; the command file is Layer-2. The `claude-golden.json` fixture is untouched (R5). Verified against `classes.js` — no artifact change needed.

### A4. Issue form (`.github/ISSUE_TEMPLATE/021-feedback.yml`) — FR-008

A GitHub **issue form** (first `.yml` in `ISSUE_TEMPLATE/`; the existing two are `.md`): a feedback `body` textarea, an auto-attached-context textarea, a `labels: [feedback]` default and a title prefix, so `gh`/URL submissions land shaped for backlog triage (refinement-round pickup). Registered in `.github/ISSUE_TEMPLATE/_INDEX.md`. The URL fallback uses plain `?title=&body=` pre-fill (reliable) rather than the form's field-id params — see [research.md](research.md) R3.

### A5. Package sync — FR-009 (no dep) / packaging

`scripts/feedback.js`, `.claude/commands/021-feedback.md`, and `.github/ISSUE_TEMPLATE/021-feedback.yml` fall under already-synced trees; `npm run sync:package -- --check` must be green. `_INDEX.md` updates travel with them.

## Testing strategy

`node:test`:
- **Payload / context block** — with a fixture manifest, the body contains `version`/`stack`/`phase`; absent-manifest degrades with the explicit marker (FR-003, Scenarios 3–4).
- **Transport selection** — with a stubbed `ghReady` (or a PATH-shimmed fake `gh`), present+authed → `gh` transport; missing or unauthed → `url` (FR-004, Scenarios 1–2). Assert the `gh auth status` gate specifically (present-but-unauthed → `url`).
- **Fixed slug + URL** — every path targets `billdingwall/zero-two-one`; the URL is a well-formed `issues/new?title=…&body=…` with encoded params (FR-005/007, Scenario 5).
- **No autonomous post** — dry mode (no `--submit`) makes **no** `gh issue create` call (assert via the fake `gh` recording invocations) (FR-006).
- **Repo link** — with an `origin` remote → link present; without → omitted with the note (FR-002).
- **Cross-stack render** — an antigravity install produces `.agents/skills/021-feedback/SKILL.md` (FR-001, Scenario 7); a claude install produces `.claude/commands/021-feedback.md`.
- **Dispatch** — `021 feedback …` routes to `feedback.js` and passes args through (extends the spec-009 dispatch test).
- **Regression** — full existing suite green; golden fixture unchanged (R5); `sync:package --check` no drift.

## Work breakdown

See [tasks.md](tasks.md).
