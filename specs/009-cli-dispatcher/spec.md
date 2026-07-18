---
status: Done
feature: The 021 CLI Dispatcher
release: mvp-4
branch: 009-cli-dispatcher
created: 2026-07-18
---

# Feature Spec: The `021` CLI Dispatcher

*The fourth and final feature of [mvp-4 — AI-Led Init & Stack/Design Adapters](../../requirements/_releases/mvp-4.md). Specs [006](../006-source-layer-renderer/spec.md)–[008](../008-kiro-adapter/spec.md) gave each stack its own instruction surface (`CLAUDE.md`, `AGENTS.md`+`.agents/skills`, `.kiro/steering`+`.kiro/agents`), but those surfaces reference lifecycle commands as `npm run 021-*`. This spec delivers a **single, assistant-agnostic command surface** — a `021` CLI binary that dispatches over the existing scripts — so all three stacks issue **identical** commands (`021 status`, `021 qa`, `021 spec verify …`), and re-points every adapter's rendered instructions at it. It replaces the rejected Makefile idea with a Node-built-in dispatcher (repo-refactor §1.2/§3.3), and closes out the release's "one contract, three renderings" goal.*

## Why

The framework's lifecycle commands live behind npm scripts (`021-status`, `021-qa`, `021-doctor`, `021-spec:status|context|verify`). npm scripts are fine for the dogfood repo, but as the **contract adapters reference** they are awkward: `npm run 021-spec:context -- 006` (the `--` separator is a footgun), and they only exist if the project has a `package.json` with those scripts wired. The repo-refactor audit wanted **one deterministic command surface** for all three assistants; it proposed a root `Makefile`, which was **rejected** (not on Windows, a second toolchain, a parallel interface) in favor of a single `021` CLI binary shipped as a second `bin` (repo-refactor §3.3).

With a `021` CLI, every adapter's rendered instructions — Claude's `CLAUDE.md`/commands, Antigravity's `AGENTS.md`/`SKILL.md`, Kiro's steering — reference the **same** `021 …` commands. That is the "one contract, three renderings" payoff the whole adapter cut was building toward. The CLI is a thin dispatcher (Node built-ins only, no logic moves — it shells the existing scripts); npm scripts remain as aliases for the dogfood repo and CI.

## Users & Context

- **Primary user:** a developer in a scaffolded project (any stack) running lifecycle commands, and the **AI assistant** reading the stack's instruction surface — both now issue `021 status` / `021 spec verify <feature>` regardless of stack.
- **Secondary user (regression guard):** the dogfood repo + CI, which keep using the npm-script aliases (`npm test`, `npm run 021-*`) — those must keep working unchanged.
- **Trigger:** any lifecycle invocation; and init/upgrade, which now render instruction surfaces that reference the CLI instead of `npm run 021-*`.
- **Builds on:** the existing `scripts/workflow-status.js`, `scripts/run-qa.sh`, `scripts/speckit/{doctor,spec-status,fetch-speckit-context,verify-spec-compliance,lib}.js` (the CLI dispatches to these unchanged); specs 006–008 adapter surfaces (whose rendered instructions this re-points).
- **Constraint:** zero runtime dependencies — the dispatcher is `child_process`/`process` over the existing scripts, Node built-ins only. No logic moves out of the scripts; the CLI is a routing shell.

## Clarifications

### Session 2026-07-18 (clarify)

- **Q: What is the CLI's bin name — `021`, `zto`, or `zero-two-one`?**
  A: **`021`.** On-convention — CODE.md §2 explicitly reserves bare `021` "where a tool needs one identifier," and a CLI bin is exactly that; it reinforces the 021- brand. The known caveats (a leading digit is unusual in PATH; it collides in spelling with the Kiro agent id `.kiro/agents/021.json`, a different runtime context) are accepted. The TDD §9.2 disambiguation note is resolved in favor of `021` for the bin.
- **Q: How do adapter instructions reference the CLI — `npx 021 …` or bare `021 …`?**
  A: **`npx 021 …`** — always resolvable (from a local devDep or fetched), even before a global install (repo-refactor §3.3). Bare `021 …` still works when the bin is on PATH, and the `npm run 021-*` aliases remain as a fallback.
- **Q: Expose a programmatic API (`require('zero-two-one/speckit')` over `lib.js`)?**
  A: **Yes.** Add an `exports` map exposing `./speckit` → `scripts/speckit/lib.js`, so agent runtimes can consume `manifestFacts`/`engineFor`/spec-state helpers (the deferred TDD §14 / mvp-4 decision, decided now with the adapter seam complete). Additive; the CLI remains the primary surface.
