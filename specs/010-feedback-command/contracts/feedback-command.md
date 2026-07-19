# Contract: Feedback Command (`021-feedback`)

*The observable behavior the [tasks](../tasks.md) verify. Four surfaces: the `scripts/feedback.js` CLI, the `021 feedback` dispatch, the `/021-feedback` walkthrough, and the URL format.*

## C1 — `scripts/feedback.js` CLI

```
node scripts/feedback.js "<title>" [--body <text>] [--submit]
```

- **Requires a title.** No positional title → print usage to stderr, exit `1`. No post occurs.
- **Assembles the payload** from `<title>`, `--body`, the manifest context block, and the `origin` repo link (when resolvable) — see [data-model.md](../data-model.md).
- **Selects the transport** (`gh` iff on PATH **and** `gh auth status` exit 0, else `url`) and **prints which it will use before anything else** (FR-006).
- **Dry (no `--submit`) — the default:**
  - `gh` transport → prints the full title + body + the exact `gh issue create --repo billdingwall/zero-two-one --title <title> --body <body>` it *would* run. **Runs nothing.** Exit `0`.
  - `url` transport → prints the pre-filled `issues/new` URL (C4). Exit `0`.
- **`--submit`:**
  - `gh` transport → runs `gh issue create --repo billdingwall/zero-two-one --title … --body …` with inherited stdio; exit = `gh`'s status (auth handled by `gh`, never by this script).
  - `url` transport → `--submit` is a no-op with a note that browser submission is the user's action; prints the URL; exit `0`.
- **Never** reads, stores, or transmits a token; issues no HTTP of its own (FR-004/009).
- **Fixed destination** `billdingwall/zero-two-one` in every path (FR-007); no flag can retarget it.
- **Absent manifest** → the context block carries an explicit "manifest not found" marker; the command still assembles and prints (exit `0`), it does not abort (FR-003, Scenario 4).

## C2 — `021 feedback` dispatch (`bin/021.js`)

- `npx 021 feedback "<title>" [--body …] [--submit]` runs `scripts/feedback.js` with the args passed through verbatim and returns its exit code (spec-009 dispatch semantics: `spawnSync(execPath, [script, ...rest], { stdio:'inherit', cwd: process.cwd() })`).
- `npx 021 feedback` with no title → `feedback.js` usage + exit `1`.
- The dispatcher holds **no** feedback logic (spec-009 invariant); it only routes. `USAGE` lists the `feedback` line.
- `npm run` aliases are unaffected (FR unchanged from 009).

## C3 — `/021-feedback` walkthrough (surface behavior)

The command surface (claude file; antigravity SKILL render; kiro via the `021` agent) drives ask-don't-assume (EDD §4):

1. Gathers a feedback title + optional detail from the user.
2. Runs `npx 021 feedback "<title>" --body "<detail>"` (**dry**) and shows the user the reported transport and the full assembled payload (incl. the context block).
3. Files **only on explicit user confirmation** — either `npx 021 feedback … --submit` (gh) or by opening / handing over the URL (url). **No issue is filed without that confirmation** (FR-006).
4. Reports the resulting issue URL (gh) or that the browser is pre-filled (url).

**Cross-stack identity (FR-001):** all three stacks call the same `021 feedback` CLI, so payload and transport behavior are identical; only the surface wrapper differs (verbatim command / rendered SKILL / agent-invoked).

## C4 — URL format (`url` transport)

```
https://github.com/billdingwall/zero-two-one/issues/new?title=<enc>&body=<enc>
```

- `title`/`body` are `encodeURIComponent`-encoded; the body carries the same context block as the `gh` path.
- Host/owner/repo are fixed to `github.com/billdingwall/zero-two-one` (FR-007).
- If the encoded URL would exceed a safe length ceiling (~8 KB), the body is truncated with a "full context printed above — paste it in" note and the block is echoed to stdout (see [research.md](../research.md) R3). Plain `title`/`body` pre-fill is used (not issue-form field ids) for reliability.

## Acceptance mapping

| Spec acceptance | Contract |
|---|---|
| `gh` available → ready `gh issue create`, files on confirm, no token | C1 (gh dry + `--submit`), C3 |
| `gh` absent → pre-filled URL, same payload | C1 (url), C4 |
| Manifest context attached (either transport) | C1 (payload) |
| No manifest → graceful marker | C1 (absent manifest) |
| Repo slug fixed to `billdingwall/zero-two-one` | C1/C4 (constant) |
| Issue shaped for triage | `021-feedback.yml` (data-model) |
| Cross-stack render, identical payload | C2/C3 (one CLI, three wrappers) |
| No autonomous post; transport reported first | C1 (dry default), C3 (confirm) |
