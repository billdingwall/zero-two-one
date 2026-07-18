# Quickstart: Validating the Kiro Adapter & Engine Dispatch

*Manual + automated validation for [spec.md](spec.md). Installs go into throwaway temp targets from the framework source root; engine checks use `.kiro/specs` fixtures.*

## Part A — install adapter

### A1. Kiro install renders the surface

```
node bin/init.js --stack kiro <tmp>
```

Expect in `<tmp>`:
- `.kiro/steering/021-product.md`, `021-tech.md`, `021-structure.md` — each starting with its inclusion-mode frontmatter (`inclusion: always` / `fileMatch`).
- `.kiro/agents/021.json` — valid JSON with `prompt`/`resources`/`hooks` and `skill://` references.
- `.kiro/skills/021-generate-prd/SKILL.md`, … (8 skills) — the materialized skill surface.
- The common guiding docs (`CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`) + `requirements/*`.
- **Absent:** `CLAUDE.md`/`.claude/`, `AGENTS.md`/`.agents/`.
- `.zero-two-one.json` → `tools.stack: "kiro"`, `tools.ssd: "kiro-specs"`.

### A2. `kiro` is no longer reserved

`getAdapter('kiro')` returns an entry (no "not yet supported" throw); `--stack kiro` succeeds.

### A3. 3-stack neutral-core invariant

Install `claude`, `antigravity`, `kiro` into clean targets; diff the trees (excluding `.zero-two-one.json`, empty `.ai/context`, merged `package.json`/`.gitignore`):
- **Only** each stack's Layer-2 differs: `{CLAUDE.md,.claude/**}` vs `{AGENTS.md,.agents/**}` vs `{.kiro/steering,agents,skills/**}`.
- Every Layer-1 path — incl. the frontmatter'd `skills/*.md` — byte-identical across all three.

### A4. 006/007 regression

`claude` install → 006 golden fixture byte-identical, no `.kiro/`. `antigravity` install → `.agents/` surface intact, no `.kiro/`.

## Part B — engine dispatch

### B1. `github-speckit` is the default (regression bar)

With no `tools.ssd` (or `github-speckit`): `021-spec:status list`, `verify`, `context`, `doctor`, and the gate resolve `specs/NNN-*/spec.md` exactly as today. The framework's own repo is the live fixture — its `npm test` speckit assertions stay green.

### B2. `kiro-specs` reads `.kiro/specs`

Seed a fixture: a `.zero-two-one.json` with `tools.ssd: "kiro-specs"` + `.kiro/specs/my-feature/{requirements.md (status: Approved in frontmatter), design.md, tasks.md (checkboxes)}`.

- `listSpecs()` → `['my-feature']`.
- `readStatus('my-feature')` → `Approved` (from `requirements.md`).
- `writeStatus('my-feature','Done')` → updates `status:` in `requirements.md` (not `spec.md`).
- `countTasks` over `.kiro/specs/my-feature/tasks.md` → correct totals.
- `021-spec:context my-feature` → bundle drawn from `requirements.md`/`design.md`/`tasks.md`.

### B3. Gate honors the engine

On the `kiro-specs` fixture, stage an implementation file with `my-feature` not gate-passing → the pre-commit gate blocks; set `requirements.md` status to `Approved` → it permits. Editing `.kiro/specs/**` alone is treated as docs (not implementation).

## Gates

```
npm test                          # kiro install + engine dispatch (both) + 001–007 regressions
npm run lint
npm run check:links
npm run sync:package -- --check
npm run 021-spec:verify -- 008
```