- **Q: Fold `init` into the CLI?**
  A: **No — keep `zero-two-one-init` separate.** `init` is the bootstrap installer (run via `npx zero-two-one-init` before the project exists); the CLI is post-install lifecycle. The CLI subcommands are `status`/`qa`/`doctor`/`spec`/`phase` — no `021 init`.

## User Scenarios (Acceptance)

1. **The CLI dispatches lifecycle commands** — *Given* the package is installed, *when* a user runs `021 status`, `021 qa`, `021 doctor`, `021 spec status|context|verify [args]`, or `021 phase`, *then* each runs the corresponding existing script and exits with its exit code — behavior identical to the matching `npm run 021-*`.
2. **`spec` subcommands pass through arguments cleanly** — *Given* `021 spec verify 006`, *when* it runs, *then* `006` reaches `verify-spec-compliance.js` as its spec argument, with **no** `--` separator footgun.
3. **Adapters reference the CLI, not npm** — *Given* a fresh install of any stack, *when* the instruction surface renders, *then* Claude's `CLAUDE.md`/commands, Antigravity's `AGENTS.md`/`SKILL.md`, and Kiro's steering all reference `021 …` commands (identical across stacks), not `npm run 021-*`.
4. **npm-script aliases still work** — *Given* the dogfood repo, *when* `npm test` / `npm run 021-status` / `npm run 021-spec:verify` run, *then* they behave exactly as before (the CLI is additive; the scripts are unchanged).
5. **The CLI is registered as a package bin** — *Given* the published package, *when* installed, *then* the `021` CLI is on `PATH` (or reachable via `npx`), alongside the existing `zero-two-one-init` bin.
6. **README reflects reality** — *Given* the README, *when* read after this spec, *then* the "stack availability: … land in mvp-4" caveat is removed — all three stacks work.
7. **Missing/unknown subcommand is helpful** — *Given* `021` with no or an unknown subcommand, *then* it prints a usage summary of the available commands and exits non-zero.

## Functional Requirements

