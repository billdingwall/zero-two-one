# Quickstart: Validating the Antigravity Adapter

*Manual + automated validation for [spec.md](spec.md). Assumes the engine changes ([plan.md](plan.md)) are in place. All installs go into throwaway temp targets from the framework source root.*

## 1. Antigravity install renders the skills surface

```
node bin/init.js --stack antigravity <tmp-target>
```

Expect in `<tmp-target>`:
- `.agents/skills/021-generate-prd/SKILL.md`, `…/021-verify-spec-compliance/SKILL.md`, … — one dir per skill (8 total), each `SKILL.md` starting with `---\nname: 021-<name>\ndescription: …\n---`.
- `.agents/skills/021-init/SKILL.md`, `.agents/skills/021-status/SKILL.md` — the two lifecycle commands (frontmatter synthesized).
- `AGENTS.md` at root (neutral body — no "Claude").
- **Absent:** `CLAUDE.md`, `.claude/commands/` anywhere.
- `.zero-two-one.json` → `tools.stack: "antigravity"`; `files` lists the `.agents/skills/**/SKILL.md` paths.

## 2. `GEMINI.md` is honored

```
printf '# my gemini entry\n' > <tmp-target>/GEMINI.md
node bin/init.js --stack antigravity <tmp-target>
```

Expect: `GEMINI.md` **unchanged** (byte-for-byte), **no** `AGENTS.md` written. Re-run without a pre-seeded `GEMINI.md` in a fresh target → `AGENTS.md` is written instead.

## 3. `claude` is still byte-identical (regression bar)

```
node bin/init.js --stack claude <tmp-claude>
```

Expect: `CLAUDE.md` + `.claude/commands/021-*.md` match the 006 golden fixture (`test/init/fixtures/claude-golden.json`); **no** `.agents/` path. The `node:test` golden suite is the automated form.

## 4. Neutral-core invariant (incl. the skills surface)

Install `claude` and `antigravity` into two clean targets; diff the trees excluding `.zero-two-one.json`, empty `.ai/context`, and merged `package.json`/`.gitignore`:

- **Only** Layer-2 differs: `{CLAUDE.md, .claude/commands/**}` vs `{AGENTS.md, .agents/skills/**}`.
- Every Layer-1 path — including the now-frontmatter'd `skills/*.md` — is **byte-identical** on both sides.

## 5. Ownership & upgrade

```
node bin/init.js --stack antigravity <tmp>          # install
node bin/init.js --upgrade <tmp>                     # stack read from manifest
```

- `classify('.agents/skills/021-init/SKILL.md', 'antigravity')` → `framework-owned`; under `'claude'` → `null`.
- `classify('AGENTS.md','antigravity')` and `classify('GEMINI.md','antigravity')` → `user-owned`.
- `--upgrade` refreshes `.agents/skills/**` (and the entrypoint), never introduces `CLAUDE.md`/`.claude/commands`.
- Hand-edit a `SKILL.md`, re-run without `--upgrade` → `conflict` (left unchanged).

## 6. Migrate wire-through

```
mkdir -p <tmp>/.agents && printf '# existing\n' > <tmp>/AGENTS.md
node bin/init.js <tmp>          # no --stack; migrate detects
```

Expect: detection proposes `antigravity` (spec 002); the install writes the `.agents/skills/**` surface; the existing `AGENTS.md` is honored (user-owned, untouched).

## 7. MCP post-install note

Antigravity install prints registration guidance referencing `~/.gemini/config/mcp_config.json` (from `skills/tools.json`). Confirm **nothing** is written under `~/.gemini/` (console output only).

## 8. Gates

```
npm test                       # incl. new antigravity/surface suites + 006 golden still green
npm run lint
npm run check:links
npm run sync:package -- --check
npm run 021-spec:verify -- 007
```
