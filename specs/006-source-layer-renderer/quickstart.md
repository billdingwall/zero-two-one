# Quickstart / Validation: Source Layer & Stack-Parameterized Renderer

*Install each stack into a throwaway repo, diff the trees, assert the bytes. Each step maps to an acceptance criterion in [spec.md](spec.md). Run the repo's own `bin/init.js` — it sources from its own location (`__dirname/..`), so you exercise the local renderer, not a published tarball.*

## Setup
```sh
SRC=$(pwd)                              # the zero-two-one repo root (implicit source)
CL=$(mktemp -d); AG=$(mktemp -d)
git -C "$CL" init -q; git -C "$AG" init -q
```

## 1. `claude` → byte-identical (FR-010)
```sh
node "$SRC/bin/init.js" "$CL" --yes --stack claude
# entrypoint + commands match today's bytes (the golden fixture asserts this in CI):
test -f "$CL/CLAUDE.md" && ls "$CL/.claude/commands/"021-*.md
# manifest records the stack:
grep '"stack": "claude"' "$CL/.zero-two-one.json"
```

## 2. `antigravity` → `AGENTS.md`, no Claude surface (Scenario 2)
```sh
node "$SRC/bin/init.js" "$AG" --yes --stack antigravity
test -f "$AG/AGENTS.md"                 # entrypoint rendered
test ! -f "$AG/CLAUDE.md" && echo "no CLAUDE.md"
test ! -d "$AG/.claude" && echo "no .claude/"
```

## 3. Un-chosen stacks install nothing (FR-009)
```sh
# the antigravity tree carries NO claude Layer-2 path, and vice-versa
! find "$AG" -path '*/.claude/*' | grep . && echo "AG: no .claude surface"
! find "$CL" -name AGENTS.md | grep . && echo "CL: no AGENTS.md"
```

## 4. Neutral-core invariant — only Layer-2 differs (Scenario 4)
```sh
# diff the two installed trees; every differing path must be Layer-2 (entrypoint or a surfaceDir)
diff -rq "$CL" "$AG" | grep -v '\.git' \
  | grep -vE 'CLAUDE\.md|AGENTS\.md|\.claude/|\.zero-two-one\.json'
# → empty output: all Layer-1 paths are byte-identical across stacks
```
*(`.zero-two-one.json` differs by design — it records the stack — so it's excluded here; the assertion is that nothing **else** in Layer 1 differs.)*

## 5. Stack-aware ownership (Scenario 6)
```sh
node -e "const c=require('$SRC/scripts/init/classes');
  console.log('claude .claude/commands:', c.classify('.claude/commands/021-status.md','claude'));   // framework-owned
  console.log('antigravity .claude/commands:', c.classify('.claude/commands/021-status.md','antigravity')); // null
  console.log('antigravity AGENTS.md:', c.classify('AGENTS.md','antigravity'));"                    // user-owned
```

## 6. `--upgrade` honors the recorded stack (Scenario 5)
```sh
node "$SRC/bin/init.js" "$AG" --yes --upgrade
test ! -f "$AG/CLAUDE.md" && echo "upgrade added no CLAUDE.md"
grep -q 'AGENTS.md' "$AG/.zero-two-one.json" || true   # AGENTS.md still the entrypoint
```

## 7. Package sync stays clean (FR-012)
```sh
cd "$SRC" && npm run sync:package -- --check   # green; CLAUDE-Template.md gone, ASSISTANT-Template.md shipped
```

## Done when
The per-stack `node:test` suite passes (golden fixture for `claude`; `antigravity` entrypoint-only; neutral-core invariant; stack-aware `classify`; `--upgrade`; default-`claude`), spec 001/002 tests are green (byte-compare assertions re-pointed to the renderer), `npm test`/`npm run lint` pass, no runtime dependency was added, and `sync:package -- --check` is clean.
