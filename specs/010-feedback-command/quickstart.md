# Quickstart: Feedback Command (`021-feedback`)

*Manual end-to-end walkthrough validating [spec.md](spec.md) after implementation. Run from the repo root.*

## 1. Dry run — `gh` present + authed

```bash
gh auth status            # confirm logged in
npx 021 feedback "Init clobbered my hook" --body "Ran init on a repo with husky and…"
```

**Expect:** the command reports `Transport: gh`, prints the full title + body including a context block with `version` / `stack` / `phase` from `.zero-two-one.json` and a repo link from `origin`, and prints the exact `gh issue create --repo billdingwall/zero-two-one --title … --body …` it *would* run. **No issue is created.**

## 2. Submit (gh path)

```bash
npx 021 feedback "Init clobbered my hook" --body "…" --submit
```

**Expect:** `gh issue create` runs and prints the new issue URL under `billdingwall/zero-two-one`. Auth was handled entirely by `gh` — the framework never saw a token. *(Only run this when you actually intend to file a real issue.)*

## 3. URL fallback — `gh` absent or unauthed

Simulate no `gh` (e.g. `PATH` without it, or a logged-out shim):

```bash
PATH=/usr/bin npx 021 feedback "Docs typo" --body "workflows.md step 5 has a broken link"
```

**Expect:** `Transport: url` and a pre-filled `https://github.com/billdingwall/zero-two-one/issues/new?title=…&body=…`. Opening it lands on GitHub's new-issue form pre-populated with the same title/body + context block. `--submit` on this path only notes that submission is the user's browser action.

## 4. No manifest — graceful degrade

```bash
cd "$(mktemp -d)" && git init -q
npx 021 feedback "Testing from a bare repo"
```

**Expect:** the command still assembles and prints (exit 0); the context block carries an explicit "manifest not found" marker instead of `version`/`stack`/`phase`, and the repo link is present/absent per whether an `origin` remote exists. It does **not** abort.

## 5. Cross-stack render

```bash
# claude
t=$(mktemp -d); node bin/init.js "$t" --stack claude >/dev/null
ls "$t/.claude/commands/021-feedback.md"

# antigravity — rendered SKILL
t=$(mktemp -d); node bin/init.js "$t" --stack antigravity >/dev/null
ls "$t/.agents/skills/021-feedback/SKILL.md"
```

**Expect:** claude installs the command file; antigravity installs the rendered SKILL. Both drive the same `021 feedback` CLI. (kiro reaches it through the `021` agent's CLI wrapper.)

## 6. Issue form + regression

```bash
ls .github/ISSUE_TEMPLATE/021-feedback.yml      # the triage form ships
npm test                                        # full suite green
npm run lint && node scripts/check-links.js     # lint + links clean
npm run sync:package -- --check                 # no package drift
```

**Expect:** the form exists and validates as a GitHub issue form; the whole suite passes; no new runtime dependency; `package/**` in sync. The `claude-golden.json` fixture is **unchanged** (adding a new command file doesn't touch the three pinned entries).
