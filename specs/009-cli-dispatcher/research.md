# Research & Decisions: The `021` CLI Dispatcher

*Rolls up the 2026-07-18 clarify (bin name `021`; `npx 021 …`; expose `exports`; keep `init` separate — see [spec.md](spec.md) Clarifications) and settles the one deferred plan detail. Rejected alternatives recorded.*

## R1 — Script-resolution root (deferred detail) → package-relative path, project-scoped data

**Decision.** `bin/021.js` resolves the target script path **package-relative** (`path.join(__dirname, '..', 'scripts', …)`) and execs it with `cwd: process.cwd()`.

**Why.** The CLI ships with the scripts it dispatches, so resolving them package-relative means `021` always runs the versions that match the CLI (no dependence on whether the project's installed copy is up to date). The *data* is still the invoking project's: every wrapped script derives state from `repoRoot()` (git root of `cwd`), and we exec with the caller's `cwd`. This mirrors `npm run 021-*` in the one way that matters — commands act on the invoking project — while being robust to a project whose local `scripts/` copy predates the CLI.

**Note.** The `npm run 021-*` aliases resolve `node scripts/…` *cwd-relative* (the project's copy); the CLI resolves *package-relative* (its own copy). Because framework files are byte-identical across the two by the neutral-core guarantee, the outputs match. Version skew (a project on framework vX invoking a fetched CLI vY) is an upgrade concern, out of scope here.

**Rejected.** Resolving scripts cwd-relative (the project's copy) — makes `021` depend on the project having an up-to-date `scripts/`, and fails in a directory that has the manifest but not the scripts; package-relative is self-contained.

## R2 — Golden re-baseline is intended, not a regression (FR-005)

The 006 golden fixture pinned `claude`'s `CLAUDE.md` + `.claude/commands/021-*.md` bytes as the "don't change claude" bar that 006–008 all honored. Spec 009's **whole point** is to change the *referenced command surface* (`npm run 021-*` → `npx 021 …`) in those exact files. So the fixture is **re-captured** from the new output — a deliberate, one-time advance of the bar, not a break. The renderer/adapters/engine are untouched; only instruction *text* moves. After re-baselining, the 006 test re-pins and 006–008 stay green. This is the sanctioned way to move a golden bar: change the source intentionally, re-capture, and keep the assertion.

## R3 — Dispatcher is a routing shell, no logic moves (FR-001/006)

`bin/021.js` contains only the subcommand→script table and a `spawnSync`. All behavior stays in `scripts/*`, which remain independently runnable and npm-aliased. This honors repo-refactor §3.3 ("dispatcher over the existing scripts — no logic moves") and keeps the dogfood repo / CI (which use the npm aliases) completely unaffected. It also means the CLI needs no tests of *command behavior* — only of *routing* (right script, args, exit code).

## R4 — `exports` is a whitelist; include `./package.json` (FR-009)

Adding an `exports` field to a package makes subpath resolution a **closed whitelist** — unlisted subpaths (including `./package.json`) stop resolving via the package name. Since the package is currently exports-less (everything resolvable) and has no `"."` main (removed r7), the risk is narrow, but the safe form lists both `./speckit` (the new API) and `./package.json` (tools frequently read it). This exposes `lib.js`'s read-mostly helpers for the agent-runtime use case without committing the *internal* modules (`engines/*`, `init/*`) to API stability.

## R5 — `npx 021` and the leading-digit bin

A leading-digit npm bin name (`021`) is legal; npm creates the `node_modules/.bin/021` symlink and `npx 021` resolves it (from a local devDep or by fetching `zero-two-one`). The spelling overlap with the Kiro agent id `.kiro/agents/021.json` ("invoked as `021`") is across different runtime contexts (a PATH binary vs Kiro's agent runner) and was accepted in clarify per CODE.md §2 ("bare `021` where a tool needs one identifier"). Adapter instructions use `npx 021 …` so the reference resolves even before a global install; bare `021 …` works once on PATH, and the `npm run 021-*` aliases remain a fallback.
