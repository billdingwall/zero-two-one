# Quickstart: End-to-End Test Harness

*How to run the e2e locally and read its output. It is a separate lane — `npm test` does **not** run it.*

## Run it

```sh
npm run test:e2e
```

What happens (≈ one `npm install` + 6 installs + 12 commits):

```
1. npm run sync:package -- --check      # fail fast if package/ is out of sync
2. cd package && npm pack               # → package/zero-two-one-1.1.0.tgz  (the real shipped artifact)
3. npm install --prefer-offline <tgz>   # into a throwaway toolbox (offline: zero-dep)
4. for each of 6 cells: git init a target, run the installed init, assert, prove the gate
5. tear everything down
```

Expected tail:

```
✔ claude · scaffold
✔ claude · migrate
✔ antigravity · scaffold
✔ antigravity · migrate
✔ kiro · scaffold
✔ kiro · migrate
✔ meta: test:e2e not in npm test; CI e2e job exists; package unchanged
# pass 7
```

## What each cell proves

- **Install surface** rendered for the stack (claude `CLAUDE.md`+`.claude/commands`; antigravity `AGENTS.md`+`.agents/skills`; kiro `.kiro/steering`+`.kiro/agents/021.json`).
- **Manifest** correct — read via the shipped `zero-two-one/speckit` export: `mode` (scaffold/migrate), `stack`, `phase: planning`, `ssd`.
- **`021 status` / `qa` / `doctor`** each exit 0 (planning → `qa` docs tier).
- **migrate** cells: the seeded `README.md` is untouched and the pre-existing hook still runs after the gate (chained, not clobbered).
- **The gate, for real:** on a `042-e2e-probe` branch with a Draft spec, committing `src/feature.js` is **blocked**; after `021 spec status set 042-e2e-probe Approved`, the same commit is **allowed**.

## Reading a gate-proof failure

If a cell fails on the gate, the two likely causes:

```
AssertionError: expected git commit to be BLOCKED (Draft spec) but it exited 0
```
→ the probe file landed inside the hook's exclude surface (must be `src/feature.js`, **not** `scripts/…`), or the hook isn't active (target must be `git init`'d **before** install).

```
AssertionError: expected git commit to be ALLOWED (Approved spec) but it exited 1
```
→ `021 spec status set … Approved` didn't reach the engine for this stack (kiro writes `.kiro/specs/<feat>/requirements.md`, not `specs/`).

## CI

The `e2e` job in `.github/workflows/ci.yml` runs `npm run test:e2e` on **every push and PR**. It is dev-only — `.github/workflows/` is excluded from the published package, and `test/e2e/**` is never shipped.

## Confirm nothing shipped

```sh
npm run sync:package -- --check     # green — the e2e added no package content
cd package && npm pack --dry-run    # still 108 files
```