- **FR-001 — The CLI dispatcher.** Add a new `bin` — a Node-built-in dispatcher that routes subcommands to the existing scripts: `status` → `scripts/workflow-status.js`; `qa` → `scripts/run-qa.sh`; `doctor` → `scripts/speckit/doctor.js`; `spec status|context|verify` → `scripts/speckit/{spec-status,fetch-speckit-context,verify-spec-compliance}.js`; `phase` → `scripts/speckit/lib.js phase`. No logic moves — it resolves the script path relative to the package and execs it, forwarding argv and the exit code.
- **FR-002 — Argument pass-through.** Trailing arguments reach the target script directly (`021 spec verify 006` → the script's argv is `['006']`) — no `npm run … --` separator. `spec` is a namespace with `status|context|verify` leaf subcommands.
- **FR-003 — Bin name `021`.** *(clarified)* The CLI's bin name is **`021`** (CODE.md §2 reserves bare `021` for a single-identifier tool; TDD §9.2 disambiguation resolved in its favor). It registers in **both** package manifests' `bin` map alongside `zero-two-one-init` (`"021": "bin/021.js"`).
- **FR-004 — Adapters reference `npx 021 …`.** *(clarified)* Re-point **every framework file carrying a literal `npm run 021-*`** to **`npx 021 …`** *(analyze A1 — the actionable set)*: `templates/ASSISTANT-Template.md` (→ `CLAUDE.md`/`AGENTS.md`), `.claude/commands/021-*.md`, **`skills/{fetch-speckit-context,verify-spec-compliance}.md`** (which render into `.agents/skills/` + `.kiro/skills/`), `templates/kiro-steering/021-*.md`, `templates/README-Template.md`, the `workflow/` process docs, and the repo `README.md` — so all three stacks (and the docs they read) issue identical commands. (`npx` so the reference resolves before a global install; bare `021` and the `npm run 021-*` aliases remain valid.)
- **FR-005 — Golden fixture re-baseline.** Re-pointing `ASSISTANT-Template.md` and `.claude/commands/021-*.md` **intentionally changes** the `claude` rendered bytes, so the spec 006 golden fixture (`test/init/fixtures/claude-golden.json`) is **re-captured** in this spec. This is the one place the "claude byte-identical" bar is deliberately moved — 006–008 held it; 009 advances it by design, and the fixture is re-pinned to the new (CLI-referencing) output.
- **FR-006 — npm-script aliases preserved.** The `package.json` `021-*` scripts remain and behave identically (they may optionally delegate to the CLI, but must not change behavior). `npm test`/`lint`/`sync:package` unchanged. The dogfood repo and CI are unaffected.
- **FR-007 — Helpful usage.** No subcommand or an unknown one prints a usage summary (the command list) and exits non-zero; `--help`/`-h` prints the same and exits zero.
- **FR-008 — README stack-caveat removed.** Drop the "stack availability … land in mvp-4" note (README.md:33) now that `--stack antigravity|kiro` and the adapters are real (r7 item).
- **FR-009 — Programmatic API (`exports`).** *(clarified: yes)* Add an `exports` map to the package so `require('zero-two-one/speckit')` resolves to `scripts/speckit/lib.js` — a thin, additive programmatic surface (`manifestFacts`, `engineFor`, spec-state helpers) for agent runtimes (TDD §14). Guard against `exports` regressions: adding the field restricts subpath resolution, so include `"./speckit"` and `"./package.json"` (and any subpath the package's own consumers rely on). The CLI remains the primary surface; this is additive.
- **FR-010 — Zero dependencies + package sync.** Node built-ins only; the CLI ships via `sync-to-package.js`; both manifests' `bin` maps carry it; `npm run sync:package -- --check` green.

## Key Entities

- **The CLI dispatcher (`bin/021.js`)** — the routing shell: parse `argv[2]` (+ `argv[3]` for `spec`), map to a script path under the package, `spawnSync(process.execPath, [script, ...rest], { stdio: 'inherit' })` (or `sh` for `run-qa.sh`), exit with its status.
- **Subcommand → script map** — `status`/`qa`/`doctor`/`spec {status,context,verify}`/`phase` → the existing scripts. The single place the routing lives.
- **Bin name** — `021` | `zto` | `zero-two-one` (FR-003) — registered in both `bin` maps; referenced by every adapter surface.
- **Golden fixture** — re-captured to the CLI-referencing `claude` output (FR-005).

## Acceptance Criteria

- `021 status|qa|doctor|phase` and `021 spec status|context|verify <arg>` each run the matching script with the right args and exit code; parity with `npm run 021-*`.
- A fresh install of each stack renders instruction surfaces that reference `021 …` (identical across stacks), not `npm run 021-*`.
- The golden fixture is re-captured; the `claude` install matches the new fixture; specs 006–008 tests pass with the updated bytes.
- `npm test`/`npm run 021-*` unchanged; the CLI is registered in both `bin` maps; `sync:package -- --check` green.
- README stack caveat removed; the programmatic-API decision is recorded (TDD §14).
- `npm run lint`/`check:links` green.

## Out of Scope

- **New lifecycle commands** — the CLI wraps the *existing* command set (status/qa/doctor/spec/phase); no new capability. `init` stays the separate `zero-two-one-init` bin (clarified) — the installer runs before the CLI would exist in a project; there is no `021 init`.
- **AI-led interactive walkthrough / `--stack`/`--design` interview UX** — a separate mvp-4 item; unaffected by the CLI.
- **Design-system adapter / `material-3`** — independent (TDD §9.4).
- **Moving logic out of the scripts** — the CLI is a dispatcher only; the scripts remain the implementation and stay independently runnable (and npm-aliased).

## Dependencies & References

- Existing scripts the CLI wraps: `scripts/workflow-status.js`, `scripts/run-qa.sh`, `scripts/speckit/{doctor,spec-status,fetch-speckit-context,verify-spec-compliance,lib}.js`.
- [spec 006](../006-source-layer-renderer/spec.md) — the golden fixture this re-baselines (FR-005); `templates/ASSISTANT-Template.md`.
- [spec 007](../007-antigravity-adapter/spec.md) / [spec 008](../008-kiro-adapter/spec.md) — the `.agents/`/`.kiro/` instruction surfaces this re-points.
- TDD §6 (naming convention — the bin name), §9.2 (the `021` disambiguation note — bin vs kiro agent id), §14 (programmatic-API decision).
- [_notes/repo-refactor.md](../../requirements/_notes/repo-refactor.md) §1.2 (Makefile rejected), §3.3 (the `021` CLI design), §5.2 (spec cut — 009); [_releases/mvp-4.md](../../requirements/_releases/mvp-4.md) (README caveat removal, API decision).

## Open Questions

*All resolved in the 2026-07-18 clarify session (see Clarifications): bin name **`021`** (`npx 021 …` in adapter instructions); the programmatic API **is** exposed (`exports` → `require('zero-two-one/speckit')`); `init` **stays** the separate `zero-two-one-init` bin. No open items remain.*

*One implementation detail deferred to plan: the CLI's script-resolution root — `021` (run via `npx`) dispatches to the **package's** copy of `scripts/*`, which operates on the current project's state through `repoRoot()` (git root of `cwd`); confirm this matches the `npm run 021-*` alias behavior (which runs the project's local copy). Settled in plan/contracts.*
