# Data Model: The `021` CLI Dispatcher

*No persistent state — the CLI is stateless routing. The "model" here is the **subcommand→script map**, the **re-point mapping**, and the **manifest `bin`/`exports` shapes**.*

## 1. Subcommand → script map

The single routing table in `bin/021.js`. Paths are package-relative (`__dirname/..`).

| `021 …` | Script | Runner | Extra args |
|---|---|---|---|
| `status` | `scripts/workflow-status.js` | node | — |
| `qa` | `scripts/run-qa.sh` | sh | — |
| `doctor` | `scripts/speckit/doctor.js` | node | — |
| `phase` | `scripts/speckit/lib.js` | node | `phase` (prepended) |
| `spec status` | `scripts/speckit/spec-status.js` | node | — |
| `spec context` | `scripts/speckit/fetch-speckit-context.js` | node | — |
| `spec verify` | `scripts/speckit/verify-spec-compliance.js` | node | — |

- Trailing user args (`argv` after the resolved subcommand) forward verbatim: `021 spec verify 006` → `verify-spec-compliance.js` argv `['006']`.
- `spec` is a namespace: `argv[3]` selects the leaf; `argv.slice(4)` is the leaf's args. An unknown `spec` leaf → usage + exit 1.
- Exec: `spawnSync(process.execPath, [script, ...extra, ...rest], { stdio: 'inherit', cwd: process.cwd() })`; qa uses `spawnSync('sh', [script, ...rest], …)`. Exit with `result.status ?? 1`.

## 2. Re-point mapping (`npm run 021-*` → `npx 021 …`)

| Before | After |
|---|---|
| `npm run 021-status` | `npx 021 status` |
| `npm run 021-qa` | `npx 021 qa` |
| `npm run 021-doctor` | `npx 021 doctor` |
| `npm run 021-spec:status -- list` | `npx 021 spec status list` |
| `npm run 021-spec:context -- <feature>` | `npx 021 spec context <feature>` |
| `npm run 021-spec:verify -- <feature>` | `npx 021 spec verify <feature>` |

The `021-spec:<y>` colon becomes a `spec <y>` namespace; the `npm run … --` separator is dropped (the footgun the CLI removes).

### Files re-pointed (FR-004) — *(analyze A1: the actionable set is every file with a literal `npm run 021-*`)*

- **Golden-pinned (trigger the re-baseline, FR-005):** `templates/ASSISTANT-Template.md` (→ `CLAUDE.md`/`AGENTS.md`), `.claude/commands/021-init.md`, `.claude/commands/021-status.md`.
- **Rendered skill surfaces (critical — these render to `.agents/skills/` + `.kiro/skills/` SKILL.md):** `skills/fetch-speckit-context.md`, `skills/verify-spec-compliance.md`. Missing them would ship `npm run 021-*` into Antigravity/Kiro users' skills.
- **Kiro steering templates:** `templates/kiro-steering/021-{product,tech,structure}.md`.
- **Guiding-doc template:** `templates/README-Template.md`.
- **Layer-1 framework docs (referenced by steering / read by the assistant):** `workflow/workflows.md`, `workflow/specific-workflows/{init-and-migration,release-launch,spec-driven-delivery}.md`.
- **Repo README:** `README.md` (the repo's own user-facing docs — aligns with the FR-008 caveat removal).

*Not re-pointed:* `templates/CODE-Template.md`, `templates/06-REVIEW-Template.md`, `templates/reviews/06-REVIEW-mvp-Template.md` — they mention command **names** in prose but carry no `npm run 021-*` (analyze A1). The re-point is a literal `npm run 021-*` → `npx 021 …` substitution; only `ASSISTANT-Template.md` + `.claude/commands/*` are golden-pinned, so the golden scope (FR-005) is unchanged by the wider file set.

## 3. Manifest `bin` + `exports`

Both `package.json` (root/dev) and `package/package.json` (published):

```jsonc
"bin": {
  "zero-two-one-init": "bin/init.js",
  "021": "bin/021.js"
},
"exports": {
  "./speckit": "./scripts/speckit/lib.js",
  "./package.json": "./package.json"
}
```

- `bin."021"` → the dispatcher; a leading-digit bin is legal (npm creates the `021` symlink in `node_modules/.bin`, reachable via `npx 021`).
- `exports` is a **whitelist** — once present, only listed subpaths resolve via the package name; `./package.json` is included so tools reading it still work (FR-009).
- `require('zero-two-one/speckit')` → `lib.js` public exports (`manifestFacts`, `engineFor`, `readStatus`, `listSpecs`, …).

## 4. Artifacts touched

| Artifact | Change |
|---|---|
| `bin/021.js` | **New** — the dispatcher (§1) |
| `package.json`, `package/package.json` | `bin."021"` + `exports` (§3) |
| The re-pointed surfaces (§2) | `npm run 021-*` → `npx 021 …` |
| `test/init/fixtures/claude-golden.json` | re-baselined to the CLI-referencing `claude` output (FR-005) |
| `README.md` | stack-availability caveat removed (FR-008) |
| `scripts/sync-to-package.js` | ships `bin/021.js`; carries `bin`/`exports` into `package/package.json` |
| `.zero-two-one.json` | dogfood regen picks up `bin/021.js` |
